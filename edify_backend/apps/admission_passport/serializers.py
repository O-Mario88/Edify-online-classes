from rest_framework import serializers
from .models import AdmissionApplication, AdmissionStatusEvent


class AdmissionStatusEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionStatusEvent
        fields = ('id', 'from_status', 'to_status', 'actor_name', 'note', 'created_at')

    def get_actor_name(self, obj):
        if obj.actor:
            return getattr(obj.actor, 'full_name', obj.actor.email)
        return 'System'


class AdmissionApplicationSerializer(serializers.ModelSerializer):
    events = AdmissionStatusEventSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model = AdmissionApplication
        fields = (
            'id', 'student', 'student_name', 'parent', 'institution', 'institution_name',
            'class_level', 'entry_term', 'study_mode', 'current_school', 'academic_summary',
            'share_passport', 'shared_passport_token',
            'status', 'submitted_at', 'reviewed_at', 'created_at', 'events',
        )
        read_only_fields = (
            'student', 'student_name', 'institution_name', 'shared_passport_token',
            'submitted_at', 'reviewed_at', 'created_at', 'events',
        )

    def get_student_name(self, obj):
        return getattr(obj.student, 'full_name', obj.student.email)


class StatusChangeSerializer(serializers.Serializer):
    to_status = serializers.ChoiceField(choices=[c[0] for c in AdmissionApplication.STATUS_CHOICES])
    note = serializers.CharField(required=False, allow_blank=True)
