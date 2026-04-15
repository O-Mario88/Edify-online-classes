import logging
from attendance.models import DailyRegister
from interventions.models import StudentRiskAlert, InterventionPlan
from lessons.models import LessonAttendance
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

def seed_engagement(users_dict, academic_dict, content_dict):
    """Generates synthetic historical attendance data and surfaces Early Warnings."""
    logger.info("Seeding Level 5: Historical Attendance & At-Risk Early Warnings")
    
    student_sec = users_dict["student.demo@edify.ug"]
    teacher_sec = users_dict["teacher.demo@edify.ug"]
    s3_blue = academic_dict["s3_blue"]
    lessons = content_dict["lessons"]
    
    now = timezone.now()
    
    # 1. Lesson Attendance mapping
    for index, lesson in enumerate(lessons):
        # Stellar student always attends
        LessonAttendance.objects.get_or_create(
            lesson=lesson, student=users_dict["student.stellar@edify.ug"],
            defaults={"status": "present", "duration_minutes": 40}
        )
        # Demo student misses occasionally
        status = "absent" if index % 3 == 0 else "present"
        LessonAttendance.objects.get_or_create(
            lesson=lesson, student=student_sec,
            defaults={"status": status, "duration_minutes": 40 if status == 'present' else 0}
        )
        
        # Bulk students
        for j in range(1, 31):
            email = f"student.sec{j}@edify.ug"
            if email in users_dict:
                bulk_status = "absent" if (index + j) % 5 == 0 else "present"
                LessonAttendance.objects.get_or_create(
                    lesson=lesson, student=users_dict[email],
                    defaults={"status": bulk_status, "duration_minutes": 40 if bulk_status == 'present' else 0}
                )

    # 2. Daily Register Map (Historical padding for UI averages)
    from scheduling.models import AcademicTerm
    term, _ = AcademicTerm.objects.get_or_create(
        institution=s3_blue.institution, 
        name="Term 1",
        defaults={"start_date": now.date() - timedelta(days=30), "end_date": now.date() + timedelta(days=60)}
    )
    
    for i in range(1, 60):
        past_date = (now - timedelta(days=i)).date()
        # skip weekends roughly
        if past_date.weekday() > 4:
            continue
            
        DailyRegister.objects.get_or_create(
            student=users_dict["student.stellar@edify.ug"], record_date=past_date,
            defaults={"status": "present", "recorded_by": teacher_sec, "institution": s3_blue.institution, "term": term}
        )
        
        # Demo student has dropping attendance
        demo_status = "unauthorized_absent" if i % 4 == 0 else "present"
        DailyRegister.objects.get_or_create(
            student=student_sec, record_date=past_date,
            defaults={"status": demo_status, "recorded_by": teacher_sec, "institution": s3_blue.institution, "term": term}
        )
        
        # Bulk Secondary Students
        for j in range(1, 31):
            email = f"student.sec{j}@edify.ug"
            if email in users_dict:
                bulk_status = "unauthorized_absent" if (i + j) % 7 == 0 else "present" # Some random absences
                DailyRegister.objects.get_or_create(
                    student=users_dict[email], record_date=past_date,
                    defaults={"status": bulk_status, "recorded_by": teacher_sec, "institution": s3_blue.institution, "term": term}
                )

    # 3. AI Copilot Risk Alerts
    risk, _ = StudentRiskAlert.objects.get_or_create(
        student=student_sec,
        institution=s3_blue.institution,
        defaults={
            "severity": "amber",
            "flagged_reason": "Attendance dropped below primary school average (60%).",
            "status": "active"
        }
    )
    
    # 4. Teacher Active Intervention Case
    InterventionPlan.objects.get_or_create(
        alert=risk,
        defaults={
            "assigned_teacher": teacher_sec,
            "target_outcome": "Kinematics Catch-up Framework",
            "status": "active",
            "deadline": now + timedelta(days=5)
        }
    )
    
    logger.info(" - Seeded 14-day trailing attendance and Copilot Warnings.")
