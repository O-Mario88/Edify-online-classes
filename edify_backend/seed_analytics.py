import os
import sys
import django
from datetime import timedelta
from django.utils import timezone

sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edify_core.settings")
django.setup()

from analytics.models import DailyPlatformMetric, DailyInstitutionMetric
from institutions.models import Institution
import random

def seed():
    # Ensure an institution exists
    institution, _ = Institution.objects.get_or_create(
        name="Demo Academy",
        defaults={'country_code': 'UG'}
    )
    
    today = timezone.now().date()
    
    print("Clearing old analytics metrics...")
    DailyPlatformMetric.objects.all().delete()
    DailyInstitutionMetric.objects.all().delete()

    print("Seeding past 7 days of analytics data...")
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        
        # Platform metric growth logic (fake growth over week)
        base_active = 14000 + (6 - i) * 50
        base_dau = 1500 + (6 - i) * 60 + random.randint(-50, 50)
        
        DailyPlatformMetric.objects.create(
            date=target_date,
            total_active_users=base_active,
            dau=max(0, base_dau),
            active_institutions=240,
            paying_institutions=240,
            live_classes_held=45 + random.randint(-5, 10),
            lessons_completed=8000 + (6 - i) * 100 + random.randint(-200, 200),
            assessments_submitted=3000 + random.randint(-100, 100),
            mrr=42000000,
            marketplace_gmv=1200000 + (6-i) * 50000,
            payout_liabilities=840000,
            exam_registrations_pending=120
        )
        
        # Institution metric fake variance
        att_rate = 92 - i * 0.5 + random.randint(-2, 2)
        DailyInstitutionMetric.objects.create(
            date=target_date,
            institution=institution,
            total_students=1240,
            total_teachers=40,
            student_teacher_ratio=31.0,
            average_attendance_rate=min(100.0, max(0.0, att_rate)),
            lessons_published_count=12 + random.randint(0, 3),
            fee_collection_rate=72.0,
            outstanding_invoices_count=42
        )
        
    print("Analytics seeding complete.")

if __name__ == '__main__':
    seed()
