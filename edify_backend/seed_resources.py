#!/usr/bin/env python
"""
Seed script for Resource objects - creates academic materials with realistic metadata
"""
import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from curriculum.models import Subject, ClassLevel
from resources.models import Resource
import random

User = get_user_model()

RESOURCE_DATA = [
    # Mathematics
    {
        'title': 'Senior 4 Mathematics Revision Notes',
        'author': 'Sarah Nakamya',
        'description': 'Complete coverage of O-level geometry, algebra, and statistics with practice problems.',
        'category': 'Notes',
        'subject_name': 'Mathematics',
        'class_name': 'S4',
        'price': 9.99,
        'rating': 4.8,
        'is_featured': True,
    },
    {
        'title': 'Mathematics: Integration Techniques',
        'author': 'Paul Ssekibuule',
        'description': 'Comprehensive coverage of integration by parts, substitution, and partial fractions.',
        'category': 'Notes',
        'subject_name': 'Mathematics',
        'class_name': 'S6',
        'price': 10.99,
        'rating': 4.9,
        'is_featured': True,
    },
    {
        'title': 'Sub-Mathematics: Linear Programming',
        'author': 'Moses Tumusiime',
        'description': 'Graphical and algebraic approaches to linear programming with worked examples.',
        'category': 'Workbook',
        'subject_name': 'Sub-Mathematics',
        'class_name': 'S5',
        'price': 8.99,
        'rating': 4.5,
        'is_featured': False,
    },
    
    # Biology
    {
        'title': 'Biology: Human Circulatory System',
        'author': 'Michael Okello',
        'description': 'Visual exploration of the heart, blood vessels, and circulatory pathways.',
        'category': 'Textbook',
        'subject_name': 'Biology',
        'class_name': 'S4',
        'price': 12.99,
        'rating': 4.9,
        'is_featured': True,
    },
    {
        'title': 'Biology: Ecology & Environment',
        'author': 'Dr. Nassali',
        'description': 'Ecosystems, food chains, nutrient cycles, and conservation strategies.',
        'category': 'Textbook',
        'subject_name': 'Biology',
        'class_name': 'S3',
        'price': 13.99,
        'rating': 4.8,
        'is_featured': False,
    },
    
    # English
    {
        'title': 'English Language Comprehension',
        'author': 'Edify Board',
        'description': 'Master techniques for summary writing, passage analysis, and critical reading.',
        'category': 'Workbook',
        'subject_name': 'English Language',
        'class_name': 'S4',
        'price': 8.99,
        'rating': 4.7,
        'is_featured': True,
    },
    {
        'title': 'Literature: Hamlet Study Guide',
        'author': 'Ruth Achieng',
        'description': 'Scene-by-scene analysis, themes, and essay guides for Shakespeare\'s Hamlet.',
        'category': 'Workbook',
        'subject_name': 'Literature (English)',
        'class_name': 'S5',
        'price': 10.99,
        'rating': 4.9,
        'is_featured': True,
    },
    
    # Physics
    {
        'title': 'Physics Practical Guide',
        'author': 'Dr. Kaggwa',
        'description': 'Step-by-step guides for mechanics, optics, and electricity experiments.',
        'category': 'Notes',
        'subject_name': 'Physics',
        'class_name': 'S4',
        'price': 10.99,
        'rating': 4.5,
        'is_featured': False,
    },
    {
        'title': 'Physics: Electromagnetism',
        'author': 'Dr. Mugisha',
        'description': 'Faraday\'s law, Lenz\'s law, motors, generators and electromagnetic induction.',
        'category': 'Textbook',
        'subject_name': 'Physics',
        'class_name': 'S5',
        'price': 14.99,
        'rating': 4.6,
        'is_featured': False,
    },
    
    # Chemistry
    {
        'title': 'Chemistry: Organic Compounds',
        'author': 'Dr. Asiimwe',
        'description': 'In-depth coverage of hydrocarbons, alcohols, and carbonyl compounds for A-level.',
        'category': 'Textbook',
        'subject_name': 'Chemistry',
        'class_name': 'S6',
        'price': 13.99,
        'rating': 4.7,
        'is_featured': False,
    },
    
    # Geography
    {
        'title': 'Geography Atlas Companion',
        'author': 'Jane Doe',
        'description': 'Detailed maps and analytical notes on East African physical geography.',
        'category': 'Textbook',
        'subject_name': 'Geography',
        'class_name': 'S3',
        'price': 14.99,
        'rating': 4.6,
        'is_featured': False,
    },
    
    # History
    {
        'title': 'History: Colonial Africa',
        'author': 'Prof. Wamala',
        'description': 'A comprehensive guide to the scramble, partition, and colonial resistance in Africa.',
        'category': 'Notes',
        'subject_name': 'History',
        'class_name': 'S4',
        'price': 11.99,
        'rating': 4.6,
        'is_featured': False,
    },
    
    # Economics
    {
        'title': 'Economics: Demand & Supply',
        'author': 'Edify Economics Dept',
        'description': 'Structured notes on price theory, elasticity, and consumer behaviour.',
        'category': 'Notes',
        'subject_name': 'Economics',
        'class_name': 'S5',
        'price': 9.99,
        'rating': 4.5,
        'is_featured': False,
    },
    
    # General Paper
    {
        'title': 'General Paper Reading Pack',
        'author': 'Edify Arts Team',
        'description': 'Curated essays and critical thinking prompts for A-level preparation.',
        'category': 'Notes',
        'subject_name': 'General Paper',
        'class_name': 'S5-S6',
        'price': 15.99,
        'rating': 4.8,
        'is_featured': False,
    },
    
    # Agriculture
    {
        'title': 'Agriculture: Crop Production',
        'author': 'Mr. Byabagambi',
        'description': 'NCDC-aligned notes on soil science, planting, and crop protection methods.',
        'category': 'Textbook',
        'subject_name': 'Agriculture',
        'class_name': 'S4',
        'price': 12.99,
        'rating': 4.4,
        'is_featured': False,
    },
    
    # ICT
    {
        'title': 'ICT: Databases and Networking',
        'author': 'Tech Dept Edify',
        'description': 'Covers relational databases, SQL basics, and networking fundamentals for A-level.',
        'category': 'Notes',
        'subject_name': 'Information Technology',
        'class_name': 'S5',
        'price': 11.99,
        'rating': 4.6,
        'is_featured': False,
    },
    
    # CRE
    {
        'title': 'CRE: Old Testament Prophets',
        'author': 'Sister Nalubega',
        'description': 'Teachings of Amos, Isaiah, and Jeremiah mapped to contemporary social justice.',
        'category': 'Notes',
        'subject_name': 'Christian Religious Education',
        'class_name': 'S4',
        'price': 9.99,
        'rating': 4.7,
        'is_featured': False,
    },
    
    # Entrepreneurship
    {
        'title': 'Entrepreneurship: Business Plans',
        'author': 'Edify Commerce Team',
        'description': 'Step-by-step workbook for drafting, pitching, and refining a business plan.',
        'category': 'Workbook',
        'subject_name': 'Entrepreneurship',
        'class_name': 'S6',
        'price': 11.99,
        'rating': 4.5,
        'is_featured': False,
    },
]

