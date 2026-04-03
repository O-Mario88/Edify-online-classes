from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from classes.models import Class, ClassEnrollment
from lessons.models import Lesson, LessonQualificationRecord, LessonAttendance
from live_sessions.models import LiveSession
from billing.models import TeacherAccessFeeAccount, TeacherFeeInstallment
from marketplace.models import TeacherPayoutBatch, TeacherPayoutProfile, PayoutRequest

def seed_marketplace_ecosystem():
    User = get_user_model()
    
    # 1. Independent Teacher (Has 300,000 obligation and pending payout)
    tr_indep, _ = User.objects.get_or_create(email="tr.independent@edify.ug", defaults={
        "first_name": "Independent", "last_name": "Pro", "role": "independent_teacher", "is_verified_teacher": True
    })
    tr_indep.set_password("Demo1234!")
    tr_indep.save()

    TeacherPayoutProfile.objects.get_or_create(teacher=tr_indep, defaults={
        "mobile_number": "0777123456", "network": "mtn", "is_verified": True
    })

    # Monetization Models
    fee_account, _ = TeacherAccessFeeAccount.objects.get_or_create(teacher=tr_indep)

    # 2. Public Marketplace Class
    pub_class, _ = Class.objects.get_or_create(
        teacher=tr_indep,
        name="Senior 4 Mathematics (Public)",
        defaults={"level": "S4", "visibility": "public"}
    )

    # 3. Independent Students
    stu_indep, _ = User.objects.get_or_create(email="student.indep@edify.ug", defaults={
        "first_name": "Public", "last_name": "Learner", "role": "independent_student"
    })
    stu_indep.set_password("Demo1234!")
    stu_indep.save()
    ClassEnrollment.objects.get_or_create(student=stu_indep, enrolled_class=pub_class)

    stu_indep2, _ = User.objects.get_or_create(email="student2.indep@edify.ug", defaults={
        "first_name": "Public", "last_name": "Learner 2", "role": "independent_student"
    })
    stu_indep2.set_password("Demo1234!")
    stu_indep2.save()
    ClassEnrollment.objects.get_or_create(student=stu_indep2, enrolled_class=pub_class)

    # 4. Generate qualified lesson to trigger payout logic
    lesson_ok, _ = Lesson.objects.get_or_create(
        parent_class=pub_class, 
        title="Trigonometry Review",
        defaults={"scheduled_at": timezone.now() - timedelta(days=2), "access_mode": "published"}
    )
    
    # Add dummy attendance to satisfy rules
    for st in [stu_indep, stu_indep2]:
        LessonAttendance.objects.get_or_create(lesson=lesson_ok, student=st, defaults={"status": "present", "duration_minutes": 60})

    # Flag as qualified
    LessonQualificationRecord.objects.get_or_create(
        lesson=lesson_ok,
        defaults={
            "status": "qualified_for_payout",
            "calculated_payout": "20000.00"
        }
    )

    # 5. Generate Rejected Lesson
    lesson_rej, _ = Lesson.objects.get_or_create(
        parent_class=pub_class, 
        title="Algebra Draft",
        defaults={"scheduled_at": timezone.now() - timedelta(days=1), "access_mode": "draft"}
    )
    LessonQualificationRecord.objects.get_or_create(
        lesson=lesson_rej,
        defaults={
            "status": "rejected_for_payout",
            "rejection_reason": "Lesson was not published.",
            "calculated_payout": "0.00"
        }
    )

    # 6. Simulate a historical completed batch & deduction
    batch, _ = TeacherPayoutBatch.objects.get_or_create(
        teacher=tr_indep,
        cycle_start_date=timezone.now() - timedelta(days=40),
        cycle_end_date=timezone.now() - timedelta(days=26),
        defaults={
            "gross_earnings": "100000.00",
            "deduction_amount": "60000.00",
            "net_payout": "40000.00",
            "status": "disbursed"
        }
    )
    
    pre_req, created = PayoutRequest.objects.get_or_create(
        teacher=tr_indep,
        net_payable="40000.00",
        status="paid"
    )
    if created:
        batch.payout_request = pre_req
        batch.save()
        fee_account.recovered_amount = "60000.00"
        fee_account.save()

    print("-> Seeded Marketplace & Ecosystem workflows.")
