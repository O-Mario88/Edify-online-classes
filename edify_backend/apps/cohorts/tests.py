import datetime
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from .models import Cohort

User = get_user_model()


class CohortTests(TestCase):
    LIST_URL = '/api/v1/cohorts/cohorts/'
    ENROLL_URL = '/api/v1/cohorts/cohorts/{slug}/enroll/'
    MY_URL = '/api/v1/cohorts/enrollments/my/'

    def setUp(self):
        cache.clear()
        self.teacher = User.objects.create_user(
            email='co.teacher@edify.test', full_name='Teacher',
            country_code='UG', password='P!', role='teacher',
        )
        self.s1 = User.objects.create_user(
            email='co.s1@edify.test', full_name='Student 1',
            country_code='UG', password='P!', role='student',
        )
        self.s2 = User.objects.create_user(
            email='co.s2@edify.test', full_name='Student 2',
            country_code='UG', password='P!', role='student',
        )
        self.cohort = Cohort.objects.create(
            title='PLE Revision 12-Week', slug='ple-revision-12w',
            teacher_lead=self.teacher, exam_track='PLE',
            start_date=datetime.date(2026, 5, 1),
            end_date=datetime.date(2026, 7, 24),
            weekly_plan=[{'week': 1, 'focus': 'Fractions'}],
            max_seats=1, is_published=True,
        )
        self.hidden = Cohort.objects.create(
            title='Draft', slug='draft',
            teacher_lead=self.teacher,
            start_date=datetime.date(2026, 5, 1), end_date=datetime.date(2026, 6, 1),
            is_published=False,
        )
        self.c1 = APIClient(); self.c1.force_authenticate(user=self.s1)
        self.c2 = APIClient(); self.c2.force_authenticate(user=self.s2)

    def test_anonymous_blocked(self):
        resp = APIClient().get(self.LIST_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_only_published_surface(self):
        resp = self.c1.get(self.LIST_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        slugs = {r['slug'] for r in resp.data.get('results', resp.data)}
        self.assertIn('ple-revision-12w', slugs)
        self.assertNotIn('draft', slugs)

    def test_enroll_is_idempotent_and_my_cohorts_scoped(self):
        r1 = self.c1.post(self.ENROLL_URL.format(slug='ple-revision-12w'), {}, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED, r1.content)
        r2 = self.c1.post(self.ENROLL_URL.format(slug='ple-revision-12w'), {}, format='json')
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        self.assertEqual(r1.data['id'], r2.data['id'])

        my = self.c1.get(self.MY_URL)
        self.assertEqual(len(my.data), 1)

    def test_seat_cap_blocks_over_enrollment(self):
        r1 = self.c1.post(self.ENROLL_URL.format(slug='ple-revision-12w'), {}, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        r2 = self.c2.post(self.ENROLL_URL.format(slug='ple-revision-12w'), {}, format='json')
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)
