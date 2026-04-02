import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from institutions.models import Institution, InstitutionMembership
from classes.models import Class, ClassLevel
from curriculum.models import Subject, CurriculumTrack, EducationLevel
from institutions.models import InstitutionSubject

User = get_user_model()

def run_seed():
    print("Seeding QA Data for MVP Phase 1...")

    # 1. Create Users
    users = {
        'qa_principal@modelhigh.edu': {'name': 'QA Principal', 'role': 'institution_admin'},
        'qa_teacher@modelhigh.edu': {'name': 'QA Teacher', 'role': 'institution_teacher'},
        'qa_student@modelhigh.edu': {'name': 'QA Student', 'role': 'universal_student'},
    }

    db_users = {}
    for email, info in users.items():
        user, created = User.objects.get_or_create(email=email)
        user.set_password('demo123')
        user.full_name = info['name']
        user.role = info['role']
        user.save()
        db_users[email] = user
        print(f"Created/Updated User: {email} (Password: demo123)")

    # 2. Create Institution
    school, created = Institution.objects.get_or_create(
        name="Kampala Model High School",
        defaults={'slug': 'modelhigh'}
    )
    print(f"Ensured Institution: {school.name}")

    # 3. Bind Memberships
    InstitutionMembership.objects.get_or_create(
        institution=school, user=db_users['qa_principal@modelhigh.edu'],
        defaults={'role': 'headteacher', 'status': 'active'}
    )
    InstitutionMembership.objects.get_or_create(
        institution=school, user=db_users['qa_teacher@modelhigh.edu'],
        defaults={'role': 'class_teacher', 'status': 'active'}
    )
    InstitutionMembership.objects.get_or_create(
        institution=school, user=db_users['qa_student@modelhigh.edu'],
        defaults={'role': 'student', 'status': 'active'}
    )

    # 4. Activate a Curriculum Subject for the School
    track, _ = CurriculumTrack.objects.get_or_create(name="QA Testing Track", country_id=1)
    ed_level, _ = EducationLevel.objects.get_or_create(name="Secondary", track=track)
    c_level, _ = ClassLevel.objects.get_or_create(name="QA Senior 3", level=ed_level)
    subject, _ = Subject.objects.get_or_create(name="QA Biology", code="BIO_QA")

    inst_subject, _ = InstitutionSubject.objects.get_or_create(
        institution=school, subject=subject,
        defaults={'is_offered': True}
    )

    # 5. Create a Class for the Teacher
    qa_class, _ = Class.objects.get_or_create(
        institution=school,
        institution_subject=inst_subject,
        class_level=c_level,
        teacher=db_users['qa_teacher@modelhigh.edu'],
        defaults={'title': 'Senior 3 QA Biology'}
    )
    print(f"Created/Bound QA Class: {qa_class.title}")

    print("QA Seeding Complete! You can now log into these accounts.")

if __name__ == "__main__":
    run_seed()
