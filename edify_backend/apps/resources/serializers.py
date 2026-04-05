from rest_framework import serializers
from .models import Resource, SharedResourceLink

class ResourceSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'author', 'author_name', 'category', 
            'price', 'rating', 'is_featured', 'file_path', 'external_url', 
            'visibility', 'subject', 'class_level', 'topic', 'uploaded_by', 
            'owner_type', 'owner_institution', 'created_at', 'vimeo_video_id'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'author_name']
    
    def get_author_name(self, obj):
        """Return author field or uploaded_by user's name if author not specified"""
        if obj.author:
            return obj.author
        return obj.uploaded_by.get_full_name() or obj.uploaded_by.email

class SharedResourceLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedResourceLink
        fields = '__all__'
        read_only_fields = ['added_by', 'added_at']
