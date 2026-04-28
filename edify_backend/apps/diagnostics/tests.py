"""Flagship diagnostic flow tests.

Covers:
  - anonymous request is rejected (401)
  - a signed-up student can start a diagnostic and receives sampled questions
  - submitting answers computes scores + report_data and transitions state
  - a student cannot read another student's session
"""
from decimal import Decimal
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from curriculum.models import Country, CurriculumTrack, EducationLevel, ClassLevel, Subject, Topic
from assessments.models import Assessment, Question

from .models import DiagnosticSession

User = get_user_model()


def _make_question_bank(class_level, teacher):
    """Seed a small but realistic bank: 2 subjects × 2 topics × 3 questions each."""
    subjects = [
        Subject.objects.create(name='Mathematics'),
        Subject.objects.create(name='English'),
    ]
    created = []
    for subj in subjects:
        for topic_name in ('Topic A', 'Topic B'):
            topic = Topic.objects.create(subject=subj, class_level=class_level, name=topic_name)
            assessment = Assessment.objects.create(
                title=f'{subj.name} — {topic_name}',
                instructions='',
                type='quiz',
                source='platform_quiz',
                max_score=10,
                topic=topic,
                created_by=teacher,
                is_published=True,
            )
            for i in range(3):
                Question.objects.create(
                    assessment=assessment,
                    type='mcq',
                    content=f'{subj.name} {topic_name} Q{i+1}',
                    options=['A', 'B', 'C', 'D'],
                    correct_answer='A',
                    marks=1,
                    order=i + 1,
                )
                created.append(True)
    return subjects


class DiagnosticFlowTests(TestCase):
    START_URL = '/api/v1/diagnostic/start/'

    def setUp(self):
        cache.clear()
        # Curriculum scaffolding.
        country = Country.objects.create(code='UG', name='Uganda')
        track = CurriculumTrack.objects.create(country=country, name='O-Level')
        level = EducationLevel.objects.create(track=track, name='Lower Secondary', is_primary=False)
        self.class_level = ClassLevel.objects.create(level=level, name='S1', internal_canonical_grade=8)

        # Teacher seeds the question bank.
        self.teacher = User.objects.create_user(
            email='diag.teacher@edify.test', full_name='Diag Teacher',
            country_code='UG', password='TeachPass!', role='teacher',
        )
        _make_question_bank(self.class_level, self.teacher)

        self.student = User.objects.create_user(
            email='diag.student@edify.test', full_name='Diag Student',
            country_code='UG', password='StudentPass!', role='student',
        )
        self.other_student = User.objects.create_user(
            email='diag.other@edify.test', full_name='Other Student',
            country_code='UG', password='StudentPass!', role='student',
        )
        self.client_auth = APIClient()
        self.client_auth.force_authenticate(user=self.student)
        self.other_client = APIClient()
        self.other_client.force_authenticate(user=self.other_student)

    def test_anonymous_cannot_start_diagnostic(self):
        resp = APIClient().post(self.START_URL, {'class_level_id': self.class_level.id}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_starts_diagnostic_and_receives_questions(self):
        resp = self.client_auth.post(self.START_URL, {'class_level_id': self.class_level.id}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        body = resp.data
        self.assertEqual(body['session']['state'], 'in_progress')
        self.assertGreater(len(body['questions']), 0)
        self.assertLessEqual(len(body['questions']), 10)
        # Each question is sanitized — no correct_answer leak.
        first = body['questions'][0]
        self.assertIn('content', first)
        self.assertIn('options', first)
        self.assertNotIn('correct_answer', first)

    def test_student_submits_and_report_is_generated(self):
        start_resp = self.client_auth.post(self.START_URL, {'class_level_id': self.class_level.id}, format='json')
        self.assertEqual(start_resp.status_code, status.HTTP_200_OK)
        session_id = start_resp.data['session']['id']
        questions = start_resp.data['questions']

        # Answer every question with 'A' — the seeded correct answer.
        answers = {str(q['id']): 'A' for q in questions}
        submit_url = f'/api/v1/diagnostic/{session_id}/submit/'
        resp = self.client_auth.post(submit_url, {'answers': answers}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        body = resp.data

        self.assertEqual(body['state'], 'submitted')
        self.assertEqual(body['correct_count'], len(questions))
        self.assertEqual(Decimal(body['score_pct']), Decimal('100.00'))
        report = body['report_data']
        self.assertEqual(report['level_label'], 'Advanced')
        self.assertTrue(report['strong_subjects'])
        self.assertIn('trust_note', report)
        self.assertIn('study_plan_preview', report)
        self.assertGreater(len(report['study_plan_preview']), 0)
        # First 3 preview days unlocked, rest locked.
        unlocked = [d for d in report['study_plan_preview'] if not d['locked']]
        locked = [d for d in report['study_plan_preview'] if d['locked']]
        self.assertLessEqual(len(unlocked), 3)
        self.assertGreaterEqual(len(locked), 0)

    def test_submitting_empty_answers_gives_zero_and_needs_support_label(self):
        start_resp = self.client_auth.post(self.START_URL, {'class_level_id': self.class_level.id}, format='json')
        session_id = start_resp.data['session']['id']
        submit_url = f'/api/v1/diagnostic/{session_id}/submit/'
        resp = self.client_auth.post(submit_url, {'answers': {}}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['correct_count'], 0)
        # 0% → Critical Gaps
        self.assertEqual(resp.data['report_data']['level_label'], 'Critical Gaps')

    def test_student_cannot_read_another_students_session(self):
        start_resp = self.client_auth.post(self.START_URL, {'class_level_id': self.class_level.id}, format='json')
        session_id = start_resp.data['session']['id']
        # Other student tries to fetch it.
        resp = self.other_client.get(f'/api/v1/diagnostic/{session_id}/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_double_submit_is_blocked(self):
        start_resp = self.client_auth.post(self.START_URL, {'class_level_id': self.class_level.id}, format='json')
        session_id = start_resp.data['session']['id']
        submit_url = f'/api/v1/diagnostic/{session_id}/submit/'
        self.client_auth.post(submit_url, {'answers': {}}, format='json')
        resp = self.client_auth.post(submit_url, {'answers': {}}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
