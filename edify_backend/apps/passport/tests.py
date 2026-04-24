from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from .models import Credential, LearningPassport

User = get_user_model()


class PassportPhase4Tests(TestCase):
    def setUp(self):
        cache.clear()
        self.student = User.objects.create_user(
            email='pp.student@edify.test', full_name='Passport Student',
            country_code='UG', password='Pass!', role='student',
        )
        self.teacher = User.objects.create_user(
            email='pp.teacher@edify.test', full_name='Passport Teacher',
            country_code='UG', password='Pass!', role='teacher',
        )
        self.cred = Credential.objects.create(
            title='Fluency Starter Badge', slug='fluency-starter',
            credential_type='badge', issuer_type='maple',
            criteria='Finish the fluency practice lab at 70%+.',
        )
        self.s_client = APIClient(); self.s_client.force_authenticate(user=self.student)
        self.t_client = APIClient(); self.t_client.force_authenticate(user=self.teacher)

    def test_my_passport_auto_creates(self):
        resp = self.s_client.get('/api/v1/passport/my/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['visibility'], 'private')
        self.assertEqual(resp.data['entries'], [])

    def test_share_flow_mints_token_and_public_view_renders(self):
        self.s_client.post('/api/v1/passport/share/', {}, format='json')
        p = LearningPassport.objects.get(student=self.student)
        self.assertTrue(p.public_share_token)
        anon = APIClient()
        resp = anon.get(f'/api/v1/passport/public/{p.public_share_token}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertNotIn('student', resp.data)
        # Redacted view doesn't leak email, but includes student_name.
        self.assertEqual(resp.data['student_name'], 'Passport Student')

    def test_issue_credential_creates_passport_entry(self):
        resp = self.t_client.post('/api/v1/passport/credentials/issue/', {
            'credential_slug': 'fluency-starter',
            'student_id': self.student.id,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        code = resp.data['verification_code']
        # Verify endpoint works without auth and returns valid=True.
        anon = APIClient()
        v = anon.get(f'/api/v1/passport/credentials/verify/{code}/')
        self.assertEqual(v.status_code, status.HTTP_200_OK)
        self.assertTrue(v.data['verified'])
        self.assertEqual(v.data['credential_title'], 'Fluency Starter Badge')
        # Passport entry is created.
        my = self.s_client.get('/api/v1/passport/my/')
        entries = my.data['entries']
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]['entry_type'], 'badge')

    def test_unknown_verification_code_404s(self):
        anon = APIClient()
        v = anon.get('/api/v1/passport/credentials/verify/NOPE-NOPE-NOPE/')
        self.assertEqual(v.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_cannot_issue_credential(self):
        resp = self.s_client.post('/api/v1/passport/credentials/issue/', {
            'credential_slug': 'fluency-starter',
            'student_id': self.student.id,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_stop_sharing_invalidates_token(self):
        self.s_client.post('/api/v1/passport/share/', {}, format='json')
        p = LearningPassport.objects.get(student=self.student)
        token = p.public_share_token
        self.s_client.post('/api/v1/passport/stop-sharing/', {}, format='json')
        anon = APIClient()
        v = anon.get(f'/api/v1/passport/public/{token}/')
        self.assertEqual(v.status_code, status.HTTP_404_NOT_FOUND)
