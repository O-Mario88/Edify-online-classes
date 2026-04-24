from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from .models import UpgradeRequest, PremiumAccess

User = get_user_model()


class PilotPaymentTests(TestCase):
    CREATE_URL = '/api/v1/pilot-payments/upgrade-requests/'
    INBOX_URL = '/api/v1/pilot-payments/upgrade-requests/admin-inbox/'
    ACCESS_URL = '/api/v1/pilot-payments/premium-access/my-access/'

    def setUp(self):
        cache.clear()
        self.student = User.objects.create_user(
            email='pp.student@edify.test', full_name='S', country_code='UG',
            password='P!', role='student',
        )
        self.admin = User.objects.create_user(
            email='pp.admin@edify.test', full_name='A', country_code='UG',
            password='P!', role='platform_admin',
        )
        self.sc = APIClient(); self.sc.force_authenticate(user=self.student)
        self.ac = APIClient(); self.ac.force_authenticate(user=self.admin)

    def test_full_request_approve_grant_flow(self):
        # Student creates request.
        r = self.sc.post(self.CREATE_URL, {
            'plan': 'learner_plus',
            'preferred_method': 'mtn_momo',
            'contact_phone': '+256700000000',
            'note': 'Please approve — preparing for PLE.',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.content)
        rid = r.data['id']

        # Admin sees it in inbox.
        inbox = self.ac.get(self.INBOX_URL)
        self.assertEqual(inbox.status_code, status.HTTP_200_OK)
        self.assertEqual(len(inbox.data), 1)

        # Student has no active plans yet.
        a0 = self.sc.get(self.ACCESS_URL)
        self.assertEqual(a0.data['active_plans'], [])

        # Admin approves.
        dec = self.ac.post(f'{self.CREATE_URL}{rid}/review/', {
            'decision': 'approved', 'admin_note': 'Confirmed MoMo payment.', 'grant_months': 3,
        }, format='json')
        self.assertEqual(dec.status_code, status.HTTP_200_OK, dec.content)
        self.assertEqual(dec.data['status'], 'approved')

        # Student now has an active plan.
        a1 = self.sc.get(self.ACCESS_URL)
        self.assertIn('learner_plus', a1.data['active_plans'])

    def test_student_cannot_access_admin_inbox(self):
        resp = self.sc.get(self.INBOX_URL)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_review_own_request(self):
        r = self.sc.post(self.CREATE_URL, {'plan': 'learner_plus'}, format='json')
        rid = r.data['id']
        dec = self.sc.post(f'{self.CREATE_URL}{rid}/review/', {'decision': 'approved'}, format='json')
        self.assertEqual(dec.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_review_already_decided_request(self):
        r = self.sc.post(self.CREATE_URL, {'plan': 'learner_plus'}, format='json')
        rid = r.data['id']
        self.ac.post(f'{self.CREATE_URL}{rid}/review/', {'decision': 'approved'}, format='json')
        second = self.ac.post(f'{self.CREATE_URL}{rid}/review/', {'decision': 'rejected'}, format='json')
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
