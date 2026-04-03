import logging
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from marketplace.services.payout_engine import PayoutEngine

logger = logging.getLogger(__name__)
User = get_user_model()

class Command(BaseCommand):
    help = 'Processes the biweekly teacher payouts based on qualified public lessons.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting biweekly payout processing engine..."))
        
        # In a real app we might tag "independent_teacher" on User Profile,
        # here we query all teachers who are linked to independent/public classes.
        from classes.models import Class
        public_teachers = User.objects.filter(
            taught_classes__visibility='public'
        ).distinct()
        
        processed_count = 0
        total_payout = 0
        
        for teacher in public_teachers:
            try:
                # 1. We must evaluate pending lessons for this teacher to qualify them
                from lessons.models import Lesson
                lessons = Lesson.objects.filter(parent_class__teacher=teacher, access_mode='published')
                
                for lesson in lessons:
                    PayoutEngine.evaluate_lesson(lesson)
                    
                # 2. Process to batch
                batch = PayoutEngine.process_biweekly_payout(teacher)
                if batch:
                    processed_count += 1
                    total_payout += batch.net_payout
                    self.stdout.write(self.style.SUCCESS(f"Generated Payout for {teacher.email}: UGX {batch.net_payout}"))
            except Exception as e:
                logger.error(f"Failed processing payout for {teacher.email}: {str(e)}")
                self.stdout.write(self.style.ERROR(f"Error for {teacher.email}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f"Finished processing {processed_count} teacher batches. Total Net Output: UGX {total_payout}"))
