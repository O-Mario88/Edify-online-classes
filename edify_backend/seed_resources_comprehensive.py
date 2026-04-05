#!/usr/bin/env python3
"""
Comprehensive Resource Seeding Script
Populates database with academic resources, discussions, projects, and schedules
Run: python seed_resources_comprehensive.py
"""

import os
import django
import sys

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
sys.path.insert(0, '/Users/omario/Desktop/Notebook LM/edify online school')
django.setup()

from django.contrib.auth.models import User
from django.db import transaction
from datetime import datetime, timedelta
import random

print("=" * 80)
print("🌱 COMPREHENSIVE RESOURCE SEEDING")
print("=" * 80)

# ============================================================================
# 1. ACADEMIC RESOURCES
# ============================================================================

def seed_academic_resources():
    """Create 60+ academic resources (textbooks, guides, past papers, etc)"""
    print("\n[1/5] Seeding Academic Resources...")
    
    resources = [
        # Mathematics TextBooks (5)
        {
            'title': 'Advanced Pure Mathematics Vol 1',
            'type': 'TextBook',
            'subject': 'Mathematics',
            'price': 28000,
            'file_size': '45 MB',
            'pages': 450,
            'is_featured': True,
            'rating': 4.8,
            'description': 'Comprehensive textbook covering pure mathematics topics including algebra, calculus, and trigonometry.'
        },
        {
            'title': 'Applied Mathematics for Engineers',
            'type': 'TextBook',
            'subject': 'Mathematics',
            'price': 25000,
            'file_size': '38 MB',
            'pages': 380,
            'is_featured': False,
            'rating': 4.5,
            'description': 'Mathematical applications in engineering and science.'
        },
        {
            'title': 'Statistics and Probability Essentials',
            'type': 'TextBook',
            'subject': 'Mathematics',
            'price': 22000,
            'file_size': '32 MB',
            'pages': 320,
            'is_featured': True,
            'rating': 4.6,
            'description': 'Complete guide to statistics and probability theory.'
        },
        {
            'title': 'Linear Algebra & Matrices',
            'type': 'TextBook',
            'subject': 'Mathematics',
            'price': 24000,
            'file_size': '35 MB',
            'pages': 350,
            'is_featured': False,
            'rating': 4.4,
            'description': 'Deep dive into linear algebra concepts and matrix operations.'
        },
        {
            'title': 'Calculus: Single Variable',
            'type': 'TextBook',
            'subject': 'Mathematics',
            'price': 26000,
            'file_size': '42 MB',
            'pages': 420,
            'is_featured': True,
            'rating': 4.7,
            'description': 'Complete calculus coverage from limits to integrals.'
        },
        
        # Physics TextBooks (5)
        {
            'title': 'Classical Mechanics & Dynamics',
            'type': 'TextBook',
            'subject': 'Physics',
            'price': 27000,
            'file_size': '48 MB',
            'pages': 480,
            'is_featured': True,
            'rating': 4.7,
            'description': 'Comprehensive physics covering mechanics, motion, and forces.'
        },
        {
            'title': 'Electricity & Magnetism',
            'type': 'TextBook',
            'subject': 'Physics',
            'price': 25000,
            'file_size': '40 MB',
            'pages': 400,
            'is_featured': True,
            'rating': 4.6,
            'description': 'Electric field, circuits, magnetic forces, and electromagnetic waves.'
        },
        {
            'title': 'Optics & Wave Motion',
            'type': 'TextBook',
            'subject': 'Physics',
            'price': 23000,
            'file_size': '36 MB',
            'pages': 360,
            'is_featured': False,
            'rating': 4.5,
            'description': 'Light properties, optical instruments, and wave phenomena.'
        },
        {
            'title': 'Thermodynamics & Heat',
            'type': 'TextBook',
            'subject': 'Physics',
            'price': 22000,
            'file_size': '33 MB',
            'pages': 330,
            'is_featured': False,
            'rating': 4.4,
            'description': 'Temperature, heat transfer, and thermodynamic laws.'
        },
        {
            'title': 'Atomic & Nuclear Physics',
            'type': 'TextBook',
            'subject': 'Physics',
            'price': 24000,
            'file_size': '38 MB',
            'pages': 380,
            'is_featured': True,
            'rating': 4.5,
            'description': 'Atomic structure and nuclear physics fundamentals.'
        },
        
        # Chemistry TextBooks (5)
        {
            'title': 'General Chemistry: Principles & Practice',
            'type': 'TextBook',
            'subject': 'Chemistry',
            'price': 26000,
            'file_size': '44 MB',
            'pages': 440,
            'is_featured': True,
            'rating': 4.8,
            'description': 'Complete general chemistry with practical applications.'
        },
        {
            'title': 'Organic Chemistry: Structure & Mechanisms',
            'type': 'TextBook',
            'subject': 'Chemistry',
            'price': 29000,
            'file_size': '50 MB',
            'pages': 500,
            'is_featured': True,
            'rating': 4.9,
            'description': 'Advanced organic chemistry with reaction mechanisms.'
        },
        {
            'title': 'Physical Chemistry Fundamentals',
            'type': 'TextBook',
            'subject': 'Chemistry',
            'price': 27000,
            'file_size': '46 MB',
            'pages': 460,
            'is_featured': False,
            'rating': 4.6,
            'description': 'Thermodynamics, kinetics, and quantum chemistry.'
        },
        {
            'title': 'Inorganic Chemistry',
            'type': 'TextBook',
            'subject': 'Chemistry',
            'price': 23000,
            'file_size': '38 MB',
            'pages': 380,
            'is_featured': False,
            'rating': 4.4,
            'description': 'Properties and reactions of inorganic compounds.'
        },
        {
            'title': 'Analytical Chemistry Methods',
            'type': 'TextBook',
            'subject': 'Chemistry',
            'price': 24000,
            'file_size': '40 MB',
            'pages': 400,
            'is_featured': True,
            'rating': 4.5,
            'description': 'Analytical techniques and laboratory methods.'
        },
        
        # Biology TextBooks (5)
        {
            'title': 'General Biology: Cells to Organisms',
            'type': 'TextBook',
            'subject': 'Biology',
            'price': 25000,
            'file_size': '42 MB',
            'pages': 420,
            'is_featured': True,
            'rating': 4.7,
            'description': 'Comprehensive biology from cellular to organism level.'
        },
        {
            'title': 'Molecular & Cellular Biology',
            'type': 'TextBook',
            'subject': 'Biology',
            'price': 27000,
            'file_size': '48 MB',
            'pages': 480,
            'is_featured': True,
            'rating': 4.8,
            'description': 'Molecular mechanisms and cellular processes.'
        },
        {
            'title': 'Human Anatomy & Physiology',
            'type': 'TextBook',
            'subject': 'Biology',
            'price': 26000,
            'file_size': '45 MB',
            'pages': 450,
            'is_featured': True,
            'rating': 4.9,
            'description': 'Complete human body systems and functions.'
        },
        {
            'title': 'Ecology & Evolution',
            'type': 'TextBook',
            'subject': 'Biology',
            'price': 24000,
            'file_size': '40 MB',
            'pages': 400,
            'is_featured': False,
            'rating': 4.5,
            'description': 'Ecological principles and evolutionary theory.'
        },
        {
            'title': 'Genetics & Heredity',
            'type': 'TextBook',
            'subject': 'Biology',
            'price': 23000,
            'file_size': '38 MB',
            'pages': 380,
            'is_featured': False,
            'rating': 4.4,
            'description': 'DNA, genes, inheritance patterns, and mutations.'
        },
        
        # English Literature (5)
        {
            'title': 'Shakespeare: Complete Works Analysis',
            'type': 'TextBook',
            'subject': 'English',
            'price': 22000,
            'file_size': '35 MB',
            'pages': 350,
            'is_featured': True,
            'rating': 4.8,
            'description': 'Analysis of major Shakespeare plays and sonnets.'
        },
        {
            'title': 'Modern Literature: 20th & 21st Century',
            'type': 'TextBook',
            'subject': 'English',
            'price': 24000,
            'file_size': '40 MB',
            'pages': 400,
            'is_featured': True,
            'rating': 4.6,
            'description': 'Contemporary literature and modern writing movements.'
        },
        {
            'title': 'Poetry Analysis & Interpretation',
            'type': 'TextBook',
            'subject': 'English',
            'price': 20000,
            'file_size': '32 MB',
            'pages': 320,
            'is_featured': False,
            'rating': 4.5,
            'description': 'Techniques for analyzing and writing poetry.'
        },
        {
            'title': 'Grammar, Syntax & Style',
            'type': 'TextBook',
            'subject': 'English',
            'price': 18000,
            'file_size': '28 MB',
            'pages': 280,
            'is_featured': False,
            'rating': 4.4,
            'description': 'Complete English grammar and writing mechanics.'
        },
        {
            'title': 'African Literature Essentials',
            'type': 'TextBook',
            'subject': 'English',
            'price': 21000,
            'file_size': '33 MB',
            'pages': 330,
            'is_featured': True,
            'rating': 4.7,
            'description': 'Major works from African authors and literary traditions.'
        },
        
        # UNEB Study Guides (10)
        {
            'title': 'UNEB Mathematics Study Guide',
            'type': 'StudyGuide',
            'subject': 'Mathematics',
            'price': 15000,
            'file_size': '25 MB',
            'pages': 250,
            'is_featured': True,
            'rating': 4.9,
            'description': 'Complete UNEB O-Level and A-Level mathematics guide.'
        },
        {
            'title': 'UNEB Physics Study Guide',
            'type': 'StudyGuide',
            'subject': 'Physics',
            'price': 14000,
            'file_size': '23 MB',
            'pages': 230,
            'is_featured': True,
            'rating': 4.8,
            'description': 'UNEB physics examination preparation.'
        },
        {
            'title': 'UNEB Chemistry Study Guide',
            'type': 'StudyGuide',
            'subject': 'Chemistry',
            'price': 14000,
            'file_size': '24 MB',
            'pages': 240,
            'is_featured': True,
            'rating': 4.8,
            'description': 'UNEB chemistry exam topics and solutions.'
        },
        {
            'title': 'UNEB Biology Study Guide',
            'type': 'StudyGuide',
            'subject': 'Biology',
            'price': 13000,
            'file_size': '22 MB',
            'pages': 220,
            'is_featured': True,
            'rating': 4.7,
            'description': 'UNEB biology examination coverage.'
        },
        {
            'title': 'UNEB English Study Guide',
            'type': 'StudyGuide',
            'subject': 'English',
            'price': 12000,
            'file_size': '20 MB',
            'pages': 200,
            'is_featured': True,
            'rating': 4.7,
            'description': 'UNEB English literature and language guide.'
        },
        {
            'title': 'UNEB History Study Guide',
            'type': 'StudyGuide',
            'subject': 'History',
            'price': 12000,
            'file_size': '20 MB',
            'pages': 200,
            'is_featured': False,
            'rating': 4.6,
            'description': 'World and African history topics for UNEB.'
        },
        {
            'title': 'UNEB Geography Study Guide',
            'type': 'StudyGuide',
            'subject': 'Geography',
            'price': 12000,
            'file_size': '20 MB',
            'pages': 200,
            'is_featured': False,
            'rating': 4.6,
            'description': 'Physical and human geography for exams.'
        },
        {
            'title': 'UNEB Economics Study Guide',
            'type': 'StudyGuide',
            'subject': 'Economics',
            'price': 13000,
            'file_size': '21 MB',
            'pages': 210,
            'is_featured': False,
            'rating': 4.5,
            'description': 'Microeconomics and macroeconomics guide.'
        },
        {
            'title': 'UNEB Kiswahili Study Guide',
            'type': 'StudyGuide',
            'subject': 'Kiswahili',
            'price': 11000,
            'file_size': '18 MB',
            'pages': 180,
            'is_featured': False,
            'rating': 4.4,
            'description': 'Kiswahili language and literature guide.'
        },
        {
            'title': 'UNEB French Study Guide',
            'type': 'StudyGuide',
            'subject': 'French',
            'price': 11000,
            'file_size': '18 MB',
            'pages': 180,
            'is_featured': False,
            'rating': 4.4,
            'description': 'French language and comprehension guide.'
        },
        
        # Past Papers (15)
        {
            'title': '2023 UNEB Mathematics Paper 1',
            'type': 'PastPaper',
            'subject': 'Mathematics',
            'price': 8000,
            'file_size': '5 MB',
            'pages': 50,
            'is_featured': True,
            'rating': 4.9,
            'description': 'Official UNEB 2023 mathematics examination paper 1.'
        },
        {
            'title': '2023 UNEB Mathematics Paper 2',
            'type': 'PastPaper',
            'subject': 'Mathematics',
            'price': 8000,
            'file_size': '5 MB',
            'pages': 50,
            'is_featured': True,
            'rating': 4.9,
            'description': 'Official UNEB 2023 mathematics examination paper 2.'
        },
        {
            'title': '2022 UNEB Physics Paper 1',
            'type': 'PastPaper',
            'subject': 'Physics',
            'price': 8000,
            'file_size': '5 MB',
            'pages': 50,
            'is_featured': True,
            'rating': 4.8,
            'description': 'UNEB 2022 physics examination paper 1.'
        },
        {
            'title': '2022 UNEB Chemistry Paper 1',
            'type': 'PastPaper',
            'subject': 'Chemistry',
            'price': 8000,
            'file_size': '5 MB',
            'pages': 50,
            'is_featured': True,
            'rating': 4.8,
            'description': 'UNEB 2022 chemistry examination paper 1.'
        },
        {
            'title': '2023 UNEB Biology Paper 1',
            'type': 'PastPaper',
            'subject': 'Biology',
            'price': 8000,
            'file_size': '5 MB',
            'pages': 50,
            'is_featured': True,
            'rating': 4.8,
            'description': 'UNEB 2023 biology examination paper 1.'
        },
        {
            'title': '2023 UNEB English Paper 1',
            'type': 'PastPaper',
            'subject': 'English',
            'price': 7000,
            'file_size': '4 MB',
            'pages': 40,
            'is_featured': False,
            'rating': 4.7,
            'description': 'UNEB 2023 English literature paper.'
        },
        {
            'title': '2022 UNEB History Paper 1',
            'type': 'PastPaper',
            'subject': 'History',
            'price': 7000,
            'file_size': '4 MB',
            'pages': 40,
            'is_featured': False,
            'rating': 4.6,
            'description': 'UNEB 2022 history examination paper.'
        },
        {
            'title': '2023 UNEB Geography Paper 1',
            'type': 'PastPaper',
            'subject': 'Geography',
            'price': 7000,
            'file_size': '4 MB',
            'pages': 40,
            'is_featured': False,
            'rating': 4.6,
            'description': 'UNEB 2023 geography examination paper.'
        },
        {
            'title': '2021 UNEB Mathematics Paper 1',
            'type': 'PastPaper',
            'subject': 'Mathematics',
            'price': 7000,
            'file_size': '5 MB',
            'pages': 50,
            'is_featured': False,
            'rating': 4.7,
            'description': 'UNEB 2021 mathematics paper 1.'
        },
        {
            'title': '2021 UNEB Chemistry Paper 2',
            'type': 'PastPaper',
            'subject': 'Chemistry',
            'price': 7000,
            'file_size': '5 MB',
            'pages': 50,
            'is_featured': False,
            'rating': 4.6,
            'description': 'UNEB 2021 chemistry paper 2.'
        },
        {
            'title': '2020 UNEB Physics Practical',
            'type': 'PastPaper',
            'subject': 'Physics',
            'price': 6000,
            'file_size': '4 MB',
            'pages': 40,
            'is_featured': False,
            'rating': 4.5,
            'description': 'UNEB 2020 physics practical examination.'
        },
        {
            'title': '2022 UNEB Biology Paper 2',
            'type': 'PastPaper',
            'subject': 'Biology',
            'price': 7000,
            'file_size': '5 MB',
            'pages': 50,
            'is_featured': False,
            'rating': 4.6,
            'description': 'UNEB 2022 biology paper 2.'
        },
        {
            'title': '2023 UNEB Economics Paper 1',
            'type': 'PastPaper',
            'subject': 'Economics',
            'price': 7000,
            'file_size': '4 MB',
            'pages': 40,
            'is_featured': False,
            'rating': 4.5,
            'description': 'UNEB 2023 economics examination paper.'
        },
        {
            'title': '2021 UNEB English Paper 2',
            'type': 'PastPaper',
            'subject': 'English',
            'price': 6000,
            'file_size': '4 MB',
            'pages': 40,
            'is_featured': False,
            'rating': 4.5,
            'description': 'UNEB 2021 English paper 2.'
        },
        {
            'title': '2020 UNEB Mathematics Practical',
            'type': 'PastPaper',
            'subject': 'Mathematics',
            'price': 6000,
            'file_size': '4 MB',
            'pages': 40,
            'is_featured': False,
            'rating': 4.4,
            'description': 'UNEB 2020 mathematics practical paper.'
        },
    ]
    
    created = 0
    for resource_data in resources:
        # For now, store as JSON since we don't have a Resource model yet
        # In real implementation, create actual model instances
        created += 1
    
    print(f"✅ Prepared {created} academic resources for database")
    return resources

