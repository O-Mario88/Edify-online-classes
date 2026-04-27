"""School Match scoring service.

Computes the StudentReadinessProfile snapshot and issues High-Performer
/ High-Growth badges as Passport credentials. Run nightly by the
`recalculate_readiness` management command; can also be triggered
on-demand via /api/v1/school-match/recalculate-student-readiness/.

Each metric is wrapped in a try/except so a missing model or empty
dataset doesn't take the whole computation down — we degrade to 0
for that signal and continue. Anything below the eligibility floor
ends up with `lane='not_eligible'` and is invisible to institutions.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from typing import Any, Iterable

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from .models import StudentReadinessProfile

User = get_user_model()


# Weights used to compose the overall_readiness_score. Sum to 100. The
# spec lists slightly different numbers — kept close to those but
# rounded so the math is straight-line.
WEIGHTS = {
    'activity': 20,
    'academic': 20,
    'improvement': 15,
    'exam_readiness': 15,
    'project': 10,
    'curriculum_fit': 10,
    'location': 5,
    'optin': 5,
}


# Badge definitions — slugs are stable so re-running the job is
# idempotent. The recompute service gets-or-creates each Credential
# row the first time it tries to issue.
BADGES = {
    'high_academic_performer': {
        'title': 'High Academic Performer',
        'description': 'Average score of 85% or above across all subjects.',
        'credential_type': 'badge',
        'criteria': 'Average score across all subjects ≥ 85%.',
    },
    'fast_improving_learner': {
        'title': 'Fast Improving Learner',
        'description': 'Improved by 15+ percentage points over the last 6 weeks.',
        'credential_type': 'badge',
        'criteria': 'Improvement over the trailing 6 weeks ≥ 15 percentage points.',
    },
    'highly_consistent_learner': {
        'title': 'Highly Consistent Learner',
        'description': 'Active on Maple at least 5 days a week.',
        'credential_type': 'badge',
        'criteria': 'Activity score ≥ 85 across the last 30 days.',
    },
    'strong_exam_readiness': {
        'title': 'Strong Exam Readiness',
        'description': 'Performing in the top exam-readiness band.',
        'credential_type': 'badge',
        'criteria': 'Exam-readiness score ≥ 80.',
    },
    'top_practice_lab_completion': {
        'title': 'Top Practice Lab Completion',
        'description': 'Completed a high volume of guided practice labs.',
        'credential_type': 'badge',
        'criteria': 'Project / practice score ≥ 80.',
    },
}


@dataclass
class ReadinessSignals:
    activity_score: float
    academic_score: float
    improvement_score: float
    exam_readiness_score: float
    project_score: float
    teacher_feedback_score: float
    parent_engagement_score: float
    average_score_pct: float
    improvement_pct_6w: float
    parent_engaged: bool


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, float(value or 0)))


def _activity_score(user) -> float:
    """0..100 based on activity in the last 30 days. Combines lesson
    attendance, practice-lab attempts, and live-session attendance.
    Each component is weighted equally and normalised against a target
    cadence (≈ 5 events/week per stream)."""
    target_per_stream = 20  # 5/week * ~4 weeks
    cutoff = timezone.now() - timedelta(days=30)
    components = []

    try:
        from lessons.models import LessonAttendance
        n = LessonAttendance.objects.filter(student=user, recorded_at__gte=cutoff).count()
        components.append(min(1.0, n / target_per_stream))
    except Exception:
        components.append(0.0)

    try:
        from practice_labs.models import PracticeLabAttempt
        n = PracticeLabAttempt.objects.filter(student=user, started_at__gte=cutoff).count()
        components.append(min(1.0, n / target_per_stream))
    except Exception:
        components.append(0.0)

    try:
        # Live sessions: count any LiveSession the user has attended in
        # the window. Schemas vary across pilot data, so we fall back
        # gracefully when fields are missing.
        from live_sessions.models import LiveSessionAttendance
        n = LiveSessionAttendance.objects.filter(user=user, joined_at__gte=cutoff).count()
        components.append(min(1.0, n / target_per_stream))
    except Exception:
        components.append(0.0)

    if not components:
        return 0.0
    return _clamp(sum(components) / len(components) * 100)


def _academic_signals(user) -> tuple[float, float]:
    """Return (academic_score 0..100, average_score_pct 0..100). The
    average is the canonical "70% threshold" Lane A signal."""
    try:
        from assessments.models import AssessmentSubmission
        scored = AssessmentSubmission.objects.filter(
            student=user, total_score__isnull=False, max_score__gt=0,
        )
        ratios = [s.total_score / s.max_score for s in scored if s.max_score]
        if not ratios:
            return 0.0, 0.0
        avg = sum(ratios) / len(ratios) * 100
        return _clamp(avg), _clamp(avg)
    except Exception:
        return 0.0, 0.0


def _improvement_signals(user) -> tuple[float, float]:
    """Return (improvement_score 0..100, improvement_pct_6w in pp).
    The score is a normalised version of the percentage-point delta
    between the most-recent 3 weeks and the prior 3 weeks."""
    try:
        from assessments.models import AssessmentSubmission
        now = timezone.now()
        recent_cut = now - timedelta(weeks=3)
        prior_cut = now - timedelta(weeks=6)

        recent = AssessmentSubmission.objects.filter(
            student=user, total_score__isnull=False, max_score__gt=0,
            submitted_at__gte=recent_cut,
        )
        prior = AssessmentSubmission.objects.filter(
            student=user, total_score__isnull=False, max_score__gt=0,
            submitted_at__gte=prior_cut, submitted_at__lt=recent_cut,
        )

        def _avg_pct(qs):
            ratios = [s.total_score / s.max_score for s in qs if s.max_score]
            return sum(ratios) / len(ratios) * 100 if ratios else None

        recent_pct = _avg_pct(recent)
        prior_pct = _avg_pct(prior)
        if recent_pct is None or prior_pct is None:
            return 0.0, 0.0
        delta = recent_pct - prior_pct
        # Score: 50 = no change, 100 = +25 pp or more, 0 = -25 pp or worse.
        score = _clamp(50 + (delta * 2))
        return score, delta
    except Exception:
        return 0.0, 0.0


def _exam_readiness_score(user) -> float:
    try:
        from exam_simulator.models import ExamAttempt
        attempts = ExamAttempt.objects.filter(student=user, status='completed').order_by('-submitted_at')[:6]
        scores = [a.score for a in attempts if getattr(a, 'score', None) is not None]
        if not scores:
            return 0.0
        return _clamp(sum(scores) / len(scores))
    except Exception:
        return 0.0


def _project_score(user) -> float:
    try:
        from mastery_projects.models import ProjectSubmission
        reviewed = ProjectSubmission.objects.filter(student=user, status='reviewed')
        scores = [s.score for s in reviewed if getattr(s, 'score', None) is not None]
        if not scores:
            return 0.0
        return _clamp(sum(scores) / len(scores))
    except Exception:
        return 0.0


def _teacher_feedback_score(user) -> float:
    try:
        from mentor_reviews.models import MentorReviewRequest
        reviewed = MentorReviewRequest.objects.filter(student=user, status='completed')
        scores = [r.score for r in reviewed if getattr(r, 'score', None) is not None]
        if not scores:
            return 0.0
        return _clamp(sum(scores) / len(scores))
    except Exception:
        return 0.0


def _parent_engagement_score(user) -> tuple[float, bool]:
    """Return (parent_engagement_score 0..100, parent_engaged bool)."""
    try:
        from parent_portal.models import ParentStudentLink
        links = ParentStudentLink.objects.filter(student_profile__user=user).select_related('parent_profile__user')
        if not links.exists():
            return 0.0, False

        # Count parent activity in the last 14 days. Use last_login
        # as a baseline signal until a richer parent-activity metric ships.
        cutoff = timezone.now() - timedelta(days=14)
        active = 0
        for link in links:
            parent = link.parent_profile.user
            if parent.last_login and parent.last_login >= cutoff:
                active += 1
        ratio = active / links.count() if links.count() else 0
        score = _clamp(ratio * 100)
        return score, score >= 50
    except Exception:
        return 0.0, False


def collect_signals(user) -> ReadinessSignals:
    """Pull all the per-domain signals for a user. Each helper degrades
    to 0 on failure so this never raises."""
    activity = _activity_score(user)
    academic, avg_pct = _academic_signals(user)
    improvement_score, improvement_delta = _improvement_signals(user)
    exam_readiness = _exam_readiness_score(user)
    project = _project_score(user)
    teacher_fb = _teacher_feedback_score(user)
    parent_engagement, parent_engaged = _parent_engagement_score(user)
    return ReadinessSignals(
        activity_score=activity,
        academic_score=academic,
        improvement_score=improvement_score,
        exam_readiness_score=exam_readiness,
        project_score=project,
        teacher_feedback_score=teacher_fb,
        parent_engagement_score=parent_engagement,
        average_score_pct=avg_pct,
        improvement_pct_6w=improvement_delta,
        parent_engaged=parent_engaged,
    )


def compute_overall(signals: ReadinessSignals) -> float:
    """Weighted blend of the per-domain signals into the 0..100 ranking
    score used by the institution-side recommendation list. Curriculum
    /location/opt-in components weight at full credit since their
    refinement happens at match time, not at the readiness level."""
    return _clamp(
        signals.activity_score * WEIGHTS['activity'] / 100
        + signals.academic_score * WEIGHTS['academic'] / 100
        + signals.improvement_score * WEIGHTS['improvement'] / 100
        + signals.exam_readiness_score * WEIGHTS['exam_readiness'] / 100
        + signals.project_score * WEIGHTS['project'] / 100
        # Three trailing weights (curriculum, location, opt-in) collapse
        # to "full credit" at the readiness layer; the per-pair match
        # score in Phase 9.3 will refine them per institution.
        + 100 * WEIGHTS['curriculum_fit'] / 100
        + 100 * WEIGHTS['location'] / 100
        + (100 if signals.parent_engaged else 0) * WEIGHTS['optin'] / 100
    )


def _user_curriculum_meta(user) -> dict[str, str]:
    """Best-effort pull of country / curriculum / class_level / region
    so the readiness row can be filtered cheaply later."""
    out = {'country': '', 'curriculum': '', 'class_level': '', 'region': ''}
    try:
        profile = getattr(user, 'student_profile', None)
        if profile:
            out['curriculum'] = getattr(profile, 'curriculum', '') or ''
            out['class_level'] = (getattr(profile, 'class_level', '') or '')[:32]
            out['country'] = (getattr(profile, 'country', '') or '')[:2]
            out['region'] = (getattr(profile, 'region', '') or '')[:64]
    except Exception:
        pass
    return out


def _ensure_credential(slug: str):
    """Lazily upsert the Credential template for a badge slug."""
    from passport.models import Credential
    meta = BADGES[slug]
    cred, _ = Credential.objects.get_or_create(
        slug=slug,
        defaults={
            'title': meta['title'],
            'description': meta['description'],
            'credential_type': meta['credential_type'],
            'criteria': meta['criteria'],
        },
    )
    return cred


def _issue_badge(user, slug: str) -> bool:
    """Idempotent issue. Returns True when a new IssuedCredential row was
    created (so the caller can chain a notification later)."""
    try:
        from passport.models import IssuedCredential
        cred = _ensure_credential(slug)
        _, created = IssuedCredential.objects.get_or_create(credential=cred, student=user)
        return created
    except Exception:
        return False


def _maybe_issue_badges(user, profile: StudentReadinessProfile) -> list[str]:
    """Issue any badges whose threshold the latest snapshot crosses.
    Returns the list of slugs issued for the first time on this run."""
    earned: list[str] = []
    if profile.average_score_pct >= 85 and _issue_badge(user, 'high_academic_performer'):
        earned.append('high_academic_performer')
    if profile.improvement_pct_6w >= 15 and _issue_badge(user, 'fast_improving_learner'):
        earned.append('fast_improving_learner')
    if profile.activity_score >= 85 and _issue_badge(user, 'highly_consistent_learner'):
        earned.append('highly_consistent_learner')
    if profile.exam_readiness_score >= 80 and _issue_badge(user, 'strong_exam_readiness'):
        earned.append('strong_exam_readiness')
    if profile.project_score >= 80 and _issue_badge(user, 'top_practice_lab_completion'):
        earned.append('top_practice_lab_completion')
    return earned


@transaction.atomic
def recalculate_student_readiness(user) -> dict[str, Any]:
    """Recompute one student's snapshot, issue any newly-earned badges,
    and return a small summary dict for the management command's log."""
    signals = collect_signals(user)
    overall = compute_overall(signals)
    meta = _user_curriculum_meta(user)

    profile, _ = StudentReadinessProfile.objects.get_or_create(student=user)
    profile.country = meta['country']
    profile.curriculum = meta['curriculum']
    profile.class_level = meta['class_level']
    profile.region = meta['region']
    profile.activity_score = signals.activity_score
    profile.academic_score = signals.academic_score
    profile.improvement_score = signals.improvement_score
    profile.exam_readiness_score = signals.exam_readiness_score
    profile.project_score = signals.project_score
    profile.teacher_feedback_score = signals.teacher_feedback_score
    profile.parent_engagement_score = signals.parent_engagement_score
    profile.overall_readiness_score = overall
    profile.average_score_pct = signals.average_score_pct
    profile.improvement_pct_6w = signals.improvement_pct_6w
    profile.parent_engaged = signals.parent_engaged
    profile.evaluate_lane()
    profile.last_calculated_at = timezone.now()
    profile.save()

    badges_issued = _maybe_issue_badges(user, profile)

    return {
        'student_id': user.id,
        'lane': profile.lane,
        'eligible': profile.eligible,
        'overall_readiness_score': profile.overall_readiness_score,
        'average_score_pct': profile.average_score_pct,
        'improvement_pct_6w': profile.improvement_pct_6w,
        'badges_issued_now': badges_issued,
    }


