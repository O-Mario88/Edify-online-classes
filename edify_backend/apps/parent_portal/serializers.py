from rest_framework import serializers
from .models import ParentStudentLink, WeeklySummary, RiskAlert

class ParentStudentLinkSerializer(serializers.ModelSerializer):
    student_data = serializers.SerializerMethodField()

    class Meta:
        model = ParentStudentLink
        fields = '__all__'

    def get_student_data(self, obj):
        user = obj.student_profile.user
        return {
            "id": str(user.id),
            "name": getattr(user, 'full_name', getattr(user, 'username', 'Student')),
            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.id}",
            "student_statuses": {
                "institutional": [{"class": "S4 A - Senior Four"}]
            },
            "preferences": {
                "level": "O-Level",
                "subjects": ["Mathematics", "Physics", "Chemistry"]
            }
        }

class WeeklySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklySummary
        fields = '__all__'

class RiskAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskAlert
        fields = '__all__'

