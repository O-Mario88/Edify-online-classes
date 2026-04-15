"""
Seed script for Primary School mock data (Uganda P4-P7).
Creates a primary institution, teachers, P4-P7 classes, subjects, students,
parent accounts, and P7 readiness data for demo purposes.

Usage:
  cd edify_backend
  python seed_primary.py
"""
import os
import sys
import django
import random
from decimal import Decimal

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from curriculum.models import Country, CurriculumTrack, EducationLevel, ClassLevel, Subject, Topic
from apps.institutions.models import Institution, InstitutionMembership

User = get_user_model()

# ─── Configuration ───
PRIMARY_SUBJECTS = [
    ('ENG', 'English'),
    ('MATH', 'Mathematics'),
    ('SST', 'Social Studies'),
    ('SCI', 'Integrated Science'),
    ('RE', 'Religious Education'),
    ('LL', 'Local Language'),
    ('CAPE', 'Creative Arts & Physical Education'),
]

PRIMARY_CLASSES = [
    ('P4', 'Primary 4', 4),
    ('P5', 'Primary 5', 5),
    ('P6', 'Primary 6', 6),
    ('P7', 'Primary 7', 7),
]

STUDENT_NAMES = [
    ('Amina', 'Nakato'), ('Joel', 'Okello'), ('Grace', 'Auma'),
    ('David', 'Mugisha'), ('Patience', 'Nabirye'), ('Moses', 'Kato'),
    ('Faith', 'Nambi'), ('Isaac', 'Ssebunya'), ('Sarah', 'Nalwoga'),
    ('Peter', 'Olweny'), ('Ruth', 'Kamugisha'), ('Samuel', 'Byaruhanga'),
    ('Mary', 'Atim'), ('John', 'Odong'), ('Esther', 'Kisakye'),
    ('Daniel', 'Tumwine'), ('Rebecca', 'Nambooze'), ('Joseph', 'Opio'),
    ('Miriam', 'Karungi'), ('Stephen', 'Lubega'),
]

TEACHER_NAMES = [
    ('Janet', 'Nabirye'), ('Robert', 'Okello'), ('Florence', 'Apio'),
    ('James', 'Ssempijja'), ('Agnes', 'Kamugisha'), ('Charles', 'Odong'),
    ('Betty', 'Nambi'),
]

PARENT_NAMES = [
    ('Richard', 'Nakato'), ('Christine', 'Okello'), ('Patrick', 'Auma'),
    ('Dorothy', 'Mugisha'), ('Francis', 'Nabirye'), ('Margaret', 'Kato'),
    ('Henry', 'Nambi'), ('Rose', 'Ssebunya'), ('George', 'Nalwoga'),
    ('Alice', 'Olweny'),
]

MATH_TOPICS = [
    'Number Operations', 'Fractions', 'Decimals', 'Measurement',
    'Geometry', 'Algebra Basics', 'Statistics', 'Money & Business',
    'Time & Calendar', 'Ratio and Proportion',
]

ENGLISH_TOPICS = [
    'Reading Comprehension', 'Creative Writing', 'Grammar & Structure',
    'Vocabulary Building', 'Listening Skills', 'Letter Writing',
    'Oral Communication', 'Poetry & Literature',
]

SCIENCE_TOPICS = [
    'Living Things', 'Human Body Systems', 'Plants & Agriculture',
    'Force and Motion', 'Energy & Heat', 'Weather & Climate',
    'Water & Sanitation', 'Simple Machines',
]

SST_TOPICS = [
    'Map Reading', 'Uganda Geography', 'East African Community',
    'Government & Democracy', 'Cultural Heritage', 'Transport & Communication',
    'Environment & Conservation', 'Economic Activities',
]