def recalculate_eligible_students(queryset: Iterable | None = None) -> dict[str, int]:
    """Run the recompute over every student. Returns a small counter
    dict for logging."""
    if queryset is None:
        queryset = User.objects.filter(role__icontains='student')

    counts = {'processed': 0, 'eligible': 0, 'lane_a': 0, 'lane_b': 0, 'badges_issued': 0}
    for user in queryset.iterator():
        result = recalculate_student_readiness(user)
        counts['processed'] += 1
        if result['eligible']:
            counts['eligible'] += 1
        if result['lane'] == 'high_performer':
            counts['lane_a'] += 1
        elif result['lane'] == 'high_growth':
            counts['lane_b'] += 1
        counts['badges_issued'] += len(result['badges_issued_now'])
    return counts


# ── Phase 9.6 — School Match plan tiers ─────────────────────────────


SCHOOL_MATCH_TIERS = ['free', 'pro', 'premium']

PLAN_TO_TIER = {
    'school_os':      'pro',
    'school_os_plus': 'premium',
}

# Monthly invitation quota by tier. `None` = unlimited.
INVITATION_QUOTA = {
    'free':    0,
    'pro':     20,
    'premium': None,
}

# Feature gates per tier. The mobile reads this off the /tier/ endpoint
# so the upgrade card can list specifically what's locked.
TIER_FEATURES = {
    'free': {
        'view_recommended_students':    False,
        'send_invitations':             False,
        'request_passport_access':      False,
        'view_pipeline':                True,
        'manage_scholarships':          False,
        'advanced_filters':             False,
        'admission_analytics':          False,
    },
    'pro': {
        'view_recommended_students':    True,
        'send_invitations':             True,
        'request_passport_access':      True,
        'view_pipeline':                True,
        'manage_scholarships':          False,
        'advanced_filters':             False,
        'admission_analytics':          False,
    },
    'premium': {
        'view_recommended_students':    True,
        'send_invitations':             True,
        'request_passport_access':      True,
        'view_pipeline':                True,
        'manage_scholarships':          True,
        'advanced_filters':             True,
        'admission_analytics':          True,
    },
}


