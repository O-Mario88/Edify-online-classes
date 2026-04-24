from rest_framework import serializers
from .models import TeacherAvailability, SupportRequest, SupportSession


class TeacherAvailabilitySerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    day_label = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TeacherAvailability
        fields = (
            'id', 'teacher', 'teacher_name', 'subject', 'subject_name',
            'day_of_week', 'day_label', 'start_time', 'end_time',
            'mode', 'is_active',
        )
        read_only_fields = ('teacher', 'teacher_name')

    def get_teacher_name(self, obj):
        return getattr(obj.teacher, 'full_name', obj.teacher.email)


class SupportRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)

    class Meta:
        model = SupportRequest
        fields = (
            'id', 'student', 'student_name', 'assigned_teacher', 'teacher_name',
            'subject', 'subject_name', 'topic', 'question', 'request_type',
            'priority', 'status', 'resolution_note',
            'created_at', 'assigned_at', 'resolved_at',
        )
        read_only_fields = (
            'student', 'student_name', 'assigned_teacher', 'teacher_name',
            'status', 'assigned_at', 'resolved_at', 'created_at', 'resolution_note',
        )

    def get_student_name(self, obj):
        return getattr(obj.student, 'full_name', obj.student.email)

    def get_teacher_name(self, obj):
        if obj.assigned_teacher:
            return getattr(obj.assigned_teacher, 'full_name', obj.assigned_teacher.email)
        return None


class ResolveSerializer(serializers.Serializer):
    resolution_note = serializers.CharField(required=False, allow_blank=True)


class SupportSessionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)

    class Meta:
        model = SupportSession
        fields = (
            'id', 'student', 'student_name', 'teacher', 'teacher_name',
            'subject', 'subject_name', 'topic',
            'scheduled_at', 'duration_minutes', 'meeting_link', 'status',
            'related_request', 'created_at',
        )

    def get_student_name(self, obj):
        return getattr(obj.student, 'full_name', obj.student.email)

    def get_teacher_name(self, obj):
        return getattr(obj.teacher, 'full_name', obj.teacher.email)
