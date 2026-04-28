from rest_framework import serializers

from assessments.models import Question
from .models import DiagnosticSession


class DiagnosticQuestionSerializer(serializers.ModelSerializer):
    """Question as delivered to the diagnostic frontend.

    Critically does NOT include correct_answer — grading happens server-side.
    """
    subject_name = serializers.SerializerMethodField()
    topic_name = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'type', 'content', 'options', 'marks', 'subject_name', 'topic_name')

    def get_subject_name(self, obj):
        topic = getattr(obj.assessment, 'topic', None)
        if topic and topic.subject:
            return topic.subject.name
        return None

    def get_topic_name(self, obj):
        topic = getattr(obj.assessment, 'topic', None)
        return topic.name if topic else None


class DiagnosticSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosticSession
        fields = (
            'id', 'state', 'class_level', 'total_questions', 'correct_count',
            'score_pct', 'per_subject_scores', 'per_topic_scores', 'report_data',
            'started_at', 'submitted_at',
        )
        read_only_fields = fields


class DiagnosticStartSerializer(serializers.Serializer):
    class_level_id = serializers.IntegerField(required=False, allow_null=True)


class DiagnosticSubmitSerializer(serializers.Serializer):
    # answers maps question_id (string or int) → submitted answer string.
    answers = serializers.DictField(child=serializers.CharField(allow_blank=True), required=True)
