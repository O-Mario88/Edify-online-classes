"""Standby Teacher Network endpoints.

Learners:
  GET  /available/                       — list teacher availability windows
  POST /support-requests/                — post a question
  GET  /support-requests/my/             — my requests
  POST /sessions/                        — create a session (usually after accept)

Teachers / reviewers:
  GET  /support-requests/teacher-queue/  — open + assigned-to-me
  POST /support-requests/<id>/accept/
  POST /support-requests/<id>/resolve/
"""
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from notifications.utils import notify
from .models import TeacherAvailability, SupportRequest, SupportSession
from .serializers import (
    TeacherAvailabilitySerializer,
    SupportRequestSerializer,
    SupportSessionSerializer,
    ResolveSerializer,
)


TEACHER_ROLES = ('teacher', 'independent_teacher', 'institution_teacher', 'institution_admin', 'platform_admin')


class TeacherAvailabilityViewSet(viewsets.ModelViewSet):
    """Teachers own their availability rows. Students see all active rows."""
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherAvailabilitySerializer
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')
        if role in TEACHER_ROLES:
            # Teachers managing their own rows OR viewing all for context.
            return TeacherAvailability.objects.all().select_related('teacher', 'subject')
        return TeacherAvailability.objects.filter(is_active=True).select_related('teacher', 'subject')

    def perform_create(self, serializer):
        if getattr(self.request.user, 'role', '') not in TEACHER_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only teachers can publish availability.')
        serializer.save(teacher=self.request.user)

    @action(detail=False, methods=['get'], url_path='available')
    def available(self, request):
        """What learners see — only active rows, any teacher."""
        qs = TeacherAvailability.objects.filter(is_active=True).select_related('teacher', 'subject')
        subject_id = request.query_params.get('subject')
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        return Response(TeacherAvailabilitySerializer(qs, many=True).data)


class SupportRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportRequestSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')
        if role in TEACHER_ROLES:
            # Teachers can reach any request (the queue action filters); this
            # lets accept/resolve return 403 instead of 404 when another
            # teacher is already assigned.
            return SupportRequest.objects.all().select_related('student', 'subject', 'assigned_teacher')
        return SupportRequest.objects.filter(student=user).select_related('subject', 'assigned_teacher')

    def _queue_queryset(self, user):
        from django.db.models import Q
        return SupportRequest.objects.filter(
            Q(assigned_teacher=user) | Q(status='open', assigned_teacher__isnull=True)
        ).distinct().select_related('student', 'subject', 'assigned_teacher')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'], url_path='my')
    def my_requests(self, request):
        qs = SupportRequest.objects.filter(student=request.user).select_related('subject', 'assigned_teacher')
        return Response(SupportRequestSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='teacher-queue')
    def teacher_queue(self, request):
        if getattr(request.user, 'role', '') not in TEACHER_ROLES:
            return Response({'detail': 'Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(SupportRequestSerializer(self._queue_queryset(request.user), many=True).data)

    @action(detail=True, methods=['post'], url_path='accept')
    def accept(self, request, pk=None):
        if getattr(request.user, 'role', '') not in TEACHER_ROLES:
            return Response({'detail': 'Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)
        req = self.get_object()
        if req.status not in ('open',):
            return Response({'detail': f'Cannot accept from status "{req.status}".'}, status=status.HTTP_400_BAD_REQUEST)
        req.assigned_teacher = request.user
        req.assigned_at = timezone.now()
        req.status = 'assigned'
        req.save()
        notify(
            user=req.student,
            title='A teacher picked up your question',
            message=f'{request.user.full_name} is on it. You\'ll get a follow-up here when they respond.',
            kind='standby_assigned',
            link='/standby-teachers',
        )
        return Response(SupportRequestSerializer(req).data)

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        if getattr(request.user, 'role', '') not in TEACHER_ROLES:
            return Response({'detail': 'Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)
        req = self.get_object()
        if req.assigned_teacher_id and req.assigned_teacher_id != request.user.id and getattr(request.user, 'role', '') != 'platform_admin':
            return Response({'detail': 'Only the assigned teacher can resolve.'}, status=status.HTTP_403_FORBIDDEN)
        s = ResolveSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        req.resolution_note = s.validated_data.get('resolution_note', '')
        req.status = 'resolved'
        req.resolved_at = timezone.now()
        if not req.assigned_teacher_id:
            req.assigned_teacher = request.user
        req.save()
        notify(
            user=req.student,
            title='Your question has been answered',
            message=req.resolution_note[:200] if req.resolution_note else 'Open the Standby Teacher view to read the response.',
            kind='standby_resolved',
            link='/standby-teachers',
        )
        return Response(SupportRequestSerializer(req).data)


class SupportSessionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportSessionSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')
        if role in TEACHER_ROLES:
            from django.db.models import Q
            return SupportSession.objects.filter(
                Q(teacher=user) | Q(student=user)
            ).distinct().select_related('student', 'teacher', 'subject')
        return SupportSession.objects.filter(student=user).select_related('student', 'teacher', 'subject')

    def perform_create(self, serializer):
        # Either the teacher creating a session with the student, or the
        # student booking into a published availability. We accept both.
        serializer.save()
