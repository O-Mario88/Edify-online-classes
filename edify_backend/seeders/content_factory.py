import logging
from lessons.models import Lesson
from resources.models import Resource, ResourceEngagementRecord
from assessments.models import Assessment, Submission
from marketplace.models import Listing, ListingTopicBinding
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

def seed_content_and_assignments(users_dict, academic_dict):
    """Creates Lessons, Resources, and their interactions to feed the Data Analytics views."""
    logger.info("Seeding Level 4: Resources, Lessons & Content Analytics")
    
    teacher_sec = users_dict["teacher.demo@edify.ug"]
    student_sec = users_dict["student.demo@edify.ug"]
    s3_blue = academic_dict["s3_blue"]
    topic_kin = academic_dict["topics"]["ph1"]
    
    # 1. Lesson Creation (Historical & Future)
    lessons = []
    for i in range(1, 15):
        lesson, _ = Lesson.objects.get_or_create(
            parent_class=s3_blue, 
            title=f"Physics Module {i}: Advanced Principles",
            defaults={"topic": topic_kin, "scheduled_at": timezone.now() - timedelta(days=20 - i*2)}
        )
        lessons.append(lesson)
    
    # 2. Uploaded Resources
    res_pdf, _ = Resource.objects.get_or_create(
        title="Kinematics Worksheet 1",
        defaults={"category": "worksheet", "uploaded_by": teacher_sec, "topic": topic_kin}
    )
    res_vid, _ = Resource.objects.get_or_create(
        title="O-Level Physics Revision Video",
        defaults={"category": "video", "uploaded_by": teacher_sec, "topic": topic_kin}
    )
    
    for i in range(1, 10):
        Resource.objects.get_or_create(
            title=f"Supplementary Guide {i} - Physics",
            defaults={"category": "notes", "uploaded_by": teacher_sec, "topic": topic_kin}
        )

    # 3. Generate Telemetry/Interactions for Student
    ResourceEngagementRecord.objects.get_or_create(
        student=student_sec, resource=res_pdf,
        defaults={"completion_percentage": 100, "total_active_time_mins": 25, "is_completed": True}
    )
    ResourceEngagementRecord.objects.get_or_create(
        student=users_dict["student.stellar@edify.ug"], resource=res_vid,
        defaults={"completion_percentage": 100, "total_active_time_mins": 40, "is_completed": True}
    )
    
    for j in range(1, 31):
        email = f"student.sec{j}@edify.ug"
        if email in users_dict:
            ResourceEngagementRecord.objects.get_or_create(
                student=users_dict[email], resource=res_pdf,
                defaults={"completion_percentage": 85 - j, "total_active_time_mins": 30, "is_completed": j % 2 == 0}
            )
    
    # 5. Formative Assessments & Marking Backlog
    quiz, _ = Assessment.objects.get_or_create(
        topic=topic_kin, type="quiz",
        defaults={"max_score": 100}
    )
    # Submitted but ungraded (feeds teacher marking backlog KPI)
    Submission.objects.get_or_create(
        student=student_sec, assessment=quiz,
        defaults={"status": "submitted", "submitted_at": timezone.now()}
    )
    # Graded (Feeds Class Average)
    Submission.objects.get_or_create(
        student=users_dict["student.stellar@edify.ug"], assessment=quiz,
        defaults={"status": "graded", "total_score": 95, "submitted_at": timezone.now() - timedelta(days=1)}
    )
    
    # 6. Independent Market
    independent_ind = users_dict.get("teacher.independent@edify.ug")
    if independent_ind:
        listing, _ = Listing.objects.get_or_create(
            teacher=independent_ind, title="Acing Physics Masterclass",
            defaults={"content_type": "video", "price_amount": 10000, "visibility_state": "published"}
        )
        ListingTopicBinding.objects.get_or_create(listing=listing, topic=topic_kin)
    
    logger.info(" - Seeded Telemetry, Logs, and Marking queues.")
    return {"lessons": lessons, "quiz": quiz}
