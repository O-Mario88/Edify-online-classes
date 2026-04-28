"""Tests for the fees app — ledger CRUD + IPN webhook."""
from decimal import Decimal
from datetime import date

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from institutions.models import Institution, InstitutionMembership
from .models import FeeAssessment, FeePayment

User = get_user_model()


class FeesIpnTests(TestCase):
    """The IPN webhook is the load-bearing piece — providers retry it
    aggressively, so it must be idempotent and reject malformed input
    without leaking 500s."""

    IPN_URL = '/api/v1/fees/ipn/{}/'

    def setUp(self):
        self.institution = Institution.objects.create(name='Test School')
        self.student = User.objects.create_user(
            email='ipn.student@test.local', full_name='IPN Student',
            country_code='UG', password='Pass!', role='student',
        )
        self.assessment = FeeAssessment.objects.create(
            institution=self.institution, student=self.student,
            term_label='2026 T1', item='Tuition',
            amount=Decimal('500000.00'), currency='UGX',
        )

    def _client(self):
        return APIClient()

    def test_unknown_provider_400s(self):
        r = self._client().post(self.IPN_URL.format('unknown'), {}, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pesapal_stub_mode_writes_payment(self):
        ref = f'fee:{self.assessment.id}:abc123'
        body = {
            'pesapal_merchant_reference': ref,
            'amount': '500000',
            'pesapal_status': 'COMPLETED',
            'payment_method': 'mobile money',
            'payment_date': '2026-04-25T10:00:00Z',
            'pesapal_transaction_tracking_id': 'TXN-0001',
        }
        r = self._client().post(self.IPN_URL.format('pesapal'), body, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.content)
        self.assertTrue(r.data['stub_mode'])
        self.assertEqual(FeePayment.objects.filter(assessment=self.assessment).count(), 1)
        self.assessment.refresh_from_db()
        self.assertEqual(self.assessment.status, 'paid')

    def test_pesapal_repeat_ipn_is_idempotent(self):
        ref = f'fee:{self.assessment.id}:nonce'
        body = {
            'pesapal_merchant_reference': ref,
            'amount': '100000',
            'pesapal_status': 'COMPLETED',
            'pesapal_transaction_tracking_id': 'TXN-IDEMP',
        }
        r1 = self._client().post(self.IPN_URL.format('pesapal'), body, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        r2 = self._client().post(self.IPN_URL.format('pesapal'), body, format='json')
        self.assertEqual(r2.status_code, status.HTTP_200_OK, r2.content)
        self.assertEqual(FeePayment.objects.filter(assessment=self.assessment).count(), 1)

    def test_failed_status_does_not_record_payment(self):
        body = {
            'pesapal_merchant_reference': f'fee:{self.assessment.id}:fail',
            'amount': '100000',
            'pesapal_status': 'FAILED',
        }
        r = self._client().post(self.IPN_URL.format('pesapal'), body, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(FeePayment.objects.count(), 0)

    def test_missing_assessment_id_in_reference_400s(self):
        body = {
            'pesapal_merchant_reference': 'random-ref-no-fee-prefix',
            'amount': '100000',
            'pesapal_status': 'COMPLETED',
        }
        r = self._client().post(self.IPN_URL.format('pesapal'), body, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unknown_assessment_id_404s(self):
        body = {
            'pesapal_merchant_reference': 'fee:99999:nonce',
            'amount': '100000',
            'pesapal_status': 'COMPLETED',
        }
        r = self._client().post(self.IPN_URL.format('pesapal'), body, format='json')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_airtel_money_stub_writes_payment(self):
        body = {
            'reference': f'fee:{self.assessment.id}:airtel',
            'amount': '250000',
            'status': 'TS',
            'transaction_id': 'AIRTEL-001',
            'transaction_date': '2026-04-25',
        }
        r = self._client().post(self.IPN_URL.format('airtel_money'), body, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.content)
        self.assessment.refresh_from_db()
        self.assertEqual(self.assessment.status, 'partial')


class FeeAssessmentSummaryTests(TestCase):
    """The summary endpoint feeds the FeeCollectionPanel summary tiles —
    must return honest zeros when nothing has been assessed."""

    def setUp(self):
        self.institution = Institution.objects.create(name='Sum School')
        self.admin = User.objects.create_user(
            email='admin@sum.local', full_name='Sum Admin',
            country_code='UG', password='Pass!', role='institution_admin',
        )
        InstitutionMembership.objects.create(
            user=self.admin, institution=self.institution,
            role='institution_admin', status='active',
        )
        self.student = User.objects.create_user(
            email='child@sum.local', full_name='Sum Child',
            country_code='UG', password='Pass!', role='student',
        )

    def _client(self):
        c = APIClient()
        c.force_authenticate(self.admin)
        return c

    def test_summary_with_no_assessments_returns_zeros(self):
        r = self._client().get('/api/v1/fees/assessments/summary/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['assessment_count'], 0)
        self.assertEqual(r.data['total_assessed'], '0')
        self.assertEqual(r.data['total_collected'], '0')

    def test_summary_aggregates_assessments_and_payments(self):
        a1 = FeeAssessment.objects.create(
            institution=self.institution, student=self.student,
            term_label='T1', item='Tuition', amount=Decimal('100'), currency='UGX',
        )
        a2 = FeeAssessment.objects.create(
            institution=self.institution, student=self.student,
            term_label='T1', item='Lunch', amount=Decimal('50'), currency='UGX',
        )
        FeePayment.objects.create(assessment=a1, amount=Decimal('40'), paid_on=date.today())
        r = self._client().get('/api/v1/fees/assessments/summary/')
        self.assertEqual(r.data['assessment_count'], 2)
        self.assertEqual(Decimal(r.data['total_assessed']), Decimal('150'))
        self.assertEqual(Decimal(r.data['total_collected']), Decimal('40'))
        self.assertEqual(Decimal(r.data['outstanding']), Decimal('110'))