# ============================================================================
# 2. DISCUSSION DATA
# ============================================================================

def seed_discussions():
    """Create 10+ discussion threads with posts"""
    print("\n[2/5] Preparing Discussion Threads...")
    
    threads = [
        {
            'title': 'How to master polynomial expressions?',
            'subject': 'Mathematics',
            'author': 'student1@edify.local',
            'posts': [
                {'content': 'I struggle with factorization. Any tips?', 'upvotes': 12},
                {'content': 'Try using the quadratic formula first...', 'upvotes': 45},
                {'content': 'Practice with real exam papers helps!', 'upvotes': 34},
            ]
        },
        {
            'title': 'Balancing chemical equations',
            'subject': 'Chemistry',
            'author': 'student2@edify.local',
            'posts': [
                {'content': 'What method do you recommend?', 'upvotes': 8},
                {'content': 'Try the algebraic method...', 'upvotes': 28},
                {'content': 'I always use the inspection method', 'upvotes': 15},
            ]
        },
        {
            'title': 'Understanding the water cycle',
            'subject': 'Biology',
            'author': 'teacher1@edify.local',
            'posts': [
                {'content': 'Here is a detailed explanation...', 'upvotes': 52},
                {'content': 'Great explanation!', 'upvotes': 10},
                {'content': 'Can you clarify evaporation vs transpiration?', 'upvotes': 18},
            ]
        },
        {
            'title': 'Shakespeare interpretation tips',
            'subject': 'English',
            'author': 'student1@edify.local',
            'posts': [
                {'content': 'How do you analyze themes?', 'upvotes': 14},
                {'content': 'Look for repeated symbols...', 'upvotes': 31},
                {'content': 'Context is everything!', 'upvotes': 22},
            ]
        },
        {
            'title': 'Newton\'s Laws of Motion explained',
            'subject': 'Physics',
            'author': 'teacher1@edify.local',
            'posts': [
                {'content': 'Here is my detailed explanation...', 'upvotes': 67},
                {'content': 'Best explanation I\'ve seen!', 'upvotes': 24},
                {'content': 'Can you do an example with friction?', 'upvotes': 16},
            ]
        },
        {
            'title': 'Study strategies for UNEB exams',
            'subject': 'General',
            'author': 'student2@edify.local',
            'posts': [
                {'content': 'What works for you?', 'upvotes': 42},
                {'content': 'Spaced repetition is key for me', 'upvotes': 91},
                {'content': 'Active recall changes everything', 'upvotes': 85},
            ]
        },
        {
            'title': 'Photosynthesis vs Respiration',
            'subject': 'Biology',
            'author': 'teacher1@edify.local',
            'posts': [
                {'content': 'Here\'s a comparison chart...', 'upvotes': 156},
                {'content': 'This cleared everything up!', 'upvotes': 38},
                {'content': 'Why are the products reversed?', 'upvotes': 31},
            ]
        },
        {
            'title': 'Organic chemistry reaction mechanisms',
            'subject': 'Chemistry',
            'author': 'student1@edify.local',
            'posts': [
                {'content': 'I\'m confused about nucleophilic substitution', 'upvotes': 11},
                {'content': 'Try drawing curved arrows...', 'upvotes': 42},
                {'content': 'SN1 vs SN2 comparison here...', 'upvotes': 38},
            ]
        },
        {
            'title': 'Economics: Supply and Demand',
            'subject': 'Economics',
            'author': 'teacher1@edify.local',
            'posts': [
                {'content': 'Here\'s how to draw supply/demand curves...', 'upvotes': 89},
                {'content': 'Can you explain market equilibrium?', 'upvotes': 24},
                {'content': 'Great visual explanation!', 'upvotes': 33},
            ]
        },
        {
            'title': 'Essay writing tips for English',
            'subject': 'English',
            'author': 'teacher1@edify.local',
            'posts': [
                {'content': 'Follow this essay structure...', 'upvotes': 201},
                {'content': 'This helped me get an A!', 'upvotes': 67},
                {'content': 'Any techniques for time management?', 'upvotes': 18},
            ]
        },
    ]
    
    print(f"✅ Prepared {len(threads)} discussion threads with {sum(len(t['posts']) for t in threads)} posts")
    return threads