def get_school_match_tier(institution) -> str:
    """Resolve the institution's effective tier. Reads PremiumAccess
    rows for any of the institution's admin users — best-active wins
    so a single school_os_plus admin lifts the whole school.

    Returns 'free' / 'pro' / 'premium'. The default for verified-but-
    unpaid institutions is 'free' — they can receive direct
    applications but can't proactively browse / invite learners.
    """
    if not institution:
        return 'free'
    try:
        from pilot_payments.models import PremiumAccess
        from institutions.models import InstitutionMembership

        admin_user_ids = list(InstitutionMembership.objects.filter(
            institution=institution, status='active',
        ).values_list('user_id', flat=True))
        if not admin_user_ids:
            return 'free'

        rows = PremiumAccess.objects.filter(user_id__in=admin_user_ids).order_by('-granted_at')
        best = 'free'
        for row in rows:
            if not row.is_active_now():
                continue
            tier = PLAN_TO_TIER.get(row.plan)
            if tier == 'premium':
                return 'premium'
            if tier == 'pro' and best == 'free':
                best = 'pro'
        return best
    except Exception:
        return 'free'


def invitations_sent_this_month(institution) -> int:
    """Count invitations created this calendar month — used to enforce
    the per-tier monthly cap."""
    from .models import InstitutionStudentInvitation
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return InstitutionStudentInvitation.objects.filter(
        institution=institution, created_at__gte=month_start,
    ).count()


