from rest_framework import serializers
from .models import ExamSimulation, ExamSimulationAttempt, MistakeNotebookEntry


class ExamCardSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True, default=None)
    question_count = serializers.IntegerField(source='questions.count', read_only=True)

    class Meta:
        model = ExamSimulation
        fields = (
            'id', 'slug', 'title', 'exam_track', 'subject_name', 'class_level_name',
            'duration_minutes', 'is_premium', 'question_count',
        )


class DeliveredQuestionSerializer(serializers.Serializer):
    """Question delivered to a learner mid-attempt — no correct_answer."""
    id = serializers.IntegerField()
    type = serializers.CharField()
    content = serializers.CharField()
    options = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    marks = serializers.DecimalField(max_digits=5, decimal_places=2)
    order = serializers.IntegerField()


class AttemptSerializer(serializers.ModelSerializer):
    exam = ExamCardSerializer(read_only=True)

    class Meta:
        model = ExamSimulationAttempt
        fields = (
            'id', 'exam', 'status', 'score_points', 'max_points', 'score_pct',
            'readiness_band', 'started_at', 'submitted_at',
        )


class SubmitSerializer(serializers.Serializer):
    answers = serializers.DictField(child=serializers.CharField(allow_blank=True))


class MistakeEntrySerializer(serializers.ModelSerializer):
    question_content = serializers.CharField(source='question.content', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    topic_name = serializers.CharField(source='topic.name', read_only=True, default=None)

    class Meta:
        model = MistakeNotebookEntry
        fields = (
            'id', 'question_content', 'subject_name', 'topic_name',
            'learner_answer', 'correct_answer', 'explanation',
            'retry_status', 'created_at',
        )
