from rest_framework import viewsets, exceptions, serializers as drf_serializers
from rest_framework.permissions import IsAuthenticated
from pilot_payments.permissions import IsActiveSubscription
from .models import Lesson, LessonNote, LessonRecording, LessonAttendance, LessonInstance, LessonVerificationRecord, TeacherNote
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
    permission_classes = [IsAuthenticated, IsActiveSubscription]
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
    permission_classes = [IsAuthenticated, IsActiveSubscription]

    def get_queryset(self):
        inst_ids = self.get_user_institutions()
        return LessonNote.objects.select_related('lesson').filter(
            Q(lesson__parent_class__institution_id__in=inst_ids) |
            Q(lesson__parent_class__visibility='public')
        ).distinct()

class LessonRecordingViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = LessonRecordingSerializer
    permission_classes = [IsAuthenticated, IsActiveSubscription]

    def get_queryset(self):
        inst_ids = self.get_user_institutions()
        return LessonRecording.objects.select_related('lesson').filter(
            Q(lesson__parent_class__institution_id__in=inst_ids) |
            Q(lesson__parent_class__visibility='public')
        ).distinct()

class LessonAttendanceViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = LessonAttendanceSerializer
    permission_classes = [IsAuthenticated, IsActiveSubscription]

    def get_queryset(self):
        inst_ids = self.get_user_institutions()
        return LessonAttendance.objects.select_related('lesson', 'student').filter(
            lesson__parent_class__institution_id__in=inst_ids
        )


class LessonInstanceViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = LessonInstance.objects.select_related('timetable_slot', 'verification_record').all()
    # Assuming user defined a serializer or we can just bypass for standard actions
    permission_classes = [IsAuthenticated, IsActiveSubscription]

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


class TeacherNoteSerializer(drf_serializers.ModelSerializer):
    teacher_name = drf_serializers.CharField(source='teacher.full_name', read_only=True)

    class Meta:
        model = TeacherNote
        fields = ('id', 'teacher', 'teacher_name', 'class_scope', 'title', 'body', 'photo_url', 'created_at')
        read_only_fields = ('id', 'teacher', 'teacher_name', 'created_at')


class TeacherNoteViewSet(viewsets.ModelViewSet):
    """POST /api/v1/lessons/teacher-notes/  → publish a free-form note
    GET  /api/v1/lessons/teacher-notes/  → list notes the caller can see

    Teachers see notes they authored. Students see notes addressed to
    classes they're enrolled in plus the notes their teachers
    published with `class_scope=null` (visible to every student that
    teacher teaches).
    """
    serializer_class = TeacherNoteSerializer
    permission_classes = [IsAuthenticated, IsActiveSubscription]

    def get_queryset(self):
        from classes.models import ClassEnrollment
        user = self.request.user
        role = (getattr(user, 'role', '') or '').lower()
        if 'teacher' in role or user.is_staff:
            return TeacherNote.objects.filter(teacher=user).select_related('teacher', 'class_scope')
        # Students: notes scoped to their enrolled classes OR notes
        # from those classes' teachers with no class_scope set.
        enrolled_class_ids = ClassEnrollment.objects.filter(
            student=user, status='active',
        ).values_list('enrolled_class_id', flat=True)
        teacher_ids = Lesson.objects.filter(
            parent_class_id__in=enrolled_class_ids,
        ).values_list('parent_class__teacher_id', flat=True).distinct()
        return TeacherNote.objects.filter(
            Q(class_scope_id__in=enrolled_class_ids)
            | Q(class_scope__isnull=True, teacher_id__in=teacher_ids)
        ).select_related('teacher', 'class_scope').order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        role = (getattr(user, 'role', '') or '').lower()
        if not (user.is_staff or 'teacher' in role):
            raise exceptions.PermissionDenied('Only teachers can publish notes.')
        serializer.save(teacher=user)
