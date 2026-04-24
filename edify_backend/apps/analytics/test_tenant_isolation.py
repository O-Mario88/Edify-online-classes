"""Tenant-isolation regression tests for analytics viewsets.

Covers the three viewsets flagged by scripts/audit.py as open_queryset:
  - AnalyticsEventViewSet
  - DailyPlatformMetricViewSet  (platform-admin-only by nature)
  - SubjectPerformanceSnapshotViewSet

Plus DailyPlatformMetric / SystemHealthSnapshot, which declare a class
attribute ``queryset = ...objects.all()`` and don't override
``get_queryset``. They must be admin-only — anything else is a leak.
See docs/audit/FIX_PLAN.md §2.3.
"""
import datetime
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from institutions.models import Institution, InstitutionMembership
from analytics.models import (
    AnalyticsEvent, DailyPlatformMetric, DailyInstitutionMetric,
    SubjectPerformanceSnapshot, SystemHealthSnapshot,
)

User = get_user_model()


class TwoTenantSetup(TestCase):
    def setUp(self):
        cache.clear()
        self.inst_a = Institution.objects.create(name='Analytics Tenant A')
        self.inst_b = Institution.objects.create(name='Analytics Tenant B')

        def mk(email, role, inst):
            u = User.objects.create_user(
                email=email, full_name=email, country_code='UG',
                password='AnPass!', role=role,
            )
            InstitutionMembership.objects.create(
                user=u, institution=inst,
                role='subject_teacher' if role == 'teacher' else role,
                status='active',
            )
            return u

        self.teacher_a = mk('an.t.a@edify.test', 'teacher', self.inst_a)
        self.teacher_b = mk('an.t.b@edify.test', 'teacher', self.inst_b)

    def client_for(self, user):
        c = APIClient()
        c.force_authenticate(user=user)
        return c

    def _ids(self, resp):
        body = resp.data
        rows = body.get('results', body) if isinstance(body, dict) else body
        return {str(r.get('id')) for r in rows if isinstance(r, dict) and r.get('id') is not None}


class AnalyticsEventIsolation(TwoTenantSetup):
    URL = '/api/v1/analytics/analytics-event/'

    def test_teacher_a_does_not_see_tenant_b_events(self):
        e_a = AnalyticsEvent.objects.create(
            user=self.teacher_a, institution=self.inst_a, event_name='login',
        )
        e_b = AnalyticsEvent.objects.create(
            user=self.teacher_b, institution=self.inst_b, event_name='login',
        )
        resp = self.client_for(self.teacher_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(e_a.id), ids)
        self.assertNotIn(str(e_b.id), ids)


class DailyPlatformMetricPlatformOnly(TwoTenantSetup):
    URL = '/api/v1/analytics/daily-platform-metric/'

    def test_non_admin_cannot_list_platform_metrics(self):
        DailyPlatformMetric.objects.create(date=datetime.date.today())
        resp = self.client_for(self.teacher_a).get(self.URL)
        # Must be forbidden OR return an empty list — never leak rows.
        if resp.status_code == status.HTTP_200_OK:
            self.assertEqual(self._ids(resp), set())
        else:
            self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class SubjectPerformanceSnapshotIsolation(TwoTenantSetup):
    URL = '/api/v1/analytics/subject-performance-snapshot/'

    def test_teacher_a_cannot_see_tenant_b_subject_snapshots(self):
        from curriculum.models import Subject
        subj_a = Subject.objects.create(name='Math')
        subj_b = Subject.objects.create(name='English')
        # A separate student per tenant so unique_together(student,subject) holds.
        student_a = User.objects.create_user(
            email='sps.a@edify.test', full_name='sps.a', country_code='UG',
            password='p!', role='student',
        )
        student_b = User.objects.create_user(
            email='sps.b@edify.test', full_name='sps.b', country_code='UG',
            password='p!', role='student',
        )
        s_a = SubjectPerformanceSnapshot.objects.create(
            student=student_a, institution=self.inst_a, subject=subj_a,
        )
        s_b = SubjectPerformanceSnapshot.objects.create(
            student=student_b, institution=self.inst_b, subject=subj_b,
        )
        resp = self.client_for(self.teacher_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(s_a.id), ids)
        self.assertNotIn(str(s_b.id), ids)


class SystemHealthSnapshotPlatformOnly(TwoTenantSetup):
    URL = '/api/v1/analytics/system-health-snapshot/'

    def test_non_admin_cannot_list_system_health(self):
        SystemHealthSnapshot.objects.create()
        resp = self.client_for(self.teacher_a).get(self.URL)
        if resp.status_code == status.HTTP_200_OK:
            self.assertEqual(self._ids(resp), set())
        else:
            self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
