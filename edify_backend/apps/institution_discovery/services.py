"""Scoring service for the institution discovery hub.

Rules-based v1 (no LLM in the ranking path). The score is composed of
eight components, each 0–100. We draw from signals that already exist
in the platform:

  - verified_lesson_delivery   LessonAttendance + Lesson activity last 90d
  - assessment_activity        Assessment.is_published + Submission grading
  - attendance_tracking        DailyRegister rows per student last 30d
  - parent_reporting           WeeklySummary rows last 30d
  - teacher_responsiveness     GradeRecord turnaround last 60d
  - peer_learning_activity     tutoring match-requests last 60d
  - student_engagement         AnalyticsEvent count last 30d
  - platform_consistency       uptime of activity over last 90d

We deliberately start simple — any of these signals being absent maps
to a 0, not a crash. That means a newly-onboarded institution earns
its score over time instead of inheriting a default.
"""
from __future__ import annotations
from datetime import timedelta
from typing import Iterable

from django.db.models import Count, Avg, F, ExpressionWrapper, FloatField
from django.utils import timezone

from institutions.models import Institution, InstitutionMembership


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def _safe_count(model, **filters) -> int:
    try:
        return model.objects.filter(**filters).count()
    except Exception:
        return 0


def _lesson_delivery_score(institution: Institution) -> float:
    try:
        from lessons.models import LessonAttendance
        recent = LessonAttendance.objects.filter(
            lesson__parent_class__institution=institution,
            recorded_at__gte=timezone.now() - timedelta(days=90),
        )
        total = recent.count()
        if total == 0:
            return 0.0
        present = recent.filter(status='present').count()
        # 0–60 for coverage + 0–40 for share-present.
        coverage = _clamp((total / 500.0) * 60, 0, 60)
        present_pct = (present / total) * 40
        return round(coverage + present_pct, 1)
    except Exception:
        return 0.0


def _assessment_activity_score(institution: Institution) -> float:
    try:
        from assessments.models import Assessment, Submission
        since = timezone.now() - timedelta(days=90)
        published = Assessment.objects.filter(
            created_by__institution_memberships__institution=institution,
            created_by__institution_memberships__status='active',
            is_published=True,
            created_at__gte=since,
        ).distinct().count()
        graded = Submission.objects.filter(
            assessment__created_by__institution_memberships__institution=institution,
            status='graded',
            submitted_at__gte=since,
        ).count()
        # 0–50 for publishing cadence + 0–50 for grading cadence.
        pub_score = _clamp((published / 20.0) * 50, 0, 50)
        grade_score = _clamp((graded / 100.0) * 50, 0, 50)
        return round(pub_score + grade_score, 1)
    except Exception:
        return 0.0


def _attendance_tracking_score(institution: Institution) -> float:
    try:
        from attendance.models import DailyRegister
        since = timezone.now().date() - timedelta(days=30)
        rows = DailyRegister.objects.filter(
            institution=institution,
            record_date__gte=since,
        ).count()
        return round(_clamp((rows / 300.0) * 100, 0, 100), 1)
    except Exception:
        return 0.0


def _parent_reporting_score(institution: Institution) -> float:
    try:
        from parent_portal.models import WeeklySummary
        since = timezone.now() - timedelta(days=30)
        rows = WeeklySummary.objects.filter(
            link__student_profile__user__institution_memberships__institution=institution,
            week_date__gte=since.date(),
        ).count()
        return round(_clamp((rows / 50.0) * 100, 0, 100), 1)
    except Exception:
        return 0.0


def _teacher_responsiveness_score(institution: Institution) -> float:
    try:
        from grading.models import GradeRecord
        since = timezone.now() - timedelta(days=60)
        graded = GradeRecord.objects.filter(
            submission__assessment__created_by__institution_memberships__institution=institution,
            graded_at__gte=since,
        )
        count = graded.count()
        return round(_clamp((count / 60.0) * 100, 0, 100), 1)
    except Exception:
        return 0.0


def _peer_learning_score(institution: Institution) -> float:
    try:
        from tutoring.models import MatchRequest
        since = timezone.now() - timedelta(days=60)
        total = MatchRequest.objects.filter(
            requester__institution_memberships__institution=institution,
            created_at__gte=since,
        ).count()
        return round(_clamp((total / 25.0) * 100, 0, 100), 1)
    except Exception:
        return 0.0


def _student_engagement_score(institution: Institution) -> float:
    try:
        from analytics.models import AnalyticsEvent
        since = timezone.now() - timedelta(days=30)
        total = AnalyticsEvent.objects.filter(
            institution=institution,
            occurred_at__gte=since,
        ).count()
        return round(_clamp((total / 1500.0) * 100, 0, 100), 1)
    except Exception:
        return 0.0


