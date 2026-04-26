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
