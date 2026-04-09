"""
Institution Health Scorer — computes composite health snapshots
for institutions based on attendance, engagement, completion, and adoption.
"""
from django.utils import timezone
from django.db.models import Avg, Count, Q
from datetime import timedelta

from .models import InstitutionHealthSnapshot


class InstitutionHealthScorer:
    """Computes and stores daily institution health snapshots."""

    # Weights for composite score (sum = 1.0)
    WEIGHTS = {
        'teacher_activity': 0.15,
        'student_attendance': 0.20,
        'assignment_completion': 0.15,
        'resource_engagement': 0.10,
        'parent_engagement': 0.05,
        'intervention_completion': 0.10,
        'offline_result_trend': 0.10,
        'online_result_trend': 0.10,
        'adoption_depth': 0.05,
    }

    def compute(self, institution):
        """Compute today's health snapshot for an institution."""
        today = timezone.now().date()

        # Check if already computed today
        existing = InstitutionHealthSnapshot.objects.filter(
            institution=institution, date=today
        ).first()
        if existing:
            return existing

        scores = {
            'teacher_activity': self._teacher_activity(institution),
            'student_attendance': self._student_attendance(institution),
            'assignment_completion': self._assignment_completion(institution),
            'resource_engagement': self._resource_engagement(institution),
            'parent_engagement': self._parent_engagement(institution),
            'intervention_completion': self._intervention_completion(institution),
            'offline_result_trend': self._offline_result_trend(institution),
            'online_result_trend': self._online_result_trend(institution),
            'adoption_depth': self._adoption_depth(institution),
        }

        overall = sum(
            scores[k] * self.WEIGHTS[k.replace('_score', '')]
            for k in scores
        )

        # Get previous snapshot for trend
        previous = InstitutionHealthSnapshot.objects.filter(
            institution=institution, date__lt=today
        ).first()

        risk_factors = []
        for k, v in scores.items():
            if v < 40:
                risk_factors.append(f"Critical: {k.replace('_', ' ').title()} at {v:.0f}%")
            elif v < 60:
                risk_factors.append(f"Warning: {k.replace('_', ' ').title()} at {v:.0f}%")

        risk_level = 'healthy'
        if overall < 40:
            risk_level = 'critical'
        elif overall < 60:
            risk_level = 'at_risk'
        elif any(v < 20 for v in scores.values()):
            risk_level = 'at_risk'

        snapshot = InstitutionHealthSnapshot.objects.create(
            institution=institution,
            date=today,
            overall_score=overall,
            teacher_activity_score=scores['teacher_activity'],
            student_attendance_score=scores['student_attendance'],
            assignment_completion_score=scores['assignment_completion'],
            resource_engagement_score=scores['resource_engagement'],
            parent_engagement_score=scores['parent_engagement'],
            intervention_completion_score=scores['intervention_completion'],
            offline_result_trend_score=scores['offline_result_trend'],
            online_result_trend_score=scores['online_result_trend'],
            adoption_depth_score=scores['adoption_depth'],
            risk_level=risk_level,
            risk_factors=risk_factors,
            previous_score=previous.overall_score if previous else None,
            score_change=(overall - previous.overall_score) if previous else None,
        )

        return snapshot

    def _teacher_activity(self, institution):
        """Score: teacher lesson delivery and resource creation (0-100)."""
        from analytics.models import TeacherPerformanceSnapshot
        snaps = TeacherPerformanceSnapshot.objects.filter(institution=institution)
        if not snaps.exists():
            return 50  # neutral when no data

        avg_lessons = snaps.aggregate(avg=Avg('lessons_delivered'))['avg'] or 0
        # Target: teachers deliver ≥10 lessons per period
        return min(100, (avg_lessons / 10) * 100)

    def _student_attendance(self, institution):
        """Score: 7-day rolling attendance rate (0-100)."""
        from attendance.models import DailyRegister
        since = timezone.now().date() - timedelta(days=7)
        registers = DailyRegister.objects.filter(
            institution=institution, date__gte=since
        )
        total = registers.count()
        if total == 0:
            return 50
        present = registers.filter(status='present').count()
        return (present / total) * 100

    def _assignment_completion(self, institution):
        """Score: assignment submission rate (0-100)."""
        from assessments.models import Assessment, Submission
        recent = Assessment.objects.filter(
            target_group__institution=institution,
            due_date__gte=timezone.now().date() - timedelta(days=30)
        )
        if not recent.exists():
            return 50

        total_expected = 0
        total_submitted = 0
        for a in recent[:20]:  # cap to avoid slow queries
            enrolled = a.target_group.enrollments.count() if hasattr(a, 'target_group') and a.target_group else 0
            submitted = Submission.objects.filter(assessment=a, status='submitted').count()
            total_expected += enrolled
            total_submitted += submitted

        if total_expected == 0:
            return 50
        return min(100, (total_submitted / total_expected) * 100)

    def _resource_engagement(self, institution):
        """Score: resource view rate (0-100)."""
        from resources.models import Resource, ResourceEngagementRecord
        resources = Resource.objects.filter(institution=institution)
        if not resources.exists():
            return 50

        since = timezone.now() - timedelta(days=14)
        engagements = ResourceEngagementRecord.objects.filter(
            resource__institution=institution,
            accessed_at__gte=since
        ).count()

        resource_count = resources.count()
        # Target: each resource viewed at least once per week
        target = resource_count * 2
        return min(100, (engagements / max(target, 1)) * 100)

    def _parent_engagement(self, institution):
        """Score: parent login rate (0-100)."""
        from analytics.models import AnalyticsEvent
        since = timezone.now() - timedelta(days=7)
        parent_logins = AnalyticsEvent.objects.filter(
            institution=institution,
            event_type='login',
            user__role='parent',
            created_at__gte=since
        ).values('user').distinct().count()

        # Get total parents
        from accounts.models import CustomUser
        total_parents = CustomUser.objects.filter(
            role='parent',
            parent_profile__institution=institution
        ).count()

        if total_parents == 0:
            return 50
        return min(100, (parent_logins / total_parents) * 100)

    def _intervention_completion(self, institution):
        """Score: intervention pack completion rate (0-100)."""
        from intelligence.models import InterventionPackAssignment, InterventionPack
        packs = InterventionPack.objects.filter(institution=institution)
        if not packs.exists():
            return 50

        assignments = InterventionPackAssignment.objects.filter(pack__institution=institution)
        total = assignments.count()
        if total == 0:
            return 50
        completed = assignments.filter(completed_at__isnull=False).count()
        return (completed / total) * 100

    def _offline_result_trend(self, institution):
        """Score: national exam improvement year-over-year (0-100)."""
        from intelligence.models import NationalExamResult
        results = NationalExamResult.objects.filter(
            institution=institution
        ).order_by('-year')[:2]

        if results.count() < 2:
            return 50

        current = results[0]
        previous = results[1]
        if previous.total_candidates == 0:
            return 50

        current_pass = (current.division_1 + current.division_2) / max(current.total_candidates, 1)
        previous_pass = (previous.division_1 + previous.division_2) / max(previous.total_candidates, 1)

        improvement = current_pass - previous_pass
        # Map [-0.3, +0.3] improvement to [0, 100]
        return max(0, min(100, 50 + (improvement * 166)))

    def _online_result_trend(self, institution):
        """Score: online assessment average trend (0-100)."""
        from analytics.models import SubjectPerformanceSnapshot
        recent = SubjectPerformanceSnapshot.objects.filter(
            institution=institution
        ).aggregate(avg_readiness=Avg('exam_readiness_score'))

        readiness = recent.get('avg_readiness') or 50
        return min(100, readiness)

    def _adoption_depth(self, institution):
        """Score: how many platform features institution uses (0-100)."""
        features_used = 0
        total_features = 8

        from resources.models import Resource
        if Resource.objects.filter(institution=institution).exists():
            features_used += 1

        from assessments.models import Assessment
        if Assessment.objects.filter(target_group__institution=institution).exists():
            features_used += 1

        from attendance.models import DailyRegister
        if DailyRegister.objects.filter(institution=institution).exists():
            features_used += 1

        from interventions.models import InterventionPlan
        if InterventionPlan.objects.filter(institution=institution).exists():
            features_used += 1

        from discussions.models import Discussion
        if Discussion.objects.filter(institution=institution).exists():
            features_used += 1

        from intelligence.models import InterventionPack
        if InterventionPack.objects.filter(institution=institution).exists():
            features_used += 1

        from analytics.models import AnalyticsEvent
        if AnalyticsEvent.objects.filter(institution=institution).exists():
            features_used += 1

        from intelligence.models import LearningProgress
        if LearningProgress.objects.filter(
            user__student_profile__institution=institution
        ).exists():
            features_used += 1

        return (features_used / total_features) * 100