def seed_primary():
    print('=' * 60)
    print('🌱 Seeding Primary School Data (Uganda P4-P7)')
    print('=' * 60)

    # ─── 1. Curriculum Track ───
    print('\n📚 Setting up curriculum...')
    uganda, _ = Country.objects.get_or_create(code='UG', defaults={'name': 'Uganda'})
    primary_track, _ = CurriculumTrack.objects.get_or_create(
        country=uganda, name='Primary',
        defaults={'description': 'Uganda Primary Education (P1-P7)'}
    )
    upper_primary, _ = EducationLevel.objects.get_or_create(
        track=primary_track, name='Upper Primary',
        defaults={'description': 'Primary 4 to Primary 7'}
    )

    # Class levels
    class_levels = {}
    for code, name, grade in PRIMARY_CLASSES:
        cl, _ = ClassLevel.objects.get_or_create(
            level=upper_primary, name=name,
            defaults={'order': grade}
        )
        class_levels[code] = cl
        print(f'  ✅ {name}')

    # Subjects
    subjects = {}
    for code, name in PRIMARY_SUBJECTS:
        subj, _ = Subject.objects.get_or_create(
            name=name, defaults={'code': code}
        )
        subjects[code] = subj
        print(f'  ✅ Subject: {name}')

    # Topics
    topic_map = {
        'MATH': MATH_TOPICS,
        'ENG': ENGLISH_TOPICS,
        'SCI': SCIENCE_TOPICS,
        'SST': SST_TOPICS,
    }
    for subj_code, topics in topic_map.items():
        subj = subjects[subj_code]
        for idx, topic_name in enumerate(topics):
            for cls_code, cls_level in class_levels.items():
                Topic.objects.get_or_create(
                    subject=subj,
                    name=topic_name,
                    class_level=cls_level,
                    defaults={
                        'order': idx + 1,
                        'description': f'{topic_name} for {cls_level.name}',
                    }
                )
        print(f'  ✅ Topics for {subj.name}: {len(topics)} × {len(class_levels)} classes')

    # ─── 2. Institution ───
    print('\n🏫 Creating primary institution...')
    admin_user, _ = User.objects.get_or_create(
        username='primary_admin',
        defaults={
            'email': 'admin@greenhill-primary.ug',
            'first_name': 'Admin',
            'last_name': 'Greenhill',
            'role': 'institution_admin',
        }
    )
    admin_user.set_password('Demo@2026')
    admin_user.save()

    institution, _ = Institution.objects.get_or_create(
        name='Greenhill Primary Academy',
        defaults={
            'school_level': 'primary',
            'grade_offerings': [4, 5, 6, 7],
            'district': 'Kampala',
            'country': 'Uganda',
            'admin_user': admin_user,
            'is_active': True,
        }
    )

    # Admin membership
    InstitutionMembership.objects.get_or_create(
        institution=institution,
        user=admin_user,
        defaults={'role': 'admin', 'is_active': True}
    )
    print(f'  ✅ {institution.name} (school_level=primary)')
    print(f'  🔑 Login: primary_admin / Demo@2026')

    # ─── 3. Teachers ───
    print('\n👩‍🏫 Creating teachers...')
    teachers = []
    for idx, (first, last) in enumerate(TEACHER_NAMES):
        username = f'teacher_{first.lower()}'
        t, _ = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{first.lower()}.{last.lower()}@greenhill-primary.ug',
                'first_name': first,
                'last_name': last,
                'role': 'institution_teacher',
            }
        )
        t.set_password('Demo@2026')
        t.save()
        InstitutionMembership.objects.get_or_create(
            institution=institution, user=t,
            defaults={'role': 'teacher', 'is_active': True}
        )
        teachers.append(t)
        assigned_subj = PRIMARY_SUBJECTS[idx % len(PRIMARY_SUBJECTS)][1]
        print(f'  ✅ {first} {last} → {assigned_subj}')

    # ─── 4. Students ───
    print('\n🎒 Creating students...')
    students_by_class = {}
    student_objects = []

    for cls_code, cls_name, grade in PRIMARY_CLASSES:
        students_in_class = []
        count = random.randint(32, 42)
        for i in range(count):
            first, last = STUDENT_NAMES[i % len(STUDENT_NAMES)]
            # Add class prefix to make unique
            username = f'{cls_code.lower()}_{first.lower()}_{i}'
            s, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@student.greenhill-primary.ug',
                    'first_name': first,
                    'last_name': last,
                    'role': 'institution_student',
                }
            )
            s.set_password('Demo@2026')
            s.save()
            InstitutionMembership.objects.get_or_create(
                institution=institution, user=s,
                defaults={'role': 'student', 'is_active': True}
            )
            students_in_class.append(s)
            student_objects.append(s)
        students_by_class[cls_code] = students_in_class
        print(f'  ✅ {cls_name}: {len(students_in_class)} students')

    # ─── 5. Parents ───
    print('\n👨‍👩‍👧 Creating parent accounts...')
    parents = []
    for idx, (first, last) in enumerate(PARENT_NAMES):
        username = f'parent_{first.lower()}'
        p, _ = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{first.lower()}.{last.lower()}@parent.greenhill-primary.ug',
                'first_name': first,
                'last_name': last,
                'role': 'parent',
            }
        )
        p.set_password('Demo@2026')
        p.save()
        parents.append(p)
    print(f'  ✅ {len(parents)} parent accounts')

    # ─── 6. P7 Readiness Data ───
    print('\n🎓 Creating P7 readiness profiles...')
    try:
        from apps.intelligence.models import (
            P7ReadinessProfile, SubjectReadinessScore,
            MockExamRecord, P7RiskFlag, P7InstitutionSummary
        )

        p7_students = students_by_class.get('P7', [])
        readiness_states = ['highly_ready', 'on_track', 'needs_support', 'high_risk', 'critical_exam_risk']
        risk_count = 0

        for student in p7_students:
            score = random.randint(15, 95)
            if score >= 65:
                state = 'highly_ready' if score >= 80 else 'on_track'
            elif score >= 45:
                state = 'needs_support'
            elif score >= 25:
                state = 'high_risk'
            else:
                state = 'critical_exam_risk'

            profile, _ = P7ReadinessProfile.objects.get_or_create(
                student=student,
                institution=institution,
                defaults={
                    'overall_readiness_score': Decimal(str(score)),
                    'readiness_state': state,
                    'attendance_score': Decimal(str(random.randint(20, 98))),
                    'lesson_completion_score': Decimal(str(random.randint(15, 95))),
                    'assignment_completion_score': Decimal(str(random.randint(10, 95))),
                    'mock_exam_score': Decimal(str(random.randint(15, 90))),
                    'offline_test_score': Decimal(str(random.randint(20, 90))),
                    'resource_engagement_score': Decimal(str(random.randint(5, 85))),
                    'intervention_completion_score': Decimal(str(random.randint(10, 90))),
                    'parent_followup_score': Decimal(str(random.randint(5, 80))),
                    'revision_participation_score': Decimal(str(random.randint(10, 90))),
                }
            )

            # Subject readiness
            for code, name in PRIMARY_SUBJECTS[:5]:  # Core 5 subjects
                SubjectReadinessScore.objects.get_or_create(
                    profile=profile,
                    subject_name=name,
                    defaults={
                        'average_score': Decimal(str(random.randint(25, 95))),
                        'mock_score': Decimal(str(random.randint(20, 90))),
                        'offline_score': Decimal(str(random.randint(25, 92))),
                        'completion_pct': Decimal(str(random.randint(20, 95))),
                        'is_weak': random.random() < 0.3,
                        'needs_urgent_revision': random.random() < 0.15,
                    }
                )

            # Risk flags for at-risk students
            if state in ('high_risk', 'critical_exam_risk'):
                risk_count += 1
                P7RiskFlag.objects.get_or_create(
                    student=student,
                    risk_type='learner',
                    defaults={
                        'severity': 'critical' if state == 'critical_exam_risk' else 'high',
                        'institution': institution,
                        'signals': [
                            f'Readiness score: {score}%',
                            'Multiple subjects below threshold',
                        ],
                        'recommended_actions': [
                            'Emergency parent meeting',
                            'Assign subject rescue pack',
                            'Daily revision schedule',
                        ],
                    }
                )

        # Institution summary
        P7InstitutionSummary.objects.get_or_create(
            institution=institution,
            defaults={
                'total_p7_learners': len(p7_students),
                'avg_readiness_score': Decimal('58.5'),
                'highly_ready_count': len([s for s in p7_students[:5]]),
                'on_track_count': len(p7_students) // 3,
                'needs_support_count': len(p7_students) // 4,
                'high_risk_count': risk_count,
                'weakest_subject': 'Mathematics',
                'strongest_subject': 'Religious Education',
            }
        )

        print(f'  ✅ P7 readiness profiles: {len(p7_students)}')
        print(f'  ⚠️  Risk flags created: {risk_count}')

    except ImportError:
        print('  ⚠️  P7 readiness models not yet migrated. Skipping.')

    # ─── Summary ───
    print('\n' + '=' * 60)
    print('✅ Primary School seeding complete!')
    print(f'   Institution: {institution.name}')
    print(f'   Classes: {len(class_levels)}')
    print(f'   Subjects: {len(subjects)}')
    print(f'   Teachers: {len(teachers)}')
    print(f'   Students: {len(student_objects)}')
    print(f'   Parents: {len(parents)}')
    print('=' * 60)
    print('\n🔑 Login credentials (all accounts):')
    print('   Password: Demo@2026')
    print('   Admin: primary_admin')
    print(f'   Teachers: teacher_janet, teacher_robert, ...')
    print(f'   Students: p7_amina_0, p6_amina_0, ...')
    print(f'   Parents: parent_richard, parent_christine, ...')


if __name__ == '__main__':
    seed_primary()
