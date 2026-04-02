from rest_framework import serializers
from .models import AssessmentWindow, Assessment, Question, Submission

class AssessmentWindowSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentWindow
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'type', 'content', 'marks', 'order', 'options']
        # Note: 'correct_answer' is omitted by default so students don't see it

class QuestionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Assessment
        fields = '__all__'

class AssessmentAdminSerializer(serializers.ModelSerializer):
    questions = QuestionAdminSerializer(many=True, read_only=True)
    
    class Meta:
        model = Assessment
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ['total_score', 'status', 'submitted_at']
