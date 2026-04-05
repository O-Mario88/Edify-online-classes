#!/usr/bin/env python3
"""
Seed script to populate Edify database with realistic test data
Run with: python seed_test_data.py
"""

import os
import sys
import django
from pathlib import Path
from django.core.management import call_command

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'edify_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model
from curriculum.models import Country, Subject, ClassLevel, Topic, EducationLevel, CurriculumTrack
from marketplace.models import Listing, ListingTopicBinding, Wallet, TeacherPayoutProfile
from classes.models import Class, ClassEnrollment
from institutions.models import Institution, InstitutionMembership
from lessons.models import Lesson, LessonNote

User = get_user_model()

class DataSeeder:
    """Populate database with test data"""
    
    def __init__(self):
        self.users_created = 0
        self.listings_created = 0
        self.institutions_created = 0
        
    def create_countries(self):
        """Create countries"""
        print("📍 Creating countries...")
        countries = [
            ('uganda', 'Uganda'),
            ('kenya', 'Kenya'),
            ('tanzania', 'Tanzania'),
        ]
        
        for code, name in countries:
            Country.objects.get_or_create(
                code=code,
                defaults={'name': name}
            )
        print(f"✅ Countries created")
        
    def create_subjects(self):
        """Create subjects"""
        print("📚 Creating subjects...")
        subjects = [
            'Mathematics', 'English', 'Physics', 'Chemistry', 
            'Biology', 'History', 'Geography', 'Economics',
            'Computer Science', 'Literature'
        ]
        
        for name in subjects:
            Subject.objects.get_or_create(name=name)
        print(f"✅ {len(subjects)} subjects created")
        
    def create_class_levels(self):
        """Create class levels"""
        print("🎓 Creating class levels...")
        
        # First get the Uganda country
        uganda = Country.objects.get_or_create(
            code='uganda',
            defaults={'name': 'Uganda'}
        )[0]
        
        # Create curriculum track for Uganda
        track, _ = CurriculumTrack.objects.get_or_create(
            country=uganda,
            name='Uganda National Curriculum'
        )
        
        levels = ['O-Level', 'A-Level', 'Primary', 'Secondary']
        
        for name in levels:
            EducationLevel.objects.get_or_create(
                name=name,
                track=track
            )
        print(f"✅ Class levels created")
        
    def create_users(self):
        """Create test users"""
        print("👥 Creating test users...")
        
        test_users = [
            {
                'email': 'student1@edify.local',
                'full_name': 'John Okello',
                'password': 'TestPass123!',
                'country_code': 'uganda',
                'role': 'student'
            },
            {
                'email': 'student2@edify.local',
                'full_name': 'Sarah Nakato',
                'password': 'TestPass123!',
                'country_code': 'uganda',
                'role': 'student'
            },
            {
                'email': 'teacher1@edify.local',
                'full_name': 'Mr. Emmanuel Kato',
                'password': 'TestPass123!',
                'country_code': 'uganda',
                'role': 'teacher'
            },
            {
                'email': 'teacher2@edify.local',
                'full_name': 'Dr. Sarah Jenkins',
                'password': 'TestPass123!',
                'country_code': 'uganda',
                'role': 'teacher'
            },
            {
                'email': 'admin@edify.local',
                'full_name': 'Admin User',
                'password': 'AdminPass123!',
                'country_code': 'uganda',
                'role': 'admin'
            }
        ]
        
        for user_data in test_users:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'full_name': user_data['full_name'],
                    'country_code': user_data['country_code'],
                    'role': user_data['role']
                }
            )
            
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.users_created += 1
                print(f"   ✓ {user_data['full_name']} ({user_data['role']})")
        
        print(f"✅ {self.users_created} users created")
        
    def create_institutions(self):
        """Create test institutions"""
        print("🏢 Creating institutions...")
        
        institutions_data = [
            {
                'name': 'Makerere High School',
                'country_code': 'uganda',
            },
            {
                'name': 'King\'s College Budo',
                'country_code': 'uganda',
            },
            {
                'name': 'Kampala International School',
                'country_code': 'uganda',
            }
        ]
        
        for inst_data in institutions_data:
            institution, created = Institution.objects.get_or_create(
                name=inst_data['name'],
                defaults={
                    'country_code': inst_data['country_code'],
                }
            )
            
            if created:
                self.institutions_created += 1
                print(f"   ✓ {institution.name}")
        
        print(f"✅ {self.institutions_created} institutions created")
        
    def create_listings(self):
        """Create marketplace listings"""
        print("📋 Creating marketplace listings...")
        
        teachers = User.objects.filter(role='teacher')
        subjects = Subject.objects.all()
        
        if not teachers.exists() or not subjects.exists():
            print("   ⚠️  Skipping listings - need teachers and subjects first")
            return
        
        listings_data = [
            {
                'title': 'O-Level Mathematics: Algebra Mastery',
                'content_type': 'video',
                'price': 50000,
                'subjects': ['Mathematics']
            },
            {
                'title': 'A-Level Physics: Quantum & Mechanics',
                'content_type': 'video',
                'price': 100000,
                'subjects': ['Physics']
            },
            {
                'title': 'Literature in English: African Writers',
                'content_type': 'notes',
                'price': 0,
                'subjects': ['Literature']
            },
            {
                'title': 'Advanced Chemistry: Organic Synthesis',
                'content_type': 'assessment',
                'price': 75000,
                'subjects': ['Chemistry']
            },
        ]
        
        teacher = teachers.first()
        for listing_data in listings_data:
            listing, created = Listing.objects.get_or_create(
                title=listing_data['title'],
                teacher=teacher,
                defaults={
                    'content_type': listing_data['content_type'],
                    'price_amount': listing_data['price'],
                    'visibility_state': 'published'
                }
            )
            
            if created:
                self.listings_created += 1
                print(f"   ✓ {listing.title}")
        
        print(f"✅ {self.listings_created} listings created")
        
    def create_teacher_wallets(self):
        """Create wallets for teachers"""
        print("💰 Creating teacher wallets...")
        
        teachers = User.objects.filter(role='teacher')
        
        for teacher in teachers:
            Wallet.objects.get_or_create(
                teacher=teacher,
                defaults={'balance': 0.00}
            )
            
            TeacherPayoutProfile.objects.get_or_create(
                teacher=teacher,
                defaults={
                    'mobile_number': '+256700000000',
                    'network': 'mtn',
                    'is_verified': False
                }
            )
        
        print(f"✅ Wallets created for {teachers.count()} teachers")
        
    def run(self):
        """Execute all seed operations"""
        print("\n" + "="*70)
        print("🌱 EDIFY DATABASE SEEDING")
        print("="*70 + "\n")
        
        try:
            self.create_countries()
            self.create_subjects()
            self.create_class_levels()
            self.create_users()
            self.create_institutions()
            self.create_listings()
            self.create_teacher_wallets()
            
            print("\n" + "="*70)
            print("✅ SEEDING COMPLETE")
            print("="*70)
            print(f"\n📊 Summary:")
            print(f"   Users created: {self.users_created}")
            print(f"   Institutions: {self.institutions_created}")
            print(f"   Listings: {self.listings_created}")
            print(f"\n🧪 Test Credentials:")
            print(f"   Student: student1@edify.local / TestPass123!")
            print(f"   Teacher: teacher1@edify.local / TestPass123!")
            print(f"   Admin: admin@edify.local / AdminPass123!")
            print("\n")
            
        except Exception as e:
            print(f"\n❌ Error during seeding: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == '__main__':
    seeder = DataSeeder()
    seeder.run()
