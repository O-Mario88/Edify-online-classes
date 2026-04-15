#!/usr/bin/env python3
"""
Heavy Seed Script — 10 Ugandan schools with rich data across all modules.
Run: cd edify_backend && python seed_heavy.py
"""

import os, sys, random, decimal
from pathlib import Path
from datetime import date, timedelta, datetime, time

sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

# ── Import all models ──────────────────────────────────────────────
from curriculum.models import Country, CurriculumTrack, EducationLevel, ClassLevel, Subject, Topic, SubjectCombination
from institutions.models import Institution, InstitutionMembership, InstitutionSubject
from classes.models import Class, ClassEnrollment
from scheduling.models import AcademicTerm, Room, TimetableSlot
from attendance.models import DailyRegister, LessonAttendance
from assessments.models import Assessment, AssessmentWindow, Question, Submission
from lessons.models import Lesson, LessonNote
from resources.models import Resource
from analytics.models import (
    DailyPlatformMetric, DailyInstitutionMetric,
    SubjectPerformanceSnapshot, TeacherPerformanceSnapshot,
    TeacherAttendanceSnapshot
)
from marketplace.models import Listing, Wallet

# Try intelligence models (may not exist yet)
try:
    from intelligence.models import (
        InstitutionHealthSnapshot, NextBestAction,
        Badge, HouseTeam, Challenge
    )
    HAS_INTELLIGENCE = True
except ImportError:
    HAS_INTELLIGENCE = False

# ── Constants ──────────────────────────────────────────────────────

PASSWORD = 'MapleTest2026!'

SCHOOLS = [
    {'name': 'Kampala High School', 'slug': 'kampala-high', 'level': 'secondary', 'color': '#1E40AF'},
    {'name': "King's College Budo", 'slug': 'kings-budo', 'level': 'secondary', 'color': '#7C3AED'},
    {'name': 'Makerere College School', 'slug': 'makerere-college', 'level': 'secondary', 'color': '#059669'},
    {'name': 'Gayaza High School', 'slug': 'gayaza-high', 'level': 'secondary', 'color': '#DC2626'},
    {'name': 'Namilyango College', 'slug': 'namilyango', 'level': 'secondary', 'color': '#D97706'},
    {'name': 'Mt. St. Mary\'s Namagunga', 'slug': 'namagunga', 'level': 'secondary', 'color': '#EC4899'},
    {'name': 'Ntare School', 'slug': 'ntare-school', 'level': 'secondary', 'color': '#0891B2'},
    {'name': 'Mbarara High School', 'slug': 'mbarara-high', 'level': 'mixed', 'color': '#65A30D'},
    {'name': 'St. Mary\'s Kisubi', 'slug': 'smack-kisubi', 'level': 'secondary', 'color': '#4F46E5'},
    {'name': 'Buddo Junior School', 'slug': 'buddo-junior', 'level': 'primary', 'color': '#F59E0B'},
]

SUBJECTS_LIST = [
    'Mathematics', 'English Language', 'Physics', 'Chemistry',
    'Biology', 'History', 'Geography', 'Economics',
    'Literature in English', 'Computer Studies',
    'Fine Art', 'Agriculture', 'Entrepreneurship',
    'Christian Religious Education', 'French',
]

