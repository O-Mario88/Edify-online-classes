"""
Seed script for ContentItem records.
Creates realistic academic content entries for testing the Content Upload & Delivery System.
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from resources.content_models import ContentItem, ContentTag, ContentItemTag
from curriculum.models import Subject, ClassLevel, Topic, Country, CurriculumTrack, EducationLevel
from institutions.models import Institution

User = get_user_model()


def get_or_create_tags():
    """Create standard content tags."""
    tag_names = [
        'UNEB', 'revision', 'past-paper', 'notes', 'video-lesson',
        'practice', 'formula-sheet', 'teacher-guide', 'exam-prep',
        'interactive', 'primary', 'secondary', 'O-Level', 'A-Level',
        'term-1', 'term-2', 'term-3', 'beginner', 'advanced', 'remedial'
    ]
    tags = {}
    from django.utils.text import slugify
    for name in tag_names:
        slug = slugify(name)
        try:
            tag = ContentTag.objects.get(slug=slug)
        except ContentTag.DoesNotExist:
            try:
                tag = ContentTag.objects.get(name=name)
            except ContentTag.DoesNotExist:
                tag = ContentTag.objects.create(name=name, slug=slug)
        tags[name] = tag
    return tags


def seed_content():
    print("=" * 60)
    print("SEEDING CONTENT ITEMS")
    print("=" * 60)

    # Get or create a teacher user for ownership
    teacher = User.objects.filter(role='teacher').first()
    if not teacher:
        teacher = User.objects.first()
    if not teacher:
        print("ERROR: No users found. Run seed_data.py first.")
        return

    admin = User.objects.filter(role='admin').first() or teacher
    institution = Institution.objects.first()
    uganda = Country.objects.filter(code='UG').first()

    tags = get_or_create_tags()

    # Get curriculum references
    subjects = {s.name: s for s in Subject.objects.all()}
    class_levels = {cl.name: cl for cl in ClassLevel.objects.all()}
    topics = list(Topic.objects.all()[:20])

    if not subjects:
        print("WARNING: No subjects found. Content will be created without subject bindings.")
    if not class_levels:
        print("WARNING: No class levels found. Content will be created without class bindings.")

    print(f"Found {len(subjects)} subjects, {len(class_levels)} class levels, {len(topics)} topics")
    print(f"Using teacher: {teacher.email}, admin: {admin.email}")

    content_specs = [
        # ── Primary Level Content ──
        {
            'title': 'P7 Mathematics - Number Operations Complete Notes',
            'description': 'Comprehensive notes covering addition, subtraction, multiplication and division of whole numbers, fractions, and decimals for P7 students.',
            'content_type': 'notes',
            'owner_type': 'teacher',
            'school_level': 'primary',
            'class_level_name': 'P7',
            'subject_name': 'Mathematics',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['notes', 'primary'],
        },
        {
            'title': 'P7 Science - Living Things and Their Environment',
            'description': 'Illustrated study notes on classification of living organisms, habitats, food chains, and adaptations.',
            'content_type': 'notes',
            'owner_type': 'teacher',
            'school_level': 'primary',
            'class_level_name': 'P7',
            'subject_name': 'Science',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['notes', 'primary'],
        },
        {
            'title': 'P7 English - Comprehension Practice Worksheets',
            'description': 'A collection of 15 reading comprehension passages with questions, covering narrative, expository, and persuasive text types.',
            'content_type': 'worksheet',
            'owner_type': 'teacher',
            'school_level': 'primary',
            'class_level_name': 'P7',
            'subject_name': 'English',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['practice', 'primary'],
        },
        {
            'title': 'P6 Social Studies - Map Reading Skills Video',
            'description': 'Video lesson explaining how to read topographic maps, use legends, calculate distances using scale, and interpret contours.',
            'content_type': 'video',
            'owner_type': 'teacher',
            'school_level': 'primary',
            'class_level_name': 'P6',
            'subject_name': 'Social Studies',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['video-lesson', 'primary'],
        },

        # ── Secondary O-Level Content ──
        {
            'title': 'S1 Mathematics - Algebra Fundamentals',
            'description': 'Introduction to algebraic expressions, simplification, expansion, and factorization. Includes worked examples and exercises.',
            'content_type': 'notes',
            'owner_type': 'teacher',
            'school_level': 'secondary',
            'class_level_name': 'S1',
            'subject_name': 'Mathematics',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['notes', 'secondary', 'O-Level'],
        },
        {
            'title': 'S2 Biology - Cell Structure and Function',
            'description': 'Detailed notes on plant and animal cell structures, organelle functions, and cell processes including osmosis and diffusion.',
            'content_type': 'notes',
            'owner_type': 'teacher',
            'school_level': 'secondary',
            'class_level_name': 'S2',
            'subject_name': 'Biology',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['notes', 'secondary', 'O-Level'],
        },
        {
            'title': 'S3 Physics - Electricity and Magnetism Slides',
            'description': 'Presentation slides covering electric circuits, Ohm\'s law, series and parallel circuits, and electromagnetic induction.',
            'content_type': 'slides',
            'owner_type': 'teacher',
            'school_level': 'secondary',
            'class_level_name': 'S3',
            'subject_name': 'Physics',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['notes', 'secondary', 'O-Level'],
        },
        {
            'title': 'S4 Chemistry - UNEB Past Papers 2018-2023',
            'description': 'Complete collection of UCE Chemistry past examination papers with marking guides for the years 2018 to 2023.',
            'content_type': 'mock_exam',
            'owner_type': 'platform_admin',
            'school_level': 'secondary',
            'class_level_name': 'S4',
            'subject_name': 'Chemistry',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['UNEB', 'past-paper', 'exam-prep', 'O-Level'],
        },
        {
            'title': 'S4 Mathematics - Quick Reference Formula Sheet',
            'description': 'A concise 2-page formula sheet covering all O-Level mathematics formulas: algebra, geometry, trigonometry, statistics, and probability.',
            'content_type': 'pdf',
            'owner_type': 'platform_admin',
            'school_level': 'secondary',
            'class_level_name': 'S4',
            'subject_name': 'Mathematics',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['formula-sheet', 'revision', 'O-Level'],
        },
        {
            'title': 'S3 Geography - Weather and Climate Video Lecture',
            'description': 'Recorded lesson on weather instruments, climate zones of East Africa, factors affecting climate, and data interpretation.',
            'content_type': 'video',
            'owner_type': 'teacher',
            'school_level': 'secondary',
            'class_level_name': 'S3',
            'subject_name': 'Geography',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['video-lesson', 'secondary'],
        },

        # ── A-Level Content ──
        {
            'title': 'S5 Mathematics - Differentiation and Integration Notes',
            'description': 'Advanced calculus notes covering limits, derivatives, integration techniques, and applications in physics.',
            'content_type': 'notes',
            'owner_type': 'teacher',
            'school_level': 'secondary',
            'class_level_name': 'S5',
            'subject_name': 'Mathematics',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['notes', 'A-Level', 'advanced'],
        },
        {
            'title': 'S6 Biology - UACE Past Papers with Solutions',
            'description': 'UACE Biology past papers (2019-2023) with detailed worked solutions and examiner comments.',
            'content_type': 'mock_exam',
            'owner_type': 'platform_admin',
            'school_level': 'secondary',
            'class_level_name': 'S6',
            'subject_name': 'Biology',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['UNEB', 'past-paper', 'exam-prep', 'A-Level'],
        },

        # ── Draft / Under Review Content ──
        {
            'title': 'S2 History - East African Independence Movements',
            'description': 'Draft notes on the independence movements of Uganda, Kenya, Tanzania, and their post-colonial challenges.',
            'content_type': 'notes',
            'owner_type': 'teacher',
            'school_level': 'secondary',
            'class_level_name': 'S2',
            'subject_name': 'History',
            'visibility_scope': 'institution',
            'publication_status': 'draft',
            'language': 'en',
            'tag_names': ['notes', 'secondary'],
        },
        {
            'title': 'S1 English - Creative Writing Workshop Materials',
            'description': 'Workshop materials including prompts, rubrics, and sample essays for teaching creative writing skills.',
            'content_type': 'activity',
            'owner_type': 'teacher',
            'school_level': 'secondary',
            'class_level_name': 'S1',
            'subject_name': 'English',
            'visibility_scope': 'class',
            'publication_status': 'under_review',
            'language': 'en',
            'tag_names': ['practice', 'secondary'],
        },

        # ── Institution-scoped Content ──
        {
            'title': 'Term 1 Revision Pack - S3 Sciences',
            'description': 'Comprehensive revision pack for S3 Biology, Chemistry, and Physics covering all Term 1 topics with practice questions.',
            'content_type': 'revision',
            'owner_type': 'institution',
            'school_level': 'secondary',
            'class_level_name': 'S3',
            'visibility_scope': 'institution',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['revision', 'term-1', 'exam-prep'],
        },
        {
            'title': 'Teacher Guide - Differentiated Instruction Strategies',
            'description': 'A guide for teachers on implementing differentiated instruction for mixed-ability classrooms.',
            'content_type': 'teacher_guide',
            'owner_type': 'institution',
            'school_level': 'secondary',
            'visibility_scope': 'institution',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['teacher-guide'],
        },

        # ── Intervention & Remedial Content ──
        {
            'title': 'Remedial Mathematics - Basic Operations Recovery Pack',
            'description': 'Targeted intervention materials for students struggling with basic arithmetic. Scaffolded exercises from concrete to abstract.',
            'content_type': 'intervention',
            'owner_type': 'teacher',
            'school_level': 'secondary',
            'class_level_name': 'S1',
            'subject_name': 'Mathematics',
            'visibility_scope': 'assigned_students',
            'publication_status': 'published',
            'language': 'en',
            'tag_names': ['remedial', 'beginner'],
        },

        # ── Archived Content ──
        {
            'title': 'S4 Physics - Mechanics Practice Problems (2022)',
            'description': 'Practice problem set for mechanics. Replaced by updated 2024 edition.',
            'content_type': 'worksheet',
            'owner_type': 'teacher',
            'school_level': 'secondary',
            'class_level_name': 'S4',
            'subject_name': 'Physics',
            'visibility_scope': 'global',
            'publication_status': 'archived',
            'language': 'en',
            'tag_names': ['practice', 'O-Level'],
        },

        # ── Featured Library Items (formerly frontend placeholders) ──
        {
            'title': 'Mathematics Revision Notes - Complete O-Level Collection',
            'description': 'Comprehensive revision notes covering all O-Level mathematics topics including algebra, geometry, trigonometry, statistics, and arithmetic. Aligned to the NCDC syllabus.',
            'content_type': 'notes',
            'owner_type': 'platform_admin',
            'school_level': 'secondary',
            'class_level_name': 'S4',
            'subject_name': 'Mathematics',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'is_featured': True,
            'language': 'en',
            'tag_names': ['notes', 'revision', 'O-Level', 'exam-prep'],
        },
        {
            'title': 'Biology Study Guide - Human Systems & Ecology',
            'description': 'A visual study guide covering human body systems (circulatory, respiratory, digestive, nervous) and ecology fundamentals (food chains, nutrient cycles, conservation). Ideal for O-Level exam preparation.',
            'content_type': 'textbook',
            'owner_type': 'platform_admin',
            'school_level': 'secondary',
            'class_level_name': 'S4',
            'subject_name': 'Biology',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'is_featured': True,
            'language': 'en',
            'tag_names': ['notes', 'revision', 'O-Level', 'exam-prep'],
        },
        {
            'title': 'English Comprehension Pack - Guided Reading & Analysis',
            'description': 'A structured workbook with 20 graded comprehension passages, summary exercises, vocabulary building, and critical reading strategies for O-Level English.',
            'content_type': 'worksheet',
            'owner_type': 'platform_admin',
            'school_level': 'secondary',
            'class_level_name': 'S4',
            'subject_name': 'English',
            'visibility_scope': 'global',
            'publication_status': 'published',
            'is_featured': True,
            'language': 'en',
            'tag_names': ['practice', 'revision', 'O-Level'],
        },
    ]

    created_count = 0
    skipped_count = 0

    for spec in content_specs:
        # Check if already exists
        if ContentItem.objects.filter(title=spec['title']).exists():
            print(f"  SKIP (exists): {spec['title']}")
            skipped_count += 1
            continue

        # Resolve references
        subject = subjects.get(spec.get('subject_name'))
        class_level = class_levels.get(spec.get('class_level_name'))
        uploader = admin if spec['owner_type'] == 'platform_admin' else teacher

        item = ContentItem.objects.create(
            title=spec['title'],
            description=spec['description'],
            content_type=spec['content_type'],
            uploaded_by=uploader,
            owner_type=spec['owner_type'],
            owner_institution=institution if spec['owner_type'] == 'institution' else None,
            school_level=spec.get('school_level', ''),
            country=uganda,
            class_level=class_level,
            subject=subject,
            topic=topics[created_count % len(topics)] if topics and subject else None,
            visibility_scope=spec['visibility_scope'],
            publication_status=spec['publication_status'],
            is_featured=spec.get('is_featured', False),
            language=spec.get('language', 'en'),
            mime_type='application/pdf',
            file_size=1024 * 1024 * 2,  # 2 MB placeholder
        )

        # Attach tags
        for tag_name in spec.get('tag_names', []):
            if tag_name in tags:
                ContentItemTag.objects.get_or_create(
                    content_item=item,
                    tag=tags[tag_name]
                )

        print(f"  CREATED: {item.title} [{item.publication_status}]")
        created_count += 1

    print(f"\n{'=' * 60}")
    print(f"CONTENT SEEDING COMPLETE")
    print(f"  Created: {created_count}")
    print(f"  Skipped: {skipped_count}")
    print(f"  Total in DB: {ContentItem.objects.count()}")
    print(f"  Published: {ContentItem.objects.filter(publication_status='published').count()}")
    print(f"  Draft: {ContentItem.objects.filter(publication_status='draft').count()}")
    print(f"  Tags: {ContentTag.objects.count()}")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    seed_content()