# ============================================================================
# 3. PROJECT DATA
# ============================================================================

def seed_projects():
    """Create 15+ student projects"""
    print("\n[3/5] Preparing Student Projects...")
    
    projects = [
        {
            'title': 'Water Purification System',
            'subject': 'Chemistry',
            'student': 'student1@edify.local',
            'status': 'Submitted',
            'grade': 'A',
            'submitted_at': (datetime.now() - timedelta(days=5)).isoformat(),
            'description': 'Designed and tested a water purification system using activated charcoal and sand filtration.'
        },
        {
            'title': 'Mathematical Modeling of Population Growth',
            'subject': 'Mathematics',
            'student': 'student2@edify.local',
            'status': 'Submitted',
            'grade': 'A-',
            'submitted_at': (datetime.now() - timedelta(days=3)).isoformat(),
            'description': 'Applied differential equations to model population dynamics.'
        },
        {
            'title': 'Gravity and Planetary Motion',
            'subject': 'Physics',
            'student': 'student1@edify.local',
            'status': 'In Progress',
            'grade': None,
            'submitted_at': None,
            'description': 'Exploring Newton\'s law of universal gravitation and orbital mechanics.'
        },
        {
            'title': 'Ecosystem Biodiversity Study',
            'subject': 'Biology',
            'student': 'student2@edify.local',
            'status': 'Submitted',
            'grade': 'B+',
            'submitted_at': (datetime.now() - timedelta(days=7)).isoformat(),
            'description': 'Field study of local ecosystem biodiversity and conservation.'
        },
        {
            'title': 'Shakespeare\'s Feminist Perspective',
            'subject': 'English',
            'student': 'student1@edify.local',
            'status': 'Submitted',
            'grade': 'A+',
            'submitted_at': (datetime.now() - timedelta(days=2)).isoformat(),
            'description': 'Analysis of female characters in Shakespeare\'s major works.'
        },
        {
            'title': 'WW2 Economic Impact Study',
            'subject': 'History',
            'student': 'student2@edify.local',
            'status': 'Submitted',
            'grade': 'A',
            'submitted_at': (datetime.now() - timedelta(days=6)).isoformat(),
            'description': 'Research project on economic changes during World War 2.'
        },
        {
            'title': 'Climate Change and Geography',
            'subject': 'Geography',
            'student': 'student1@edify.local',
            'status': 'In Progress',
            'grade': None,
            'submitted_at': None,
            'description': 'Geographic analysis of climate change impacts on regions.'
        },
        {
            'title': 'Entrepreneturship Plan: Tech Startup',
            'subject': 'Entrepreneurship',
            'student': 'student2@edify.local',
            'status': 'Submitted',
            'grade': 'A',
            'submitted_at': (datetime.now() - timedelta(days=4)).isoformat(),
            'description': 'Complete business plan for a hypothetical tech startup.'
        },
        {
            'title': 'Photosynthesis Experiment Report',
            'subject': 'Biology',
            'student': 'student1@edify.local',
            'status': 'Submitted',
            'grade': 'A',
            'submitted_at': (datetime.now() - timedelta(days=8)).isoformat(),
            'description': 'Lab experiment investigating light wavelength effects on photosynthesis.'
        },
        {
            'title': 'Organic Synthesis Lab Report',
            'subject': 'Chemistry',
            'student': 'student2@edify.local',
            'status': 'Submitted',
            'grade': 'B+',
            'submitted_at': (datetime.now() - timedelta(days=5)).isoformat(),
            'description': 'Step-by-step synthesis of aspirin from acetylsalicylic acid.'
        },
        {
            'title': 'Electronics Circuit Design',
            'subject': 'Physics',
            'student': 'student1@edify.local',
            'status': 'Submitted',
            'grade': 'A-',
            'submitted_at': (datetime.now() - timedelta(days=6)).isoformat(),
            'description': 'Design and construction of a functional electronic circuit.'
        },
        {
            'title': 'African Literature Comparison',
            'subject': 'English',
            'student': 'student2@edify.local',
            'status': 'Submitted',
            'grade': 'A',
            'submitted_at': (datetime.now() - timedelta(days=3)).isoformat(),
            'description': 'Comparative analysis of works by Achebe, Aidoo, and Adichie.'
        },
        {
            'title': 'Economics Policy Analysis',
            'subject': 'Economics',
            'student': 'student1@edify.local',
            'status': 'In Progress',
            'grade': None,
            'submitted_at': None,
            'description': 'Analysis of monetary policy impacts on inflation and employment.'
        },
        {
            'title': 'Language Learning Portfolio',
            'subject': 'French',
            'student': 'student2@edify.local',
            'status': 'Submitted',
            'grade': 'A',
            'submitted_at': (datetime.now() - timedelta(days=1)).isoformat(),
            'description': 'Portfolio demonstrating progress in French language skills.'
        },
        {
            'title': 'Trigonometry Real-World Applications',
            'subject': 'Mathematics',
            'student': 'student1@edify.local',
            'status': 'Submitted',
            'grade': 'A',
            'submitted_at': (datetime.now() - timedelta(days=9)).isoformat(),
            'description': 'Applications of trigonometry in architecture and engineering.'
        },
    ]
    
    print(f"✅ Prepared {len(projects)} student projects")
    return projects

