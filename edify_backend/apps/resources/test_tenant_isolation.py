"""Tenant-isolation regression tests for resources/content viewsets.

Covers the five viewsets flagged by scripts/audit.py as open_queryset:
  - ContentItemViewSet
  - InstitutionContentViewSet
  - ContentEngagementViewSet
  - ContentTagViewSet  (catalog — shared across tenants intentionally)
  - ContentRecommendationViewSet  (also covers ContentAssignmentViewSet)

ContentTag is a shared tag catalog by design; the assertion for it is
that all authenticated users see the same global list (documented,
not a leak). All other rows should be cross-tenant-isolated.
See docs/audit/FIX_PLAN.md §2.3.
"""
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from institutions.models import Institution, InstitutionMembership
from resources.content_models import (
    ContentItem, ContentEngagement, ContentTag,
    ContentAssignment, ContentRecommendation,
)

User = get_user_model()


class TwoTenantSetup(TestCase):
    def setUp(self):
        cache.clear()
        self.inst_a = Institution.objects.create(name='Content Tenant A')
        self.inst_b = Institution.objects.create(name='Content Tenant B')

        def mk(email, role, inst):
            u = User.objects.create_user(
                email=email, full_name=email, country_code='UG',
                password='ContentPass!', role=role,
            )
            InstitutionMembership.objects.create(
                user=u, institution=inst,
                role='subject_teacher' if role == 'teacher' else role,
                status='active',
            )
            return u

        self.teacher_a = mk('ct.a@edify.test', 'teacher', self.inst_a)
        self.student_a = mk('cs.a@edify.test', 'student', self.inst_a)
        self.teacher_b = mk('ct.b@edify.test', 'teacher', self.inst_b)
        self.student_b = mk('cs.b@edify.test', 'student', self.inst_b)

    def client_for(self, user):
        c = APIClient()
        c.force_authenticate(user=user)
        return c

    def _ids(self, resp):
        body = resp.data
        rows = body.get('results', body) if isinstance(body, dict) else body
        return {str(r.get('id')) for r in rows if isinstance(r, dict) and r.get('id') is not None}


class ContentItemIsolation(TwoTenantSetup):
    URL = '/api/v1/content/items/'

    def test_teacher_a_does_not_see_tenant_b_item(self):
        item_a = ContentItem.objects.create(
            title='A-item', content_type='notes',
            uploaded_by=self.teacher_a, owner_institution=self.inst_a,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        item_b = ContentItem.objects.create(
            title='B-item', content_type='notes',
            uploaded_by=self.teacher_b, owner_institution=self.inst_b,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        resp = self.client_for(self.teacher_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(item_a.id), ids)
        self.assertNotIn(str(item_b.id), ids)


class InstitutionContentIsolation(TwoTenantSetup):
    URL = '/api/v1/content/institution/'

    def test_institution_admin_a_does_not_see_tenant_b(self):
        # Make teacher_a an institution admin so the viewset applies.
        self.teacher_a.role = 'institution'
        self.teacher_a.save()
        item_a = ContentItem.objects.create(
            title='I-A', content_type='notes',
            uploaded_by=self.teacher_a, owner_institution=self.inst_a,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        item_b = ContentItem.objects.create(
            title='I-B', content_type='notes',
            uploaded_by=self.teacher_b, owner_institution=self.inst_b,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        resp = self.client_for(self.teacher_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(item_a.id), ids)
        self.assertNotIn(str(item_b.id), ids)


class ContentEngagementIsolation(TwoTenantSetup):
    URL = '/api/v1/content/engagement/'

    def _engagements(self):
        item_a = ContentItem.objects.create(
            title='E-A', content_type='notes',
            uploaded_by=self.teacher_a, owner_institution=self.inst_a,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        item_b = ContentItem.objects.create(
            title='E-B', content_type='notes',
            uploaded_by=self.teacher_b, owner_institution=self.inst_b,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        eng_a = ContentEngagement.objects.create(
            student=self.student_a, content_item=item_a, institution=self.inst_a,
        )
        eng_b = ContentEngagement.objects.create(
            student=self.student_b, content_item=item_b, institution=self.inst_b,
        )
        return eng_a, eng_b

    def test_student_a_does_not_see_tenant_b_engagement(self):
        eng_a, eng_b = self._engagements()
        resp = self.client_for(self.student_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(eng_a.id), ids)
        self.assertNotIn(str(eng_b.id), ids)

    def test_teacher_a_does_not_see_tenant_b_student_engagement(self):
        eng_a, eng_b = self._engagements()
        resp = self.client_for(self.teacher_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertNotIn(str(eng_b.id), ids)


class ContentTagCatalogIsSharedAcrossTenants(TwoTenantSetup):
    """ContentTag is a platform-wide tag catalog, not a tenant-scoped resource.

    This test pins that contract: if you ever add tenant scoping, bump the
    API version and update the docs. For now, the audit flag is a false
    positive — both tenants should see the same tags.
    """
    URL = '/api/v1/content/tags/'

    def test_tag_catalog_is_visible_to_both_tenants(self):
        tag = ContentTag.objects.create(name='algebra-basics')
        ids_a = self._ids(self.client_for(self.teacher_a).get(self.URL))
        ids_b = self._ids(self.client_for(self.teacher_b).get(self.URL))
        self.assertIn(str(tag.id), ids_a)
        self.assertIn(str(tag.id), ids_b)


class ContentAssignmentIsolation(TwoTenantSetup):
    URL = '/api/v1/content/assignments/'

    def test_teacher_a_does_not_see_tenant_b_assignments(self):
        item_a = ContentItem.objects.create(
            title='AS-A', content_type='notes',
            uploaded_by=self.teacher_a, owner_institution=self.inst_a,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        item_b = ContentItem.objects.create(
            title='AS-B', content_type='notes',
            uploaded_by=self.teacher_b, owner_institution=self.inst_b,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        a_a = ContentAssignment.objects.create(
            content_item=item_a, student=self.student_a,
            assigned_by=self.teacher_a, assigned_by_type='teacher',
        )
        a_b = ContentAssignment.objects.create(
            content_item=item_b, student=self.student_b,
            assigned_by=self.teacher_b, assigned_by_type='teacher',
        )
        resp = self.client_for(self.teacher_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(a_a.id), ids)
        self.assertNotIn(str(a_b.id), ids)


class ContentRecommendationIsolation(TwoTenantSetup):
    URL = '/api/v1/content/recommendations/'

    def test_student_a_does_not_see_student_b_recommendations(self):
        item_a = ContentItem.objects.create(
            title='R-A', content_type='notes',
            uploaded_by=self.teacher_a, owner_institution=self.inst_a,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        item_b = ContentItem.objects.create(
            title='R-B', content_type='notes',
            uploaded_by=self.teacher_b, owner_institution=self.inst_b,
            owner_type='institution', publication_status='published',
            visibility_scope='institution',
        )
        r_a = ContentRecommendation.objects.create(
            content_item=item_a, student=self.student_a,
            source='ai', status='active',
        )
        r_b = ContentRecommendation.objects.create(
            content_item=item_b, student=self.student_b,
            source='ai', status='active',
        )
        resp = self.client_for(self.student_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(r_a.id), ids)
        self.assertNotIn(str(r_b.id), ids)
