from rest_framework import viewsets, exceptions
from rest_framework.permissions import IsAuthenticated
from .models import Lesson, LessonNote, LessonRecording, LessonAttendance, LessonInstance, LessonVerificationRecord
from .serializers import LessonSerializer, LessonNoteSerializer, LessonRecordingSerializer, LessonAttendanceSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from institutions.models import InstitutionMembership
from django.db.models import Q

class TenantFilterMixin:
    def get_user_institutions(self):
        return InstitutionMembership.objects.filter(
            user=self.request.user, status='active'
        ).values_list('institution_id', flat=True)

class LessonViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['parent_class', 'topic', 'access_mode']

    def get_queryset(self):
        inst_ids = self.get_user_institutions()
        return Lesson.objects.select_related('parent_class', 'topic').filter(
            Q(parent_class__institution_id__in=inst_ids) | 
            Q(parent_class__visibility='public')
        ).distinct()
        
    def perform_create(self, serializer):
        parent_class = serializer.validated_data.get('parent_class')
        if parent_class and parent_class.institution_id not in self.get_user_institutions():
            raise exceptions.PermissionDenied("You cannot create lessons for an institution you don't belong to.")
        serializer.save()

class LessonNoteViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = LessonNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        inst_ids = self.get_user_institutions()
        return LessonNote.objects.select_related('lesson').filter(
            Q(lesson__parent_class__institution_id__in=inst_ids) |
            Q(lesson__parent_class__visibility='public')
        ).distinct()

class LessonRecordingViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = LessonRecordingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        inst_ids = self.get_user_institutions()
        return LessonRecording.objects.select_related('lesson').filter(
            Q(lesson__parent_class__institution_id__in=inst_ids) |
            Q(lesson__parent_class__visibility='public')
        ).distinct()

class LessonAttendanceViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = LessonAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        inst_ids = self.get_user_institutions()
        return LessonAttendance.objects.select_related('lesson', 'student').filter(
            lesson__parent_class__institution_id__in=inst_ids
        )


class LessonInstanceViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = LessonInstance.objects.select_related('timetable_slot', 'verification_record').all()
    # Assuming user defined a serializer or we can just bypass for standard actions
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        instance = self.get_object()
        record, _ = LessonVerificationRecord.objects.get_or_create(lesson_instance=instance)
        
        if record.status not in ['scheduled', 'reminder_sent']:
            return Response({"error": "Lesson already advanced beyond scheduled phase."}, status=status.HTTP_400_BAD_REQUEST)
            
        record.acknowledged_at = timezone.now()
        record.status = 'acknowledged'
        record.save()
        
        # Also mark push notification record if attached via request payload
        from notifications.models import TeacherLessonNotification
        notification_id = request.data.get('notification_id')
        if notification_id:
            try:
                notif = TeacherLessonNotification.objects.get(id=notification_id, teacher=request.user)
                notif.is_acknowledged = True
                notif.acknowledged_at = timezone.now()
                notif.save()
            except TeacherLessonNotification.DoesNotExist:
                pass
                
        return Response({"status": "acknowledged", "timestamp": record.acknowledged_at})

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        instance = self.get_object()
        record, _ = LessonVerificationRecord.objects.get_or_create(lesson_instance=instance)
        
        # Anti-abuse constraint: Can only start close to time or after acknowledged
        if record.status in ['started', 'completed']:
            return Response({"error": "Lesson already started or completed."}, status=status.HTTP_400_BAD_REQUEST)
            
        record.started_at = timezone.now()
        record.status = 'started'
        record.save()
        return Response({"status": "started", "timestamp": record.started_at})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Enforce Assignment/Project continuity here.
        A lesson *cannot* cleanly move from 'started' to 'completed' without linked homework.
        """
        instance = self.get_object()
        assignment_id = request.data.get('assignment_id')
        
        if not assignment_id:
            # We strictly enforce the institutional linkage
            return Response({
                "error": "Mandatory Post-Lesson Enforcement: You must create or attach an Assignment/Project to formally close this lesson.",
                "code": "MISSING_FOLLOWUP_TASK"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        from assessments.models import Assessment
        try:
            assignment = Assessment.objects.get(id=assignment_id)
        except Assessment.DoesNotExist:
            return Response({"error": "Invalid assignment configuration."}, status=status.HTTP_400_BAD_REQUEST)

        record, _ = LessonVerificationRecord.objects.get_or_create(lesson_instance=instance)
        if record.status != 'started':
            return Response({"error": "You must physically 'Start' a lesson before resolving it to 'Completed'."}, status=status.HTTP_400_BAD_REQUEST)
            
        record.completed_at = timezone.now()
        record.status = 'completed'
        record.linked_assignment = assignment
        record.save()
        
        return Response({"status": "completed", "verified": True})
