from rest_framework import serializers
from .models import MentorReviewRequest, MentorReviewResponse


class MentorReviewResponseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = MentorReviewResponse
        fields = ('id', 'teacher', 'teacher_name', 'feedback', 'recommended_next_steps', 'attachments', 'completed_at')
        read_only_fields = ('teacher', 'teacher_name', 'completed_at')

    def get_teacher_name(self, obj):
        return getattr(obj.teacher, 'full_name', obj.teacher.email)


class MentorReviewRequestSerializer(serializers.ModelSerializer):
    responses = MentorReviewResponseSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = MentorReviewRequest
        fields = (
            'id', 'student', 'student_name', 'teacher', 'subject', 'request_type',
            'related_submission', 'message', 'priority', 'status',
            'created_at', 'completed_at', 'responses',
        )
        read_only_fields = ('student', 'student_name', 'teacher', 'status', 'created_at', 'completed_at', 'responses')

    def get_student_name(self, obj):
        return getattr(obj.student, 'full_name', obj.student.email)


class RespondSerializer(serializers.Serializer):
    feedback = serializers.CharField()
    recommended_next_steps = serializers.CharField(required=False, allow_blank=True)
    attachments = serializers.ListField(child=serializers.URLField(), required=False)
