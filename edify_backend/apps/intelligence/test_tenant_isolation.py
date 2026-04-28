"""Tenant-isolation regression tests for intelligence viewsets.

Covers the five viewsets flagged by scripts/audit.py as open_queryset:
  - NextBestActionViewSet
  - InterventionPackAssignmentViewSet
  - ParentActionViewSet
  - LearningProgressViewSet
  - StoryCardViewSet

Plus NationalExamResultViewSet, ImpactComparisonViewSet, and
InstitutionHealthHistoryViewSet whose .all() returns were found during
the audit review even though their lines didn't map into the static
report. See docs/audit/FIX_PLAN.md §2.3.

The bar each test enforces: user A at institution A lists the endpoint
and does NOT see data owned by user B at institution B.
"""
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from institutions.models import Institution, InstitutionMembership
from intelligence.models import (
    NextBestAction, InterventionPack, InterventionPackAssignment,
    ParentAction, LearningProgress, StoryCard,
    NationalExamResult, ImpactComparison, InstitutionHealthSnapshot,
)

User = get_user_model()


class TwoTenantSetup(TestCase):
    """Reusable base: two institutions, each with a teacher + student + parent."""

    def setUp(self):
        cache.clear()
        self.inst_a = Institution.objects.create(name='Tenant A Academy')
        self.inst_b = Institution.objects.create(name='Tenant B Academy')

        def mk(email, role, inst):
            u = User.objects.create_user(
                email=email, full_name=email, country_code='UG',
                password='TenantPass!', role=role,
            )
            InstitutionMembership.objects.create(
                user=u, institution=inst,
                role='subject_teacher' if role == 'teacher' else role,
                status='active',
            )
            return u

        self.teacher_a = mk('t.a@edify.test', 'teacher', self.inst_a)
        self.student_a = mk('s.a@edify.test', 'student', self.inst_a)
        self.parent_a = mk('p.a@edify.test', 'parent', self.inst_a)

        self.teacher_b = mk('t.b@edify.test', 'teacher', self.inst_b)
        self.student_b = mk('s.b@edify.test', 'student', self.inst_b)
        self.parent_b = mk('p.b@edify.test', 'parent', self.inst_b)

    def client_for(self, user):
        c = APIClient()
        c.force_authenticate(user=user)
        return c

    def _ids(self, resp):
        body = resp.data
        rows = body.get('results', body) if isinstance(body, dict) else body
        return {str(r.get('id')) for r in rows if isinstance(r, dict) and r.get('id') is not None}


class NextBestActionIsolation(TwoTenantSetup):
    URL = '/api/v1/intelligence/actions/'

    def test_student_a_does_not_see_student_b_actions(self):
        nba_a = NextBestAction.objects.create(
            user=self.student_a, institution=self.inst_a,
            action_type='review_weakness', title='A-action', description='',
            target_role='student', status='pending',
        )
        nba_b = NextBestAction.objects.create(
            user=self.student_b, institution=self.inst_b,
            action_type='review_weakness', title='B-action', description='',
            target_role='student', status='pending',
        )
        resp = self.client_for(self.student_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(nba_a.id), ids)
        self.assertNotIn(str(nba_b.id), ids)


