"""Signup funnel — /api/v1/analytics/signup-funnel/

Platform-admin-only. Returns the conversion funnel over a rolling 30-day
window:
    Registered → Activated (email verified) → First diagnostic taken
    → First lesson attended → First assessment graded

Each step carries a count + the drop-off percentage from the previous
step, so the AdminDashboard can render "30% drop-off at activation"
as a real number rather than a guess.
"""
from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


class SignupFunnelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') not in ('platform_admin', 'admin') and not request.user.is_staff:
            return Response({'detail': 'Platform admin role required.'}, status=403)

        window_days = 30
        cutoff = timezone.now() - timedelta(days=window_days)
        recent = User.objects.filter(date_joined__gte=cutoff)

        registered = recent.count()
        activated = recent.filter(email_verified=True).count()

        # Diagnostic taken — count distinct student users with a
        # DiagnosticSession started in window. Import lazily so the
        # view loads even if the app is disabled.
        try:
            from diagnostics.models import DiagnosticSession
            diagnostics = DiagnosticSession.objects.filter(
                student__in=recent, started_at__isnull=False,
            ).values('student').distinct().count()
        except Exception:
            diagnostics = 0

        # First lesson attended
        try:
            from lessons.models import LessonAttendance
            first_lesson = LessonAttendance.objects.filter(
                student__in=recent, status='present',
            ).values('student').distinct().count()
        except Exception:
            first_lesson = 0

        # First assessment graded
        try:
            from assessments.models import Submission
            first_graded = Submission.objects.filter(
                student__in=recent, status='graded',
            ).values('student').distinct().count()
        except Exception:
            first_graded = 0

        def pct(a: int, b: int) -> float:
            return round((a / max(1, b)) * 100, 1) if b else 0.0

        steps = [
            {'id': 'registered',     'label': 'Registered',          'count': registered,   'share_of_prev': 100.0, 'share_of_start': 100.0},
            {'id': 'activated',      'label': 'Activated email',     'count': activated,    'share_of_prev': pct(activated, registered),    'share_of_start': pct(activated, registered)},
            {'id': 'diagnostic',     'label': 'Took diagnostic',     'count': diagnostics,  'share_of_prev': pct(diagnostics, activated),   'share_of_start': pct(diagnostics, registered)},
            {'id': 'first_lesson',   'label': 'First lesson',        'count': first_lesson, 'share_of_prev': pct(first_lesson, diagnostics or activated or 1), 'share_of_start': pct(first_lesson, registered)},
            {'id': 'first_graded',   'label': 'First graded work',   'count': first_graded, 'share_of_prev': pct(first_graded, first_lesson or diagnostics or 1), 'share_of_start': pct(first_graded, registered)},
        ]
        return Response({
            'window_days': window_days,
            'generated_at': timezone.now().isoformat(),
            'steps': steps,
        })
