from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from .models import CareerPathway

User = get_user_model()


class PathwayTests(TestCase):
    LIST_URL = '/api/v1/pathways/'
    MINE_URL = '/api/v1/pathways/my-suggestions/'

    def setUp(self):
        cache.clear()
        self.student = User.objects.create_user(
            email='pw.student@edify.test', full_name='S', country_code='UG',
            password='P!', role='student',
        )
        CareerPathway.objects.create(
            title='Health Sciences', slug='health-sciences',
            recommended_subjects=['Biology', 'Chemistry', 'Mathematics'],
            typical_roles=['Doctor', 'Nurse', 'Pharmacist'],
        )
        CareerPathway.objects.create(
            title='Engineering & ICT', slug='engineering-ict',
            recommended_subjects=['Mathematics', 'Physics', 'Computer Studies'],
            typical_roles=['Software Engineer', 'Electrical Engineer'],
        )
        CareerPathway.objects.create(
            title='Arts & Humanities', slug='arts-humanities',
            recommended_subjects=['Literature', 'History', 'Geography'],
            typical_roles=['Journalist', 'Teacher', 'Researcher'],
        )
        self.s_client = APIClient()
        self.s_client.force_authenticate(user=self.student)

    def test_anonymous_blocked(self):
        resp = APIClient().get(self.LIST_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_shows_published(self):
        resp = self.s_client.get(self.LIST_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data.get('results', resp.data)), 3)

    def test_my_suggestions_returns_top_three_with_reasoning(self):
        resp = self.s_client.get(self.MINE_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertEqual(len(resp.data), 3)
        for row in resp.data:
            self.assertIn('reasoning', row)
            self.assertIn('pathway', row)
            self.assertTrue(row['pathway']['title'])
