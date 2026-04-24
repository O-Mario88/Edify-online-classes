from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import LearnerSettings
from .serializers import LearnerSettingsSerializer


class LearnerSettingsView(APIView):
    """GET/PATCH a learner's settings. Auto-creates on first fetch."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        obj, _ = LearnerSettings.objects.get_or_create(user=request.user)
        return Response(LearnerSettingsSerializer(obj).data)

    def patch(self, request):
        obj, _ = LearnerSettings.objects.get_or_create(user=request.user)
        s = LearnerSettingsSerializer(obj, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)
