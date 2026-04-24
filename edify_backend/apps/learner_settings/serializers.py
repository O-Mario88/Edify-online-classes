from rest_framework import serializers
from .models import LearnerSettings


class LearnerSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearnerSettings
        fields = (
            'low_data_mode', 'prefer_audio_lessons', 'allow_offline_downloads',
            'whatsapp_optin', 'sms_optin', 'weekly_brief_delivery',
            'contact_phone', 'updated_at',
        )
        read_only_fields = ('updated_at',)
