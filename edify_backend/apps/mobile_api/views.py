"""Mobile-aggregator endpoints — single-call payloads for native dashboards.

The web dashboards fire 5–6 parallel API calls on mount; doing the same
on a 3G phone is unacceptable. These views aggregate everything a role
needs for the first paint into one response so the mobile app can render
the home screen with one round-trip after login.

Endpoints exposed under /api/v1/mobile/:

  GET  /student-home/           — Today hero + plan + KPIs + next live + flags
  GET  /app-config/             — versioning + maintenance + feature flags

Future endpoints (Phase 1+) belong in this module too:
  GET  /parent-home/   GET /teacher-home/   GET /institution-home/
  POST /device-token/  DELETE /device-token/
  GET  /notification-preferences/  POST /notification-preferences/
  POST /content-progress/bulk/  POST /sync/
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from django.conf import settings
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


# Latest mobile app version we ship. Bump on every store release. The
# `min_supported_version` is the floor — older clients see the force-
# update screen instead of being able to log in.
LATEST_APP_VERSION = '0.1.0'
MIN_SUPPORTED_VERSION = '0.1.0'


class AppConfigView(APIView):
    """GET /api/v1/mobile/app-config/

    Public (anonymous-OK) — the splash screen calls this before login to
    decide whether to show a force-update gate or a maintenance banner.

    Mirrors the spec's "App config endpoint" contract:
      min_supported_version, latest_version, force_update,
      maintenance_mode, feature_flags, support_email, terms_url,
      privacy_url.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        client_version = request.query_params.get('client_version', '0.0.0')
        force_update = _version_lt(client_version, MIN_SUPPORTED_VERSION)

        return Response({
            'latest_version': LATEST_APP_VERSION,
            'min_supported_version': MIN_SUPPORTED_VERSION,
            'force_update': force_update,
            'maintenance_mode': False,
            'maintenance_message': '',
            'support_email': 'support@maple.edify',
            'terms_url': 'https://maple.edify/terms',
            'privacy_url': 'https://maple.edify/privacy',
            'feature_flags': {
                'practice_labs': True,
                'mastery_projects': True,
                'exam_simulator': True,
                'teacher_support': True,
                'school_match': True,
                'payments': True,
                'offline_notes': False,
                'audio_recording': False,
                'camera_upload': True,
                'parent_messaging': True,
                'teacher_earnings': True,
                'institution_mobile': False,
            },
            'server_time': timezone.now().isoformat(),
        })


class StudentHomeView(APIView):
    """GET /api/v1/mobile/student-home/

    Single-payload aggregator for the student dashboard's first paint.
    Reuses existing helpers wherever possible — never recomputes a
    metric the web already calculates.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        today_payload = _today_for_student(user)
        kpis = _student_kpis(user)
        next_live = _next_live_session(user)
        access = _access_status(user)

        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'stage': getattr(user, 'stage', 'secondary'),
            },
            'today': today_payload,
            'kpis': kpis,
            'next_live_session': next_live,
            'access': access,
            'fetched_at': timezone.now().isoformat(),
        })


# ──────────────────────────────────────────────────────────────────────
# Internal helpers — keep small and lazy-import the optional apps so a
# missing module never 500s the home payload.
# ──────────────────────────────────────────────────────────────────────


def _version_lt(client: str, minimum: str) -> bool:
    def parts(v: str) -> tuple[int, ...]:
        try:
            return tuple(int(p) for p in v.split('.')[:3])
        except (TypeError, ValueError):
            return (0, 0, 0)
    return parts(client) < parts(minimum)


def _today_for_student(user) -> dict[str, Any]:
    """Reuses analytics.today._student_today for parity with the web hero."""
    try:
        from analytics.today import _student_today
        return _student_today(user)
    except Exception:
        return {
            'kind': 'fallback',
            'severity': 'healthy',
            'title': 'Welcome back',
            'message': 'Pick a lesson below to keep going.',
            'action_label': 'Browse classes',
            'action_link': '/classes',
        }


def _student_kpis(user) -> dict[str, Any]:
    """Reuses ReadinessEngine — same numbers the web dashboard shows."""
    try:
        from analytics.views import ReadinessEngine
        kpis = ReadinessEngine.get_student_kpis(user)
        return {
            'overall_progress': kpis.get('overallProgress', 0),
            'attendance': kpis.get('attendance', 0),
            'exam_readiness': kpis.get('readinessScore', 0),
            'overdue_work': kpis.get('overdueTasks', 0),
            'assessments_completed': kpis.get('assessmentsCompleted', 0),
        }
    except Exception:
        return {
            'overall_progress': 0,
            'attendance': 0,
            'exam_readiness': 0,
            'overdue_work': 0,
            'assessments_completed': 0,
        }


def _next_live_session(user) -> dict[str, Any] | None:
    try:
        from live_sessions.models import LiveSession
        now = timezone.now()
        soon = LiveSession.objects.filter(
            scheduled_start__gte=now,
            scheduled_start__lt=now + timedelta(days=7),
            status='scheduled',
        ).order_by('scheduled_start').first()
        if not soon or not soon.scheduled_start:
            return None
        return {
            'id': soon.id,
            'title': getattr(soon.lesson, 'title', None) or 'Live class',
            'subject': (
                getattr(getattr(soon.lesson, 'subject', None), 'name', None)
                or getattr(getattr(getattr(soon.lesson, 'parent_class', None), 'subject', None), 'name', None)
                or 'Class'
            ),
            'scheduled_start': soon.scheduled_start.isoformat(),
            'duration_minutes': soon.duration_minutes or 60,
            'meeting_link': soon.meeting_link or '',
        }
    except Exception:
        return None


def _access_status(user) -> dict[str, Any]:
    """Mirrors the web's AccessStatusBanner: free / institutional / premium."""
    try:
        from pilot_payments.models import PremiumAccess
        active = [a for a in PremiumAccess.objects.filter(user=user) if a.is_active_now()]
        if active:
            grant = active[0]
            return {
                'tier': 'premium',
                'plan': grant.plan,
                'expires_at': grant.expires_at.isoformat() if grant.expires_at else None,
            }
    except Exception:
        pass
    role = (getattr(user, 'role', '') or '').lower()
    if 'institution' in role:
        return {'tier': 'institutional', 'plan': None, 'expires_at': None}
    return {'tier': 'free', 'plan': None, 'expires_at': None}
