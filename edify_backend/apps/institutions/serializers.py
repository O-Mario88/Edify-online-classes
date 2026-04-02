from rest_framework import serializers
from .models import Institution, InstitutionMembership

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'slug', 'logo', 'primary_color', 'secondary_color',
            'country_code', 'curriculum_track', 'subscription_plan', 'is_active', 'created_at'
        ]

class InstitutionMembershipSerializer(serializers.ModelSerializer):
    institution_detail = InstitutionSerializer(source='institution', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = InstitutionMembership
        fields = [
            'id', 'institution', 'institution_detail', 'user', 'user_email', 'user_name',
            'role', 'status', 'joined_at'
        ]
        read_only_fields = ['joined_at', 'status']

class BulkInviteSerializer(serializers.Serializer):
    emails = serializers.ListField(
        child=serializers.EmailField(),
        allow_empty=False
    )
    role = serializers.ChoiceField(choices=InstitutionMembership.ROLE_CHOICES)
