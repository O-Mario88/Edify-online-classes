"""
Serializers for the Content Management System.
Handles upload validation, metadata normalization, and API response shaping.
"""
import os
import mimetypes
from rest_framework import serializers
from django.utils.text import slugify
from .content_models import (
    ContentItem, ContentVersion, ContentTag, ContentItemTag,
    ContentVisibilityRule, ContentAuditLog, ContentEngagement,
    ContentAssignment, ContentRecommendation, ContentAccessSession,
)


class ContentTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentTag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug']

    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class ContentEngagementSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    remaining_percentage = serializers.SerializerMethodField()

    class Meta:
        model = ContentEngagement
        fields = [
            'id', 'student', 'student_name', 'content_item',
            'status', 'view_count', 'active_time_seconds',
            'completion_percentage', 'remaining_percentage',
            'last_position', 'is_completed',
            'first_accessed', 'last_accessed', 'completed_at',
        ]
        read_only_fields = ['id', 'first_accessed', 'last_accessed', 'completed_at', 'status']

    def get_remaining_percentage(self, obj):
        return max(0, 100 - float(obj.completion_percentage))


class ContentAssignmentSerializer(serializers.ModelSerializer):
    """Read serializer for content assignments."""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True, default=None)
    content_title = serializers.CharField(source='content_item.title', read_only=True)
    content_type = serializers.CharField(source='content_item.content_type', read_only=True)
    content_thumbnail = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    topic_name = serializers.CharField(source='topic.name', read_only=True, default=None)
    # Inline engagement data for the assigned student
    engagement = serializers.SerializerMethodField()

    class Meta:
        model = ContentAssignment
        fields = [
            'id', 'content_item', 'content_title', 'content_type', 'content_thumbnail',
            'student', 'student_name',
            'assigned_by', 'assigned_by_name', 'assigned_by_type',
            'assignment_type', 'priority', 'note',
            'target_class', 'subject', 'subject_name', 'topic', 'topic_name', 'lesson',
            'due_date', 'is_active',
            'engagement',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_content_thumbnail(self, obj):
        if obj.content_item.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.content_item.thumbnail.url)
            return obj.content_item.thumbnail.url
        return None

    def get_engagement(self, obj):
        try:
            eng = ContentEngagement.objects.get(
                student=obj.student, content_item=obj.content_item
            )
            return {
                'status': eng.status,
                'completion_percentage': float(eng.completion_percentage),
                'remaining_percentage': eng.remaining_percentage,
                'active_time_seconds': eng.active_time_seconds,
                'last_position': eng.last_position,
                'first_accessed': eng.first_accessed,
                'last_accessed': eng.last_accessed,
                'is_completed': eng.is_completed,
            }
        except ContentEngagement.DoesNotExist:
            return {
                'status': 'not_started',
                'completion_percentage': 0,
                'remaining_percentage': 100,
                'active_time_seconds': 0,
                'last_position': 0,
                'first_accessed': None,
                'last_accessed': None,
                'is_completed': False,
            }


class ContentAssignmentCreateSerializer(serializers.Serializer):
    """Handles bulk assignment creation (one content → many students)."""
    content_item_id = serializers.UUIDField()
    student_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    assignment_type = serializers.ChoiceField(
        choices=['required', 'recommended'], default='required'
    )
    priority = serializers.ChoiceField(
        choices=['low', 'medium', 'high', 'urgent'], default='medium'
    )
    note = serializers.CharField(required=False, default='', allow_blank=True)
    target_class_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    subject_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    topic_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    lesson_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    due_date = serializers.DateTimeField(required=False, allow_null=True, default=None)


class ContentRecommendationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    content_title = serializers.CharField(source='content_item.title', read_only=True)
    content_type = serializers.CharField(source='content_item.content_type', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    topic_name = serializers.CharField(source='topic.name', read_only=True, default=None)
    engagement = serializers.SerializerMethodField()

    class Meta:
        model = ContentRecommendation
        fields = [
            'id', 'student', 'student_name',
            'content_item', 'content_title', 'content_type',
            'source', 'reason', 'confidence_score',
            'subject', 'subject_name', 'topic', 'topic_name',
            'status',
            'engagement',
            'created_at', 'expires_at', 'dismissed_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_engagement(self, obj):
        try:
            eng = ContentEngagement.objects.get(
                student=obj.student, content_item=obj.content_item
            )
            return {
                'status': eng.status,
                'completion_percentage': float(eng.completion_percentage),
                'remaining_percentage': eng.remaining_percentage,
                'active_time_seconds': eng.active_time_seconds,
                'is_completed': eng.is_completed,
            }
        except ContentEngagement.DoesNotExist:
            return {
                'status': 'not_started',
                'completion_percentage': 0,
                'remaining_percentage': 100,
                'active_time_seconds': 0,
                'is_completed': False,
            }


class ContentAccessSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentAccessSession
        fields = [
            'id', 'student', 'content_item', 'engagement',
            'session_started_at', 'session_ended_at', 'active_seconds',
            'interaction_type', 'client_type',
            'progress_at_start', 'progress_at_end', 'position_at_end',
        ]
        read_only_fields = ['id', 'session_started_at']


class ContentVersionSerializer(serializers.ModelSerializer):
    replaced_by_name = serializers.CharField(source='replaced_by.full_name', read_only=True)

    class Meta:
        model = ContentVersion
        fields = [
            'id', 'content_item', 'version_number', 'file', 'file_size',
            'mime_type', 'change_note', 'replaced_by', 'replaced_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ContentAuditLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.full_name', read_only=True)

    class Meta:
        model = ContentAuditLog
        fields = [
            'id', 'content_item', 'action', 'performed_by',
            'performed_by_name', 'old_value', 'new_value', 'notes', 'timestamp',
        ]
        read_only_fields = ['id', 'timestamp']


class ContentItemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    uploader_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    institution_name = serializers.CharField(source='owner_institution.name', read_only=True, default=None)
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True, default=None)
    topic_name = serializers.CharField(source='topic.name', read_only=True, default=None)
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    engagement_summary = serializers.SerializerMethodField()

    class Meta:
        model = ContentItem
        fields = [
            'id', 'title', 'description', 'content_type',
            'uploader_name', 'owner_type', 'institution_name',
            'school_level', 'class_level', 'class_level_name',
            'subject', 'subject_name', 'topic', 'topic_name',
            'visibility_scope', 'publication_status',
            'file_url', 'thumbnail_url', 'mime_type', 'file_size',
            'duration_seconds', 'language', 'version', 'is_featured',
            'tags', 'engagement_summary',
            'created_at', 'updated_at', 'published_at',
        ]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return obj.external_url or None

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None

    def get_tags(self, obj):
        return list(
            obj.item_tags.select_related('tag').values_list('tag__name', flat=True)
        )

    def get_engagement_summary(self, obj):
        engagements = obj.engagements.all()
        if not engagements.exists():
            return {'total_views': 0, 'unique_viewers': 0, 'avg_completion': 0}
        from django.db.models import Sum, Count, Avg
        agg = engagements.aggregate(
            total_views=Sum('view_count'),
            unique_viewers=Count('student', distinct=True),
            avg_completion=Avg('completion_percentage'),
        )
        return {
            'total_views': agg['total_views'] or 0,
            'unique_viewers': agg['unique_viewers'] or 0,
            'avg_completion': float(agg['avg_completion'] or 0),
        }


class ContentItemDetailSerializer(ContentItemListSerializer):
    """Full detail serializer with versions, audit logs, and visibility rules."""
    versions = ContentVersionSerializer(many=True, read_only=True)

    class Meta(ContentItemListSerializer.Meta):
        fields = ContentItemListSerializer.Meta.fields + [
            'uploaded_by', 'owner_institution',
            'country', 'curriculum', 'education_level',
            'lesson', 'assignment', 'intervention',
            'moderation_status', 'rejection_reason',
            'vimeo_video_id', 'vimeo_upload_status',
            'external_url', 'archived_at',
            'versions',
        ]


class ContentItemUploadSerializer(serializers.ModelSerializer):
    """
    Handles multipart upload with file + metadata.
    Validates file type, size, and academic scope.
    """
    MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
    tags = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False, default=list
    )

    class Meta:
        model = ContentItem
        fields = [
            'id',
            'title', 'description', 'content_type',
            'owner_type', 'owner_institution',
            'school_level', 'country', 'curriculum', 'education_level',
            'class_level', 'subject', 'topic', 'lesson',
            'assignment', 'intervention',
            'visibility_scope', 'publication_status',
            'file', 'external_url', 'thumbnail',
            'language', 'is_featured', 'tags',
            'duration_seconds',
        ]
        read_only_fields = ['id']

    def validate_file(self, value):
        if not value:
            return value
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"File size {value.size / (1024*1024):.1f}MB exceeds maximum 500MB."
            )
        # Block potentially dangerous extensions
        ext = os.path.splitext(value.name)[1].lower()
        dangerous = {'.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi', '.com', '.scr', '.dll', '.sys', '.js', '.vbs', '.wsf', '.php', '.py', '.rb', '.pl'}
        if ext in dangerous:
            raise serializers.ValidationError(f"File type '{ext}' is not allowed for security reasons.")
        return value

    # Text-first content types where the body lives in `description` and no
    # file/external link is required.
    TEXT_ONLY_CONTENT_TYPES = {'notes', 'revision'}

    def validate(self, attrs):
        content_type = attrs.get('content_type')
        if content_type in self.TEXT_ONLY_CONTENT_TYPES:
            # Notes / revision posts are inline text; skip the file/URL gate
            # but require meaningful body content.
            if not (attrs.get('description') or '').strip():
                raise serializers.ValidationError(
                    {'description': 'Description is required for text-only content.'}
                )
            return attrs
        # All other content types must carry either an uploaded file or an
        # external link to the underlying media.
        if not attrs.get('file') and not attrs.get('external_url'):
            raise serializers.ValidationError(
                "Either a file or external URL must be provided."
            )
        return attrs

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        request = self.context.get('request')
        validated_data['uploaded_by'] = request.user

        # Auto-detect mime type and file size
        uploaded_file = validated_data.get('file')
        if uploaded_file:
            validated_data['mime_type'] = (
                uploaded_file.content_type
                or mimetypes.guess_type(uploaded_file.name)[0]
                or ''
            )
            validated_data['file_size'] = uploaded_file.size

        item = ContentItem.objects.create(**validated_data)

        # Create tags
        for tag_name in tags_data:
            tag, _ = ContentTag.objects.get_or_create(
                slug=slugify(tag_name),
                defaults={'name': tag_name}
            )
            ContentItemTag.objects.get_or_create(content_item=item, tag=tag)

        # Audit log
        ContentAuditLog.objects.create(
            content_item=item,
            action='created',
            performed_by=request.user,
            new_value={'title': item.title, 'content_type': item.content_type},
        )

        return item

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        request = self.context.get('request')

        old_values = {
            'title': instance.title,
            'publication_status': instance.publication_status,
            'visibility_scope': instance.visibility_scope,
        }

        # If file is being replaced, create a version record
        new_file = validated_data.get('file')
        if new_file and instance.file:
            ContentVersion.objects.create(
                content_item=instance,
                version_number=instance.version,
                file=instance.file,
                file_size=instance.file_size,
                mime_type=instance.mime_type,
                replaced_by=request.user,
                change_note='File replaced via update',
            )
            instance.version += 1
            validated_data['mime_type'] = (
                new_file.content_type
                or mimetypes.guess_type(new_file.name)[0]
                or ''
            )
            validated_data['file_size'] = new_file.size

            ContentAuditLog.objects.create(
                content_item=instance,
                action='file_replaced',
                performed_by=request.user,
                old_value={'version': instance.version - 1},
                new_value={'version': instance.version},
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.item_tags.all().delete()
            for tag_name in tags_data:
                tag, _ = ContentTag.objects.get_or_create(
                    slug=slugify(tag_name),
                    defaults={'name': tag_name}
                )
                ContentItemTag.objects.get_or_create(content_item=instance, tag=tag)

        ContentAuditLog.objects.create(
            content_item=instance,
            action='updated',
            performed_by=request.user,
            old_value=old_values,
            new_value={
                'title': instance.title,
                'publication_status': instance.publication_status,
                'visibility_scope': instance.visibility_scope,
            },
        )

        return instance


class ContentItemPublishSerializer(serializers.Serializer):
    """Serializer for publish/archive/reject actions."""
    action = serializers.ChoiceField(choices=['publish', 'archive', 'reject', 'hide', 'restore'])
    reason = serializers.CharField(required=False, default='')


class ContentEngagementUpdateSerializer(serializers.Serializer):
    """For frontend engagement tracking updates."""
    content_item_id = serializers.UUIDField()
    active_time_seconds = serializers.IntegerField(min_value=0, default=0)
    completion_percentage = serializers.DecimalField(
        max_digits=5, decimal_places=2, min_value=0, max_value=100, default=0
    )
    last_position = serializers.IntegerField(min_value=0, default=0)
    is_completed = serializers.BooleanField(default=False)
