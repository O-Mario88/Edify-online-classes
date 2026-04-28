"""Today Hero endpoint — /api/v1/dashboard/today/

Returns the single highest-priority action for the calling user based
on their role and current state. The frontend consumes this payload
as the hero card on every dashboard, replacing the "wall of features"
with an explicit "do this next" message.

Design goals:
- One endpoint, role-branch inside. Frontend never has to know which
  signals are evaluated.
- Cheap: no more than 2-3 queries per role.
- Honest: when there's nothing urgent, say so ("You're all caught up")
  rather than inventing a task.
- Action-linkable: every response carries an action_link the hero
  button can navigate to.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def _student_today(user) -> dict:
    """For a learner: overdue work > next live session > keep-going."""
    from assessments.models import Submission, AssessmentWindow
    # Overdue submissions — we flag any assessment window that's closed
    # but has no submission from this learner yet.
    now = timezone.now()
    missed = AssessmentWindow.objects.filter(
        close_at__lt=now, close_at__gt=now - timedelta(days=30),
    ).exclude(
        assessment__submissions__student=user,
    ).count()
    if missed > 0:
        return {
            'kind': 'overdue_work',
            'severity': 'warning',
            'title': f'You have {missed} overdue assessment{"" if missed == 1 else "s"}',
            'message': 'Clear them first — your exam readiness score depends on it.',
            'action_label': 'Open assignments',
            'action_link': '/dashboard/student?focus=assignments',
        }

    # Upcoming live session?
    try:
        from live_sessions.models import LiveSession
        soon = now + timedelta(hours=24)
        upcoming = LiveSession.objects.filter(
            scheduled_start__gte=now, scheduled_start__lt=soon,
            status='scheduled',
        ).order_by('scheduled_start').first()
    except Exception:
        upcoming = None
    if upcoming and upcoming.scheduled_start:
        mins = int((upcoming.scheduled_start - now).total_seconds() / 60)
        when = 'right now' if mins < 5 else f'in {mins // 60}h {mins % 60}m' if mins >= 60 else f'in {mins} min'
        return {
            'kind': 'live_session_soon',
            'severity': 'info',
            'title': f'Live class {when}',
            'message': getattr(upcoming.lesson, 'title', None) or 'Open your weekly schedule to join.',
            'action_label': 'Join',
            'action_link': upcoming.meeting_link or '/dashboard/student',
        }

    # Default: resume learning
    return {
        'kind': 'keep_going',
        'severity': 'healthy',
        'title': "You're all caught up",
        'message': 'Keep the streak alive — pick up where you left off.',
        'action_label': 'Resume learning',
        'action_link': '/classes',
    }


def _teacher_today(user) -> dict:
    """For a teacher: backlog > today's classes > calm day."""
    from assessments.models import Submission
    backlog = Submission.objects.filter(
        status='submitted',
        assessment__window__class_reference__teacher=user,
    ).count()
    if backlog > 0:
        return {
            'kind': 'marking_backlog',
            'severity': 'warning',
            'title': f'{backlog} script{"" if backlog == 1 else "s"} waiting for your grade',
            'message': 'Clear the queue before it grows. Learners see their scores the moment you mark.',
            'action_label': 'Start grading',
            'action_link': '/dashboard/teacher?tab=grading',
        }

    # Live session scheduled by me in the next 6 hours?
    try:
        from live_sessions.models import LiveSession
        now = timezone.now()
        mine_soon = LiveSession.objects.filter(
            scheduled_start__gte=now,
            scheduled_start__lt=now + timedelta(hours=6),
            lesson__parent_class__teacher=user,
            status='scheduled',
        ).order_by('scheduled_start').first()
    except Exception:
        mine_soon = None
    if mine_soon and mine_soon.scheduled_start:
        mins = int((mine_soon.scheduled_start - timezone.now()).total_seconds() / 60)
        when = 'right now' if mins < 5 else f'in {mins} min' if mins < 60 else f'in {mins // 60}h {mins % 60}m'
        return {
            'kind': 'teaching_soon',
            'severity': 'info',
            'title': f'You are teaching {when}',
            'message': getattr(mine_soon.lesson, 'title', None) or 'Open live sessions to start.',
            'action_label': 'Open session',
            'action_link': mine_soon.meeting_link or '/live-sessions',
        }

    return {
        'kind': 'calm_day',
        'severity': 'healthy',
        'title': 'Queue is clear, no class in the next 6h',
        'message': 'A good moment to prep next week or upload a new resource.',
        'action_label': 'Open planner',
        'action_link': '/dashboard/teacher',
    }


