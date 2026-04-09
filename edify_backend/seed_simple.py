#!/usr/bin/env python3
"""
SIMPLIFIED SEED SCRIPT - Focus on core mock data
Run: python manage.py shell < seed_simple.py
Or: cd edify_backend && python seed_simple.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction
from curriculum.models import Country, CurriculumTrack, EducationLevel, Subject, Topic, ClassLevel
from institutions.models import Institution
from marketplace.models import Listing, ListingTopicBinding
from resources.models import Resource

User = get_user_model()

print("\n" + "="*80)
print("🌱 SIMPLIFIED MOCK DATA SEEDER")
print("="*80)

try:
    # 1. CREATE COUNTRIES
    print("\n1️⃣ Creating countries...")
    uganda, _ = Country.objects.get_or_create(code='UG', defaults={'name': 'Uganda'})
    kenya, _ = Country.objects.get_or_create(code='KE', defaults={'name': 'Kenya'})
    print("✅ Countries created")
    
    # 2. CREATE CURRICULUM TRACKS
    print("\n2️⃣ Creating curriculum tracks...")
    o_track, _ = CurriculumTrack.objects.get_or_create(country=uganda, name='O-Level')
    a_track, _ = CurriculumTrack.objects.get_or_create(country=uganda, name='A-Level')
    print("✅ Curriculum tracks created")
    
    # 3. CREATE EDUCATION LEVELS & CLASS LEVELS
    print("\n3️⃣ Creating education levels and class levels...")
    o_level, _ = EducationLevel.objects.get_or_create(track=o_track, name='O-Level')
    a_level, _ = EducationLevel.objects.get_or_create(track=a_track, name='A-Level')
    
    for i, cls_name in enumerate(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']):
        level = o_level if i < 4 else a_level
        ClassLevel.objects.get_or_create(level=level, name=cls_name)
    print("✅ Education and class levels created")
    
    # 4. CREATE SUBJECTS & TOPICS
    print("\n4️⃣ Creating subjects and topics...")
    subjects_topics = {
        'Mathematics': ['Algebra', 'Geometry', 'Calculus', 'Trigonometry', 'Statistics'],
        'Physics': ['Mechanics', 'Electricity', 'Optics', 'Thermodynamics', 'Kinematics'],
        'Chemistry': ['Atomic Structure', 'Chemical Bonding', 'Reactions', 'Titration'],
        'Biology': ['Genetics', 'Cells', 'Evolution', 'Ecology', 'Photosynthesis'],
        'English': ['Grammar', 'Literature', 'Comprehension', 'Writing', 'Speaking'],
        'Geography': ['Map Skills', 'Climate', 'Resources', 'Development', 'Population'],
        'History': ['Ancient', 'Medieval', 'Modern', 'Africa', 'World Wars'],
        'Computer Studies': ['Programming', 'Networks', 'Databases', 'Web Development'],
        'Entrepreneurship': ['Planning', 'Marketing', 'Finance', 'Leadership'],
        'Religious Education': ['Faith', 'Ethics', 'Morality', 'Philosophy'],
    }
    
    s4_level = ClassLevel.objects.filter(name='S4').first()
    if not s4_level:
        print("ERROR: S4 class level not found!")
        sys.exit(1)
    
    for subject_name, topics_list in subjects_topics.items():
        subject, _ = Subject.objects.get_or_create(name=subject_name)
        for i, topic_name in enumerate(topics_list):
            Topic.objects.get_or_create(
                subject=subject,
                class_level=s4_level,
                name=topic_name,
                defaults={'order': i + 1}
            )
    print(f"✅ Created {len(subjects_topics)} subjects with topics")
    
    # 5. CREATE USERS
    print("\n5️⃣ Creating users...")
    
    # Teachers
    teachers_data = [
        ('teacher1@edify.local', 'Mr. Omondi Kipchoge'),
        ('teacher2@edify.local', 'Ms. Sarah Nakamya'),
        ('teacher3@edify.local', 'Dr. Ahmed Hassan'),
    ]
    
    teachers = []
    for email, name in teachers_data:
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'full_name': name, 'role': 'teacher', 'country_code': 'uganda', 'is_active': True}
        )
        if created:
            user.set_password('TestPass123!')
            user.save()
        teachers.append(user)
    
    # Students
    students = []
    for i in range(1, 26):
        user, created = User.objects.get_or_create(
            email=f'student{i}@edify.local',
            defaults={'full_name': f'Student {i}', 'role': 'student', 'country_code': 'uganda', 'is_active': True}
        )
        if created:
            user.set_password('TestPass123!')
            user.save()
        students.append(user)
    
    # Admin
    admin_user, created = User.objects.get_or_create(
        email='admin@edify.local',
        defaults={'full_name': 'Christine Namaganda', 'role': 'admin', 'country_code': 'uganda', 'is_active': True}
    )
    if created:
        admin_user.set_password('AdminPass123!')
        admin_user.save()
    
    print(f"✅ Created {len(teachers)} teachers, {len(students)} students, and 1 admin")
    
    # 6. CREATE INSTITUTIONS
    print("\n6️⃣ Creating institutions...")
    institution_data = [
        {'name': 'Kampala Model High School', 'slug': 'kmhs', 'country_code': 'UG'},
        {'name': 'Makerere College School', 'slug': 'mcs', 'country_code': 'UG'},
        {'name': 'Lakeside Secondary School', 'slug': 'lss', 'country_code': 'UG'},
    ]
    
    institutions = []
    for data in institution_data:
        inst, created = Institution.objects.get_or_create(
            slug=data['slug'],
            defaults={'name': data['name'], 'country_code': data['country_code'], 'is_active': True}
        )
        if created:
            print(f"  ✅ {inst.name}")
        institutions.append(inst)
    
    # 7. CREATE MARKETPLACE LISTINGS
    print("\n7️⃣ Creating marketplace listings...")
    
    topics = Topic.objects.all()[:30]
    listing_count = 0
    
    for topic in topics:
        for i in range(random.randint(1, 2)):
            listing_type = random.choice(['video', 'notes', 'assessment'])
            
            listing = Listing.objects.create(
                teacher=random.choice(teachers),
                title=f"{listing_type.title()}: {topic.name}",
                content_type=listing_type,
                price_amount=random.choice([5000, 10000, 15000, 20000]),
                currency='UGX',
                visibility_state='published',
                average_rating=round(random.uniform(4.0, 5.0), 1),
                review_count=random.randint(5, 200),
                student_count=random.randint(10, 500)
            )
            
            if listing:
                try:
                    ListingTopicBinding.objects.create(listing=listing, topic=topic)
                    listing_count += 1
                except:
                    pass
    
    print(f"✅ Created {listing_count} marketplace listings")
    
    # 8. CREATE RESOURCES
    print("\n8️⃣ Creating resources...")
    
    resource_types = ['textbook', 'guide', 'past_paper', 'notes', 'video']
    resources_created = 0
    
    for res_type in resource_types:
        for i in range(5):
            try:
                resource = Resource.objects.create(
                    title=f"{res_type.title()} - Part {i+1}",
                    resource_type=res_type,
                    file_size_mb=random.randint(10, 100),
                    upload_date=timezone.now(),
                    uploaded_by=random.choice(teachers)
                )
                resources_created += 1
            except Exception as e:
                print(f"    ! Error creating resource: {e}")
                pass
    
    print(f"✅ Created {resources_created} resources")
    
    print("\n" + "="*80)
    print("✅ SEEDING COMPLETE!")
    print("="*80)
    print(f"\n📊 Summary:")
    print(f"   ✅ Countries: {Country.objects.count()}")
    print(f"   ✅ Subjects: {Subject.objects.count()}")
    print(f"   ✅ Topics: {Topic.objects.count()}")
    print(f"   ✅ Teachers: {User.objects.filter(role='teacher').count()}")
    print(f"   ✅ Students: {User.objects.filter(role='student').count()}")
    print(f"   ✅ Institutions: {Institution.objects.count()}")
    print(f"   ✅ Marketplace Listings: {Listing.objects.count()}")
    print(f"   ✅ Resources: {Resource.objects.count()}")
    print(f"   ✅ Topics with Listings: {ListingTopicBinding.objects.values('topic').distinct().count()}")
    
    print("\n🎯 TEST CREDENTIALS:")
    print(f"   Student: student1@edify.local / TestPass123!")
    print(f"   Teacher: teacher1@edify.local / TestPass123!")
    print(f"   Admin: admin@edify.local / AdminPass123!")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
