from rest_framework import serializers

from institutions.models import Institution
from .models import InstitutionDiscoveryProfile, InstitutionRecommendationScore


class RecommendationScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionRecommendationScore
        fields = (
            'maple_activeness_score',
            'growth_index',
            'verified_lesson_delivery',
            'assessment_activity',
            'attendance_tracking',
            'parent_reporting',
            'teacher_responsiveness',
            'peer_learning_activity',
            'student_engagement',
            'platform_consistency',
            'exam_readiness_strength',
            'standby_teachers_available',
            'explanation',
            'last_computed_at',
        )
        read_only_fields = fields


class DiscoveryProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionDiscoveryProfile
        fields = (
            'location_city', 'location_region', 'about', 'admission_blurb',
            'boarding_options', 'admission_status',
            'levels_offered', 'subjects_offered',
            'admission_contact_name', 'admission_contact_email',
            'admission_contact_phone', 'website', 'is_listed',
        )


class InstitutionCardSerializer(serializers.ModelSerializer):
    """Compact recommendation card payload."""
    logo = serializers.ImageField(read_only=True)
    profile = DiscoveryProfileSerializer(source='discovery_profile', read_only=True)
    score = RecommendationScoreSerializer(source='recommendation_score', read_only=True)
    match_reason = serializers.SerializerMethodField()

    class Meta:
        model = Institution
        fields = (
            'id', 'slug', 'name', 'logo', 'primary_color', 'secondary_color',
            'school_level', 'profile', 'score', 'match_reason',
        )

    def get_match_reason(self, obj):
        reason = getattr(obj, '_match_reason', None)
        return reason


class InstitutionDetailSerializer(InstitutionCardSerializer):
    """Full profile payload for the detail page. Includes contact-level fields."""

    class Meta(InstitutionCardSerializer.Meta):
        fields = InstitutionCardSerializer.Meta.fields
