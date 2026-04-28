from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from institutions.models import Institution, InstitutionMembership
from passport.models import LearningPassport
from .models import AdmissionApplication

User = get_user_model()


class AdmissionPassportTests(TestCase):
    APPS_URL = '/api/v1/admission-passport/applications/'
    INBOX_URL = '/api/v1/admission-passport/applications/institution-inbox/'

    def setUp(self):
        cache.clear()
        self.inst = Institution.objects.create(name='Admission School')
        self.student = User.objects.create_user(
            email='a.student@edify.test', full_name='Ada', country_code='UG',
            password='Pass!', role='student',
        )
        self.admin = User.objects.create_user(
            email='a.admin@edify.test', full_name='Admin', country_code='UG',
            password='Pass!', role='institution_admin',
        )
        InstitutionMembership.objects.create(user=self.admin, institution=self.inst, role='headteacher', status='active')
        self.s_client = APIClient(); self.s_client.force_authenticate(user=self.student)
        self.a_client = APIClient(); self.a_client.force_authenticate(user=self.admin)

    def test_full_submit_and_status_change_flow(self):
        create = self.s_client.post(self.APPS_URL, {
            'institution': self.inst.id,
            'entry_term': 'Term 1 2026', 'study_mode': 'day',
            'current_school': 'Sunny Primary',
            'academic_summary': 'Strong in maths; working on English.',
            'share_passport': True,
        }, format='json')
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.content)
        app_id = create.data['id']

        # Submit — snapshots passport share token.
        sub = self.s_client.post(f'{self.APPS_URL}{app_id}/submit/', {}, format='json')
        self.assertEqual(sub.status_code, status.HTTP_200_OK, sub.content)
        self.assertEqual(sub.data['status'], 'submitted')
        self.assertTrue(sub.data['shared_passport_token'])
        # Passport is now shareable anonymously.
        anon = APIClient()
        pub = anon.get(f'/api/v1/passport/public/{sub.data["shared_passport_token"]}/')
        self.assertEqual(pub.status_code, status.HTTP_200_OK)

        # Admin inbox sees it.
        inbox = self.a_client.get(self.INBOX_URL)
        self.assertEqual(inbox.status_code, status.HTTP_200_OK)
        ids = {a['id'] for a in inbox.data}
        self.assertIn(app_id, ids)

        # Admin moves to interview_invited → event logged.
        mv = self.a_client.post(f'{self.APPS_URL}{app_id}/change-status/', {
            'to_status': 'interview_invited', 'note': 'Please schedule for next Monday.',
        }, format='json')
        self.assertEqual(mv.status_code, status.HTTP_200_OK)
        self.assertEqual(mv.data['status'], 'interview_invited')
        self.assertGreaterEqual(len(mv.data['events']), 2)

    def test_student_cannot_change_status(self):
        create = self.s_client.post(self.APPS_URL, {
            'institution': self.inst.id, 'share_passport': False,
        }, format='json')
        app_id = create.data['id']
        self.s_client.post(f'{self.APPS_URL}{app_id}/submit/', {}, format='json')
        bad = self.s_client.post(f'{self.APPS_URL}{app_id}/change-status/', {
            'to_status': 'accepted',
        }, format='json')
        self.assertEqual(bad.status_code, status.HTTP_403_FORBIDDEN)

    def test_unrelated_admin_cannot_see_application(self):
        other_inst = Institution.objects.create(name='Other School')
        other_admin = User.objects.create_user(
            email='o.admin@edify.test', full_name='O', country_code='UG',
            password='Pass!', role='institution_admin',
        )
        InstitutionMembership.objects.create(user=other_admin, institution=other_inst, role='headteacher', status='active')
        other_client = APIClient(); other_client.force_authenticate(user=other_admin)

        create = self.s_client.post(self.APPS_URL, {
            'institution': self.inst.id, 'share_passport': False,
        }, format='json')
        app_id = create.data['id']
        self.s_client.post(f'{self.APPS_URL}{app_id}/submit/', {}, format='json')

        resp = other_client.get(self.INBOX_URL)
        ids = {a['id'] for a in resp.data}
        self.assertNotIn(app_id, ids)

    def test_share_passport_false_does_not_mint_token(self):
        create = self.s_client.post(self.APPS_URL, {
            'institution': self.inst.id, 'share_passport': False,
        }, format='json')
        app_id = create.data['id']
        sub = self.s_client.post(f'{self.APPS_URL}{app_id}/submit/', {}, format='json')
        self.assertEqual(sub.data['shared_passport_token'], '')
