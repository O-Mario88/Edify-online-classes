from rest_framework import serializers
from .models import Resource, SharedResourceLink

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'created_at']

class SharedResourceLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedResourceLink
        fields = '__all__'
        read_only_fields = ['added_by', 'added_at']
