from django.contrib import admin
from .models import Resource, SharedResourceLink, ResourceLessonLink, ResourceEngagementRecord
from .content_models import (
    ContentItem, ContentEngagement, ContentAssignment,
    ContentRecommendation, ContentAccessSession,
)


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner_type', 'visibility', 'subject', 'created_at']
    list_filter = ['owner_type', 'visibility']
    search_fields = ['title']


@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'content_type', 'owner_type', 'publication_status', 'created_at']
    list_filter = ['content_type', 'publication_status', 'owner_type']
    search_fields = ['title']


@admin.register(ContentEngagement)
class ContentEngagementAdmin(admin.ModelAdmin):
    list_display = ['student', 'content_item', 'status', 'completion_percentage', 'active_time_seconds', 'last_accessed']
    list_filter = ['status', 'is_completed']
    search_fields = ['student__email', 'content_item__title']


@admin.register(ContentAssignment)
class ContentAssignmentAdmin(admin.ModelAdmin):
    list_display = ['content_item', 'student', 'assigned_by_type', 'assignment_type', 'priority', 'due_date', 'is_active']
    list_filter = ['assigned_by_type', 'assignment_type', 'priority', 'is_active']
    search_fields = ['content_item__title', 'student__email']


@admin.register(ContentRecommendation)
class ContentRecommendationAdmin(admin.ModelAdmin):
    list_display = ['content_item', 'student', 'source', 'status', 'confidence_score', 'created_at']
    list_filter = ['source', 'status']
    search_fields = ['content_item__title', 'student__email']


@admin.register(ContentAccessSession)
class ContentAccessSessionAdmin(admin.ModelAdmin):
    list_display = ['student', 'content_item', 'interaction_type', 'active_seconds', 'session_started_at']
    list_filter = ['interaction_type']


admin.site.register(SharedResourceLink)
admin.site.register(ResourceLessonLink)
admin.site.register(ResourceEngagementRecord)
