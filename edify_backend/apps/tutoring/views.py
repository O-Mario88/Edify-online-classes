from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MatchRequest, PeerPointsLedger
from .serializers import MatchRequestSerializer, PeerPointsLedgerSerializer

class MatchRequestViewSet(viewsets.ModelViewSet):
    queryset = MatchRequest.objects.all()
    serializer_class = MatchRequestSerializer
    permission_classes = [IsAuthenticated]

class PeerPointsLedgerViewSet(viewsets.ModelViewSet):
    queryset = PeerPointsLedger.objects.all()
    serializer_class = PeerPointsLedgerSerializer
    permission_classes = [IsAuthenticated]

