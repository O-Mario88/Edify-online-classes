from rest_framework import serializers
from .models import StudentRiskAlert, InterventionPlan, InterventionAction

class StudentRiskAlertSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = StudentRiskAlert
        fields = ['id', 'student', 'student_name', 'institution', 'severity', 'flagged_reason', 'status', 'created_at']

class InterventionPlanSerializer(serializers.ModelSerializer):
    alert_details = StudentRiskAlertSerializer(source='alert', read_only=True)
    
    class Meta:
        model = InterventionPlan
        fields = ['id', 'alert', 'alert_details', 'assigned_teacher', 'target_outcome', 'status', 'deadline', 'created_at']

class InterventionActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterventionAction
        fields = '__all__'
