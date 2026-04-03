import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from marketplace.models import Wallet, PayoutRequest
from classes.models import Class
from lessons.models import Lesson
from billing.models import TeacherPlatformSubscription
from django.db import transaction

class Command(BaseCommand):
    help = 'Generates bi-weekly payouts to independent teachers for qualified lessons on the public marketplace.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting Bi-Weekly Teacher Payout Generation...")
        now = timezone.now()
        fourteen_days_ago = now - datetime.timedelta(days=14)
        
        # In a real production system, you'd want a "QualifiedLessonLedger" table to mark lessons as 
        # 'credited' so they don't get counted twice. For now, we will assume lessons published 
        # specifically in the last 14 days are the ones getting credited.
        
        # 1. Identify active public teachers (MUST have active platform subscription)
        active_platform_subs = TeacherPlatformSubscription.objects.filter(
            status='active',
            active_until__gte=now
        )
        
        qualified_teacher_ids = active_platform_subs.values_list('teacher_id', flat=True)
        
        # 2. Extract strictly independent/public classes taught by these teachers
        public_classes = Class.objects.filter(
            teacher_id__in=qualified_teacher_ids,
            visibility='public'
        )
        
        # 3. Get qualified lessons: premium access, published recently.
        # Qualified lesson payout = 10,000 UGX
        RATE_PER_LESSON = 10000.00
        
        processed_count = 0
        total_payout = 0
        
        with transaction.atomic():
            for teacher_id in qualified_teacher_ids:
                teacher_classes = public_classes.filter(teacher_id=teacher_id)
                # Count payable lessons 
                payable_lessons_count = Lesson.objects.filter(
                    parent_class__in=teacher_classes,
                    access_mode='premium',
                    published_at__gte=fourteen_days_ago,
                    published_at__lte=now
                ).count()
                
                if payable_lessons_count > 0:
                    earnings = payable_lessons_count * RATE_PER_LESSON
                    
                    wallet, _ = Wallet.objects.get_or_create(teacher_id=teacher_id)
                    wallet.balance += earnings
                    wallet.save()
                    
                    # Optionally queue a payout request explicitly
                    PayoutRequest.objects.create(
                        wallet=wallet,
                        amount=earnings,
                        status='pending'
                    )
                    
                    self.stdout.write(f"Teacher {teacher_id}: Credited {earnings} UGX for {payable_lessons_count} lessons.")
                    processed_count += 1
                    total_payout += earnings
                    
        self.stdout.write(self.style.SUCCESS(f"Complete. Processed {processed_count} teacher wallets. Total Payout Added: {total_payout} UGX."))
