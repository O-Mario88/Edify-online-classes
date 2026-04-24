"""Phase 1 discovery tests.

Covers:
  - anonymous request is blocked
  - only institutions with is_listed=True surface on /recommendations/
  - recommendations include the computed activeness score + a match
    reason string
  - a non-admin, non-member cannot recompute someone else's score
  - a member of an institution CAN recompute their own score
"""
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from institutions.models import Institution, InstitutionMembership
from .models import InstitutionDiscoveryProfile, InstitutionRecommendationScore

User = get_user_model()


class DiscoveryPhase1Tests(TestCase):
    REC_URL = '/api/v1/institution-discovery/institutions/recommendations/'
    DETAIL_URL = '/api/v1/institution-discovery/institutions/{id}/'
    RECALC_URL = '/api/v1/institution-discovery/score/recalculate/'

    def setUp(self):
        cache.clear()
        self.inst_listed = Institution.objects.create(name='Active Academy', school_level='secondary')
        self.inst_hidden = Institution.objects.create(name='Unlisted Academy', school_level='secondary')

        InstitutionDiscoveryProfile.objects.create(
            institution=self.inst_listed,
            location_city='Kampala', location_region='Central',
            about='A modern secondary school', admission_status='open',
            levels_offered=['S1', 'S2', 'S3', 'S4'],
            subjects_offered=['Mathematics', 'English', 'Biology'],
            is_listed=True,
        )
        InstitutionDiscoveryProfile.objects.create(
            institution=self.inst_hidden,
            location_city='Jinja', admission_status='open', is_listed=False,
        )

        InstitutionRecommendationScore.objects.create(
            institution=self.inst_listed,
            maple_activeness_score=78.0,
            growth_index=62.0,
            verified_lesson_delivery=80, assessment_activity=75,
            parent_reporting=70, teacher_responsiveness=85,
            exam_readiness_strength=90, standby_teachers_available=12,
            explanation='Test score explanation.',
        )

        self.student = User.objects.create_user(
            email='disc.student@edify.test', full_name='Disc Student',
            country_code='UG', password='Pass!', role='student',
        )
        self.member_admin = User.objects.create_user(
            email='disc.admin@edify.test', full_name='Disc Admin',
            country_code='UG', password='Pass!', role='institution_admin',
        )
        InstitutionMembership.objects.create(
            user=self.member_admin, institution=self.inst_listed,
            role='headteacher', status='active',
        )
        self.student_client = APIClient()
        self.student_client.force_authenticate(user=self.student)
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.member_admin)

    def test_anonymous_cannot_list_recommendations(self):
        resp = APIClient().get(self.REC_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_only_listed_institutions_surface(self):
        resp = self.student_client.get(self.REC_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = {r['id'] for r in resp.data}
        self.assertIn(self.inst_listed.id, ids)
        self.assertNotIn(self.inst_hidden.id, ids)

    def test_recommendation_card_has_score_and_match_reason(self):
        resp = self.student_client.get(self.REC_URL)
        first = resp.data[0]
        self.assertIn('score', first)
        self.assertIn('match_reason', first)
        self.assertEqual(first['score']['maple_activeness_score'], 78.0)
        self.assertIn('explanation', first['score'])
        # Trust copy present.
        self.assertTrue(len(first['score']['explanation']) > 10)

    def test_detail_endpoint_returns_full_profile(self):
        resp = self.student_client.get(self.DETAIL_URL.format(id=self.inst_listed.id))
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        body = resp.data
        self.assertEqual(body['name'], 'Active Academy')
        self.assertEqual(body['profile']['location_city'], 'Kampala')
        self.assertIn('Mathematics', body['profile']['subjects_offered'])

    def test_hidden_institution_returns_404_on_detail(self):
        resp = self.student_client.get(self.DETAIL_URL.format(id=self.inst_hidden.id))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_non_member_cannot_recompute_score(self):
        resp = self.student_client.post(
            self.RECALC_URL, {'institution_id': self.inst_listed.id}, format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_member_can_recompute_their_own_score(self):
        resp = self.admin_client.post(
            self.RECALC_URL, {'institution_id': self.inst_listed.id}, format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertIn('maple_activeness_score', resp.data)
        self.assertIn('explanation', resp.data)