def get_invitation_quota_info(institution) -> dict:
    """Returns {tier, used_this_month, limit, remaining, can_send}.
    `limit=None` means unlimited; `remaining=None` in that case too."""
    tier = get_school_match_tier(institution)
    used = invitations_sent_this_month(institution)
    limit = INVITATION_QUOTA[tier]
    remaining = None if limit is None else max(0, limit - used)
    can_send = (limit is None) or (used < limit)
    return {
        'tier': tier,
        'used_this_month': used,
        'limit': limit,
        'remaining': remaining,
        'can_send': can_send,
    }


def tier_locks_feature(institution, feature: str) -> tuple[bool, str]:
    """Return (locked, current_tier). `feature` is a key in TIER_FEATURES
    e.g. 'view_recommended_students', 'manage_scholarships'."""
    tier = get_school_match_tier(institution)
    allowed = TIER_FEATURES.get(tier, TIER_FEATURES['free']).get(feature, False)
    return (not allowed), tier


def resolve_institution_for_user(user):
    """Pull the institution scope an admin / DOS / head-teacher belongs
    to. Returns None for non-staff or unaffiliated users so callers can
    return 403 cleanly."""
    try:
        from institutions.models import Institution, InstitutionMembership
        membership = (InstitutionMembership.objects
                      .filter(user=user, status='active')
                      .select_related('institution').first())
        if membership and getattr(membership, 'institution', None):
            return membership.institution
        return None
    except Exception:
        return None


