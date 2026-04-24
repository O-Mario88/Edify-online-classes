from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class LearnerSettingsTests(TestCase):
    URL = '/api/v1/learner-settings/'

    def setUp(self):
        cache.clear()
        self.student = User.objects.create_user(
            email='ls.student@edify.test', full_name='S', country_code='UG',
            password='P!', role='student',
        )
        self.other = User.objects.create_user(
            email='ls.other@edify.test', full_name='O', country_code='UG',
            password='P!', role='student',
        )
        self.c = APIClient(); self.c.force_authenticate(user=self.student)
        self.o = APIClient(); self.o.force_authenticate(user=self.other)

    def test_auto_create_and_defaults(self):
        resp = self.c.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data['low_data_mode'])
        self.assertEqual(resp.data['weekly_brief_delivery'], 'email')

    def test_patch_updates_settings(self):
        resp = self.c.patch(self.URL, {
            'low_data_mode': True,
            'prefer_audio_lessons': True,
            'whatsapp_optin': True,
            'weekly_brief_delivery': 'whatsapp',
            'contact_phone': '+256700000000',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertTrue(resp.data['low_data_mode'])
        self.assertEqual(resp.data['weekly_brief_delivery'], 'whatsapp')

    def test_anonymous_blocked(self):
        resp = APIClient().get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_settings_are_per_user(self):
        self.c.patch(self.URL, {'low_data_mode': True}, format='json')
        resp = self.o.get(self.URL)
        self.assertFalse(resp.data['low_data_mode'])