def _parent_today(user) -> dict:
    """For a parent: overdue child work > upcoming child class > calm."""
    from parent_portal.models import ParentStudentLink
    links = ParentStudentLink.objects.filter(
        parent_profile__user=user,
    ).select_related('student_profile__user')
    children = [link.student_profile.user for link in links if link.student_profile and link.student_profile.user]
    if not children:
        return {
            'kind': 'no_children_linked',
            'severity': 'info',
            'title': 'No child linked yet',
            'message': 'Ask your school to link you to your child so the weekly brief fills in.',
            'action_label': 'Open support',
            'action_link': '/support',
        }

    # Any of my children with overdue assessments?
    from assessments.models import AssessmentWindow
    now = timezone.now()
    for child in children:
        missed = AssessmentWindow.objects.filter(
            close_at__lt=now, close_at__gt=now - timedelta(days=30),
        ).exclude(
            assessment__submissions__student=child,
        ).count()
        if missed > 0:
            return {
                'kind': 'child_overdue',
                'severity': 'warning',
                'title': f'{child.full_name.split(" ")[0]} has {missed} overdue assessment{"" if missed == 1 else "s"}',
                'message': 'Talk to them today — a short nudge usually clears it.',
                'action_label': 'Open child view',
                'action_link': '/dashboard/parent',
            }

    return {
        'kind': 'child_on_track',
        'severity': 'healthy',
        'title': 'Everything on track this week',
        'message': f'{children[0].full_name.split(" ")[0]} is keeping up. Check the weekly brief for the full picture.',
        'action_label': 'Open weekly brief',
        'action_link': '/dashboard/parent',
    }


def _institution_today(user) -> dict:
    """For institution admin: pending admissions > outstanding fees > ops."""
    from admission_passport.models import AdmissionApplication
    from institutions.models import InstitutionMembership
    inst_ids = list(
        InstitutionMembership.objects.filter(user=user, status='active')
        .values_list('institution_id', flat=True)
    )
    pending = 0
    if inst_ids:
        pending = AdmissionApplication.objects.filter(
            institution_id__in=inst_ids,
            status__in=['submitted', 'under_review', 'more_info_requested', 'interview_invited'],
        ).count()
    if pending > 0:
        return {
            'kind': 'admissions_pending',
            'severity': 'warning',
            'title': f'{pending} admission{"" if pending == 1 else "s"} awaiting review',
            'message': 'Each day you wait, a candidate may drop off. Ten minutes now saves a churn email later.',
            'action_label': 'Review inbox',
            'action_link': '/dashboard/institution/admissions',
        }

    # Outstanding fees?
    try:
        from fees.models import FeeAssessment
        overdue = 0
        if inst_ids:
            overdue = FeeAssessment.objects.filter(
                institution_id__in=inst_ids,
                status__in=['pending', 'partial'],
                due_date__lt=timezone.now().date(),
            ).count()
        if overdue > 0:
            return {
                'kind': 'fees_overdue',
                'severity': 'warning',
                'title': f'{overdue} fee assessment{"" if overdue == 1 else "s"} overdue',
                'message': 'Send a friendly reminder before invoices stack up.',
                'action_label': 'Open fee ledger',
                'action_link': '/dashboard/institution?tab=operations',
            }
    except Exception:
        pass

    return {
        'kind': 'school_calm',
        'severity': 'healthy',
        'title': 'No admissions or fees need you today',
        'message': 'A good time to review teacher activity or plan the next intake.',
        'action_label': 'Open roster',
        'action_link': '/dashboard/institution?tab=roster',
    }


def _platform_admin_today(user) -> dict:
    """For platform admin: upgrade requests > pilot feedback > calm."""
    from pilot_payments.models import UpgradeRequest
    from accounts.models import PilotFeedback
    pending = UpgradeRequest.objects.filter(status='pending').count()
    if pending > 0:
        return {
            'kind': 'upgrades_pending',
            'severity': 'warning',
            'title': f'{pending} upgrade request{"" if pending == 1 else "s"} to review',
            'message': 'We committed to 24-hour approval. Knock these out.',
            'action_label': 'Open queue',
            'action_link': '/dashboard/admin',
        }
    recent_feedback = PilotFeedback.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=2),
    ).count()
    if recent_feedback > 0:
        return {
            'kind': 'feedback_fresh',
            'severity': 'info',
            'title': f'{recent_feedback} new pilot feedback item{"" if recent_feedback == 1 else "s"}',
            'message': 'Triage the inbox — bug reports aged beyond 48h erode trust.',
            'action_label': 'Open inbox',
            'action_link': '/dashboard/admin',
        }
    return {
        'kind': 'platform_calm',
        'severity': 'healthy',
        'title': 'Nothing urgent on the platform',
        'message': 'Good time to review institution health trends.',
        'action_label': 'Open leaderboard',
        'action_link': '/dashboard/admin',
    }


class TodayHeroView(APIView):
    """Returns the single highest-priority action for the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = (getattr(request.user, 'role', '') or '').lower()
        try:
            if role in ('platform_admin', 'admin') and getattr(request.user, 'is_staff', False):
                payload: Any = _platform_admin_today(request.user)
            elif role in ('institution_admin',):
                payload = _institution_today(request.user)
            elif 'teacher' in role:
                payload = _teacher_today(request.user)
            elif role == 'parent':
                payload = _parent_today(request.user)
            elif 'student' in role or 'learner' in role:
                payload = _student_today(request.user)
            else:
                payload = _student_today(request.user)
        except Exception:
            payload = {
                'kind': 'fallback',
                'severity': 'healthy',
                'title': 'Welcome back',
                'message': 'Pick any card below to continue.',
                'action_label': 'Explore',
                'action_link': '/',
            }
        return Response(payload)