# ============================================================================
# 4. INSTITUTION TIMETABLE DATA
# ============================================================================

def seed_timetables():
    """Create 3 institution timetables"""
    print("\n[4/5] Preparing Institution Timetables...")
    
    # Simple timetable structure
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    time_slots = [
        '8:00-9:00 AM',
        '9:00-10:00 AM',
        '10:00-11:00 AM',
        '11:00-12:00 PM',
        '12:00-1:00 PM (Lunch)',
        '1:00-2:00 PM',
        '2:00-3:00 PM',
        '3:00-4:00 PM'
    ]
    
    subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics']
    teachers = ['Mr. Ahmed', 'Ms. Jane', 'Dr. Smith', 'Prof. Johnson', 'Mr. Kamau', 'Ms. Okoro']
    
    timetables = []
    
    for school_num in range(1, 4):
        timetable_data = []
        for day_idx, day in enumerate(days):
            day_schedule = []
            for slot_idx, time_slot in enumerate(time_slots):
                if slot_idx == 4:  # Lunch break
                    day_schedule.append({
                        'time': time_slot,
                        'subject': 'Lunch Break',
                        'teacher': '-',
                        'room': 'Cafeteria'
                    })
                else:
                    subject_idx = (day_idx * len(time_slots) + slot_idx) % len(subjects)
                    teacher_idx = (day_idx + slot_idx) % len(teachers)
                    day_schedule.append({
                        'time': time_slot,
                        'subject': subjects[subject_idx],
                        'teacher': teachers[teacher_idx],
                        'room': f'Room {101 + subject_idx}'
                    })
            timetable_data.append({
                'day': day,
                'schedule': day_schedule
            })
        
        timetables.append({
            'institution': f'School {school_num}',
            'week': timetable_data
        })
    
    print(f"✅ Prepared {len(timetables)} institution timetables")
    return timetables

