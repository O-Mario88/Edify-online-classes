"""Phase 2 Practice Labs tests."""
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from .models import PracticeLab, PracticeLabStep

User = get_user_model()


class PracticeLabFlowTests(TestCase):
    LIST_URL = '/api/v1/practice-labs/labs/'
    DETAIL_URL = '/api/v1/practice-labs/labs/{slug}/'
    START_URL = '/api/v1/practice-labs/labs/{slug}/start/'

    def setUp(self):
        cache.clear()
        self.author = User.objects.create_user(
            email='lab.author@edify.test', full_name='Author', country_code='UG',
            password='Pass!', role='teacher',
        )
        self.student = User.objects.create_user(
            email='lab.student@edify.test', full_name='Student', country_code='UG',
            password='Pass!', role='student',
        )
        self.lab = PracticeLab.objects.create(
            title='Fractions Step by Step', slug='fractions-step',
            description='Practice adding fractions.',
            instructions='Work through each step — no calculator.',
            difficulty='beginner', estimated_minutes=15,
            pass_threshold_pct=60, badge_label='Fractions Starter',
            is_published=True, created_by=self.author,
        )
        self.step1 = PracticeLabStep.objects.create(
            lab=self.lab, order=1, step_type='mcq',
            prompt='What is 1/2 + 1/2?', options=['1/4', '1', '2/2', '0'],
            expected_answer='1', points=2, hint='Like denominators — just add numerators.',
        )
        self.step2 = PracticeLabStep.objects.create(
            lab=self.lab, order=2, step_type='short_answer',
            prompt='In simplest form, what is 2/4?', expected_answer='1/2', points=2,
            hint='Divide top and bottom by 2.',
        )
        self.step3 = PracticeLabStep.objects.create(
            lab=self.lab, order=3, step_type='reflection',
            prompt='What was one thing you learned?', points=1,
        )
        self.client_auth = APIClient()
        self.client_auth.force_authenticate(user=self.student)

    def test_anonymous_blocked(self):
        resp = APIClient().get(self.LIST_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_listing_and_detail(self):
        resp = self.client_auth.get(self.LIST_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        resp = self.client_auth.get(self.DETAIL_URL.format(slug='fractions-step'))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data['steps']), 3)
        # No expected_answer leak in the delivered step payload.
        self.assertNotIn('expected_answer', resp.data['steps'][0])

    def test_full_attempt_pass_flow_earns_badge(self):
        start = self.client_auth.post(self.START_URL.format(slug='fractions-step'), {}, format='json')
        self.assertEqual(start.status_code, status.HTTP_201_CREATED, start.content)
        attempt_id = start.data['id']
        submit_step = f'/api/v1/practice-labs/attempts/{attempt_id}/submit-step/'
        submit = f'/api/v1/practice-labs/attempts/{attempt_id}/submit/'

        # Correct MCQ.
        r = self.client_auth.post(submit_step, {'step_id': str(self.step1.id), 'selected_option': '1'}, format='json')
        self.assertTrue(r.data['is_correct'])
        # Correct short answer.
        r = self.client_auth.post(submit_step, {'step_id': str(self.step2.id), 'response_text': '1/2'}, format='json')
        self.assertTrue(r.data['is_correct'])
        # Reflection — always counted correct as long as submitted.
        r = self.client_auth.post(submit_step, {'step_id': str(self.step3.id), 'response_text': 'Same denominator rule.'}, format='json')
        self.assertTrue(r.data['is_correct'])

        resp = self.client_auth.post(submit, {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertEqual(resp.data['status'], 'completed')
        self.assertTrue(resp.data['badge_earned'])
        self.assertEqual(float(resp.data['score_pct']), 100.0)

    def test_wrong_answers_trigger_retry(self):
        start = self.client_auth.post(self.START_URL.format(slug='fractions-step'), {}, format='json')
        attempt_id = start.data['id']
        submit_step = f'/api/v1/practice-labs/attempts/{attempt_id}/submit-step/'
        submit = f'/api/v1/practice-labs/attempts/{attempt_id}/submit/'

        self.client_auth.post(submit_step, {'step_id': str(self.step1.id), 'selected_option': '2/2'}, format='json')
        self.client_auth.post(submit_step, {'step_id': str(self.step2.id), 'response_text': 'no idea'}, format='json')
        resp = self.client_auth.post(submit, {}, format='json')
        self.assertEqual(resp.data['status'], 'needs_retry')
        self.assertFalse(resp.data['badge_earned'])

    def test_foreign_step_rejected(self):
        other = PracticeLab.objects.create(title='Other', slug='other', is_published=True, created_by=self.author)
        other_step = PracticeLabStep.objects.create(lab=other, order=1, step_type='mcq', prompt='x', expected_answer='a')
        start = self.client_auth.post(self.START_URL.format(slug='fractions-step'), {}, format='json')
        attempt_id = start.data['id']
        r = self.client_auth.post(
            f'/api/v1/practice-labs/attempts/{attempt_id}/submit-step/',
            {'step_id': str(other_step.id), 'selected_option': 'a'}, format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