UGANDAN_FIRST_NAMES_M = [
    'Allan', 'Brian', 'Charles', 'David', 'Emmanuel', 'Francis', 'George',
    'Henry', 'Isaac', 'James', 'Kenneth', 'Lawrence', 'Moses', 'Nathan',
    'Oscar', 'Patrick', 'Ronald', 'Samuel', 'Timothy', 'Victor',
    'Andrew', 'Benedict', 'Conrad', 'Dennis', 'Edwin', 'Felix', 'Gerald',
    'Herbert', 'Ivan', 'Joel', 'Kevin', 'Leonard', 'Martin', 'Nelson',
]
UGANDAN_FIRST_NAMES_F = [
    'Alice', 'Betty', 'Catherine', 'Diana', 'Esther', 'Florence', 'Grace',
    'Hellen', 'Irene', 'Janet', 'Ketty', 'Lillian', 'Margaret', 'Naomi',
    'Olive', 'Patricia', 'Rebecca', 'Sarah', 'Teddy', 'Vicky',
    'Agnes', 'Beatrice', 'Charity', 'Dorothy', 'Evelyn', 'Fiona', 'Gloria',
    'Hope', 'Immaculate', 'Josephine', 'Kisakye', 'Lydia', 'Martha', 'Norah',
]
UGANDAN_LAST_NAMES = [
    'Okello', 'Nakamya', 'Kato', 'Namukasa', 'Lwanga', 'Ssenyonga', 'Mubiru',
    'Namaganda', 'Bwire', 'Achieng', 'Mugisha', 'Nakato', 'Tumusiime', 'Babirye',
    'Ochieng', 'Kaggwa', 'Nantongo', 'Ssali', 'Atim', 'Nankya',
    'Kasozi', 'Nabwire', 'Musoke', 'Kirabo', 'Nyeko', 'Agaba', 'Akello',
    'Byarugaba', 'Chelangat', 'Draru', 'Engoru', 'Ffe', 'Gimara', 'Higenyi',
]

TOPIC_NAMES = {
    'Mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus', 'Vectors', 'Matrices', 'Probability'],
    'English Language': ['Comprehension', 'Composition', 'Grammar', 'Vocabulary', 'Summary Writing', 'Oral Skills', 'Letter Writing'],
    'Physics': ['Mechanics', 'Optics', 'Electricity', 'Waves', 'Heat', 'Magnetism', 'Nuclear Physics', 'Measurement'],
    'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Acids & Bases', 'Electrochemistry', 'Periodic Table'],
    'Biology': ['Cell Biology', 'Ecology', 'Genetics', 'Human Anatomy', 'Plant Biology', 'Reproduction', 'Evolution', 'Nutrition'],
    'History': ['Colonial Africa', 'World War I', 'World War II', 'East African Integration', 'Independence Movements', 'Cold War'],
    'Geography': ['Map Reading', 'Climate', 'Agriculture', 'Industry', 'Population', 'Urbanization', 'Physical Geography'],
    'Economics': ['Demand & Supply', 'National Income', 'Money & Banking', 'International Trade', 'Inflation', 'Public Finance'],
}

ROOM_NAMES = ['Main Hall', 'Lab A', 'Lab B', 'Computer Lab', 'Library Hall',
              'Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202',
              'Art Studio', 'Music Room', 'Sports Hall']

PERIOD_TIMES = [
    (time(8, 0), time(8, 40)),
    (time(8, 45), time(9, 25)),
    (time(9, 30), time(10, 10)),
    (time(10, 30), time(11, 10)),
    (time(11, 15), time(11, 55)),
    (time(13, 0), time(13, 40)),   # After lunch
    (time(13, 45), time(14, 25)),
    (time(14, 30), time(15, 10)),
]


def rn():
    """Random name"""
    gender = random.choice(['m', 'f'])
    first = random.choice(UGANDAN_FIRST_NAMES_M if gender == 'm' else UGANDAN_FIRST_NAMES_F)
    last = random.choice(UGANDAN_LAST_NAMES)
    return f"{first} {last}"


def make_email(full_name, school_slug, role_prefix):
    slug = full_name.lower().replace(' ', '.').replace("'", "")
    return f"{role_prefix}.{slug}@{school_slug}.edify.local"


# ═══════════════════════════════════════════════════════════════════
#  MAIN SEED
# ═══════════════════════════════════════════════════════════════════

