from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ParentStudentLink, WeeklySummary, RiskAlert
from .serializers import ParentStudentLinkSerializer, WeeklySummarySerializer, RiskAlertSerializer

class ParentStudentLinkViewSet(viewsets.ModelViewSet):
    queryset = ParentStudentLink.objects.all()
    serializer_class = ParentStudentLinkSerializer
    permission_classes = [IsAuthenticated]

class WeeklySummaryViewSet(viewsets.ModelViewSet):
    queryset = WeeklySummary.objects.all()
    serializer_class = WeeklySummarySerializer
    permission_classes = [IsAuthenticated]

class RiskAlertViewSet(viewsets.ModelViewSet):
    queryset = RiskAlert.objects.all()
    serializer_class = RiskAlertSerializer
    permission_classes = [IsAuthenticated]

