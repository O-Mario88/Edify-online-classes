from rest_framework import serializers
from .models import Resource
import os

class ResourceUploadSerializer(serializers.ModelSerializer):
    """
    Serializer for uploading resources with file validation.
    Supports video files for Vimeo upload and documents for storage.
    """
    
    ALLOWED_EXTENSIONS = {
        'video': ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'],
        'document': ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'],
        'image': ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
    MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
    
    file_type = serializers.SerializerMethodField()
    upload_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'category', 'file_path', 
            'file_type', 'upload_status', 'visibility', 'subject', 
            'class_level', 'topic', 'price', 'is_featured'
        ]
        read_only_fields = ['id', 'upload_status']
    
    def validate_file_path(self, value):
        """Validate file before upload"""
        if not value:
            raise serializers.ValidationError("File is required")
        
        # Check file size
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"File size {value.size / (1024*1024):.1f}MB exceeds maximum of 500MB"
            )
        
        # Check file extension
        filename = value.name
        ext = filename.split('.')[-1].lower()
        
        allowed_extensions = []
        for category in self.ALLOWED_EXTENSIONS.values():
            allowed_extensions.extend(category)
        
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type '.{ext}' not allowed. Allowed: {', '.join(allowed_extensions)}"
            )
        
        return value
    
    def get_file_type(self, obj):
        """Determine file type from extension"""
        if not obj.file_path:
            return None
        
        ext = obj.file_path.name.split('.')[-1].lower()
        for file_type, extensions in self.ALLOWED_EXTENSIONS.items():
            if ext in extensions:
                return file_type
        return 'unknown'
    
    def get_upload_status(self, obj):
        """Return current upload status"""
        return {
            'vimeo_status': obj.vimeo_upload_status,
            'vimeo_video_id': obj.vimeo_video_id,
            'external_url': obj.external_url
        }
    
    def create(self, validated_data):
        """Create resource and trigger async upload if video"""
        validated_data['uploaded_by'] = self.context['request'].user
        instance = super().create(validated_data)
        return instance
