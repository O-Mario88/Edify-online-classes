from rest_framework import serializers
from .models import Cohort, CohortEnrollment


class CohortCardSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True, default=None)
    seat_count = serializers.SerializerMethodField()

    class Meta:
        model = Cohort
        fields = (
            'id', 'slug', 'title', 'tagline', 'description',
            'teacher_name', 'subject_name', 'class_level_name', 'exam_track',
            'start_date', 'end_date', 'max_seats', 'seat_count',
            'is_premium', 'cover_image',
        )

    def get_teacher_name(self, obj):
        if obj.teacher_lead:
            return getattr(obj.teacher_lead, 'full_name', obj.teacher_lead.email)
        return None

    def get_seat_count(self, obj):
        return obj.enrollments.filter(status='active').count()


class CohortDetailSerializer(CohortCardSerializer):
    weekly_plan = serializers.JSONField(read_only=True)

    class Meta(CohortCardSerializer.Meta):
        fields = CohortCardSerializer.Meta.fields + ('weekly_plan',)


class CohortEnrollmentSerializer(serializers.ModelSerializer):
    cohort = CohortCardSerializer(read_only=True)

    class Meta:
        model = CohortEnrollment
        fields = ('id', 'cohort', 'status', 'progress_pct', 'enrolled_at', 'completed_at')
        read_only_fields = fields