def _platform_consistency_score(institution: Institution) -> float:
    """Activity uptime: what fraction of the last 90 days had ANY
    platform event from this institution."""
    try:
        from analytics.models import AnalyticsEvent
        since = timezone.now() - timedelta(days=90)
        distinct_days = AnalyticsEvent.objects.filter(
            institution=institution,
            occurred_at__gte=since,
        ).dates('occurred_at', 'day').count()
        return round((distinct_days / 90.0) * 100, 1)
    except Exception:
        return 0.0


def _growth_index(institution: Institution) -> float:
    """Crude month-over-month growth: recent-30d members vs previous-30d."""
    try:
        now = timezone.now()
        last_30 = InstitutionMembership.objects.filter(
            institution=institution,
            joined_at__gte=now - timedelta(days=30),
        ).count()
        prior_30 = InstitutionMembership.objects.filter(
            institution=institution,
            joined_at__gte=now - timedelta(days=60),
            joined_at__lt=now - timedelta(days=30),
        ).count()
        if prior_30 == 0:
            # First real traction — reward it lightly instead of dividing by zero.
            return round(_clamp(last_30 * 10.0, 0, 100), 1)
        delta = (last_30 - prior_30) / prior_30
        return round(_clamp(50.0 + delta * 50.0, 0, 100), 1)
    except Exception:
        return 0.0


# Weights used to compose the final Activeness Score.
_ACTIVENESS_WEIGHTS = {
    'verified_lesson_delivery': 0.25,
    'assessment_activity': 0.15,
    'attendance_tracking': 0.10,
    'parent_reporting': 0.10,
    'teacher_responsiveness': 0.10,
    'peer_learning_activity': 0.10,
    'student_engagement': 0.10,
    'platform_consistency': 0.10,
}

ACTIVENESS_EXPLANATION = (
    "Maple Activeness Score is based on verified lesson delivery, assessment activity, "
    "attendance tracking, parent reporting, teacher responsiveness, peer learning, "
    "student engagement, and platform consistency over the last 90 days."
)


def recalculate_institution_score(institution: Institution):
    """Compute and persist the recommendation score for one institution."""
    from .models import InstitutionRecommendationScore

    components = {
        'verified_lesson_delivery': _lesson_delivery_score(institution),
        'assessment_activity': _assessment_activity_score(institution),
        'attendance_tracking': _attendance_tracking_score(institution),
        'parent_reporting': _parent_reporting_score(institution),
        'teacher_responsiveness': _teacher_responsiveness_score(institution),
        'peer_learning_activity': _peer_learning_score(institution),
        'student_engagement': _student_engagement_score(institution),
        'platform_consistency': _platform_consistency_score(institution),
    }
    maple_activeness = sum(components[k] * w for k, w in _ACTIVENESS_WEIGHTS.items())
    maple_activeness = round(_clamp(maple_activeness), 1)
    growth = _growth_index(institution)

    # Soft signals.
    try:
        from intelligence.models import NationalExamResult
        er = NationalExamResult.objects.filter(institution=institution).order_by('-year').first()
        if er and er.total_candidates:
            pass_count = er.total_candidates - er.failures
            exam_readiness = round((pass_count / er.total_candidates) * 100, 1)
        else:
            exam_readiness = 0.0
    except Exception:
        exam_readiness = 0.0

    standby_teachers = InstitutionMembership.objects.filter(
        institution=institution,
        role__in=('subject_teacher', 'class_teacher'),
        status='active',
    ).count()

    score, _ = InstitutionRecommendationScore.objects.update_or_create(
        institution=institution,
        defaults={
            **components,
            'maple_activeness_score': maple_activeness,
            'growth_index': growth,
            'exam_readiness_strength': exam_readiness,
            'standby_teachers_available': standby_teachers,
            'explanation': ACTIVENESS_EXPLANATION,
        },
    )
    return score


def recalculate_all():
    """Recompute scores for every institution. Safe to run nightly."""
    for inst in Institution.objects.all():
        recalculate_institution_score(inst)


def build_match_reasoning(institution: Institution, score) -> str:
    """One-line explanation of why this institution surfaced to the learner."""
    if not score:
        return "Recently listed on Maple."
    top = sorted(
        [
            ('lesson delivery', score.verified_lesson_delivery),
            ('assessment activity', score.assessment_activity),
            ('parent reporting', score.parent_reporting),
            ('teacher responsiveness', score.teacher_responsiveness),
        ],
        key=lambda x: x[1],
        reverse=True,
    )[0]
    return f"Strong on {top[0]} ({int(top[1])}/100) and steadily active on Maple."
