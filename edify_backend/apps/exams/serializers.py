from rest_framework import serializers
from .models import ExamCenter, CandidateRegistration, SubjectSelection, BoardSubmissionBatch

class ExamCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamCenter
        fields = '__all__'

class CandidateRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateRegistration
        fields = '__all__'

class SubjectSelectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectSelection
        fields = '__all__'

class BoardSubmissionBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardSubmissionBatch
        fields = '__all__'

