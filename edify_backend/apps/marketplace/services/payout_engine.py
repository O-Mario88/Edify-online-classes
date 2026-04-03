import logging
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

from lessons.models import Lesson, LessonQualificationRecord, LessonAttendance
from live_sessions.models import LiveSession
from resources.models import ResourceLessonLink
from billing.models import TeacherAccessFeeAccount, TeacherFeeInstallment
from marketplace.models import TeacherPayoutBatch

logger = logging.getLogger(__name__)

class PayoutEngine:
    PAYOUT_PER_LESSON = Decimal('20000.00')
    STANDARD_DEDUCTION = Decimal('60000.00')

    @classmethod
    def evaluate_lesson(cls, lesson):
        """
        Evaluates a single lesson against the 5 Qualification Rules.
        Creates or updates a LessonQualificationRecord.
        """
        record, _ = LessonQualificationRecord.objects.get_or_create(lesson=lesson)
        
        # Rule 1: Public Class & Scheduled/Published
        if lesson.parent_class.visibility != 'public':
            record.status = 'rejected_for_payout'
            record.rejection_reason = "Lesson is not assigned to a public marketplace class."
            record.save()
            return record
            
        if lesson.access_mode != 'published':
            record.status = 'rejected_for_payout'
            record.rejection_reason = "Lesson is not published/active."
            record.save()
            return record

        # Rule 3 & 5: Session Delivered & Not Cancelled
        try:
            live_session = lesson.live_session
            if live_session.status != 'completed':
                record.status = 'rejected_for_payout'
                record.rejection_reason = f"Session was not completed (Status: {live_session.status})."
                record.save()
                return record
        except LiveSession.DoesNotExist:
            record.status = 'rejected_for_payout'
            record.rejection_reason = "No live session was created or delivered for this lesson."
            record.save()
            return record

        # Rule 2: Minimum Required Resources Linked
        # Needs: 1 core_note, 1 presentation, 1 reading
        resource_purposes = set(
            ResourceLessonLink.objects.filter(lesson=lesson).values_list('purpose', flat=True)
        )
        missing_resources = []
        if 'core_note' not in resource_purposes:
            missing_resources.append('Core Teaching Note')
        if 'presentation' not in resource_purposes:
            missing_resources.append('Presentation/Slides')
        if 'reading' not in resource_purposes:
            missing_resources.append('Recommended Reading')

        if missing_resources:
            record.status = 'rejected_for_payout'
            record.rejection_reason = "Missing required academic resources: " + ", ".join(missing_resources)
            record.save()
            return record

        # Rule 4: Meaningful Attendance Threshold
        # At least 5 attendees who spent >= 40% of session duration.
        min_duration = int((live_session.duration_minutes or 60) * 0.4)
        meaningful_attendees = LessonAttendance.objects.filter(
            lesson=lesson, 
            status='present', 
            duration_minutes__gte=min_duration
        ).count()

        if meaningful_attendees < 5:
            record.status = 'rejected_for_payout'
            record.rejection_reason = f"Only {meaningful_attendees} student(s) attended meaningfully. Minimum 5 required."
            record.save()
            return record

        # Passed all rules!
        if record.status != 'paid_out': # prevent overwriting if already paid
            record.status = 'qualified_for_payout'
            record.rejection_reason = None
            record.calculated_payout = cls.PAYOUT_PER_LESSON
            record.save()
            
        return record

    @classmethod
    def process_biweekly_payout(cls, teacher, end_date=None):
        """
        Aggregates all qualified lessons that haven't been paid yet.
        Generates the Payout Batch and applies the UGX 60K Fee Deduction safely.
        """
        if not end_date:
            end_date = timezone.now()
            
        # Get start date by looking back 2 weeks
        start_date = end_date - timedelta(days=14)

        # Retrieve qualified, unprocessed lessons for this teacher
        qualified_records = LessonQualificationRecord.objects.filter(
            lesson__parent_class__teacher=teacher,
            status='qualified_for_payout',
            reviewed_at__isnull=True 
        )
        
        if not qualified_records.exists():
            return None # No earnings this cycle

        gross_earnings = Decimal(qualified_records.count() * cls.PAYOUT_PER_LESSON)

        # Initialize Batch
        batch = TeacherPayoutBatch.objects.create(
            teacher=teacher,
            cycle_start_date=start_date,
            cycle_end_date=end_date,
            gross_earnings=gross_earnings,
            status='calculated'
        )

        # Evaluate Teacher Access Fee Deductions
        fee_account, _ = TeacherAccessFeeAccount.objects.get_or_create(teacher=teacher)
        deduction_amount = Decimal('0.00')

        if fee_account.remaining_balance > 0:
            target_deduction = cls.STANDARD_DEDUCTION
            
            # Can we deduct the full 60k?
            amount_to_deduct = min(target_deduction, fee_account.remaining_balance)
            
            # Can the earnings cover the deduction?
            if gross_earnings >= amount_to_deduct:
                deduction_amount = amount_to_deduct
            else:
                deduction_amount = gross_earnings # Deduct whatever is available

            if deduction_amount > 0:
                fee_account.recovered_amount += deduction_amount
                if fee_account.recovered_amount >= fee_account.total_obligation:
                    fee_account.is_recovered = True
                fee_account.save()
                
                TeacherFeeInstallment.objects.create(
                    account=fee_account,
                    payout_batch=batch,
                    amount_deducted=deduction_amount
                )

        # Finalize Batch
        batch.deduction_amount = deduction_amount
        batch.net_payout = gross_earnings - deduction_amount
        batch.save()

        # Mark lessons as paid
        qualified_records.update(
            status='paid_out',
            payout_batch=batch,
            reviewed_at=timezone.now()
        )

        return batch