def seed():
    print("\n" + "=" * 70)
    print("  EDIFY HEAVY SEED — 10 Schools + Full Data Matrix")
    print("=" * 70)

    # ── 1. Curriculum Foundation ─────────────────────────────────
    print("\n📍 Step 1: Curriculum Foundation...")

    uganda, _ = Country.objects.get_or_create(code='uganda', defaults={'name': 'Uganda'})
    kenya, _ = Country.objects.get_or_create(code='kenya', defaults={'name': 'Kenya'})
    rwanda, _ = Country.objects.get_or_create(code='rwanda', defaults={'name': 'Rwanda'})

    track, _ = CurriculumTrack.objects.get_or_create(country=uganda, name='Uganda National Curriculum')

    o_level, _ = EducationLevel.objects.get_or_create(track=track, name='O-Level')
    a_level, _ = EducationLevel.objects.get_or_create(track=track, name='A-Level')
    primary, _ = EducationLevel.objects.get_or_create(track=track, name='Primary', defaults={'is_primary': True})

    # Class levels
    class_levels = {}
    for lvl_name, grade, level_obj in [
        ('P4', 4, primary), ('P5', 5, primary), ('P6', 6, primary), ('P7', 7, primary),
        ('S1', 8, o_level), ('S2', 9, o_level), ('S3', 10, o_level), ('S4', 11, o_level),
        ('S5', 12, a_level), ('S6', 13, a_level),
    ]:
        cl, _ = ClassLevel.objects.get_or_create(
            level=level_obj, name=lvl_name,
            defaults={'internal_canonical_grade': grade}
        )
        class_levels[lvl_name] = cl

    # Subjects
    subjects = {}
    for s_name in SUBJECTS_LIST:
        subj = Subject.objects.filter(name=s_name).first()
        if not subj:
            subj = Subject.objects.create(name=s_name)
        subjects[s_name] = subj

    # Topics (8 per subject for the top 8 subjects)
    topics_created = 0
    for subj_name, topic_list in TOPIC_NAMES.items():
        subj = subjects.get(subj_name)
        if not subj:
            continue
        for cls_name in ['S1', 'S2', 'S3', 'S4']:
            cl = class_levels.get(cls_name)
            if not cl:
                continue
            for order, t_name in enumerate(topic_list, 1):
                _, created = Topic.objects.get_or_create(
                    subject=subj, class_level=cl, name=f"{t_name} ({cls_name})",
                    defaults={'order': order}
                )
                if created:
                    topics_created += 1

    # Subject combinations (core subjects for each class level)
    core_subjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology']
    for cls_name in ['S1', 'S2', 'S3', 'S4']:
        cl = class_levels[cls_name]
        for s_name in core_subjects:
            SubjectCombination.objects.get_or_create(
                class_level=cl, subject=subjects[s_name],
                defaults={'is_core': True}
            )

    print(f"   ✅ 3 countries, 1 track, 3 levels, {len(class_levels)} class levels")
    print(f"   ✅ {len(subjects)} subjects, {topics_created} topics")

    # ── 2. Platform Admin + Global Users ───────────────────────
    print("\n👤 Step 2: Platform Admin & Global Users...")

    admin_user, _ = User.objects.get_or_create(
        email='admin@edify.africa',
        defaults={'full_name': 'Edify Platform Admin', 'country_code': 'uganda', 'role': 'admin', 'is_staff': True}
    )
    admin_user.set_password(PASSWORD)
    admin_user.save()

    # Create a few universal/independent teachers
    indie_teachers = []
    for i in range(5):
        name = rn()
        t, _ = User.objects.get_or_create(
            email=f"indie.teacher{i+1}@edify.africa",
            defaults={'full_name': name, 'country_code': 'uganda', 'role': 'teacher'}
        )
        t.set_password(PASSWORD)
        t.save()
        indie_teachers.append(t)

    # Create universal students (not in any school)
    uni_students = []
    for i in range(10):
        name = rn()
        s, _ = User.objects.get_or_create(
            email=f"student{i+1}@edify.africa",
            defaults={'full_name': name, 'country_code': 'uganda', 'role': 'student'}
        )
        s.set_password(PASSWORD)
        s.save()
        uni_students.append(s)

    # Parents
    parents = []
    for i in range(8):
        name = rn()
        p, _ = User.objects.get_or_create(
            email=f"parent{i+1}@edify.africa",
            defaults={'full_name': name, 'country_code': 'uganda', 'role': 'student'}
        )
        p.set_password(PASSWORD)
        p.save()
        parents.append(p)

    print(f"   ✅ 1 admin, {len(indie_teachers)} indie teachers, {len(uni_students)} universal students, {len(parents)} parents")

    # ── 3. Schools ──────────────────────────────────────────────
    print("\n🏫 Step 3: Creating 10 Schools...")

    all_school_data = []  # Will hold tuples of (institution, teachers, students, classes, term)

    for sch in SCHOOLS:
        institution, _ = Institution.objects.get_or_create(
            slug=sch['slug'],
            defaults={
                'name': sch['name'],
                'country_code': 'uganda',
                'curriculum_track': 'national',
                'school_level': sch['level'],
                'primary_color': sch['color'],
                'subscription_plan': random.choice(['free', 'starter', 'professional', 'enterprise']),
                'grade_offerings': [8, 9, 10, 11] if sch['level'] == 'secondary' else [4, 5, 6, 7, 8, 9, 10, 11],
            }
        )

        # ── Admin for this school ──
        admin_name = rn()
        inst_admin, _ = User.objects.get_or_create(
            email=make_email(admin_name, sch['slug'], 'head'),
            defaults={'full_name': admin_name, 'country_code': 'uganda', 'role': 'institution'}
        )
        inst_admin.set_password(PASSWORD)
        inst_admin.save()

        InstitutionMembership.objects.get_or_create(
            user=inst_admin, institution=institution, role='headteacher'
        )

        # Deputy + DOS
        for staff_role in ['deputy', 'dos', 'registrar']:
            s_name = rn()
            s_user, _ = User.objects.get_or_create(
                email=make_email(s_name, sch['slug'], staff_role),
                defaults={'full_name': s_name, 'country_code': 'uganda', 'role': 'institution'}
            )
            s_user.set_password(PASSWORD)
            s_user.save()
            InstitutionMembership.objects.get_or_create(
                user=s_user, institution=institution, role=staff_role
            )

        # ── Teachers (8-12 per school) ──
        num_teachers = random.randint(8, 12)
        school_teachers = []
        for t_i in range(num_teachers):
            t_name = rn()
            teacher, _ = User.objects.get_or_create(
                email=make_email(t_name, sch['slug'], f"t{t_i+1}"),
                defaults={'full_name': t_name, 'country_code': 'uganda', 'role': 'teacher'}
            )
            teacher.set_password(PASSWORD)
            teacher.save()
            school_teachers.append(teacher)

            InstitutionMembership.objects.get_or_create(
                user=teacher, institution=institution, role='subject_teacher'
            )

        # ── Students (30-60 per school) ──
        num_students = random.randint(30, 60)
        school_students = []
        for s_i in range(num_students):
            s_name = rn()
            student, _ = User.objects.get_or_create(
                email=make_email(s_name, sch['slug'], f"s{s_i+1}"),
                defaults={'full_name': s_name, 'country_code': 'uganda', 'role': 'student'}
            )
            student.set_password(PASSWORD)
            student.save()
            school_students.append(student)

            InstitutionMembership.objects.get_or_create(
                user=student, institution=institution, role='student'
            )

        # Parent memberships (link some parents)
        for p in parents[:3]:
            InstitutionMembership.objects.get_or_create(
                user=p, institution=institution, role='parent'
            )

        # ── Institution Subjects ──
        school_subjects = random.sample(list(subjects.values()), k=min(10, len(subjects)))
        for subj in school_subjects:
            InstitutionSubject.objects.get_or_create(institution=institution, subject=subj)

        # ── Academic Term ──
        term, _ = AcademicTerm.objects.get_or_create(
            institution=institution, name='Term 1 2026',
            defaults={
                'start_date': date(2026, 2, 2),
                'end_date': date(2026, 5, 8),
                'is_active': True
            }
        )
        AcademicTerm.objects.get_or_create(
            institution=institution, name='Term 2 2026',
            defaults={
                'start_date': date(2026, 5, 25),
                'end_date': date(2026, 8, 21),
                'is_active': False
            }
        )
        AcademicTerm.objects.get_or_create(
            institution=institution, name='Term 3 2026',
            defaults={
                'start_date': date(2026, 9, 7),
                'end_date': date(2026, 12, 4),
                'is_active': False
            }
        )

        # ── Rooms ──
        room_count = random.randint(6, 10)
        school_rooms = []
        for r_name in random.sample(ROOM_NAMES, k=min(room_count, len(ROOM_NAMES))):
            room, _ = Room.objects.get_or_create(
                institution=institution, name=r_name,
                defaults={'capacity': random.randint(25, 50)}
            )
            school_rooms.append(room)

        # ── Classes (one per subject × class_level combination) ──
        if sch['level'] == 'primary':
            levels_for_school = ['P4', 'P5', 'P6', 'P7']
        else:
            levels_for_school = ['S1', 'S2', 'S3', 'S4']

        school_classes = []
        for lvl_name in levels_for_school:
            cl = class_levels.get(lvl_name)
            if not cl:
                continue
            for subj in school_subjects[:6]:  # 6 subjects per level
                teacher = random.choice(school_teachers)
                inst_subj = InstitutionSubject.objects.filter(institution=institution, subject=subj).first()
                cls, _ = Class.objects.get_or_create(
                    institution=institution,
                    class_level=cl,
                    teacher=teacher,
                    title=f"{lvl_name} {subj.name}",
                    defaults={
                        'institution_subject': inst_subj,
                        'visibility': 'private',
                        'is_published': True,
                    }
                )
                school_classes.append(cls)

        # ── Enrollments (each student in 5-8 classes) ──
        for student in school_students:
            chosen_classes = random.sample(school_classes, k=min(random.randint(5, 8), len(school_classes)))
            for cls in chosen_classes:
                ClassEnrollment.objects.get_or_create(
                    enrolled_class=cls, student=student,
                    defaults={'status': 'active'}
                )

        # ── Timetable Slots ──
        slot_count = 0
        for cls in school_classes[:16]:  # Top 16 classes get timetable slots
            day = random.randint(0, 4)
            period_idx = random.randint(0, len(PERIOD_TIMES) - 1)
            start_t, end_t = PERIOD_TIMES[period_idx]
            subj = cls.institution_subject.subject if cls.institution_subject else random.choice(school_subjects)
            TimetableSlot.objects.get_or_create(
                institution=institution,
                term=term,
                assigned_class=cls,
                day_of_week=day,
                start_time=start_t,
                defaults={
                    'end_time': end_t,
                    'subject': subj,
                    'teacher': cls.teacher,
                    'room': random.choice(school_rooms) if school_rooms else None,
                    'is_active': True,
                }
            )
            slot_count += 1

        all_school_data.append({
            'institution': institution,
            'teachers': school_teachers,
            'students': school_students,
            'classes': school_classes,
            'term': term,
            'rooms': school_rooms,
            'subjects': school_subjects,
        })

        print(f"   ✅ {sch['name']}: {num_teachers}T, {num_students}S, {len(school_classes)}C, {slot_count} timetable slots")

    # ── 4. Lessons ──────────────────────────────────────────────
    print("\n📖 Step 4: Creating Lessons...")
    total_lessons = 0
    for sd in all_school_data:
        for cls in sd['classes']:
            topics = Topic.objects.filter(
                subject=cls.institution_subject.subject if cls.institution_subject else None,
                class_level=cls.class_level
            )[:4]
            for i, topic in enumerate(topics):
                scheduled = timezone.now() - timedelta(days=random.randint(0, 30))
                lesson, created = Lesson.objects.get_or_create(
                    parent_class=cls,
                    topic=topic,
                    title=f"{topic.name} - Lesson {i+1}",
                    defaults={
                        'access_mode': random.choice(['published', 'published', 'draft']),
                        'scheduled_at': scheduled,
                        'published_at': scheduled if random.random() > 0.2 else None,
                    }
                )
                if created:
                    total_lessons += 1
                    # Add notes to 60% of lessons
                    if random.random() > 0.4:
                        LessonNote.objects.get_or_create(
                            lesson=lesson,
                            defaults={'content_blocks': {
                                'introduction': f'Introduction to {topic.name}',
                                'objectives': [f'Understand {topic.name}', 'Apply concepts', 'Solve problems'],
                                'key_terms': [topic.name.split('(')[0].strip()],
                            }}
                        )
    print(f"   ✅ {total_lessons} lessons created across all schools")

    # ── 5. Assessments & Submissions ────────────────────────────
    print("\n📝 Step 5: Assessments & Submissions...")
    total_assessments = 0
    total_submissions = 0
    for sd in all_school_data:
        for cls in random.sample(sd['classes'], k=min(8, len(sd['classes']))):
            topic = Topic.objects.filter(
                subject=cls.institution_subject.subject if cls.institution_subject else None,
                class_level=cls.class_level
            ).first()

            for a_type in ['quiz', 'exam', 'assignment']:
                assessment, created = Assessment.objects.get_or_create(
                    topic=topic,
                    type=a_type,
                    source=random.choice(['platform_quiz', 'manual_school_test', 'practical']),
                    term=sd['term'],
                    defaults={'max_score': decimal.Decimal('100.00')}
                )
                if created:
                    total_assessments += 1
                    # Add 3-5 questions
                    for q_i in range(random.randint(3, 5)):
                        Question.objects.create(
                            assessment=assessment,
                            type=random.choice(['mcq', 'short_answer']),
                            content=f"Question {q_i+1} about {topic.name if topic else 'General'}",
                            marks=decimal.Decimal(str(random.randint(5, 20))),
                            options=['Option A', 'Option B', 'Option C', 'Option D'] if random.random() > 0.3 else [],
                            correct_answer='Option A' if random.random() > 0.3 else '',
                            order=q_i + 1,
                        )

                # Submissions from enrolled students
                enrolled = ClassEnrollment.objects.filter(enrolled_class=cls, status='active').select_related('student')[:15]
                for enrollment in enrolled:
                    score = decimal.Decimal(str(random.randint(30, 98)))
                    _, sub_created = Submission.objects.get_or_create(
                        assessment=assessment,
                        student=enrollment.student,
                        defaults={
                            'status': random.choice(['submitted', 'graded', 'graded']),
                            'submitted_at': timezone.now() - timedelta(days=random.randint(1, 20)),
                            'answers_data': {'q1': 'A', 'q2': 'B', 'q3': 'C'},
                            'total_score': score,
                        }
                    )
                    if sub_created:
                        total_submissions += 1

    print(f"   ✅ {total_assessments} assessments, {total_submissions} submissions")

    # ── 6. Attendance Records ───────────────────────────────────
    print("\n📋 Step 6: Attendance Records (last 14 days)...")
    total_attendance = 0
    today = date.today()

    for sd in all_school_data:
        for day_offset in range(14):
            record_date = today - timedelta(days=day_offset)
            if record_date.weekday() >= 5:  # Skip weekends
                continue

            for student in sd['students']:
                status = random.choices(
                    ['present', 'present', 'present', 'present', 'late', 'authorized_absent', 'unauthorized_absent'],
                    weights=[50, 20, 15, 5, 5, 3, 2]
                )[0]
                _, created = DailyRegister.objects.get_or_create(
                    student=student,
                    record_date=record_date,
                    defaults={
                        'institution': sd['institution'],
                        'term': sd['term'],
                        'status': status,
                        'recorded_by': random.choice(sd['teachers']),
                    }
                )
                if created:
                    total_attendance += 1

    print(f"   ✅ {total_attendance} daily attendance records")

    # ── 7. Resources ────────────────────────────────────────────
    print("\n📚 Step 7: Resources...")
    total_resources = 0
    for sd in all_school_data[:5]:  # First 5 schools upload resources
        for teacher in sd['teachers'][:3]:
            for subj in sd['subjects'][:3]:
                topics = Topic.objects.filter(subject=subj)[:2]
                for topic in topics:
                    _, created = Resource.objects.get_or_create(
                        title=f"{topic.name} Study Notes",
                        uploaded_by=teacher,
                        defaults={
                            'description': f"Comprehensive study notes for {topic.name}",
                            'category': random.choice(['notes', 'textbook', 'worksheet', 'slides']),
                            'visibility': random.choice(['platform_shared', 'institution_only']),
                            'subject': subj,
                            'class_level': topic.class_level,
                            'topic': topic,
                            'price': decimal.Decimal(str(random.choice([0, 0, 5000, 10000, 15000]))),
                            'rating': decimal.Decimal(str(round(random.uniform(3.5, 5.0), 1))),
                        }
                    )
                    if created:
                        total_resources += 1

    print(f"   ✅ {total_resources} resources uploaded")

    # ── 8. Marketplace Listings ─────────────────────────────────
    print("\n🛒 Step 8: Marketplace Listings...")
    total_listings = 0
    for teacher in indie_teachers:
        Wallet.objects.get_or_create(
            teacher=teacher,
            defaults={'balance': decimal.Decimal(str(random.randint(0, 500000)))}
        )
        for subj_name in random.sample(list(subjects.keys()), k=4):
            subj = subjects[subj_name]
            listing, created = Listing.objects.get_or_create(
                title=f"{subj_name} Mastery Course by {teacher.full_name}",
                teacher=teacher,
                defaults={
                    'content_type': random.choice(['video', 'notes', 'assessment_pack']),
                    'price_amount': decimal.Decimal(str(random.randint(5000, 50000))),
                    'currency': 'UGX',
                    'visibility_state': 'published',
                }
            )
            if created:
                total_listings += 1

    print(f"   ✅ {total_listings} marketplace listings")

    # ── 9. Analytics Rollups ────────────────────────────────────
    print("\n📊 Step 9: Analytics (14-day rollups)...")

    for day_offset in range(14):
        d = today - timedelta(days=day_offset)
        DailyPlatformMetric.objects.get_or_create(
            date=d,
            defaults={
                'total_active_users': random.randint(800, 2500),
                'dau': random.randint(200, 800),
                'active_institutions': random.randint(6, 10),
                'paying_institutions': random.randint(3, 8),
                'live_classes_held': random.randint(20, 80),
                'lessons_completed': random.randint(100, 500),
                'assessments_submitted': random.randint(50, 300),
                'mrr': decimal.Decimal(str(random.randint(2000000, 8000000))),
                'marketplace_gmv': decimal.Decimal(str(random.randint(500000, 3000000))),
                'exam_registrations_pending': random.randint(10, 200),
            }
        )

    for sd in all_school_data:
        inst = sd['institution']
        num_s = len(sd['students'])
        num_t = len(sd['teachers'])

        for day_offset in range(14):
            d = today - timedelta(days=day_offset)
            DailyInstitutionMetric.objects.get_or_create(
                date=d, institution=inst,
                defaults={
                    'total_students': num_s,
                    'total_teachers': num_t,
                    'student_teacher_ratio': decimal.Decimal(str(round(num_s / max(num_t, 1), 2))),
                    'average_attendance_rate': decimal.Decimal(str(round(random.uniform(75, 98), 2))),
                    'lessons_published_count': random.randint(5, 30),
                    'fee_collection_rate': decimal.Decimal(str(round(random.uniform(60, 95), 2))),
                    'outstanding_invoices_count': random.randint(0, 20),
                }
            )

    # Subject performance snapshots for students
    perf_count = 0
    for sd in all_school_data:
        for student in sd['students'][:20]:  # Top 20 students per school
            for subj in sd['subjects'][:5]:
                _, created = SubjectPerformanceSnapshot.objects.get_or_create(
                    student=student, subject=subj,
                    defaults={
                        'institution': sd['institution'],
                        'average_score': decimal.Decimal(str(round(random.uniform(35, 95), 2))),
                        'exam_readiness_score': decimal.Decimal(str(round(random.uniform(30, 95), 2))),
                        'completion_percentage': decimal.Decimal(str(round(random.uniform(20, 100), 2))),
                        'is_at_risk': random.random() < 0.15,
                    }
                )
                if created:
                    perf_count += 1

    # Teacher performance snapshots
    teacher_perf_count = 0
    for sd in all_school_data:
        for teacher in sd['teachers']:
            _, created = TeacherPerformanceSnapshot.objects.get_or_create(
                teacher=teacher, institution=sd['institution'],
                defaults={
                    'class_average_score': decimal.Decimal(str(round(random.uniform(50, 85), 2))),
                    'live_sessions_delivered': random.randint(5, 40),
                    'assignments_published': random.randint(3, 20),
                    'interventions_resolved': random.randint(0, 10),
                }
            )
            if created:
                teacher_perf_count += 1

    print(f"   ✅ 14 platform metrics, {len(all_school_data)*14} institution metrics")
    print(f"   ✅ {perf_count} student performance snapshots")
    print(f"   ✅ {teacher_perf_count} teacher performance snapshots")

    # ── 10. Intelligence Layer (if available) ───────────────────
    if HAS_INTELLIGENCE:
        print("\n🧠 Step 10: Intelligence Engine...")

        health_count = 0
        for sd in all_school_data:
            for day_offset in range(7):
                d = today - timedelta(days=day_offset)
                _, created = InstitutionHealthSnapshot.objects.get_or_create(
                    institution=sd['institution'], date=d,
                    defaults={
                        'overall_score': round(random.uniform(60, 95), 1),
                        'student_attendance_score': round(random.uniform(75, 98), 1),
                        'teacher_activity_score': round(random.uniform(60, 95), 1),
                        'resource_engagement_score': round(random.uniform(40, 90), 1),
                        'parent_engagement_score': round(random.uniform(15, 60), 1),
                        'intervention_completion_score': round(random.uniform(50, 95), 1),
                        'assignment_completion_score': round(random.uniform(55, 95), 1),
                        'offline_result_trend_score': round(random.uniform(40, 85), 1),
                        'online_result_trend_score': round(random.uniform(50, 90), 1),
                        'adoption_depth_score': round(random.uniform(30, 80), 1),
                    }
                )
                if created:
                    health_count += 1

        # NBA (Next Best Actions) for teachers/students
        nba_count = 0
        action_types = ['assign_revision', 'contact_parent', 'schedule_remedial', 'review_marks', 'promote_resource']
        for sd in all_school_data[:5]:
            for teacher in sd['teachers'][:3]:
                for _ in range(random.randint(2, 5)):
                    NextBestAction.objects.create(
                        user=teacher,
                        institution=sd['institution'],
                        action_type=random.choice(action_types),
                        category=random.choice(['academic', 'attendance', 'assessment', 'intervention']),
                        title=f"Action: {random.choice(action_types).replace('_', ' ').title()}",
                        description=f"AI-generated recommendation for {teacher.full_name}",
                        priority=random.choice(['high', 'medium', 'low']),
                        status='pending',
                        action_payload={'generated_by': 'seed_heavy'},
                    )
                    nba_count += 1

        print(f"   ✅ {health_count} health snapshots, {nba_count} next-best-actions")
    else:
        print("\n⏭️  Step 10: Intelligence models not found, skipping.")

    # ── Summary ─────────────────────────────────────────────────
    total_users = User.objects.count()
    total_institutions = Institution.objects.count()
    total_classes_db = Class.objects.count()
    total_enrollments = ClassEnrollment.objects.count()
    total_lessons_db = Lesson.objects.count()
    total_assessments_db = Assessment.objects.count()
    total_submissions_db = Submission.objects.count()
    total_attendance_db = DailyRegister.objects.count()
    total_resources_db = Resource.objects.count()

    print("\n" + "=" * 70)
    print("  🎉 SEED COMPLETE — Database Totals")
    print("=" * 70)
    print(f"  Users:          {total_users}")
    print(f"  Institutions:   {total_institutions}")
    print(f"  Classes:        {total_classes_db}")
    print(f"  Enrollments:    {total_enrollments}")
    print(f"  Lessons:        {total_lessons_db}")
    print(f"  Assessments:    {total_assessments_db}")
    print(f"  Submissions:    {total_submissions_db}")
    print(f"  Attendance:     {total_attendance_db}")
    print(f"  Resources:      {total_resources_db}")
    print("=" * 70)
    print(f"\n  🔐 Login: admin@edify.africa / {PASSWORD}")
    print(f"  🔐 Any school head: head.*@<slug>.edify.local / {PASSWORD}")
    print(f"  🔐 Any teacher: t1.*@<slug>.edify.local / {PASSWORD}")
    print(f"  🔐 Any student: s1.*@<slug>.edify.local / {PASSWORD}")
    print()


if __name__ == '__main__':
    seed()
