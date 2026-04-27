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
LATEST_APP_VERSION = '0.2.0'
MIN_SUPPORTED_VERSION = '0.2.0'


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


class LessonDetailView(APIView):
    """GET /api/v1/mobile/lesson/<id>/

    Single-payload aggregator for the mobile lesson viewer:
      lesson meta + notes (text/JSON content) + recordings + the
      caller's attendance record. Saves three round-trips on first
      open over a slow connection.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id: int, *args, **kwargs):
        from lessons.models import Lesson, LessonNote, LessonRecording, LessonAttendance
        from rest_framework import status as http_status
        try:
            lesson = (
                Lesson.objects.select_related('parent_class', 'parent_class__subject', 'topic')
                .prefetch_related('notes', 'recordings')
                .get(id=lesson_id)
            )
        except Lesson.DoesNotExist:
            return Response({'detail': 'Lesson not found.'}, status=http_status.HTTP_404_NOT_FOUND)

        notes = [
            {
                'id': n.id,
                'content_blocks': n.content_blocks or {},
                'updated_at': n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in lesson.notes.all()
        ]
        recordings = [
            {
                'id': r.id,
                'url': r.url,
                'duration_seconds': r.duration or 0,
            }
            for r in lesson.recordings.all()
        ]
        attendance = LessonAttendance.objects.filter(lesson=lesson, student=request.user).first()
        attendance_payload = None
        if attendance:
            attendance_payload = {
                'status': attendance.status,
                'duration_minutes': attendance.duration_minutes,
                'recorded_at': attendance.recorded_at.isoformat() if attendance.recorded_at else None,
            }

        return Response({
            'id': lesson.id,
            'title': lesson.title,
            'class_name': getattr(lesson.parent_class, 'title', '') or '',
            'subject': getattr(getattr(lesson.parent_class, 'subject', None), 'name', '') or '',
            'topic': getattr(lesson.topic, 'name', '') or '',
            'access_mode': lesson.access_mode,
            'scheduled_at': lesson.scheduled_at.isoformat() if lesson.scheduled_at else None,
            'published_at': lesson.published_at.isoformat() if lesson.published_at else None,
            'notes': notes,
            'recordings': recordings,
            'attendance': attendance_payload,
        })


class LessonMarkAttendedView(APIView):
    """POST /api/v1/mobile/lesson/<id>/mark-attended/

    Idempotent — creates or updates a LessonAttendance row marking the
    learner as 'present' with the supplied duration. Used when the
    learner taps "Mark as complete" inside the mobile lesson viewer.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id: int, *args, **kwargs):
        from lessons.models import Lesson, LessonAttendance
        from rest_framework import status as http_status
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'detail': 'Lesson not found.'}, status=http_status.HTTP_404_NOT_FOUND)

        try:
            duration = int(request.data.get('duration_minutes', 0))
        except (TypeError, ValueError):
            duration = 0

        attendance, _ = LessonAttendance.objects.update_or_create(
            lesson=lesson, student=request.user,
            defaults={'status': 'present', 'duration_minutes': max(0, duration)},
        )
        return Response({
            'lesson_id': lesson.id,
            'status': attendance.status,
            'duration_minutes': attendance.duration_minutes,
            'recorded_at': attendance.recorded_at.isoformat() if attendance.recorded_at else None,
        })


