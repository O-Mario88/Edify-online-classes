from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from institutions.models import Institution, InstitutionMembership
from .models import MasteryProject

User = get_user_model()


class ProjectsPhase3Tests(TestCase):
    LIST = '/api/v1/mastery-projects/projects/'
    START_SUB = '/api/v1/mastery-projects/projects/{slug}/start-submission/'

    def setUp(self):
        cache.clear()
        self.inst = Institution.objects.create(name='Project School')
        self.teacher = User.objects.create_user(
            email='p.teacher@edify.test', full_name='T', country_code='UG',
            password='Pass!', role='teacher',
        )
        self.student = User.objects.create_user(
            email='p.student@edify.test', full_name='S', country_code='UG',
            password='Pass!', role='student',
        )
        InstitutionMembership.objects.create(user=self.teacher, institution=self.inst, role='subject_teacher', status='active')
        InstitutionMembership.objects.create(user=self.student, institution=self.inst, role='student', status='active')
        self.project = MasteryProject.objects.create(
            title='Record a Speech', slug='record-speech',
            description='Deliver a 3-minute speech.',
            instructions='Record yourself, upload, add a reflection.',
            rubric=[
                {'criterion': 'Clarity', 'description': 'Diction', 'max_points': 10},
                {'criterion': 'Content', 'description': 'Main points', 'max_points': 10},
            ],
            is_published=True, created_by=self.teacher,
        )
        self.s_client = APIClient(); self.s_client.force_authenticate(user=self.student)
        self.t_client = APIClient(); self.t_client.force_authenticate(user=self.teacher)

    def test_full_submit_review_flow(self):
        # Student starts.
        start = self.s_client.post(self.START_SUB.format(slug='record-speech'), {}, format='json')
        self.assertEqual(start.status_code, status.HTTP_201_CREATED, start.content)
        sub_id = start.data['id']

        # Student adds an artifact.
        art = self.s_client.post(
            f'/api/v1/mastery-projects/submissions/{sub_id}/artifacts/',
            {'artifact_type': 'text', 'text_content': 'This is my speech transcript.'}, format='json',
        )
        self.assertEqual(art.status_code, status.HTTP_201_CREATED)

        # Student submits.
        sub = self.s_client.post(
            f'/api/v1/mastery-projects/submissions/{sub_id}/submit/', {}, format='json',
        )
        self.assertEqual(sub.status_code, status.HTTP_200_OK)
        self.assertEqual(sub.data['status'], 'submitted')

        # Teacher reviews.
        rev = self.t_client.post(
            f'/api/v1/mastery-projects/submissions/{sub_id}/review/',
            {
                'rubric_scores': {'Clarity': 9, 'Content': 8},
                'feedback': 'Strong performance.', 'strengths': 'Clear voice.',
                'improvements': 'Slow down mid-speech.', 'next_steps': 'Practice tempo.',
                'status': 'passed',
            }, format='json',
        )
        self.assertEqual(rev.status_code, status.HTTP_201_CREATED, rev.content)
        self.assertEqual(rev.data['status'], 'approved')
        self.assertEqual(len(rev.data['reviews']), 1)
        self.assertEqual(float(rev.data['reviews'][0]['score']), 17.0)

    def test_student_cannot_review_own_submission(self):
        start = self.s_client.post(self.START_SUB.format(slug='record-speech'), {}, format='json')
        sub_id = start.data['id']
        self.s_client.post(f'/api/v1/mastery-projects/submissions/{sub_id}/submit/', {}, format='json')
        bad = self.s_client.post(
            f'/api/v1/mastery-projects/submissions/{sub_id}/review/',
            {'rubric_scores': {}, 'status': 'passed'}, format='json',
        )
        self.assertEqual(bad.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_queue_only_surfaces_reviewers(self):
        start = self.s_client.post(self.START_SUB.format(slug='record-speech'), {}, format='json')
        sub_id = start.data['id']
        self.s_client.post(f'/api/v1/mastery-projects/submissions/{sub_id}/submit/', {}, format='json')
        # Student can't access the review queue.
        bad = self.s_client.get('/api/v1/mastery-projects/submissions/review-queue/')
        self.assertEqual(bad.status_code, status.HTTP_403_FORBIDDEN)
        # Teacher can.
        ok = self.t_client.get('/api/v1/mastery-projects/submissions/review-queue/')
        self.assertEqual(ok.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(ok.data), 1)
