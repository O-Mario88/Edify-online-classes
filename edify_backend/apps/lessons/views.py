from rest_framework import viewsets, exceptions
from rest_framework.permissions import IsAuthenticated
from .models import Lesson, LessonNote, LessonRecording, LessonAttendance
from .serializers import LessonSerializer, LessonNoteSerializer, LessonRecordingSerializer, LessonAttendanceSerializer
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

