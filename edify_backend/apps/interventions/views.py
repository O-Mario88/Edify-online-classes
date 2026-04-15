from rest_framework import viewsets, permissions
from .models import StudentRiskAlert, InterventionPlan, InterventionAction
from .serializers import StudentRiskAlertSerializer, InterventionPlanSerializer, InterventionActionSerializer

class StudentRiskAlertViewSet(viewsets.ModelViewSet):
    queryset = StudentRiskAlert.objects.all().order_by('-created_at')
    serializer_class = StudentRiskAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return self.queryset.filter(student=user)
        # For teachers/admins, return alerts tied to their institution
        if hasattr(user, 'profile') and user.profile.institution:
            return self.queryset.filter(institution=user.profile.institution)
        return self.queryset.none()

class InterventionPlanViewSet(viewsets.ModelViewSet):
    queryset = InterventionPlan.objects.all().order_by('-created_at')
    serializer_class = InterventionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return self.queryset.filter(assigned_teacher=user)
        elif user.role == 'student':
            return self.queryset.filter(alert__student=user)
        # Add admin logic here if needed
        return self.queryset

class InterventionActionViewSet(viewsets.ModelViewSet):
    queryset = InterventionAction.objects.all().order_by('-performed_at')
    serializer_class = InterventionActionSerializer
    permission_classes = [permissions.IsAuthenticated]
