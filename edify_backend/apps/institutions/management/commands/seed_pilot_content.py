"""`manage.py seed_pilot_content` — populate every new 2026 feature surface.

Runs on top of `seed_pilot` (which creates the user accounts). Adds:
  - 3 Mastery Tracks with modules and items
  - 5 Practice Labs with multi-step content
  - 3 Mastery Projects with rubrics
  - 2 Exam Simulations reusing the existing Question bank
  - 1 Learning Cohort
  - 6 Career Pathways
  - 3 Institution Discovery Profiles (is_listed=True + score rows)
  - 8 Credential definitions
  - 2 Teacher Availability windows (Standby Network)

Idempotent: every row is keyed on slug/unique field and uses
get_or_create or update_or_create. Safe to run multiple times.

Usage:
    python manage.py seed_pilot_content

Depends on `seed_pilot` having run first (creates the users + first
institution). If you only care about the content, pre-create at
least one Institution and one Teacher User, then run this.
"""
import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from institutions.models import Institution, InstitutionMembership
from curriculum.models import Country, CurriculumTrack, EducationLevel, ClassLevel, Subject, Topic
from assessments.models import Assessment, Question

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed all 2026 pilot content (tracks, labs, projects, exams, cohorts, pathways, discovery profiles, credentials).'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding pilot content…'))

        # ── Ensure curriculum scaffolding ─────────────────────────
        country, _ = Country.objects.get_or_create(code='UG', defaults={'name': 'Uganda'})
        track, _ = CurriculumTrack.objects.get_or_create(country=country, name='O-Level')
        level, _ = EducationLevel.objects.get_or_create(track=track, name='Lower Secondary', defaults={'is_primary': False})
        primary_level, _ = EducationLevel.objects.get_or_create(track=track, name='Primary', defaults={'is_primary': True})
        s1, _ = ClassLevel.objects.get_or_create(level=level, name='S1', defaults={'internal_canonical_grade': 8})
        s3, _ = ClassLevel.objects.get_or_create(level=level, name='S3', defaults={'internal_canonical_grade': 10})
        p5, _ = ClassLevel.objects.get_or_create(level=primary_level, name='P5', defaults={'internal_canonical_grade': 5})
        p6, _ = ClassLevel.objects.get_or_create(level=primary_level, name='P6', defaults={'internal_canonical_grade': 6})
        p7, _ = ClassLevel.objects.get_or_create(level=primary_level, name='P7', defaults={'internal_canonical_grade': 7})

        math, _ = Subject.objects.get_or_create(name='Mathematics')
        english, _ = Subject.objects.get_or_create(name='English')
        biology, _ = Subject.objects.get_or_create(name='Biology')
        reading, _ = Subject.objects.get_or_create(name='Reading')

        # Topics to hang content on
        t_fractions, _ = Topic.objects.get_or_create(subject=math, class_level=p7, name='Fractions', defaults={'order': 1})
        t_essay, _ = Topic.objects.get_or_create(subject=english, class_level=s1, name='Paragraph Writing', defaults={'order': 1})
        t_comprehension, _ = Topic.objects.get_or_create(subject=reading, class_level=p7, name='Reading Comprehension', defaults={'order': 1})
        t_cells, _ = Topic.objects.get_or_create(subject=biology, class_level=s3, name='Cells', defaults={'order': 1})

        # Ensure we have at least one teacher for author FKs
        teacher = User.objects.filter(role='teacher').first() or User.objects.filter(email='teacher.a@pilot.maple').first()
        if not teacher:
            teacher = User.objects.create_user(
                email='content.seed@pilot.maple', full_name='Content Seed',
                country_code='UG', password='PilotPass!', role='teacher',
            )
        institution = Institution.objects.filter(name__icontains='Pilot').first() or Institution.objects.first()
        if not institution:
            institution = Institution.objects.create(name='Maple Pilot School')
        InstitutionMembership.objects.get_or_create(
            user=teacher, institution=institution,
            defaults={'role': 'subject_teacher', 'status': 'active'},
        )

        # ── Mastery Tracks ────────────────────────────────────────
        self._seed_mastery_tracks(teacher, math, english, reading, biology, p5, p7, s1, s3, t_fractions, t_essay, t_comprehension, t_cells)

        # ── Practice Labs ─────────────────────────────────────────
        self._seed_practice_labs(teacher, math, english, reading, p5, p6, p7, s1, t_fractions, t_essay, t_comprehension)

        # ── Mastery Projects ──────────────────────────────────────
        self._seed_mastery_projects(teacher, english, math, biology, s1, s3, t_essay, t_cells)

        # ── Exam Simulations (needs assessments + questions) ──────
        self._seed_exam_simulations(teacher, math, biology, p7, s3, t_fractions, t_cells)

        # ── Learning Cohort ───────────────────────────────────────
        self._seed_cohort(teacher, math, p7)

        # ── Career Pathways ───────────────────────────────────────
        self._seed_pathways()

        # ── Institution Discovery Profiles ────────────────────────
        self._seed_discovery(institution)

        # ── Credentials ───────────────────────────────────────────
        self._seed_credentials(math, english, reading, biology)

        # ── Standby Teacher Availability ──────────────────────────
        self._seed_standby_availability(teacher, math, english)

        self.stdout.write(self.style.SUCCESS('✔ Pilot content seeded.'))

    # ──────────────────────────────────────────────────────────────
    def _seed_mastery_tracks(self, teacher, math, english, reading, biology, p5, p7, s1, s3, t_fractions, t_essay, t_comprehension, t_cells):
        from mastery.models import MasteryTrack, MasteryTrackModule, MasteryTrackItem

        tracks = [
            {
                'slug': 'number-sense-p5', 'title': 'Number Sense — P5',
                'tagline': 'Learn to count, compare, and reason with numbers.',
                'outcome_statement': 'Confidently order, compare, and add numbers up to 10,000.',
                'target_role': 'student', 'class_level': p5, 'subject': math,
                'level': 'beginner', 'exam_track': 'PLE', 'estimated_duration_weeks': 4,
                'is_featured': True,
                'modules': [
                    ('Week 1 — Counting & Place Value', [('content', 'Place value intro'), ('practice_lab', 'Counting money lab'), ('assessment', 'Place value check')]),
                    ('Week 2 — Adding Bigger Numbers', [('content', 'Regrouping'), ('practice_lab', 'Column addition')]),
                ],
            },
            {
                'slug': 'reading-mastery-p7', 'title': 'Reading Mastery — P7',
                'tagline': 'Read smoothly. Understand deeply.', 'outcome_statement': 'Read grade-level text fluently with strong comprehension.',
                'target_role': 'student', 'class_level': p7, 'subject': reading,
                'level': 'beginner', 'exam_track': 'PLE', 'estimated_duration_weeks': 6,
                'is_featured': True,
                'modules': [
                    ('Week 1 — Fluency', [('content', 'Intro to fluency'), ('practice_lab', 'Read-aloud lab'), ('assessment', 'Fluency check')]),
                    ('Week 2 — Comprehension', [('content', 'Main idea + details'), ('practice_lab', 'Passage workshop'), ('project', 'Book review submission')]),
                ],
            },
            {
                'slug': 'ple-mathematics-revision', 'title': 'PLE Mathematics Revision',
                'tagline': 'Lock in the 12 highest-yield PLE topics.', 'outcome_statement': 'Finish PLE-level problems with confidence on fractions, geometry, and word problems.',
                'target_role': 'student', 'class_level': p7, 'subject': math,
                'level': 'intermediate', 'exam_track': 'PLE', 'estimated_duration_weeks': 12,
                'is_featured': True,
                'modules': [
                    ('Number & Fractions', [('content', 'Fractions refresher'), ('practice_lab', 'Fractions step-by-step'), ('assessment', 'Fractions quiz')]),
                    ('Geometry', [('content', 'Shapes & angles'), ('practice_lab', 'Measurement lab')]),
                ],
            },
            {
                'slug': 'uce-biology-foundations', 'title': 'UCE Biology Foundations',
                'tagline': 'Cell theory to genetics — the UCE essentials.', 'outcome_statement': 'Explain cell structure, respiration, and genetics clearly, with exam-worthy diagrams.',
                'target_role': 'student', 'class_level': s3, 'subject': biology,
                'level': 'intermediate', 'exam_track': 'UCE', 'estimated_duration_weeks': 8,
                'modules': [
                    ('Cells & Tissues', [('content', 'Cell structure'), ('assessment', 'Diagram quiz'), ('project', 'Home observation report')]),
                ],
            },
        ]
        for t_spec in tracks:
            modules = t_spec.pop('modules')
            track, _ = MasteryTrack.objects.update_or_create(
                slug=t_spec['slug'],
                defaults={**t_spec, 'is_published': True, 'created_by': teacher, 'is_premium': True},
            )
            for i, (mod_title, items) in enumerate(modules, start=1):
                module, _ = MasteryTrackModule.objects.update_or_create(
                    track=track, order=i,
                    defaults={'title': mod_title, 'description': ''},
                )
                for j, (item_type, placeholder) in enumerate(items, start=1):
                    MasteryTrackItem.objects.update_or_create(
                        module=module, order=j,
                        defaults={'item_type': item_type, 'placeholder_title': placeholder, 'required_for_completion': True},
                    )
        self.stdout.write(f'  · Mastery Tracks: {MasteryTrack.objects.filter(is_published=True).count()}')

    # ──────────────────────────────────────────────────────────────
    def _seed_practice_labs(self, teacher, math, english, reading, p5, p6, p7, s1, t_fractions, t_essay, t_comprehension):
        from practice_labs.models import PracticeLab, PracticeLabStep

        labs = [
            {
                'slug': 'counting-money-p5', 'title': 'Counting Money',
                'description': 'Add coins and notes to make exact amounts.',
                'instructions': 'Work through each shopping scene and give the right amount.',
                'subject': math, 'class_level': p5, 'topic': None,
                'difficulty': 'beginner', 'estimated_minutes': 10,
                'badge_label': 'Money Counter',
                'steps': [
                    ('mcq', 'Which coins add up to 500 UGX?', ['200 + 200 + 100', '100 + 100', '500 + 200'], '200 + 200 + 100', 'Add them slowly.'),
                    ('short_answer', 'You have 1000 UGX. A mango costs 700 UGX. How much change?', [], '300', 'Subtract 700 from 1000.'),
                    ('mcq', 'Two 500 UGX coins = ?', ['500', '1000', '1500'], '1000', ''),
                    ('reflection', 'Was any question tricky?', [], '', ''),
                ],
            },
            {
                'slug': 'my-first-paragraph-p6', 'title': 'My First Paragraph',
                'description': 'Write a short paragraph about something you love.',
                'instructions': 'Pick a favourite thing. Write 3 sentences: what it is, why you love it, one example.',
                'subject': english, 'class_level': p6, 'topic': None,
                'difficulty': 'beginner', 'estimated_minutes': 12,
                'badge_label': 'Young Writer',
                'steps': [
                    ('instruction', 'A paragraph answers: What? Why? Example.', [], '', ''),
                    ('short_answer', 'Write a topic sentence: "My favourite ____ is ____."', [], '', ''),
                    ('short_answer', 'Why do you love it? One sentence.', [], '', ''),
                    ('reflection', 'Would you share this with a friend?', [], '', ''),
                ],
            },
            {
                'slug': 'fractions-step-by-step', 'title': 'Fractions: Step by Step',
                'description': 'Add, subtract, and simplify fractions with instant feedback.',
                'instructions': 'Answer each step. Use the hint if you need it.',
                'subject': math, 'class_level': p7, 'topic': t_fractions,
                'difficulty': 'beginner', 'estimated_minutes': 15,
                'badge_label': 'Fractions Starter',
                'steps': [
                    ('mcq', 'What is 1/2 + 1/2?', ['1/4', '1', '2/2', '0'], '1', 'Like denominators — just add numerators.'),
                    ('short_answer', 'Simplify 2/4.', [], '1/2', 'Divide top and bottom by 2.'),
                    ('mcq', 'Which is larger: 3/4 or 2/3?', ['3/4', '2/3', 'Equal'], '3/4', 'Compare to 1/2 or find common denominator.'),
                    ('reflection', 'What made this topic clearer?', [], '', ''),
                ],
            },
            {
                'slug': 'strong-paragraph', 'title': 'Write a Strong Paragraph',
                'description': 'Topic sentence, supporting details, conclusion.',
                'subject': english, 'class_level': s1, 'topic': t_essay,
                'difficulty': 'beginner', 'estimated_minutes': 20,
                'badge_label': 'Paragraph Power',
                'steps': [
                    ('instruction', 'A strong paragraph has: (1) a topic sentence, (2) supporting details, (3) a closing sentence.', [], '', ''),
                    ('short_answer', 'Write a topic sentence about your favourite subject.', [], '', 'Start with "My favourite subject is…"'),
                    ('short_answer', 'Write one supporting detail.', [], '', ''),
                    ('reflection', 'Which part was hardest?', [], '', ''),
                ],
            },
            {
                'slug': 'reading-comprehension-1', 'title': 'Read & Answer: Comprehension Lab',
                'description': 'Read a short passage and answer questions.',
                'subject': reading, 'class_level': p7, 'topic': t_comprehension,
                'difficulty': 'beginner', 'estimated_minutes': 15,
                'badge_label': 'Careful Reader',
                'steps': [
                    ('instruction', 'Read: "Amara walks 2 km to school each morning. She leaves home at 6:30am and arrives by 7:00am. On Fridays, her uncle gives her a ride."', [], '', ''),
                    ('short_answer', 'How far does Amara walk to school?', [], '2 km', ''),
                    ('mcq', 'On which day does Amara not walk?', ['Monday', 'Friday', 'Sunday'], 'Friday', ''),
                    ('reflection', 'What did you notice about the passage?', [], '', ''),
                ],
            },
            {
                'slug': 'family-budget', 'title': 'Make a Family Budget',
                'description': 'Apply maths to a real-life problem.',
                'subject': math, 'class_level': s1, 'topic': None,
                'difficulty': 'intermediate', 'estimated_minutes': 25,
                'badge_label': 'Real-World Solver',
                'steps': [
                    ('instruction', 'A family earns 800,000 UGX per month. List 5 typical expenses.', [], '', ''),
                    ('short_answer', 'What percentage of income should go to savings at minimum?', [], '10%', 'Common recommendation is 10–20%.'),
                    ('short_answer', 'If rent is 200,000 UGX, what fraction of income is that?', [], '1/4', ''),
                    ('reflection', 'What would you save for first?', [], '', ''),
                ],
            },
            {
                'slug': 'pronunciation-starter', 'title': 'English Pronunciation Starter',
                'description': 'Short words, clear mouth-shape practice.',
                'subject': english, 'class_level': p7, 'topic': None,
                'difficulty': 'beginner', 'estimated_minutes': 10,
                'badge_label': 'Clear Speaker',
                'steps': [
                    ('instruction', 'Read each word out loud, slowly: thin, think, thought, third.', [], '', ''),
                    ('short_answer', 'Which letter combination is hardest for you?', [], '', ''),
                    ('reflection', 'Did saying the words slowly help?', [], '', ''),
                ],
            },
        ]

        for lab_spec in labs:
            steps = lab_spec.pop('steps')
            lab, _ = PracticeLab.objects.update_or_create(
                slug=lab_spec['slug'],
                defaults={**lab_spec, 'is_published': True, 'created_by': teacher, 'pass_threshold_pct': 60},
            )
            # Clear old steps and re-create so ordering stays consistent.
            lab.steps.all().delete()
            for i, (step_type, prompt, options, expected, hint) in enumerate(steps, start=1):
                PracticeLabStep.objects.create(
                    lab=lab, order=i, step_type=step_type,
                    prompt=prompt, options=options or [],
                    expected_answer=expected, hint=hint, points=1,
                )
        self.stdout.write(f'  · Practice Labs: {PracticeLab.objects.filter(is_published=True).count()}')

    # ──────────────────────────────────────────────────────────────
    def _seed_mastery_projects(self, teacher, english, math, biology, s1, s3, t_essay, t_cells):
        from mastery_projects.models import MasteryProject

        projects = [
            {
                'slug': 'record-a-speech', 'title': 'Record a 3-Minute Speech',
                'description': 'Deliver a clear, persuasive speech on a topic you care about.',
                'instructions': 'Pick a topic. Write a short script. Record yourself. Upload the audio or video.',
                'subject': english, 'class_level': s1, 'topic': t_essay,
                'estimated_days': 3,
                'rubric': [
                    {'criterion': 'Clarity', 'description': 'Words are clear and easy to follow.', 'max_points': 10},
                    {'criterion': 'Structure', 'description': 'Introduction, main points, conclusion.', 'max_points': 10},
                    {'criterion': 'Persuasiveness', 'description': 'Gives reasons and examples.', 'max_points': 10},
                ],
            },
            {
                'slug': 'home-cell-observation', 'title': 'Home Cell Observation Report',
                'description': 'Observe something living at home and write a short report using what you learned about cells.',
                'instructions': 'Pick a plant, fruit, or animal. Take a photo. Write a 200-word observation.',
                'subject': biology, 'class_level': s3, 'topic': t_cells,
                'estimated_days': 2,
                'rubric': [
                    {'criterion': 'Accuracy', 'description': 'Uses correct biology terms.', 'max_points': 10},
                    {'criterion': 'Evidence', 'description': 'Photo or drawing supports the text.', 'max_points': 10},
                ],
            },
            {
                'slug': 'family-budget-project', 'title': 'Design a Family Budget',
                'description': 'Turn the Family Budget practice lab into a full plan your household could use.',
                'instructions': 'List income, expenses, savings. Upload as a document or image.',
                'subject': math, 'class_level': s1, 'topic': None,
                'estimated_days': 4,
                'rubric': [
                    {'criterion': 'Realism', 'description': 'Numbers reflect a real household.', 'max_points': 10},
                    {'criterion': 'Completeness', 'description': 'Income, rent, food, school, savings all covered.', 'max_points': 10},
                    {'criterion': 'Reflection', 'description': 'Short note on what you would change.', 'max_points': 5},
                ],
            },
        ]
        from mastery_projects.models import MasteryProject
        for p_spec in projects:
            MasteryProject.objects.update_or_create(
                slug=p_spec['slug'],
                defaults={**p_spec, 'is_published': True, 'created_by': teacher},
            )
        self.stdout.write(f'  · Mastery Projects: {MasteryProject.objects.filter(is_published=True).count()}')

    # ──────────────────────────────────────────────────────────────
    def _seed_exam_simulations(self, teacher, math, biology, p7, s3, t_fractions, t_cells):
        from exam_simulator.models import ExamSimulation

        # First, make sure each exam has at least a handful of Questions to draw from.
        sims = [
            ('ple-maths-mock-1', 'PLE Maths Mock 1', 'PLE', math, p7, t_fractions, [
                ('mcq', '1/2 + 1/4 = ?', ['1/4', '3/4', '1', '2/6'], '3/4'),
                ('mcq', 'Round 234 to the nearest ten.', ['230', '240', '200', '300'], '230'),
                ('short_answer', 'What is 15% of 200?', [], '30'),
            ]),
            ('uce-biology-mock-1', 'UCE Biology Mock 1', 'UCE', biology, s3, t_cells, [
                ('mcq', 'Which organelle produces energy?', ['Nucleus', 'Mitochondrion', 'Ribosome', 'Chloroplast'], 'Mitochondrion'),
                ('mcq', 'Plant cells have a cell wall made of…', ['Fat', 'Protein', 'Cellulose', 'Water'], 'Cellulose'),
                ('short_answer', 'Name the process by which cells divide for growth.', [], 'Mitosis'),
            ]),
        ]

        for slug, title, track_name, subject, class_level, topic, q_specs in sims:
            # Create a backing Assessment to host the Questions.
            assessment, _ = Assessment.objects.get_or_create(
                title=f'{title} — question bank',
                defaults={
                    'instructions': 'Curated for exam simulation.', 'type': 'exam',
                    'source': 'platform_quiz', 'max_score': len(q_specs),
                    'topic': topic, 'created_by': teacher, 'is_published': True,
                },
            )
            questions = []
            for i, (qtype, content, options, expected) in enumerate(q_specs, start=1):
                q, _ = Question.objects.update_or_create(
                    assessment=assessment, order=i,
                    defaults={'type': qtype, 'content': content, 'options': options, 'correct_answer': expected, 'marks': 1},
                )
                questions.append(q)

            sim, _ = ExamSimulation.objects.update_or_create(
                slug=slug,
                defaults={
                    'title': title, 'exam_track': track_name,
                    'subject': subject, 'class_level': class_level,
                    'duration_minutes': 45, 'is_published': True,
                    'created_by': teacher,
                    'instructions': 'Read each question carefully. You can go back to change an answer.',
                },
            )
            sim.questions.set(questions)
        self.stdout.write(f'  · Exam Simulations: {ExamSimulation.objects.filter(is_published=True).count()}')

    # ──────────────────────────────────────────────────────────────
    def _seed_cohort(self, teacher, math, p7):
        from cohorts.models import Cohort

        start = datetime.date.today() + datetime.timedelta(days=7)
        end = start + datetime.timedelta(weeks=12)
        Cohort.objects.update_or_create(
            slug='ple-revision-12w-pilot',
            defaults={
                'title': 'PLE Revision 12-Week Cohort',
                'tagline': 'Study together with Teacher Amos — finish on time.',
                'description': 'Weekly live classes, practice labs, a mastery project, and a revision plan tailored to PLE.',
                'teacher_lead': teacher, 'subject': math, 'class_level': p7,
                'exam_track': 'PLE',
                'start_date': start, 'end_date': end,
                'weekly_plan': [
                    {'week': 1, 'focus': 'Fractions & decimals', 'live_classes': [{'day': 'Mon', 'time': '16:00'}]},
                    {'week': 2, 'focus': 'Geometry basics', 'live_classes': [{'day': 'Mon', 'time': '16:00'}]},
                ],
                'max_seats': 25, 'is_published': True, 'is_premium': True,
            },
        )
        self.stdout.write('  · Cohort: 1')

    # ──────────────────────────────────────────────────────────────
    def _seed_pathways(self):
        from pathways.models import CareerPathway

        pathways = [
            ('health-sciences', 'Health Sciences', '🩺', 'Save lives, treat illness, understand bodies.',
             ['Biology', 'Chemistry', 'Mathematics'],
             ['Patience', 'Empathy', 'Scientific reasoning'],
             ['Doctor', 'Nurse', 'Pharmacist', 'Public health officer'],
             ['Diploma in Nursing', 'BSc Biomedical Sciences', 'MBChB']),
            ('engineering-ict', 'Engineering & ICT', '🛠️', 'Build things, solve problems, write code.',
             ['Mathematics', 'Physics', 'Computer Studies'],
             ['Logical thinking', 'Problem solving', 'Teamwork'],
             ['Software Engineer', 'Electrical Engineer', 'Network Admin'],
             ['Diploma in ICT', 'BSc Engineering', 'BSc Computer Science']),
            ('arts-humanities', 'Arts & Humanities', '📚', 'Tell stories, study people, shape culture.',
             ['Literature', 'History', 'Geography', 'Art'],
             ['Writing', 'Research', 'Critical reading'],
             ['Journalist', 'Teacher', 'Historian', 'Writer'],
             ['Diploma in Education', 'BA Arts', 'MA English']),
            ('business-entrepreneurship', 'Business & Entrepreneurship', '💼', 'Run organizations, spot opportunities, create value.',
             ['Mathematics', 'Entrepreneurship', 'Economics'],
             ['Communication', 'Leadership', 'Numeracy'],
             ['Founder', 'Accountant', 'Marketing specialist'],
             ['Diploma in Business', 'BBA', 'BCom']),
            ('agriculture-tech', 'Agriculture & Food Tech', '🌾', 'Grow food, feed communities, work with the land.',
             ['Biology', 'Agriculture', 'Chemistry'],
             ['Practical skills', 'Observation', 'Planning'],
             ['Farm manager', 'Agronomist', 'Food scientist'],
             ['Diploma in Agriculture', 'BSc Agriculture']),
            ('public-service', 'Public Service & Social Impact', '🌍', 'Serve communities, shape policy, lead change.',
             ['History', 'Social Studies', 'English'],
             ['Empathy', 'Communication', 'Ethics'],
             ['Teacher', 'Social worker', 'Civil servant', 'NGO leader'],
             ['Diploma in Social Work', 'BA Social Sciences']),
        ]

        for slug, title, emoji, tagline, subjects, skills, roles, edu in pathways:
            CareerPathway.objects.update_or_create(
                slug=slug,
                defaults={
                    'title': title, 'icon_emoji': emoji, 'tagline': tagline,
                    'recommended_subjects': subjects,
                    'required_skills': skills,
                    'typical_roles': roles,
                    'education_levels': edu,
                    'is_published': True,
                    'stage': 'secondary',
                },
            )

        # Primary-stage exploration pathways. Framing is age-appropriate:
        # "people who…" rather than "careers in…". No specific qualifications.
        primary_pathways = [
            ('explore-caring-for-people', 'Caring for People', '❤️', 'People who help others stay healthy and safe.',
             ['Science', 'Reading', 'Social Studies'],
             ['Kindness', 'Listening', 'Working in teams'],
             ['Nurse', 'Doctor', 'Teacher', 'Police officer']),
            ('explore-making-things', 'Making and Building', '🔧', 'People who design, build, and fix things.',
             ['Mathematics', 'Science', 'Art'],
             ['Curiosity', 'Patience', 'Drawing'],
             ['Engineer', 'Carpenter', 'Architect', 'Inventor']),
            ('explore-telling-stories', 'Telling Stories', '📖', 'People who use words, pictures, and music to share ideas.',
             ['English', 'Reading', 'Art'],
             ['Imagination', 'Speaking clearly', 'Reading a lot'],
             ['Writer', 'Journalist', 'Artist', 'Musician']),
            ('explore-growing-food', 'Growing Food', '🌱', 'People who feed communities and take care of the land.',
             ['Science', 'Geography'],
             ['Observation', 'Patience', 'Hard work'],
             ['Farmer', 'Vet', 'Food scientist']),
        ]
        for slug, title, emoji, tagline, subjects, skills, roles in primary_pathways:
            CareerPathway.objects.update_or_create(
                slug=slug,
                defaults={
                    'title': title, 'icon_emoji': emoji, 'tagline': tagline,
                    'recommended_subjects': subjects,
                    'required_skills': skills,
                    'typical_roles': roles,
                    'education_levels': [],
                    'is_published': True,
                    'stage': 'primary',
                },
            )
        self.stdout.write(f'  · Career Pathways: {CareerPathway.objects.filter(is_published=True).count()} (both stages)')

    # ──────────────────────────────────────────────────────────────
    def _seed_discovery(self, pilot_inst):
        from institution_discovery.models import InstitutionDiscoveryProfile, InstitutionRecommendationScore

        # Pilot institution gets its own profile; plus 2 mock schools for comparison.
        profiles = [
            (pilot_inst, 'Kampala', 'Central', 'Maple Pilot School — a modern online-first school.',
             'Admissions open for Term 1. We onboard new learners every Monday.', 'day_and_boarding', 'open',
             ['P1', 'P4', 'P7', 'S1', 'S3'], ['English', 'Mathematics', 'Reading', 'Biology']),
        ]
        extra = [
            ('Nakasero Academy', 'Kampala', 'Central', 'Long-standing academy with strong PLE + UCE track record.', 'open', 'day', ['P5', 'P6', 'P7', 'S1', 'S2'], ['English', 'Mathematics', 'Science']),
            ('Mbarara Smart School', 'Mbarara', 'Western', 'A smaller, family-focused boarding school.', 'open', 'boarding', ['S1', 'S2', 'S3', 'S4'], ['English', 'Physics', 'Chemistry', 'Biology']),
        ]
        from institutions.models import Institution as Inst
        for name, city, region, about, status, mode, levels, subs in extra:
            inst, _ = Inst.objects.get_or_create(name=name)
            profiles.append((inst, city, region, about, 'Applications open — reach out to the admissions office.', mode, status, levels, subs))

        for inst, city, region, about, blurb, mode, status, levels, subs in profiles:
            profile, _ = InstitutionDiscoveryProfile.objects.update_or_create(
                institution=inst,
                defaults={
                    'location_city': city, 'location_region': region,
                    'about': about, 'admission_blurb': blurb,
                    'boarding_options': mode, 'admission_status': status,
                    'levels_offered': levels, 'subjects_offered': subs,
                    'admission_contact_email': f'admissions@{inst.name.lower().replace(" ", "")}.maple',
                    'admission_contact_phone': '+256 700 000 000',
                    'is_listed': True,
                },
            )
            InstitutionRecommendationScore.objects.update_or_create(
                institution=inst,
                defaults={
                    'maple_activeness_score': 72 if inst == pilot_inst else 58,
                    'growth_index': 65,
                    'verified_lesson_delivery': 75,
                    'assessment_activity': 70,
                    'attendance_tracking': 68,
                    'parent_reporting': 72,
                    'teacher_responsiveness': 74,
                    'peer_learning_activity': 60,
                    'student_engagement': 68,
                    'platform_consistency': 70,
                    'exam_readiness_strength': 72,
                    'standby_teachers_available': 3,
                    'explanation': 'Maple Activeness Score is based on verified lesson delivery, assessment activity, attendance tracking, parent reporting, teacher responsiveness, peer learning, student engagement, and platform consistency over the last 90 days.',
                },
            )
        self.stdout.write(f'  · Institution Discovery Profiles: {InstitutionDiscoveryProfile.objects.filter(is_listed=True).count()}')

    # ──────────────────────────────────────────────────────────────
    def _seed_credentials(self, math, english, reading, biology):
        from passport.models import Credential

        creds = [
            ('fluency-starter-badge', 'Fluency Starter Badge', 'badge', reading, 'P7', 'Complete the Fluency practice lab at 70%+.'),
            ('paragraph-power-badge', 'Paragraph Power Badge', 'badge', english, 'S1', 'Complete the Write a Strong Paragraph lab at 70%+.'),
            ('fractions-solver-badge', 'Fractions Solver Badge', 'badge', math, 'P7', 'Complete the Fractions Step-by-Step lab at 80%+.'),
            ('ple-revision-cert', 'PLE Revision Certificate', 'certificate', math, 'P7', 'Complete the PLE Maths Revision track.'),
            ('uce-biology-cert', 'UCE Biology Foundations Certificate', 'certificate', biology, 'S3', 'Complete the UCE Biology Foundations track with teacher-reviewed project.'),
            ('careful-reader-badge', 'Careful Reader Badge', 'badge', reading, 'P7', 'Finish the Read & Answer Comprehension lab.'),
            ('real-world-solver', 'Real-World Solver Badge', 'badge', math, 'S1', 'Submit an approved Family Budget project.'),
            ('clear-speaker-badge', 'Clear Speaker Badge', 'badge', english, 'P7', 'Complete pronunciation practice + record a Speech project.'),
        ]
        for slug, title, ctype, subject, level, criteria in creds:
            Credential.objects.update_or_create(
                slug=slug,
                defaults={
                    'title': title, 'credential_type': ctype, 'subject': subject,
                    'level': level, 'criteria': criteria,
                    'issuer_type': 'maple', 'is_verifiable': True, 'is_published': True,
                    'description': f'Verified by Maple when a learner meets the criteria: {criteria}',
                },
            )
        self.stdout.write(f'  · Credentials: {Credential.objects.filter(is_published=True).count()}')

    # ──────────────────────────────────────────────────────────────
    def _seed_standby_availability(self, teacher, math, english):
        from standby_teachers.models import TeacherAvailability
        import datetime as dt

        slots = [
            (math, 2, dt.time(16, 0), dt.time(17, 0), 'office_hours'),
            (english, 4, dt.time(17, 0), dt.time(18, 0), 'chat'),
        ]
        for subject, day, start, end, mode in slots:
            TeacherAvailability.objects.update_or_create(
                teacher=teacher, subject=subject, day_of_week=day,
                defaults={'start_time': start, 'end_time': end, 'mode': mode, 'is_active': True},
            )
        self.stdout.write(f'  · Standby Availability windows: {TeacherAvailability.objects.filter(is_active=True).count()}')
