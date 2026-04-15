import logging
from classes.models import Class, ClassEnrollment
from curriculum.models import Country, ClassLevel, Subject, Topic, CurriculumTrack, EducationLevel
from parent_portal.models import ParentStudentLink

logger = logging.getLogger(__name__)

def seed_academic_structure(users_dict, institutions_dict):
    """Generates Subjects, ClassLevels, Classes, and links Students."""
    logger.info("Seeding Level 3: Curriculum and Academic Structures")
    
    # 1. Base Curriculum
    country, _ = Country.objects.get_or_create(code="UG", defaults={"name": "Uganda"})
    track, _ = CurriculumTrack.objects.get_or_create(country=country, name="National Curriculum")
    edu_primary, _ = EducationLevel.objects.get_or_create(track=track, name="Primary", is_primary=True)
    edu_secondary, _ = EducationLevel.objects.get_or_create(track=track, name="Secondary", is_primary=False)
    
    level_s3, _ = ClassLevel.objects.get_or_create(level=edu_secondary, internal_canonical_grade=10, defaults={"name": "Senior 3"})
    level_p6, _ = ClassLevel.objects.get_or_create(level=edu_primary, internal_canonical_grade=6, defaults={"name": "Primary 6"})
    
    subject_physics, _ = Subject.objects.get_or_create(name="Physics", code="PHY_UG")
    subject_sst, _ = Subject.objects.get_or_create(name="Social Studies", code="SST_UG")
    
    # Primary Topics
    Topic.objects.get_or_create(subject=subject_sst, class_level=level_p6, name="East African Community", defaults={"order": 1})
    Topic.objects.get_or_create(subject=subject_sst, class_level=level_p6, name="Physical Features", defaults={"order": 2})

    # Secondary Topics
    ph_topic1, _ = Topic.objects.get_or_create(subject=subject_physics, class_level=level_s3, name="Kinematics", defaults={"order": 1})
    ph_topic2, _ = Topic.objects.get_or_create(subject=subject_physics, class_level=level_s3, name="Newton's Laws", defaults={"order": 2})
    ph_topic3, _ = Topic.objects.get_or_create(subject=subject_physics, class_level=level_s3, name="Work, Energy, Power", defaults={"order": 3})

    # 2. Classes
    maple = institutions_dict["maple_sec"]
    sunrise = institutions_dict["sunrise_pri"]
    
    s3_blue, _ = Class.objects.get_or_create(
        institution=maple, title="S3 Blue", 
        defaults={"teacher": users_dict["teacher.demo@edify.ug"], "class_level": level_s3}
    )
    
    p6_eagles, _ = Class.objects.get_or_create(
        institution=sunrise, title="P6 Eagles",
        defaults={"teacher": users_dict["teacher.primary@edify.ug"], "class_level": level_p6}
    )
    
    # 3. Enrollments
    ClassEnrollment.objects.get_or_create(student=users_dict["student.demo@edify.ug"], enrolled_class=s3_blue)
    ClassEnrollment.objects.get_or_create(student=users_dict["student.stellar@edify.ug"], enrolled_class=s3_blue)
    ClassEnrollment.objects.get_or_create(student=users_dict["student.primary@edify.ug"], enrolled_class=p6_eagles)
    
    # Bulk Enrollments
    for i in range(1, 31):
        email = f"student.sec{i}@edify.ug"
        if email in users_dict:
            ClassEnrollment.objects.get_or_create(student=users_dict[email], enrolled_class=s3_blue)
            
    for i in range(1, 11):
        email = f"student.pri{i}@edify.ug"
        if email in users_dict:
            ClassEnrollment.objects.get_or_create(student=users_dict[email], enrolled_class=p6_eagles)
    # 4. Parent Links
    from accounts.models import ParentProfile, StudentProfile
    parent_prof, _ = ParentProfile.objects.get_or_create(user=users_dict["parent.demo@edify.ug"])
    student_prof_demo, _ = StudentProfile.objects.get_or_create(user=users_dict["student.demo@edify.ug"])
    student_prof_pri, _ = StudentProfile.objects.get_or_create(user=users_dict["student.primary@edify.ug"])

    ParentStudentLink.objects.get_or_create(
        parent_profile=parent_prof, 
        student_profile=student_prof_demo,
        defaults={"relationship_type": "mother"}
    )
    ParentStudentLink.objects.get_or_create(
        parent_profile=parent_prof, 
        student_profile=student_prof_pri,
        defaults={"relationship_type": "mother"}
    )
    
    logger.info(" - Seeded Curriculum and Enrolled Students.")
    return {"s3_blue": s3_blue, "p6_eagles": p6_eagles, "topics": {"ph1": ph_topic1, "ph2": ph_topic2, "ph3": ph_topic3}}