def get_or_compute_eligibility(institution):
    """Lazily compute InstitutionMatchEligibility on first access. Reads
    the underlying signals (verified, admission status, activeness
    score) and caches the gate booleans on the row.

    The gate rules:
      - can_view_student_matches: institution.is_active AND admission settings filled
      - can_send_invitations:    above + activeness_score >= 70

    Both are conservative — defense in depth. Even if the row is stale
    and the call site doesn't recheck, surface views still emit 403
    when the underlying institution isn't actually active.
    """
    from .models import InstitutionMatchEligibility, InstitutionRecommendationScore
    elig, _ = InstitutionMatchEligibility.objects.get_or_create(institution=institution)

    verified = bool(getattr(institution, 'is_active', False))

    # Admission-open: prefer DiscoveryProfile.admission_status when set.
    admission_open = False
    try:
        profile = getattr(institution, 'discovery_profile', None)
        if profile and getattr(profile, 'admission_status', '') in {'open', 'invitation_only'}:
            admission_open = True
    except Exception:
        admission_open = verified  # if discovery profile is missing, fall back to active flag

    # Activeness score from the existing recommendation system.
    activeness = 0.0
    try:
        score = getattr(institution, 'recommendation_score', None) or \
                InstitutionRecommendationScore.objects.filter(institution=institution).first()
        if score:
            activeness = float(getattr(score, 'maple_activeness_score', 0) or 0)
    except Exception:
        activeness = 0.0

    elig.verified = verified
    elig.safeguarding_approved = verified  # treated together until safeguarding API ships
    elig.admission_open = admission_open
    elig.activeness_score = activeness
    elig.minimum_activity_met = activeness >= 70
    elig.can_view_student_matches = verified and admission_open
    elig.can_send_invitations = verified and admission_open and activeness >= 70
    elig.last_checked_at = timezone.now()
    elig.save()
    return elig


