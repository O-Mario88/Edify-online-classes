from rest_framework import serializers
from .models import MatchRequest, PeerPointsLedger

class MatchRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchRequest
        fields = '__all__'

class PeerPointsLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeerPointsLedger
        fields = '__all__'