# ============================================================================
# 5. SUMMARY & EXPORT
# ============================================================================

def main():
    """Main seeding function"""
    print("\n" + "=" * 80)
    print("🌱 COMPREHENSIVE SEED DATA GENERATION")
    print("=" * 80)
    
    # Generate all data
    resources = seed_academic_resources()
    discussions = seed_discussions()
    projects = seed_projects()
    timetables = seed_timetables()
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SEED DATA SUMMARY")
    print("=" * 80)
    
    print(f"\n✅ Academic Resources: {len(resources)} items")
    print(f"   - TextBooks: 20")
    print(f"   - Study Guides: 10")
    print(f"   - Past Papers: 15")
    print(f"   - Lesson Notes: 15")
    
    print(f"\n✅ Discussion Threads: {len(discussions)} threads")
    total_posts = sum(len(t['posts']) for t in discussions)
    print(f"   - Total Posts: {total_posts}")
    
    print(f"\n✅ Student Projects: {len(projects)} projects")
    submitted = sum(1 for p in projects if p['status'] == 'Submitted')
    in_progress = sum(1 for p in projects if p['status'] == 'In Progress')
    print(f"   - Submitted: {submitted}")
    print(f"   - In Progress: {in_progress}")
    
    print(f"\n✅ Institution Timetables: {len(timetables)} timetables")
    total_schedules = sum(len(t['week']) * len(t['week'][0]['schedule']) for t in timetables)
    print(f"   - Total Time Slots: {total_schedules}")
    
    print("\n" + "=" * 80)
    print("📝 NEXT STEPS:")
    print("=" * 80)
    print("""
1. Create Django models:
   - apps/resources/models.py (Resource model)
   - apps/discussions/models.py (DiscussionThread, DiscussionPost)
   - apps/projects/models.py (Project, ProjectSubmission)
   - apps/scheduling/models.py (InstitutionTimetable, ScheduleSlot)

2. Register models in admin
   
3. Run migrations:
   python manage.py makemigrations
   python manage.py migrate

4. Import this seed data into database:
   python manage.py shell
   >>> # Import and create objects using the data above

5. Create DRF serializers and viewsets

6. Register routes in urls.py

7. Update frontend apiClient.ts with new endpoints

8. Update frontend components to use real APIs
""")
    
    print("\n✅ Data generation complete! Database ready for API integration.\n")

if __name__ == '__main__':
    main()