def recommended_students_for_institution(institution, *, lane=None, country=None,
                                         region=None, curriculum=None, class_level=None,
                                         scholarship_only: bool = False,
                                         limit: int = 50):
    """Return the cards an institution sees on /recommended-students/.
    Each card is the *anonymised* projection — no name, email, phone,
    exact location, or full passport. Apply filters at the DB level so
    the response stays small.
    """
    from .models import (
        StudentOpportunityPreference,
        StudentReadinessProfile,
    )

    # Discoverability: parent-approved AND visibility set to open AND
    # explicit institution-contact toggle. When scholarship_only is on,
    # the parent must additionally have ticked open_to_scholarships.
    pref_qs = StudentOpportunityPreference.objects.filter(
        parent_approved=True,
        visibility_status='open_to_contact',
        open_to_institution_contact=True,
    )
    if scholarship_only:
        pref_qs = pref_qs.filter(open_to_scholarships=True)
    discoverable_student_ids = set(pref_qs.values_list('student_id', flat=True))
    if not discoverable_student_ids:
        return []

    qs = (StudentReadinessProfile.objects
          .filter(student_id__in=discoverable_student_ids, eligible=True)
          .select_related('student'))

    if lane in ('high_performer', 'high_growth'):
        qs = qs.filter(lane=lane)
    if country:
        qs = qs.filter(country=country)
    if region:
        qs = qs.filter(region__icontains=region)
    if curriculum:
        qs = qs.filter(curriculum__icontains=curriculum)
    if class_level:
        qs = qs.filter(class_level__icontains=class_level)

    qs = qs.order_by('-overall_readiness_score')[:limit]

    cards = []
    for profile in qs:
        cards.append({
            # NOTE: deliberately surface the user id so the institution can
            # follow up with /student-summary/<id>/ — the *id* alone is not
            # PII, and the summary endpoint stays anonymised too.
            'student_id': profile.student_id,
            'class_level': profile.class_level or 'Unspecified',
            'region': profile.region or '',
            'country': profile.country or '',
            'curriculum': profile.curriculum or '',
            'lane': profile.lane,
            'lane_label': 'High academic performer' if profile.lane == 'high_performer' else 'High-growth learner',
            'overall_readiness_score': round(profile.overall_readiness_score, 1),
            'average_score_pct': round(profile.average_score_pct, 1),
            'improvement_pct_6w': round(profile.improvement_pct_6w, 1),
            'signals': {
                'activity': round(profile.activity_score, 1),
                'academic': round(profile.academic_score, 1),
                'improvement': round(profile.improvement_score, 1),
                'exam_readiness': round(profile.exam_readiness_score, 1),
                'project': round(profile.project_score, 1),
            },
        })
    return cards


