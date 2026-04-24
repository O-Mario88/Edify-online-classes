from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from curriculum.models import Country, CurriculumTrack, EducationLevel, ClassLevel, Subject, Topic
from assessments.models import Assessment, Question
from .models import ExamSimulation, MistakeNotebookEntry

User = get_user_model()


class ExamSimulatorTests(TestCase):
    START_URL = '/api/v1/exam-simulator/exams/{slug}/start/'
    READINESS_URL = '/api/v1/exam-simulator/readiness/summary/'
    NOTEBOOK_URL = '/api/v1/exam-simulator/mistake-notebook/'

    def setUp(self):
        cache.clear()
        country = Country.objects.create(code='UG', name='Uganda')
        track = CurriculumTrack.objects.create(country=country, name='O-Level')
        el = EducationLevel.objects.create(track=track, name='Lower Sec')
        self.cl = ClassLevel.objects.create(level=el, name='S1', internal_canonical_grade=8)
        self.subj = Subject.objects.create(name='Maths')
        self.topic = Topic.objects.create(subject=self.subj, class_level=self.cl, name='Algebra', order=1)
        self.teacher = User.objects.create_user(
            email='es.teacher@edify.test', full_name='T', country_code='UG', password='P!', role='teacher',
        )
        self.student = User.objects.create_user(
            email='es.student@edify.test', full_name='S', country_code='UG', password='P!', role='student',
        )
        self.assessment = Assessment.objects.create(
            title='Seed', type='quiz', source='platform_quiz', max_score=10,
            topic=self.topic, created_by=self.teacher, is_published=True,
        )
        self.q1 = Question.objects.create(
            assessment=self.assessment, type='mcq', content='1+1=?',
            options=['1', '2', '3', '4'], correct_answer='2', marks=2, order=1,
        )
        self.q2 = Question.objects.create(
            assessment=self.assessment, type='short_answer', content='Capital of Uganda?',
            correct_answer='Kampala', marks=3, order=2,
        )
        self.exam = ExamSimulation.objects.create(
            title='PLE Maths Mock', slug='ple-maths-mock',
            exam_track='PLE', subject=self.subj, class_level=self.cl,
            duration_minutes=30, is_published=True, created_by=self.teacher,
        )
        self.exam.questions.add(self.q1, self.q2)

        self.s_client = APIClient(); self.s_client.force_authenticate(user=self.student)

    def test_start_delivers_questions_without_answer(self):
        resp = self.s_client.post(self.START_URL.format(slug='ple-maths-mock'), {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        q = resp.data['questions'][0]
        self.assertNotIn('correct_answer', q)

    def test_full_attempt_with_wrong_answer_creates_notebook_entry(self):
        start = self.s_client.post(self.START_URL.format(slug='ple-maths-mock'), {}, format='json')
        attempt_id = start.data['attempt']['id']
        submit_url = f'/api/v1/exam-simulator/attempts/{attempt_id}/submit/'
        resp = self.s_client.post(submit_url, {
            'answers': {str(self.q1.id): '2', str(self.q2.id): 'Nairobi'},
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertEqual(resp.data['status'], 'graded')
        self.assertEqual(resp.data['score_points'], 2)
        self.assertEqual(resp.data['max_points'], 5)
        # 40% → low
        self.assertEqual(resp.data['readiness_band'], 'low')
        # One notebook entry for the wrong short_answer.
        notebook = self.s_client.get(self.NOTEBOOK_URL)
        self.assertEqual(len(notebook.data.get('results', notebook.data)), 1)

    def test_perfect_score_is_strong_band(self):
        start = self.s_client.post(self.START_URL.format(slug='ple-maths-mock'), {}, format='json')
        attempt_id = start.data['attempt']['id']
        resp = self.s_client.post(
            f'/api/v1/exam-simulator/attempts/{attempt_id}/submit/',
            {'answers': {str(self.q1.id): '2', str(self.q2.id): 'Kampala'}}, format='json',
        )
        self.assertEqual(resp.data['readiness_band'], 'strong')
        self.assertEqual(float(resp.data['score_pct']), 100.0)

    def test_readiness_summary_rolls_up_attempts(self):
        for _ in range(2):
            start = self.s_client.post(self.START_URL.format(slug='ple-maths-mock'), {}, format='json')
            attempt_id = start.data['attempt']['id']
            self.s_client.post(
                f'/api/v1/exam-simulator/attempts/{attempt_id}/submit/',
                {'answers': {str(self.q1.id): '2', str(self.q2.id): 'Kampala'}}, format='json',
            )
        resp = self.s_client.get(self.READINESS_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        tracks = resp.data['tracks']
        self.assertEqual(len(tracks), 1)
        self.assertEqual(tracks[0]['exam_track'], 'PLE')
        self.assertEqual(tracks[0]['attempts'], 2)
        self.assertEqual(tracks[0]['readiness_band'], 'strong')
