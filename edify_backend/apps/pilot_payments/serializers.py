from rest_framework import serializers
from .models import UpgradeRequest, PremiumAccess


class UpgradeRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()

    class Meta:
        model = UpgradeRequest
        fields = (
            'id', 'requester', 'requester_name', 'plan', 'contact_phone',
            'preferred_method', 'note', 'status', 'admin_note',
            'reviewed_at', 'created_at',
        )
        read_only_fields = ('requester', 'requester_name', 'status', 'admin_note', 'reviewed_at', 'created_at')

    def get_requester_name(self, obj):
        return getattr(obj.requester, 'full_name', obj.requester.email)


class PremiumAccessSerializer(serializers.ModelSerializer):
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = PremiumAccess
        fields = ('id', 'plan', 'granted_at', 'expires_at', 'is_active')

    def get_is_active(self, obj):
        return obj.is_active_now()


class ReviewSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['approved', 'rejected'])
    admin_note = serializers.CharField(required=False, allow_blank=True)
    grant_months = serializers.IntegerField(required=False, min_value=1, max_value=24, default=3)