class InterventionPackAssignmentIsolation(TwoTenantSetup):
    URL = '/api/v1/intelligence/intervention-assignments/'

    def _assignments(self):
        pack_a = InterventionPack.objects.create(
            title='Pack A', institution=self.inst_a, created_by=self.teacher_a,
            trigger_source='manual',
        )
        pack_b = InterventionPack.objects.create(
            title='Pack B', institution=self.inst_b, created_by=self.teacher_b,
            trigger_source='manual',
        )
        asg_a = InterventionPackAssignment.objects.create(pack=pack_a, student=self.student_a)
        asg_b = InterventionPackAssignment.objects.create(pack=pack_b, student=self.student_b)
        return asg_a, asg_b

    def test_student_a_does_not_see_assignment_for_student_b(self):
        asg_a, asg_b = self._assignments()
        resp = self.client_for(self.student_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(asg_a.id), ids)
        self.assertNotIn(str(asg_b.id), ids)

    def test_teacher_a_does_not_see_assignment_in_tenant_b(self):
        asg_a, asg_b = self._assignments()
        resp = self.client_for(self.teacher_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertNotIn(str(asg_b.id), ids)


class ParentActionIsolation(TwoTenantSetup):
    URL = '/api/v1/intelligence/parent-actions/'

    def test_parent_a_does_not_see_parent_b_actions(self):
        pa_a = ParentAction.objects.create(
            parent=self.parent_a, child=self.student_a, institution=self.inst_a,
            action_type='alert_acknowledge', title='A', description='',
        )
        pa_b = ParentAction.objects.create(
            parent=self.parent_b, child=self.student_b, institution=self.inst_b,
            action_type='alert_acknowledge', title='B', description='',
        )
        resp = self.client_for(self.parent_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(pa_a.id), ids)
        self.assertNotIn(str(pa_b.id), ids)


class LearningProgressIsolation(TwoTenantSetup):
    URL = '/api/v1/intelligence/learning-progress/'

    def test_student_a_cannot_see_student_b_progress(self):
        lp_a = LearningProgress.objects.create(
            user=self.student_a, content_type='lesson', content_id=101,
            progress_pct=40,
        )
        lp_b = LearningProgress.objects.create(
            user=self.student_b, content_type='lesson', content_id=102,
            progress_pct=80,
        )
        resp = self.client_for(self.student_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(lp_a.id), ids)
        self.assertNotIn(str(lp_b.id), ids)


class StoryCardIsolation(TwoTenantSetup):
    URL = '/api/v1/intelligence/story-cards/'

    def test_student_a_cannot_see_story_card_for_student_b(self):
        sc_a = StoryCard.objects.create(
            audience='student', user=self.student_a, institution=self.inst_a,
            headline='A', body='a body',
        )
        sc_b = StoryCard.objects.create(
            audience='student', user=self.student_b, institution=self.inst_b,
            headline='B', body='b body',
        )
        resp = self.client_for(self.student_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(sc_a.id), ids)
        self.assertNotIn(str(sc_b.id), ids)


class NationalExamResultIsolation(TwoTenantSetup):
    URL = '/api/v1/intelligence/national-exams/'

    def test_teacher_a_cannot_see_tenant_b_results(self):
        r_a = NationalExamResult.objects.create(
            institution=self.inst_a, exam_type='PLE', year=2025,
            total_candidates=120, uploaded_by=self.teacher_a,
        )
        r_b = NationalExamResult.objects.create(
            institution=self.inst_b, exam_type='PLE', year=2025,
            total_candidates=80, uploaded_by=self.teacher_b,
        )
        resp = self.client_for(self.teacher_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(r_a.id), ids)
        self.assertNotIn(str(r_b.id), ids)


class ImpactComparisonIsolation(TwoTenantSetup):
    URL = '/api/v1/intelligence/impact/'

    def test_teacher_a_cannot_see_tenant_b_impact_rows(self):
        i_a = ImpactComparison.objects.create(
            institution=self.inst_a, period='Term 1 2026',
        )
        i_b = ImpactComparison.objects.create(
            institution=self.inst_b, period='Term 1 2026',
        )
        resp = self.client_for(self.teacher_a).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertIn(str(i_a.id), ids)
        self.assertNotIn(str(i_b.id), ids)


class InstitutionHealthHistoryIsolation(TwoTenantSetup):
    URL = '/api/v1/intelligence/health-history/'

    def test_teacher_a_cannot_fetch_tenant_b_snapshots(self):
        import datetime
        snap_b = InstitutionHealthSnapshot.objects.create(
            institution=self.inst_b, date=datetime.date.today(),
            overall_score=70,
        )
        resp = self.client_for(self.teacher_a).get(f'{self.URL}?institution={self.inst_b.id}')
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        ids = self._ids(resp)
        self.assertNotIn(str(snap_b.id), ids)
