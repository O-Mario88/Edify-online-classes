#!/usr/bin/env python3
"""
MASTER SEED SCRIPT - Loads ALL mock data into the database
This script populates the database with comprehensive test data from all frontend dashboards

Run with: python manage.py shell < seed_all_mock_data.py
Or: python seed_all_mock_data.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone
import random

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction
from curriculum.models import Country, CurriculumTrack, EducationLevel, Subject, Topic, ClassLevel
from institutions.models import Institution, InstitutionMembership
from classes.models import Class, ClassEnrollment
from lessons.models import Lesson, LessonNote
from assessments.models import Assessment, Submission, Question
from live_sessions.models import LiveSession
from marketplace.models import Listing, ListingTopicBinding, Wallet, TeacherPayoutProfile
from resources.models import Resource
from analytics.models import DailyPlatformMetric, DailyInstitutionMetric
from attendance.models import LessonAttendance

User = get_user_model()

class MockDataSeeder:
    """Master seeder for all mock data"""
    
    def __init__(self):
        self.print_header("🌱 EDIFY MOCK DATA SEEDER - MASTER SCRIPT")
        self.uganda_country = None
        self.o_level_track = None
        self.a_level_track = None
        self.students = []
        self.teachers = []
        self.institutions = []
        
    def print_header(self, text):
        print("\n" + "=" * 80)
        print(text)
        print("=" * 80)
        
    def print_section(self, text):
        print(f"\n{'=' * 50}")
        print(f"📍 {text}")
        print(f"{'=' * 50}")
    
    @transaction.atomic
    def run(self):
        """Execute all seeding operations"""
        try:
            self.seed_countries()
            self.seed_curriculum()
            self.seed_institutions()
            self.seed_users()
            self.seed_classes()
            self.seed_subjects_and_topics()
            self.seed_assessments()
            self.seed_marketplace_listings()
            self.seed_resources()
            self.seed_lessons()
            self.seed_live_sessions()
            self.seed_attendance()
            self.seed_analytics()
            self.seed_wallets()
            self.print_header("✅ ALL SEEDING COMPLETE")
        except Exception as e:
            print(f"❌ ERROR during seeding: {e}")
            import traceback
            traceback.print_exc()
    
    def seed_countries(self):
        """Create countries"""
        self.print_section("Creating Countries")
        
        countries = [
            ('UG', 'Uganda'),
            ('KE', 'Kenya'),
            ('TZ', 'Tanzania'),
        ]
        
        for code, name in countries:
            country, created = Country.objects.get_or_create(
                code=code,
                defaults={'name': name}
            )
            if created:
                print(f"✅ Created country: {name}")
        
        self.uganda_country = Country.objects.get(code='UG')
    
    def seed_curriculum(self):
        """Create curriculum tracks and education levels"""
        self.print_section("Creating Curriculum Structure")
        
        # O-Level Track
        self.o_level_track, created = CurriculumTrack.objects.get_or_create(
            country=self.uganda_country,
            name='O-Level (Ordinary)'
        )
        if created:
            print(f"✅ Created O-Level curriculum track")
        
        # A-Level Track
        self.a_level_track, created = CurriculumTrack.objects.get_or_create(
            country=self.uganda_country,
            name='A-Level (Advanced)'
        )
        if created:
            print(f"✅ Created A-Level curriculum track")
            
        # Primary Track
        self.primary_track, created = CurriculumTrack.objects.get_or_create(
            country=self.uganda_country,
            name='Primary'
        )
        if created:
            print(f"✅ Created Primary curriculum track")
        
        # Education Levels
        o_level, _ = EducationLevel.objects.get_or_create(
            track=self.o_level_track,
            name='O-Level'
        )
        
        a_level, _ = EducationLevel.objects.get_or_create(
            track=self.a_level_track,
            name='A-Level'
        )
        
        primary_level, _ = EducationLevel.objects.get_or_create(
            track=self.primary_track,
            name='Primary',
            defaults={"is_primary": True}
        )
        
        # Seed Primary Class Levels (P4-P7)
        primary_classes = [('P4', 4), ('P5', 5), ('P6', 6), ('P7', 7)]
        for cls_name, canonical in primary_classes:
            ClassLevel.objects.get_or_create(
                level=primary_level,
                name=cls_name,
                defaults={"internal_canonical_grade": canonical}
            )
        
        # Seed Secondary Class Levels (S1-S6)
        class_levels = [('S1', 8), ('S2', 9), ('S3', 10), ('S4', 11), ('S5', 12), ('S6', 13)]
        education_level = o_level
        
        for i, (cls_name, canonical) in enumerate(class_levels):
            if i >= 4:
                education_level = a_level
            
            ClassLevel.objects.get_or_create(
                level=education_level,
                name=cls_name,
                defaults={"internal_canonical_grade": canonical}
            )
        
        print(f"✅ Created curriculum tracks and class levels (S1-S6)")
    
    def seed_institutions(self):
        """Create institutions"""
        self.print_section("Creating Institutions")
        
        institution_data = []
        prefixes = ['Kampala', 'Entebbe', 'Wakiso', 'Jinja', 'Mbarara', 'Gulu', 'Arua', 'Mbale', 'Masaka', 'Fort Portal', 'Soroti', 'Hoima']
        suffixes = ['High School', 'College', 'Academy', 'Secondary School', 'International School', 'Vocational Institute', 'Primary School']
        
        for i in range(12):
            name = f"{random.choice(prefixes)} {random.choice(suffixes)}"
            level_choice = random.choice(['primary', 'secondary', 'mixed'])
            institution_data.append({
                'name': name,
                'slug': name.lower().replace(' ', '-').replace("'", ""),
                'country_code': 'UG',
                'school_level': level_choice
            })
        
        for data in institution_data:
            inst, created = Institution.objects.get_or_create(
                slug=data['slug'],
                defaults={
                    'name': data['name'],
                    'country_code': data['country_code'],
                    'school_level': data.get('school_level', 'secondary')
                }
            )
            if created:
                print(f"✅ Created institution: {inst.name}")
            self.institutions.append(inst)
    
    def seed_users(self):
        """Create teachers and students"""
        self.print_section("Creating Users (Teachers & Students)")
        
        # Create Teachers
        teachers_data = []
        for i in range(50):
            teachers_data.append({
                'email': f'teacher{i}@maplesch.com',
                'full_name': f'Teacher {i} Name',
                'role': 'teacher',
                'specialization': random.choice(['Mathematics', 'Chemistry', 'English', 'Social Studies'])
            })
        
        for teacher_data in teachers_data:
            user, created = User.objects.get_or_create(
                email=teacher_data['email'],
                defaults={
                    'full_name': teacher_data['full_name'],
                    'role': teacher_data['role'],
                    'country_code': 'uganda'
                }
            )
            if created:
                user.set_password('demo123')
                user.save()
                print(f"✅ Created teacher: {user.full_name}")
            self.teachers.append(user)
        
        # Create Students
        students_data = []
        for i in range(500):
            students_data.append({'email': f'student{i}@email.com', 'full_name': f'Student {i} Name', 'institution': random.choice(self.institutions)})
        
        for student_data in students_data:
            user, created = User.objects.get_or_create(
                email=student_data['email'],
                defaults={
                    'full_name': student_data['full_name'],
                    'role': 'student',
                    'country_code': 'uganda'
                }
            )
            if created:
                user.set_password('demo123')
                user.save()
                print(f"✅ Created student: {user.full_name}")
            self.students.append(user)
        
        # Create Admin
        admin_user, created = User.objects.get_or_create(
            email='christine.namaganda@maplesch.com',
            defaults={
                'full_name': 'Christine Namaganda',
                'role': 'platform_admin',
                'country_code': 'uganda'
            }
        )
        if created:
            admin_user.set_password('demo123')
            admin_user.save()
            print(f"✅ Created admin: {admin_user.full_name}")

        # Create Institution Admin
        inst_admin, created = User.objects.get_or_create(
            email='admin@institution.com',
            defaults={
                'full_name': 'Institution Admin',
                'role': 'institution_admin',
                'country_code': 'uganda'
            }
        )
        if created:
            inst_admin.set_password('demo123')
            inst_admin.save()
            InstitutionMembership.objects.get_or_create(
                user=inst_admin,
                institution=self.institutions[0],
                role='headteacher',
                status='active'
            )
            print(f"✅ Created institution admin: {inst_admin.full_name}")
    
    def seed_classes(self):
        """Create classes and enrollments"""
        self.print_section("Creating Classes & Enrollments")
        
        class_levels = ClassLevel.objects.all()
        
        for institution in self.institutions:
            # Distribute primary or secondary classes depending on institution school_level
            institution_levels = []
            if institution.school_level in ['primary', 'mixed']:
                institution_levels.extend([cl for cl in class_levels if cl.level.name == 'Primary'])
            if institution.school_level in ['secondary', 'mixed']:
                institution_levels.extend([cl for cl in class_levels if cl.level.name != 'Primary'])
                
            for class_level in institution_levels[:4]:  # limit classes per school to not exhaust memory
                for subject in Subject.objects.all()[:4]:  
                    teacher = random.choice(self.teachers)
                    
                    cls, created = Class.objects.get_or_create(
                        institution=institution,
                        title=f'{class_level.name} {subject.name}',
                        class_level=class_level,
                        defaults={
                            'teacher': teacher,
                            'is_published': True
                        }
                    )
                    
                    if created:
                        print(f"✅ Created class: {cls.title}")
                        
                        # Enroll students heavily
                        amount = random.randint(30, 80)
                        enrolled = 0
                        for student in self.students:
                            if student.institution == institution:
                                ClassEnrollment.objects.get_or_create(
                                    student=student,
                                    enrolled_class=cls,
                                    defaults={'enrolled_at': timezone.now()}
                                )
                                enrolled += 1
                                if enrolled > amount: break
    
    def seed_subjects_and_topics(self):
        """Create subjects and topics"""
        self.print_section("Creating Subjects & Topics")
        
        subjects_data = {
            'Mathematics': ['Algebra', 'Geometry', 'Calculus', 'Trigonometry', 'Statistics'],
            'Physics': ['Mechanics', 'Electricity', 'Optics', 'Thermodynamics', 'Kinematics'],
            'Chemistry': ['Atomic Structure', 'Chemical Bonding', 'Reactions', 'Titration', 'Organic Chemistry'],
            'Biology': ['Genetics', 'Cells', 'Evolution', 'Ecology', 'Photosynthesis'],
            'English': ['Grammar', 'Literature', 'Comprehension', 'Writing', 'Speaking'],
            'Geography': ['Map Skills', 'Climate', 'Resources', 'Development', 'Population'],
            'History': ['Ancient Civilizations', 'Medieval Times', 'Modern History', 'Africa', 'World Wars'],
            'Computer Studies': ['Programming', 'Networks', 'Databases', 'Web Development', 'Security'],
            'Entrepreneurship': ['Business Planning', 'Marketing', 'Finance', 'Leadership', 'Innovation'],
            'Religious Education': ['Faith', 'Ethics', 'Morality', 'Comparative Religions', 'Philosophy'],
        }
        
        primary_subjects_data = {
            'Social Studies': ['Physical Features of East Africa', 'People and Settlements', 'Citizenship', 'Resources and Economics', 'Our Leaders'],
            'Integrated Science': ['Human Body', 'Matter and Energy', 'Agriculture and Environment', 'Sanitation and Diseases', 'Animals'],
            'Local Language': ['Vocabulary', 'Storytelling', 'Proverbs', 'Cultural Practices', 'Grammar in Local Language'],
            'CAPE': ['Creative Arts', 'Physical Education', 'Music', 'Crafts', 'Games and Sports']
        }
        
        for subject_name, topics_list in subjects_data.items():
            subject, created = Subject.objects.get_or_create(
                name=subject_name,
                defaults={'code': subject_name.upper()[:4]}
            )
            
            if created:
                print(f"✅ Created subject: {subject_name}")
            
            # Create topics
            class_level = ClassLevel.objects.filter(name='S4').first()
            for i, topic_name in enumerate(topics_list):
                Topic.objects.get_or_create(
                    subject=subject,
                    class_level=class_level,
                    name=topic_name,
                    defaults={'order': i + 1}
                )

        # Seed Primary Subjects
        for subject_name, topics_list in primary_subjects_data.items():
            subject, created = Subject.objects.get_or_create(
                name=subject_name,
                defaults={'code': subject_name.upper().replace(' ', '')[:4]}
            )
            
            if created:
                print(f"✅ Created Primary subject: {subject_name}")
                
            for class_name in ['P4', 'P5', 'P6', 'P7']:
                p_level = ClassLevel.objects.filter(name=class_name).first()
                if p_level:
                    for i, topic_name in enumerate(topics_list):
                        # slightly vary topic names per class
                        Topic.objects.get_or_create(
                            subject=subject,
                            class_level=p_level,
                            name=f"{topic_name} Sequence",
                            defaults={'order': i + 1}
                        )
        
        # Also bind core primary subjects that overlap with secondary (like English, Math) back to primary classes
        for over_subj in ['English', 'Mathematics', 'Religious Education']:
            s = Subject.objects.filter(name=over_subj).first()
            if s:
                for class_name in ['P4', 'P5', 'P6', 'P7']:
                    p_level = ClassLevel.objects.filter(name=class_name).first()
                    if p_level:
                        for i, t_name in enumerate(subjects_data[over_subj][:4]):
                            Topic.objects.get_or_create(
                                subject=s,
                                class_level=p_level,
                                name=f"Primary {t_name}",
                                defaults={'order': i + 1}
                            )
    
    def seed_assessments(self):
        """Create assessments"""
        self.print_section("Creating Assessments")
        
        subjects = Subject.objects.all()[:3]
        
        count = 0
        for subject in subjects:
            for i in range(3):
                topic = subject.topics.first()
                topic_name = topic.name if topic else 'General'
                
                assessment = Assessment.objects.create(
                    topic=topic,
                    type='quiz',
                    source='platform_quiz',
                    max_score=100.0
                )
                
                if assessment:
                    count += 1
                    print(f"✅ Created assessment for topic: {topic_name}")
                    
                    # Create questions
                    for q in range(random.randint(5, 10)):
                        Question.objects.create(
                            assessment=assessment,
                            content=f"Question {q+1} for {subject.name}",
                            type='mcq',
                            marks=10.0,
                            order=q + 1
                        )
        
        print(f"✅ Created {count} assessments with questions")
    
    def seed_live_sessions(self):
        """Create live sessions"""
        self.print_section("Creating Live Sessions")
        
        lessons = Lesson.objects.all()[:5]
        
        for i, lesson in enumerate(lessons):
            session, created = LiveSession.objects.get_or_create(
                lesson=lesson,
                defaults={
                    'meeting_link': f"https://meet.google.com/test-{random.randint(100, 999)}-{random.randint(100, 999)}",
                    'scheduled_start': timezone.now() + timedelta(hours=random.randint(1, 24)),
                    'duration_minutes': 60,
                    'status': 'scheduled'
                }
            )
            
            if session:
                print(f"✅ Created live session for lesson: {lesson.title}")
    
    def seed_marketplace_listings(self):
        """Create marketplace listings"""
        self.print_section("Creating Marketplace Listings")
        
        listing_types = ['video', 'notes', 'assessment', 'textbook']
        topics = list(Topic.objects.all())
        
        count = 0
        for topic in random.sample(topics, min(100, len(topics))):
            for teacher in random.sample(self.teachers, min(5, len(self.teachers))):
                for listing_type in random.choices(listing_types, k=random.randint(2, 4)):
                    listing_title = f"{listing_type.title()}: {topic.name} Mastery"
                    
                    listing = Listing.objects.create(
                        teacher=teacher,
                        title=listing_title,
                        content_type=listing_type,
                        price_amount=random.choice([5000, 10000, 15000, 20000, 25000]),
                        visibility_state='published',
                        average_rating=round(random.uniform(4.0, 5.0), 1),
                        review_count=random.randint(5, 200),
                        student_count=random.randint(10, 500)
                    )
                    
                    if listing:
                        ListingTopicBinding.objects.create(listing=listing, topic=topic)
                        count += 1
        
        print(f"✅ Created {count} marketplace listings")
    
    def seed_resources(self):
        """Create academic resources footprint for library"""
        self.print_section("Creating Resources")
        
        resource_types = [
            ('textbook', 'Advanced Concepts Textbook', 45),
            ('guide', 'Ultimate Study Guide', 32),
            ('past_paper', 'Past Papers Edition', 28),
            ('notes', 'Premium Revision Notes', 22),
            ('video', 'Interactive Video Tutorial', 120),
        ]
        
        count = 0
        topics = list(Topic.objects.all())
        selected_topics = random.sample(topics, min(80, len(topics)))
        
        for topic in selected_topics:
            for res_type, base_title, size in resource_types:
                for i in range(random.randint(1, 4)):
                    resource = Resource.objects.create(
                        title=f"{base_title}: {topic.name} - Part {i+1}",
                        description=f"Comprehensive {res_type} for mastering {topic.name}",
                        category=res_type,
                        uploaded_by=random.choice(self.teachers),
                        visibility='platform_shared'
                    )
                    
                    if resource:
                        # assign resource.topic directly if possible, or assume generic
                        if hasattr(resource, 'topic'):
                            resource.topic = topic
                            resource.save()
                        count += 1
        print(f"✅ Created {count} resources")
    
    def seed_lessons(self):
        """Create lessons"""
        self.print_section("Creating Lessons")
        
        classes = Class.objects.all()[:5]
        
        count = 0
        for cls in classes:
            for i in range(random.randint(5, 10)):
                lesson = Lesson.objects.create(
                    parent_class=cls,
                    title=f"Lesson {i+1}: {cls.title} - Unit {(i // 3) + 1}",
                    scheduled_at=timezone.now() + timedelta(days=random.randint(1, 30))
                )
                
                if lesson:
                    count += 1
                    
                    # Create lesson notes
                    LessonNote.objects.create(
                        lesson=lesson,
                        content_blocks={"blocks": [{"type": "paragraph", "data": {"text": f"Comprehensive notes for {lesson.title}"}}]}
                    )
        
        print(f"✅ Created {count} lessons with notes")
    
    def seed_attendance(self):
        """Create attendance records"""
        self.print_section("Creating Attendance Records")
        
        lessons = Lesson.objects.all()[:5]
        
        count = 0
        for lesson in lessons:
            for student in self.students[:random.randint(15, 25)]:
                record = LessonAttendance.objects.create(
                    lesson=lesson,
                    student=student,
                    status=random.choice(['present', 'absent', 'late']),
                    marked_by=lesson.parent_class.teacher
                )
                
                if record:
                    count += 1
        
        print(f"✅ Created {count} attendance records")
    
    def seed_analytics(self):
        """Create analytics data"""
        self.print_section("Creating Analytics Metrics")
        
        today = timezone.now().date()
        
        # Clear old metrics
        DailyPlatformMetric.objects.all().delete()
        DailyInstitutionMetric.objects.all().delete()
        
        # Create 30 days of metrics
        for i in range(29, -1, -1):
            target_date = today - timedelta(days=i)
            
            # Platform metrics
            DailyPlatformMetric.objects.create(
                date=target_date,
                total_active_users=40000 + (29 - i) * 100,
                dau=3200 + (29 - i) * 50 + random.randint(-100, 100),
                active_institutions=78,
                paying_institutions=76,
                live_classes_held=45 + random.randint(-5, 10),
                lessons_completed=8500 + (29 - i) * 150,
                assessments_submitted=3400,
                mrr=42500000,
                marketplace_gmv=1450000 + (29 - i) * 75000,
                payout_liabilities=890000,
                exam_registrations_pending=1420
            )
            
            # Institution metrics
            for institution in self.institutions:
                att_rate = 88 + random.randint(-5, 5)
                DailyInstitutionMetric.objects.create(
                    date=target_date,
                    institution=institution,
                    total_students=len(self.students),
                    total_teachers=len(self.teachers),
                    student_teacher_ratio=round(len(self.students) / len(self.teachers), 1),
                    average_attendance_rate=min(100.0, max(0.0, att_rate)),
                    lessons_published_count=12 + random.randint(0, 5),
                    fee_collection_rate=78.5,
                    outstanding_invoices_count=random.randint(20, 60)
                )
        
        print(f"✅ Created 30 days of analytics metrics")
    
    def seed_wallets(self):
        """Create teacher wallets"""
        self.print_section("Creating Teacher Wallets")
        
        for teacher in self.teachers:
            wallet, created = Wallet.objects.get_or_create(
                teacher=teacher,
                defaults={
                    'balance': random.randint(50000, 500000)
                }
            )
            
            if created:
                print(f"✅ Created wallet for {teacher.full_name}: {wallet.balance} UGX")
            
            # Create payout profile
            TeacherPayoutProfile.objects.get_or_create(
                teacher=teacher,
                defaults={
                    'payment_method': 'mtn_mobile_money',
                    'payment_phone': f'+256750{random.randint(100000, 999999)}',
                    'is_verified': True
                }
            )

def main():
    """Main entry point"""
    seeder = MockDataSeeder()
    seeder.run()
    print("\n🎉 Mock data seeding complete! System ready for testing.")
    print("\n📊 Summary:")
    print(f"   Students: {User.objects.filter(role='student').count()}")
    print(f"   Teachers: {User.objects.filter(role='teacher').count()}")
    print(f"   Institutions: {Institution.objects.count()}")
    print(f"   Classes: {Class.objects.count()}")
    print(f"   Assessments: {Assessment.objects.count()}")
    print(f"   Marketplace Listings: {Listing.objects.count()}")
    print(f"   Resources: {Resource.objects.count()}")
    print(f"   Lessons: {Lesson.objects.count()}")
    print(f"   Live Sessions: {LiveSession.objects.count()}")

if __name__ == '__main__':
    main()