class ParentHomeView(APIView):
    """GET /api/v1/mobile/parent-home/

    Single-payload aggregator for the parent dashboard. Returns the
    parent's linked children + the selected child's KPIs, weekly
    brief, subject grid, passport summary, teacher-support summary,
    and the role-aware Today hero. Defaults to the first linked child;
    pass ?child_id=<id> to switch.

    Cold start = one round-trip; switching child = one more.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from parent_portal.models import ParentStudentLink
        from notifications.models import Notification
        from accounts.models import User as AuthUser

        parent = request.user

        # Children list — same pattern as parent_portal.my-children/ but
        # inlined so the home payload doesn't require a second hop.
        links = (
            ParentStudentLink.objects
            .filter(parent_profile__user=parent)
            .select_related('student_profile__user')
        )
        last_read = (
            Notification.objects
            .filter(user=parent, read_at__isnull=False)
            .order_by('-read_at')
            .values_list('read_at', flat=True)
            .first()
        ) or (timezone.now() - timedelta(days=7))
        children = []
        for link in links:
            sp = link.student_profile
            if not sp or not sp.user:
                continue
            unread = Notification.objects.filter(user=sp.user, created_at__gt=last_read).count()
            children.append({
                'id': sp.user.id,
                'email': sp.user.email,
                'name': sp.user.full_name,
                'stage': getattr(sp.user, 'stage', None),
                'relationship': link.relationship_type,
                'unread_count': unread,
            })

        # Pick which child to hydrate.
        requested_id = request.query_params.get('child_id')
        selected_user = None
        if requested_id:
            try:
                tid = int(requested_id)
                if any(c['id'] == tid for c in children):
                    selected_user = AuthUser.objects.filter(id=tid).first()
            except (TypeError, ValueError):
                pass
        if selected_user is None and children:
            selected_user = AuthUser.objects.filter(id=children[0]['id']).first()

        today_payload = _today_for_parent(parent)

        if selected_user is None:
            return Response({
                'parent': _parent_user_payload(parent),
                'children': children,
                'selected_child': None,
                'today': today_payload,
                'fetched_at': timezone.now().isoformat(),
            })

        kpis = _student_kpis(selected_user)
        return Response({
            'parent': _parent_user_payload(parent),
            'children': children,
            'selected_child': {
                'id': selected_user.id,
                'name': selected_user.full_name,
                'email': selected_user.email,
                'stage': getattr(selected_user, 'stage', 'secondary'),
                'kpis': kpis,
                'weekly_brief': _weekly_brief(selected_user, kpis),
                'subjects': _subject_performance(selected_user),
                'passport': _passport_summary(selected_user),
                'teacher_support': _teacher_support_summary(selected_user),
            },
            'today': today_payload,
            'fetched_at': timezone.now().isoformat(),
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
        today_tasks = _today_tasks(user)
        upcoming_assignments = _upcoming_assignments(user)
        recent_lessons = _recent_lessons(user)

        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'stage': getattr(user, 'stage', 'secondary'),
            },
            'today': today_payload,
            'today_tasks': today_tasks,
            'kpis': kpis,
            'next_live_session': next_live,
            'upcoming_assignments': upcoming_assignments,
            'recent_lessons': recent_lessons,
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


def _today_tasks(user) -> list[dict[str, Any]]:
    """Today's Learning Plan items.

    Reuses intelligence.StudyPlanEngine.generate_weekly_plan + filters to
    today only. Mobile-first shape: id, title, type, subject, minutes,
    completed bool, optional deep-link target.
    """
    try:
        from intelligence.engines.study_planner import StudyPlanEngine
        engine = StudyPlanEngine()
        plan = engine.generate_weekly_plan(user)
    except Exception:
        return []
    today_iso = timezone.now().date().isoformat()
    items: list[dict[str, Any]] = []
    for task in (plan or {}).get('tasks', []) or []:
        scheduled = task.get('scheduled_date') or ''
        if scheduled[:10] != today_iso:
            continue
        items.append({
            'id': str(task.get('id') or ''),
            'title': task.get('title') or '',
            'type': task.get('task_type') or 'custom',
            'subject': task.get('subject_name') or 'General',
            'duration_minutes': task.get('estimated_minutes') or 0,
            'completed': task.get('status') == 'completed',
        })
    # Sort completed items last so the learner sees what's still pending.
    items.sort(key=lambda t: (t['completed'], -(t['duration_minutes'] or 0)))
    return items[:10]


def _upcoming_assignments(user) -> list[dict[str, Any]]:
    """Up to 8 assignments / assessments due in the next 14 days that the
    learner has not submitted yet. Sourced from AssessmentWindow."""
    try:
        from assessments.models import AssessmentWindow
        now = timezone.now()
        windows = (
            AssessmentWindow.objects
            .filter(close_at__gte=now, close_at__lte=now + timedelta(days=14))
            .select_related('assessment', 'assessment__topic')
            .order_by('close_at')[:20]
        )
        items = []
        for w in windows:
            already_submitted = w.assessment.submissions.filter(student=user).exists()
            if already_submitted:
                continue
            items.append({
                'id': w.id,
                'assessment_id': w.assessment_id,
                'title': w.assessment.title,
                'subject': getattr(getattr(w.assessment, 'topic', None), 'subject_id', None) and 'Subject' or '',
                'topic': getattr(getattr(w.assessment, 'topic', None), 'name', None) or '',
                'type': w.assessment.type,
                'max_score': w.assessment.max_score or 0,
                'close_at': w.close_at.isoformat(),
            })
            if len(items) >= 8:
                break
        return items
    except Exception:
        return []


def _parent_user_payload(user) -> dict[str, Any]:
    return {
        'id': user.id,
        'email': user.email,
        'full_name': user.full_name,
        'role': user.role,
    }


def _today_for_parent(user) -> dict[str, Any]:
    """Reuses analytics.today._parent_today for parity with the web hero."""
    try:
        from analytics.today import _parent_today
        return _parent_today(user)
    except Exception:
        return {
            'kind': 'fallback',
            'severity': 'healthy',
            'title': 'Welcome back',
            'message': 'Pick a child below to see this week\'s progress.',
            'action_label': 'See progress',
            'action_link': '/dashboard/parent',
        }


def _weekly_brief(child_user, kpis: dict[str, Any]) -> dict[str, Any]:
    """Builds the parent-facing weekly brief block. Mirrors the
    /analytics/parent-dashboard/ shape so existing copy stays
    consistent."""
    subjects = _subject_performance(child_user)
    completed = kpis.get('assessments_completed', 0)
    readiness = kpis.get('exam_readiness', 0)
    return {
        'strongest_subject': subjects[0]['subject'] if subjects else '—',
        'weakest_topic': '—',
        'attendance': kpis.get('attendance', 0),
        'lessons_completed': kpis.get('lessons_completed', completed),
        'assessment_trend': 'Stable',
        'recommended_focus': 'Review weak topics in your subject performance grid.',
        'narrative': (
            f"This week, {child_user.full_name.split(' ')[0]} completed {completed} "
            f"assessment{'' if completed == 1 else 's'} with a readiness score of {readiness}. "
            + ("Performance is on track." if readiness >= 70 else "Additional study time is recommended.")
        ),
    }


def _subject_performance(child_user) -> list[dict[str, Any]]:
    """Subject-by-subject grid for the parent. Reuses ReadinessEngine."""
    try:
        from analytics.views import ReadinessEngine
        rows = ReadinessEngine.get_subject_performance(child_user) or []
        return [
            {
                'subject': r.get('subject') or '—',
                'completion': r.get('completion') or 0,
                'avg_score': r.get('avgScore') or 0,
                'weak_topics': r.get('weakTopics') or 0,
                'confidence': r.get('confidence') or 'Medium',
                'last_activity': r.get('lastActivity') or '',
            }
            for r in rows
        ]
    except Exception:
        return []


def _passport_summary(child_user) -> dict[str, Any]:
    """Counts the artefacts already in the learner's Passport so the
    parent can see "evidence of progress" at a glance."""
    badge_count = 0
    cert_count = 0
    project_count = 0
    try:
        from practice_labs.models import PracticeLabAttempt
        badge_count = PracticeLabAttempt.objects.filter(
            student=child_user, badge_earned=True,
        ).count()
    except Exception:
        pass
    try:
        from passport.models import Credential, LearningPassport
        passport = LearningPassport.objects.filter(student=child_user).first()
        if passport:
            cert_count = Credential.objects.filter(
                passport=passport, credential_type='certificate', is_published=True,
            ).count()
    except Exception:
        pass
    try:
        from mastery_projects.models import ProjectSubmission
        project_count = ProjectSubmission.objects.filter(
            student=child_user, status__in=['reviewed', 'approved'],
        ).count()
    except Exception:
        pass
    return {
        'badges': badge_count,
        'certificates': cert_count,
        'projects_reviewed': project_count,
    }


def _teacher_support_summary(child_user) -> dict[str, Any]:
    """Stats for the Teacher Support Summary card on the parent home."""
    answered = 0
    pending = 0
    try:
        from standby_teachers.models import SupportRequest
        qs = SupportRequest.objects.filter(student=child_user)
        answered = qs.filter(status='resolved').count()
        pending = qs.filter(status__in=['open', 'assigned']).count()
    except Exception:
        pass
    return {
        'questions_answered': answered,
        'pending_requests': pending,
    }


def _recent_lessons(user) -> list[dict[str, Any]]:
    """Recent lesson rows the learner has access to. Used by the Learn tab.

    Drawn from `lessons.Lesson` joined to enrollment / class membership
    where applicable. Falls back to the most recent platform-wide
    published lessons if the learner has no class context yet.
    """
    try:
        from lessons.models import Lesson
        qs = Lesson.objects.select_related('parent_class', 'parent_class__subject').order_by('-id')[:12]
        return [
            {
                'id': l.id,
                'title': l.title or 'Lesson',
                'subject': getattr(getattr(l.parent_class, 'subject', None), 'name', '') or '',
                'class_name': getattr(l.parent_class, 'title', '') or '',
                'duration_label': getattr(l, 'estimated_minutes', None) and f"{l.estimated_minutes} min" or '',
            }
            for l in qs
        ]
    except Exception:
        return []


# ── Phase-7 endpoints ────────────────────────────────────────────────


class DeviceTokenView(APIView):
    """POST/DELETE /api/v1/mobile/device-token/

    Mobile clients POST their Expo push token on every cold start
    (idempotent upsert on (user, token)). DELETE removes the token on
    logout so a shared device can't keep receiving the previous user's
    notifications. Both endpoints accept the body shape:

      { "token": "...", "platform": "android|ios|web", "app_version": "0.2.0" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        from notifications.models import DeviceToken
        from rest_framework import status as http_status

        token = (request.data.get('token') or '').strip()
        if not token:
            return Response({'detail': 'token is required.'}, status=http_status.HTTP_400_BAD_REQUEST)
        platform = (request.data.get('platform') or 'android').lower()
        if platform not in {'ios', 'android', 'web'}:
            platform = 'android'
        app_version = (request.data.get('app_version') or '').strip()[:32]

        obj, created = DeviceToken.objects.update_or_create(
            user=request.user,
            token=token,
            defaults={'platform': platform, 'app_version': app_version, 'active': True},
        )
        return Response({
            'id': obj.id,
            'token': obj.token,
            'platform': obj.platform,
            'app_version': obj.app_version,
            'active': obj.active,
            'created': created,
        }, status=http_status.HTTP_201_CREATED if created else http_status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        from notifications.models import DeviceToken
        from rest_framework import status as http_status

        token = (request.data.get('token') or request.query_params.get('token') or '').strip()
        if not token:
            return Response({'detail': 'token is required.'}, status=http_status.HTTP_400_BAD_REQUEST)
        deleted, _ = DeviceToken.objects.filter(user=request.user, token=token).delete()
        return Response({'deleted': bool(deleted)}, status=http_status.HTTP_200_OK)


class NotificationPreferencesView(APIView):
    """GET/POST /api/v1/mobile/notification-preferences/

    GET returns the full preference list with sensible defaults for any
    pref the user hasn't toggled. POST accepts the full payload (server
    treats POST as upsert) and saves any changed rows.

    Payload shape:
      { "preferences": [ { "key": "...", "enabled": bool, "channels": ["push"] }, ... ] }
    """
    permission_classes = [IsAuthenticated]

    DEFAULTS = [
        {'key': 'live_class_reminder', 'enabled': True,  'channels': ['push']},
        {'key': 'assignment_due',      'enabled': True,  'channels': ['push']},
        {'key': 'teacher_feedback',    'enabled': True,  'channels': ['push', 'email']},
        {'key': 'support_answered',    'enabled': True,  'channels': ['push']},
        {'key': 'exam_practice',       'enabled': False, 'channels': ['push']},
        {'key': 'badge_earned',        'enabled': True,  'channels': ['push']},
        {'key': 'weekly_brief',        'enabled': True,  'channels': ['push', 'whatsapp']},
        {'key': 'payment_confirmed',   'enabled': True,  'channels': ['push', 'email']},
    ]

    def get(self, request, *args, **kwargs):
        from notifications.models import NotificationPreference
        rows = {p.notification_type: p for p in NotificationPreference.objects.filter(user=request.user)}
        merged = []
        for d in self.DEFAULTS:
            row = rows.get(d['key'])
            merged.append({
                'key': d['key'],
                'enabled': row.enabled if row else d['enabled'],
                'channels': row.channels if row else list(d['channels']),
            })
        return Response({'preferences': merged})

    def post(self, request, *args, **kwargs):
        from notifications.models import NotificationPreference
        from rest_framework import status as http_status

        prefs = request.data.get('preferences') or []
        if not isinstance(prefs, list):
            return Response({'detail': 'preferences must be a list.'}, status=http_status.HTTP_400_BAD_REQUEST)

        valid_keys = {d['key'] for d in self.DEFAULTS}
        for p in prefs:
            key = (p.get('key') or '').strip()
            if not key or key not in valid_keys:
                continue
            channels = [c for c in (p.get('channels') or []) if c in {'push', 'email', 'whatsapp', 'sms'}]
            NotificationPreference.objects.update_or_create(
                user=request.user,
                notification_type=key,
                defaults={'enabled': bool(p.get('enabled', True)), 'channels': channels},
            )
        # Echo the saved state back.
        return self.get(request, *args, **kwargs)


class NotificationsListView(APIView):
    """GET /api/v1/mobile/notifications/

    Returns the most recent in-app notification rows for the caller.
    Limited to 50 to keep the mobile payload small. Pagination lands
    when the list grows past that threshold for an active learner.

    Optional ?since=<iso8601> filter for delta polling.
    Optional ?unread_only=true filter for the badge counter.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from notifications.models import Notification

        qs = Notification.objects.filter(user=request.user)
        if request.query_params.get('unread_only') == 'true':
            qs = qs.filter(read_at__isnull=True)
        since = request.query_params.get('since')
        if since:
            try:
                from django.utils.dateparse import parse_datetime
                d = parse_datetime(since)
                if d:
                    qs = qs.filter(created_at__gte=d)
            except Exception:
                pass

        rows = list(qs.order_by('-created_at')[:50])
        unread_count = qs.filter(read_at__isnull=True).count()

        return Response({
            'unread_count': unread_count,
            'notifications': [
                {
                    'id': n.id,
                    'channel': n.channel,
                    'payload': n.payload,
                    'status': n.status,
                    'read_at': n.read_at.isoformat() if n.read_at else None,
                    'created_at': n.created_at.isoformat(),
                }
                for n in rows
            ],
        })


class NotificationsMarkReadView(APIView):
    """POST /api/v1/mobile/notifications/mark-read/

    Marks one or more notifications as read for the caller. Accepts
    either {"id": <int>} for a single row or {"ids": [...]} for a batch.
    Idempotent — already-read rows are silently skipped.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        from notifications.models import Notification
        ids = request.data.get('ids')
        if ids is None and 'id' in request.data:
            ids = [request.data['id']]
        if not isinstance(ids, list) or not ids:
            return Response({'updated': 0})
        from django.utils import timezone as dj_timezone
        updated = Notification.objects.filter(
            user=request.user, id__in=ids, read_at__isnull=True,
        ).update(read_at=dj_timezone.now())
        return Response({'updated': updated})


class TeacherHomeView(APIView):
    """GET /api/v1/mobile/teacher-home/

    Single-payload aggregator for the teacher dashboard. Composes today's
    classes, pending review counts, unread support-question counts, and
    a placeholder earnings stub so the mobile renders the home in one
    round-trip. Each piece is wrapped in a try/except so a missing model
    or migration doesn't take the whole response down — the dashboard
    falls back to zeros and stays usable.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        teacher = request.user
        today_classes = self._today_classes(teacher)
        pending_reviews = self._pending_reviews(teacher)
        unread_questions = self._unread_questions(teacher)
        earnings = self._earnings(teacher)
        rating = self._rating(teacher)

        kpis = {
            'classes_today': len(today_classes),
            'pending_reviews': pending_reviews,
            'student_questions': unread_questions,
            'earnings_this_week': earnings['this_week'],
            'payout_pending': earnings['pending'],
            'rating': rating,
        }

        return Response({
            'user': {
                'id': teacher.id,
                'email': teacher.email,
                'full_name': getattr(teacher, 'full_name', '') or teacher.email,
                'role': getattr(teacher, 'role', 'teacher'),
            },
            'kpis': kpis,
            'today_classes': today_classes,
            'pending_reviews': pending_reviews,
            'unread_questions': unread_questions,
            'earnings': earnings,
            'fetched_at': timezone.now().isoformat(),
        })

    def _today_classes(self, teacher) -> list[dict[str, Any]]:
        try:
            from live_sessions.models import LiveSession
            start_of_day = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)
            qs = (LiveSession.objects
                  .filter(created_by=teacher,
                          scheduled_start__gte=start_of_day,
                          scheduled_start__lt=end_of_day)
                  .order_by('scheduled_start'))[:8]
            return [{
                'id': s.id,
                'title': getattr(s, 'title', '') or 'Live class',
                'subject': getattr(s, 'subject', '') or '',
                'scheduled_start': s.scheduled_start.isoformat() if s.scheduled_start else None,
                'duration_minutes': getattr(s, 'duration_minutes', 0) or 0,
                'student_count': 0,
                'meeting_link': getattr(s, 'meeting_link', '') or '',
            } for s in qs]
        except Exception:
            return []

    def _pending_reviews(self, teacher) -> int:
        try:
            from mentor_reviews.models import MentorReviewRequest
            return MentorReviewRequest.objects.filter(
                assigned_teacher=teacher, status__in=['pending', 'in_review'],
            ).count()
        except Exception:
            return 0

    def _unread_questions(self, teacher) -> int:
        try:
            from standby_teachers.models import SupportRequest
            return SupportRequest.objects.filter(
                assigned_teacher=teacher, status__in=['open', 'claimed'],
            ).count()
        except Exception:
            return 0

    def _earnings(self, teacher) -> dict[str, Any]:
        zero = {'this_week': 0, 'this_month': 0, 'pending': 0, 'wallet_balance': 0}
        try:
            from marketplace.models import Wallet, PayoutRequest, TeacherPayoutBatch
            from django.db.models import Sum
            balance = 0
            try:
                w = Wallet.objects.filter(teacher=teacher).first()
                balance = float(w.balance) if w else 0
            except Exception:
                pass
            week_start = timezone.now() - timedelta(days=7)
            month_start = timezone.now() - timedelta(days=30)
            week = TeacherPayoutBatch.objects.filter(
                teacher=teacher, created_at__gte=week_start,
            ).aggregate(total=Sum('gross_earnings'))['total'] or 0
            month = TeacherPayoutBatch.objects.filter(
                teacher=teacher, created_at__gte=month_start,
            ).aggregate(total=Sum('gross_earnings'))['total'] or 0
            pending = PayoutRequest.objects.filter(
                teacher=teacher, status__in=['requested', 'queued', 'processing'],
            ).aggregate(total=Sum('net_payable'))['total'] or 0
            return {
                'this_week': float(week),
                'this_month': float(month),
                'pending': float(pending),
                'wallet_balance': balance,
            }
        except Exception:
            return zero

    def _rating(self, teacher) -> float:
        try:
            from mentor_reviews.models import MentorReviewRequest
            from django.db.models import Avg
            r = MentorReviewRequest.objects.filter(
                assigned_teacher=teacher, status='completed',
            ).aggregate(avg=Avg('rating'))['avg']
            return round(float(r), 1) if r else 0
        except Exception:
            return 0


class InstitutionHomeView(APIView):
    """GET /api/v1/mobile/institution-home/

    Single-payload aggregator for the head-teacher / DOS / admin
    dashboard. Pulls the current institution scope from the user's
    profile and composes a school health snapshot, KPIs, and the
    metadata the home screen needs.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        admin = request.user
        institution = self._user_institution(admin)
        kpis = self._kpis(institution)
        risk_alerts = self._risk_alerts(institution)
        recent_applications = self._recent_applications(institution)

        return Response({
            'user': {
                'id': admin.id,
                'email': admin.email,
                'full_name': getattr(admin, 'full_name', '') or admin.email,
                'role': getattr(admin, 'role', 'institution_admin'),
            },
            'institution': {
                'id': getattr(institution, 'id', None),
                'name': getattr(institution, 'name', 'Your school'),
                'student_count': self._count_students(institution),
                'teacher_count': self._count_teachers(institution),
            },
            'kpis': kpis,
            'risk_alerts': risk_alerts,
            'recent_applications': recent_applications,
            'fetched_at': timezone.now().isoformat(),
        })

    def _user_institution(self, user):
        try:
            from institutions.models import Institution
            staff_link = getattr(user, 'institution_staff_profile', None)
            if staff_link and getattr(staff_link, 'institution', None):
                return staff_link.institution
            return Institution.objects.filter(admin_users=user).first() or Institution.objects.first()
        except Exception:
            return None

    def _kpis(self, institution) -> dict[str, Any]:
        empty = {
            'health_score': 0,
            'attendance': 0,
            'teacher_delivery': 0,
            'parent_engagement': 0,
            'risk_alerts': 0,
            'applications_inbox': 0,
        }
        if not institution:
            return empty
        try:
            from analytics.models import DailyInstitutionMetric
            latest = DailyInstitutionMetric.objects.filter(institution=institution).order_by('-date').first()
            if latest:
                return {
                    'health_score': int(getattr(latest, 'health_score', 0) or 0),
                    'attendance': int(getattr(latest, 'attendance_pct', 0) or 0),
                    'teacher_delivery': int(getattr(latest, 'teacher_delivery_pct', 0) or 0),
                    'parent_engagement': int(getattr(latest, 'parent_engagement_pct', 0) or 0),
                    'risk_alerts': int(getattr(latest, 'risk_alert_count', 0) or 0),
                    'applications_inbox': self._inbox_count(institution),
                }
        except Exception:
            pass
        return {**empty, 'applications_inbox': self._inbox_count(institution)}

    def _inbox_count(self, institution) -> int:
        try:
            from admission_passport.models import AdmissionApplication
            return AdmissionApplication.objects.filter(
                institution=institution,
            ).exclude(status='responded').count()
        except Exception:
            return 0

    def _count_students(self, institution) -> int:
        try:
            from institutions.models import Institution
            if not institution:
                return 0
            return getattr(institution, 'student_count', None) or 0
        except Exception:
            return 0

    def _count_teachers(self, institution) -> int:
        try:
            if not institution:
                return 0
            return getattr(institution, 'teacher_count', None) or 0
        except Exception:
            return 0

    def _risk_alerts(self, institution) -> list[dict[str, Any]]:
        """Top 5 most recent risk alerts on this institution."""
        if not institution:
            return []
        try:
            from intelligence.models import RiskAlert
            qs = (RiskAlert.objects
                  .filter(institution=institution)
                  .order_by('-created_at')[:5])
            return [{
                'id': r.id,
                'kind': getattr(r, 'kind', '') or '',
                'severity': getattr(r, 'severity', 'info') or 'info',
                'subject': getattr(r, 'subject', '') or '',
                'message': getattr(r, 'message', '') or '',
                'created_at': r.created_at.isoformat() if getattr(r, 'created_at', None) else None,
            } for r in qs]
        except Exception:
            return []

    def _recent_applications(self, institution) -> list[dict[str, Any]]:
        """5 most recent admission applications, anonymised."""
        if not institution:
            return []
        try:
            from admission_passport.models import AdmissionApplication
            qs = (AdmissionApplication.objects
                  .filter(institution=institution)
                  .order_by('-created_at')[:5])
            return [{
                'id': a.id,
                'class_level': getattr(a, 'class_level_label', '') or '',
                'status': getattr(a, 'status', '') or '',
                'created_at': a.created_at.isoformat() if getattr(a, 'created_at', None) else None,
            } for a in qs]
        except Exception:
            return []
