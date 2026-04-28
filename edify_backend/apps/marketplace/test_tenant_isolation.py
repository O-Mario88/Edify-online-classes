"""Tenant-isolation regression test for marketplace ListingViewSet.

ListingViewSet returns all *published* Listings — that's the marketplace
catalog by design (teachers monetizing their content cross-tenant is the
whole point). This test pins the contract: any authenticated user sees
the same published listings. Drafts stay invisible regardless of tenant.

Also covers PayoutRequestViewSet — which must be teacher-scoped.
See docs/audit/FIX_PLAN.md §2.3.
"""
from decimal import Decimal
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from institutions.models import Institution, InstitutionMembership
from marketplace.models import Listing, PayoutRequest

User = get_user_model()


class ListingMarketplaceIsPublic(TestCase):
    URL = '/api/v1/marketplace/listings/'

    def setUp(self):
        cache.clear()
        self.t_a = User.objects.create_user(
            email='mk.a@edify.test', full_name='Marketplace A',
            country_code='UG', password='p!', role='teacher',
        )
        self.t_b = User.objects.create_user(
            email='mk.b@edify.test', full_name='Marketplace B',
            country_code='UG', password='p!', role='teacher',
        )

    def _client(self, user):
        c = APIClient(); c.force_authenticate(user=user); return c

    def _ids(self, resp):
        body = resp.data
        rows = body.get('results', body) if isinstance(body, dict) else body
        return {str(r.get('id')) for r in rows if isinstance(r, dict) and r.get('id') is not None}

    def test_published_listings_are_cross_tenant_by_design_but_drafts_hidden(self):
        published_a = Listing.objects.create(
            teacher=self.t_a, title='Pub A', visibility_state='published',
        )
        published_b = Listing.objects.create(
            teacher=self.t_b, title='Pub B', visibility_state='published',
        )
        draft_b = Listing.objects.create(
            teacher=self.t_b, title='Draft B', visibility_state='draft',
        )
        resp = self._client(self.t_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = self._ids(resp)
        # Published from either tenant is visible (marketplace contract).
        self.assertIn(str(published_a.id), ids)
        self.assertIn(str(published_b.id), ids)
        # Draft is never visible, regardless of tenant.
        self.assertNotIn(str(draft_b.id), ids)


class PayoutRequestIsolation(TestCase):
    URL = '/api/v1/marketplace/payouts/'

    def setUp(self):
        cache.clear()
        self.t_a = User.objects.create_user(
            email='po.a@edify.test', full_name='PO A',
            country_code='UG', password='p!', role='teacher',
        )
        self.t_b = User.objects.create_user(
            email='po.b@edify.test', full_name='PO B',
            country_code='UG', password='p!', role='teacher',
        )

    def _client(self, user):
        c = APIClient(); c.force_authenticate(user=user); return c

    def _ids(self, resp):
        body = resp.data
        rows = body.get('results', body) if isinstance(body, dict) else body
        return {str(r.get('id')) for r in rows if isinstance(r, dict) and r.get('id') is not None}

    def test_teacher_a_cannot_see_teacher_b_payout_requests(self):
        r_a = PayoutRequest.objects.create(teacher=self.t_a, net_payable=Decimal('10'))
        r_b = PayoutRequest.objects.create(teacher=self.t_b, net_payable=Decimal('20'))
        resp = self._client(self.t_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(r_a.id), ids)
        self.assertNotIn(str(r_b.id), ids)
