from rest_framework import serializers
from .models import PracticeLab, PracticeLabStep, PracticeLabAttempt, PracticeLabStepResponse


class PracticeLabStepSerializer(serializers.ModelSerializer):
    """Delivered to learners — does NOT include expected_answer (server-side grading only)."""
    class Meta:
        model = PracticeLabStep
        fields = ('id', 'order', 'step_type', 'prompt', 'hint', 'options', 'points')


class PracticeLabCardSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True, default=None)
    step_count = serializers.SerializerMethodField()

    class Meta:
        model = PracticeLab
        fields = (
            'id', 'slug', 'title', 'description', 'difficulty', 'estimated_minutes',
            'subject_name', 'class_level_name', 'is_premium', 'badge_label', 'step_count',
        )

    def get_step_count(self, obj):
        return obj.steps.count()


class PracticeLabDetailSerializer(PracticeLabCardSerializer):
    steps = PracticeLabStepSerializer(many=True, read_only=True)
    instructions = serializers.CharField(read_only=True)

    class Meta(PracticeLabCardSerializer.Meta):
        fields = PracticeLabCardSerializer.Meta.fields + ('instructions', 'pass_threshold_pct', 'steps')


class PracticeLabStepResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeLabStepResponse
        fields = ('id', 'step', 'response_text', 'selected_option', 'is_correct', 'feedback')
        read_only_fields = ('is_correct', 'feedback')


class PracticeLabAttemptSerializer(serializers.ModelSerializer):
    responses = PracticeLabStepResponseSerializer(many=True, read_only=True)
    lab = PracticeLabCardSerializer(read_only=True)

    class Meta:
        model = PracticeLabAttempt
        fields = (
            'id', 'lab', 'status', 'score_points', 'max_points', 'score_pct',
            'feedback', 'badge_earned', 'started_at', 'submitted_at', 'completed_at', 'responses',
        )
        read_only_fields = fields


class StepSubmissionSerializer(serializers.Serializer):
    step_id = serializers.UUIDField()
    response_text = serializers.CharField(required=False, allow_blank=True)
    selected_option = serializers.CharField(required=False, allow_blank=True)
