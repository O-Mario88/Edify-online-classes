from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from institutions.models import Institution, InstitutionMembership

User = get_user_model()


class MentorReviewFlowTests(TestCase):
    REQUESTS_URL = '/api/v1/mentor-reviews/requests/'
    QUEUE_URL = '/api/v1/mentor-reviews/requests/teacher-queue/'

    def setUp(self):
        cache.clear()
        self.inst = Institution.objects.create(name='Mentor School')
        self.student = User.objects.create_user(
            email='m.student@edify.test', full_name='S', country_code='UG',
            password='Pass!', role='student',
        )
        self.teacher = User.objects.create_user(
            email='m.teacher@edify.test', full_name='T', country_code='UG',
            password='Pass!', role='teacher',
        )
        for u, role in ((self.student, 'student'), (self.teacher, 'subject_teacher')):
            InstitutionMembership.objects.create(user=u, institution=self.inst, role=role, status='active')
        self.s_client = APIClient(); self.s_client.force_authenticate(user=self.student)
        self.t_client = APIClient(); self.t_client.force_authenticate(user=self.teacher)

    def test_student_can_request_teacher_can_respond(self):
        create = self.s_client.post(self.REQUESTS_URL, {
            'request_type': 'essay', 'message': 'Please review my climate change essay.',
            'priority': 'high',
        }, format='json')
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        rid = create.data['id']

        # Teacher sees in queue.
        queue = self.t_client.get(self.QUEUE_URL)
        self.assertEqual(queue.status_code, status.HTTP_200_OK)
        ids = {r['id'] for r in queue.data}
        self.assertIn(rid, ids)

        # Accept + respond.
        accept = self.t_client.post(f'{self.REQUESTS_URL}{rid}/accept/', {}, format='json')
        self.assertEqual(accept.status_code, status.HTTP_200_OK)
        self.assertEqual(accept.data['status'], 'in_review')

        respond = self.t_client.post(f'{self.REQUESTS_URL}{rid}/respond/', {
            'feedback': 'Strong thesis; tighten conclusion.',
            'recommended_next_steps': 'Rewrite paragraph 4.',
        }, format='json')
        self.assertEqual(respond.status_code, status.HTTP_200_OK, respond.content)
        self.assertEqual(respond.data['status'], 'completed')
        self.assertEqual(len(respond.data['responses']), 1)

    def test_student_cannot_access_teacher_queue(self):
        resp = self.s_client.get(self.QUEUE_URL)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