def seed_resources():
    """Create Resource objects from RESOURCE_DATA"""
    try:
        # Get or create a default teacher user
        teacher = User.objects.filter(email='teacher@edify.local').first()
        if not teacher:
            teacher = User.objects.create_user(
                email='teacher@edify.local',
                password='TestPass123!',
                first_name='Default',
                last_name='Teacher'
            )
            print(f"✅ Created default teacher user: {teacher.email}")
        
        created_count = 0
        updated_count = 0
        
        for res_data in RESOURCE_DATA:
            # Find subject and class
            subject = Subject.objects.filter(name__icontains=res_data['subject_name']).first()
            class_level = ClassLevel.objects.filter(name=res_data['class_name']).first()
            
            if not subject:
                print(f"⚠️  Subject not found: {res_data['subject_name']} (skipping)")
                continue
            
            # Create or update resource
            resource, created = Resource.objects.get_or_create(
                title=res_data['title'],
                uploaded_by=teacher,
                defaults={
                    'description': res_data['description'],
                    'author': res_data['author'],
                    'category': res_data['category'],
                    'price': res_data['price'],
                    'rating': res_data['rating'],
                    'is_featured': res_data['is_featured'],
                    'subject': subject,
                    'class_level': class_level,
                    'visibility': 'platform_shared',  # Make publicly available
                    'external_url': 'https://edify.local/resource',
                }
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
                # Update fields on existing resource
                resource.description = res_data['description']
                resource.author = res_data['author']
                resource.category = res_data['category']
                resource.price = res_data['price']
                resource.rating = res_data['rating']
                resource.is_featured = res_data['is_featured']
                resource.save()
        
        print(f"\n✅ Resources seeding complete!")
        print(f"   Created: {created_count}")
        print(f"   Updated: {updated_count}")
        print(f"   Total: {created_count + updated_count}")
        
    except Exception as e:
        print(f"❌ Error seeding resources: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    seed_resources()