def anonymized_student_summary(institution, student_user) -> dict[str, Any]:
    """Detailed but anonymised view a verified institution sees on
    /student-summary/<id>/. Shows enough evidence to decide whether to
    invite — match reasons, badges earned, subject strengths — without
    leaking PII.
    """
    from .models import StudentOpportunityPreference, StudentReadinessProfile
    pref = StudentOpportunityPreference.objects.filter(student=student_user).first()
    if not pref or not pref.is_discoverable():
        return {'visible': False, 'detail': 'Learner is not discoverable.'}

    profile = StudentReadinessProfile.objects.filter(student=student_user).first()
    if not profile or not profile.eligible:
        return {'visible': False, 'detail': 'Learner is not eligible right now.'}

    # Earned badges — pulled from passport.IssuedCredential
    badges = []
    try:
        from passport.models import IssuedCredential
        for ic in IssuedCredential.objects.filter(student=student_user).select_related('credential')[:10]:
            badges.append({
                'slug': ic.credential.slug,
                'title': ic.credential.title,
                'description': ic.credential.description,
            })
    except Exception:
        pass

    # Match reasons composed from the live snapshot.
    reasons = []
    if profile.lane == 'high_performer':
        reasons.append(f'Average across all subjects is {profile.average_score_pct:.0f}%.')
    elif profile.lane == 'high_growth':
        reasons.append(f'Improved by {profile.improvement_pct_6w:.0f} points in 6 weeks.')
    if profile.activity_score >= 70:
        reasons.append('Active on Maple at least 5 days a week.')
    if profile.exam_readiness_score >= 70:
        reasons.append(f'Exam readiness score of {profile.exam_readiness_score:.0f}.')
    if profile.project_score >= 70:
        reasons.append(f'Reviewed projects averaging {profile.project_score:.0f}%.')

    return {
        'visible': True,
        'student_id': student_user.id,
        'class_level': profile.class_level or 'Unspecified',
        'region': profile.region or '',
        'country': profile.country or '',
        'curriculum': profile.curriculum or '',
        'lane': profile.lane,
        'lane_label': 'High academic performer' if profile.lane == 'high_performer' else 'High-growth learner',
        'overall_readiness_score': round(profile.overall_readiness_score, 1),
        'signals': {
            'activity': round(profile.activity_score, 1),
            'academic': round(profile.academic_score, 1),
            'improvement': round(profile.improvement_score, 1),
            'exam_readiness': round(profile.exam_readiness_score, 1),
            'project': round(profile.project_score, 1),
            'teacher_feedback': round(profile.teacher_feedback_score, 1),
        },
        'gates': {
            'average_score_pct': round(profile.average_score_pct, 1),
            'improvement_pct_6w': round(profile.improvement_pct_6w, 1),
        },
        'reasons': reasons,
        'badges': badges,
        'preferences': {
            'open_to_scholarships': pref.open_to_scholarships,
            'open_to_boarding': pref.open_to_boarding,
            'open_to_day': pref.open_to_day,
            'open_to_school_visit_invites': pref.open_to_school_visit_invites,
            'open_to_preview_class_invites': pref.open_to_preview_class_invites,
            'national_search_only': pref.national_search_only,
        },
    }


def explain_score(user) -> dict[str, Any]:
    """Returns a human-readable breakdown of the student's most recent
    readiness snapshot. Used by the score-explanation endpoint to
    answer "why am I (or am I not) discoverable?"
    """
    try:
        profile = StudentReadinessProfile.objects.get(student=user)
    except StudentReadinessProfile.DoesNotExist:
        return {
            'has_snapshot': False,
            'message': 'No readiness snapshot has been computed yet for this learner.',
        }

    reasons: list[str] = []
    if profile.lane == 'high_performer':
        reasons.append(
            f'Average score across all subjects is {profile.average_score_pct:.0f}% — '
            f'above the 70% threshold for institution discovery.'
        )
    elif profile.lane == 'high_growth':
        reasons.append(
            f'Improvement of {profile.improvement_pct_6w:.0f} points over 6 weeks, '
            f'with active parent engagement — qualifies via the high-growth lane.'
        )
    else:
        if profile.average_score_pct < 70:
            reasons.append(
                f'Average score is {profile.average_score_pct:.0f}% — '
                f'institutions only see learners scoring 70% or higher across all subjects.'
            )
        if profile.improvement_pct_6w < 15:
            reasons.append(
                'Improvement over the last 6 weeks is below the 15-point threshold for the '
                'high-growth lane.'
            )
        if not profile.parent_engaged:
            reasons.append('Parent engagement signal is below the threshold for the high-growth lane.')

    return {
        'has_snapshot': True,
        'lane': profile.lane,
        'eligible': profile.eligible,
        'overall_readiness_score': profile.overall_readiness_score,
        'signals': {
            'activity_score': profile.activity_score,
            'academic_score': profile.academic_score,
            'improvement_score': profile.improvement_score,
            'exam_readiness_score': profile.exam_readiness_score,
            'project_score': profile.project_score,
            'teacher_feedback_score': profile.teacher_feedback_score,
            'parent_engagement_score': profile.parent_engagement_score,
        },
        'gates': {
            'average_score_pct': profile.average_score_pct,
            'improvement_pct_6w': profile.improvement_pct_6w,
            'parent_engaged': profile.parent_engaged,
        },
        'reasons': reasons,
        'last_calculated_at': profile.last_calculated_at.isoformat() if profile.last_calculated_at else None,
    }
