from datetime import time
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from curriculum.models import Subject
from .models import TeacherAvailability, SupportRequest

User = get_user_model()


class StandbyTeacherTests(TestCase):
    REQ_URL = '/api/v1/standby-teachers/support-requests/'
    AVAIL_URL = '/api/v1/standby-teachers/availability/'
    LIVE_URL = '/api/v1/standby-teachers/availability/available/'
    QUEUE_URL = '/api/v1/standby-teachers/support-requests/teacher-queue/'

    def setUp(self):
        cache.clear()
        self.teacher = User.objects.create_user(
            email='sb.teacher@edify.test', full_name='Ms Standby', country_code='UG',
            password='P!', role='teacher',
        )
        self.student = User.objects.create_user(
            email='sb.student@edify.test', full_name='Asha', country_code='UG',
            password='P!', role='student',
        )
        self.other_teacher = User.objects.create_user(
            email='sb.other@edify.test', full_name='Mr Other', country_code='UG',
            password='P!', role='teacher',
        )
        self.subject = Subject.objects.create(name='Mathematics')
        self.avail = TeacherAvailability.objects.create(
            teacher=self.teacher, subject=self.subject,
            day_of_week=2, start_time=time(16, 0), end_time=time(17, 0),
            mode='office_hours', is_active=True,
        )
        self.s_client = APIClient(); self.s_client.force_authenticate(user=self.student)
        self.t_client = APIClient(); self.t_client.force_authenticate(user=self.teacher)
        self.o_client = APIClient(); self.o_client.force_authenticate(user=self.other_teacher)

    def test_available_list_visible_to_students(self):
        resp = self.s_client.get(self.LIVE_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['teacher_name'], 'Ms Standby')

    def test_student_cannot_publish_availability(self):
        resp = self.s_client.post(self.AVAIL_URL, {
            'subject': self.subject.id, 'day_of_week': 3,
            'start_time': '16:00', 'end_time': '17:00',
            'mode': 'office_hours', 'is_active': True,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_full_support_request_flow(self):
        # Student posts a question.
        create = self.s_client.post(self.REQ_URL, {
            'subject': self.subject.id, 'topic': 'Quadratic equations',
            'question': 'I do not get how to factorise x^2 - 9.',
            'request_type': 'chat', 'priority': 'normal',
        }, format='json')
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        rid = create.data['id']

        # Open in teacher queue.
        q = self.t_client.get(self.QUEUE_URL)
        self.assertEqual(q.status_code, status.HTTP_200_OK)
        ids = {r['id'] for r in q.data}
        self.assertIn(rid, ids)

        # Accept.
        acc = self.t_client.post(f'{self.REQ_URL}{rid}/accept/', {}, format='json')
        self.assertEqual(acc.status_code, status.HTTP_200_OK)
        self.assertEqual(acc.data['status'], 'assigned')

        # Other teacher cannot resolve it.
        bad = self.o_client.post(f'{self.REQ_URL}{rid}/resolve/', {
            'resolution_note': 'Steal it.',
        }, format='json')
        self.assertEqual(bad.status_code, status.HTTP_403_FORBIDDEN)

        # Assigned teacher resolves.
        res = self.t_client.post(f'{self.REQ_URL}{rid}/resolve/', {
            'resolution_note': 'Use difference of squares: (x-3)(x+3).',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.content)
        self.assertEqual(res.data['status'], 'resolved')
        self.assertIn('difference of squares', res.data['resolution_note'])

    def test_student_cannot_access_teacher_queue(self):
        bad = self.s_client.get(self.QUEUE_URL)
        self.assertEqual(bad.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_accept_already_assigned_request(self):
        create = self.s_client.post(self.REQ_URL, {
            'subject': self.subject.id, 'question': 'Q',
            'request_type': 'chat', 'priority': 'normal',
        }, format='json')
        rid = create.data['id']
        self.t_client.post(f'{self.REQ_URL}{rid}/accept/', {}, format='json')
        again = self.o_client.post(f'{self.REQ_URL}{rid}/accept/', {}, format='json')
        self.assertEqual(again.status_code, status.HTTP_400_BAD_REQUEST)

    def test_my_requests_returns_student_only_data(self):
        self.s_client.post(self.REQ_URL, {
            'subject': self.subject.id, 'question': 'Q1',
            'request_type': 'chat', 'priority': 'normal',
        }, format='json')
        # Other student posts one too; they shouldn't mix.
        other = User.objects.create_user(
            email='sb.other-student@edify.test', full_name='Ben', country_code='UG',
            password='P!', role='student',
        )
        oc = APIClient(); oc.force_authenticate(user=other)
        oc.post(self.REQ_URL, {
            'subject': self.subject.id, 'question': 'Not mine',
            'request_type': 'chat', 'priority': 'normal',
        }, format='json')
        my = self.s_client.get(f'{self.REQ_URL}my/')
        self.assertEqual(len(my.data), 1)
        self.assertEqual(my.data[0]['question'], 'Q1')
