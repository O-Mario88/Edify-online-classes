import os
import sys
import django
from datetime import timedelta
from django.utils import timezone
import random

sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edify_core.settings")
django.setup()

from django.contrib.auth import get_user_model
from institutions.models import Institution
from curriculum.models import Subject, Topic, ClassLevel
from lessons.models import Lesson
from exams.models import ExamCenter
from live_sessions.models import LiveSession
from parent_portal.models import ParentStudentLink, WeeklySummary, RiskAlert
from accounts.models import ParentProfile, StudentProfile
from classes.models import Class

User = get_user_model()

def seed():
    print("Beginning global seed for Exams, Live Sessions, and Parent Portal...")

    # Ensure robust setup 
    parent_user, _ = User.objects.get_or_create(email="parent@edify.ug", defaults={"full_name": "Test Parent", "role": "parent"})
    student_user, _ = User.objects.get_or_create(email="student@edify.ug", defaults={"full_name": "Grace Nakato", "role": "universal_student"})
    teacher_user, _ = User.objects.get_or_create(email="teacher@edify.ug", defaults={"full_name": "Test Teacher", "role": "institution_teacher"})

    parent_profile, _ = ParentProfile.objects.get_or_create(user=parent_user)
    student_profile, _ = StudentProfile.objects.get_or_create(user=student_user)

    inst, _ = Institution.objects.get_or_create(name="Uganda National Examinations Board")

    # 1. Exams
    ExamCenter.objects.all().delete()
    ExamCenter.objects.create(
        institution=inst, board_name="UNEB", center_number="U0013",
        name="Kampala Central High School",
        location={"district": "Kampala", "region": "Central", "address": "Plot 12, Kampala Road", "coordinates": {"lat": 0.3136, "lng": 32.5811}},
        capacity={"total_seats": 500, "available_seats": 124},
        fees={"uce": 180000, "uace": 210000, "registration_fee": 50000},
        facilities=["Science Laboratories", "Library", "Computer Lab"],
        performance_history=[{"year": "2024", "exam_type": "UCE", "total_candidates": 450, "pass_rate": 92.5, "distinction_rate": 45.2}]
    )
    ExamCenter.objects.create(
        institution=inst, board_name="UNEB", center_number="U0001",
        name="St. Mary's College Kisubi",
        location={"district": "Wakiso", "region": "Central", "address": "Entebbe Road", "coordinates": {"lat": 0.1232, "lng": 32.5311}},
        capacity={"total_seats": 200, "available_seats": 12},
        fees={"uce": 200000, "uace": 250000, "registration_fee": 70000},
        facilities=["Advanced Labs", "Smart Classrooms"],
        performance_history=[{"year": "2024", "exam_type": "UCE", "total_candidates": 190, "pass_rate": 99.5, "distinction_rate": 85.2}]
    )

    # 2. Live Sessions
    LiveSession.objects.all().delete()
    


    class_level = ClassLevel.objects.first()
    subject = Subject.objects.first()
    topic = Topic.objects.first()
    p_class, _ = Class.objects.get_or_create(
        institution=inst, subject=subject, class_level=class_level, teacher=teacher_user,
        defaults={"title": "S4 A General Science"}
    )
    
    # Upcoming sessions
    for i in range(5):
        start = timezone.now() + timedelta(days=i, hours=2)
        lesson, _ = Lesson.objects.get_or_create(title=f"Physics Module {i+1}", topic=topic, defaults={"scheduled_at": start, "parent_class": p_class})
        LiveSession.objects.create(
            lesson=lesson, meeting_link=f"https://meet.google.com/abc-xyz-{i}", provider="google_meet",
            scheduled_start=start, duration_minutes=60, capacity=100, enrolled_count=random.randint(10, 80)
        )
        
    # Live session
    lesson_live, _ = Lesson.objects.get_or_create(title="Mastering Kinematics (LIVE)", topic=topic, defaults={"scheduled_at": timezone.now(), "parent_class": p_class})
    LiveSession.objects.create(
        lesson=lesson_live, meeting_link="https://meet.google.com/live-now", provider="google_meet",
        scheduled_start=timezone.now(), duration_minutes=90, capacity=200, enrolled_count=190
    )
    
    # Past sessions
    for i in range(2):
        start = timezone.now() - timedelta(days=i+1)
        lesson, _ = Lesson.objects.get_or_create(title=f"Past Review {i+1}", topic=topic, defaults={"scheduled_at": start, "parent_class": p_class})
        LiveSession.objects.create(
            lesson=lesson, meeting_link=f"https://meet.google.com/def-ghi-{i}", provider="google_meet",
            scheduled_start=start, duration_minutes=60, capacity=100, enrolled_count=98
        )

    # 3. Parent Portal
    ParentStudentLink.objects.all().delete()
    link = ParentStudentLink.objects.create(parent_profile=parent_profile, student_profile=student_profile, consent_status='active')
    
    WeeklySummary.objects.create(
        link=link, week_date=timezone.now().date(), 
        ai_generated_narrative="Grace has maintained excellent attendance across all core subjects this week. However, there has been a notable dip in quiz scores related to purely mathematical concepts in Physics. I recommend reviewing the 'Kinematics Equations' module before the end of the week."
    )

    RiskAlert.objects.all().delete()
    RiskAlert.objects.create(
        student=student_user, trigger_reason="Missed 2 assignments in Advanced Physics.", severity="high"
    )

    print("Global Seeding Complete.")

if __name__ == '__main__':
    seed()
