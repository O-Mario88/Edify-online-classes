from rest_framework import serializers
from .models import CareerPathway, PathwaySuggestion


class CareerPathwaySerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerPathway
        fields = (
            'id', 'slug', 'title', 'tagline', 'description',
            'recommended_subjects', 'required_skills', 'typical_roles',
            'education_levels', 'related_industries', 'icon_emoji',
        )


class PathwaySuggestionSerializer(serializers.ModelSerializer):
    pathway = CareerPathwaySerializer(read_only=True)

    class Meta:
        model = PathwaySuggestion
        fields = ('id', 'pathway', 'confidence', 'reasoning', 'created_at')
