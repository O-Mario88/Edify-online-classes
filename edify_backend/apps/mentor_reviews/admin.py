from django.contrib import admin
from .models import MentorReviewRequest, MentorReviewResponse


@admin.register(MentorReviewRequest)
class MentorReviewRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'teacher', 'request_type', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority', 'request_type')


@admin.register(MentorReviewResponse)
class MentorReviewResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'request', 'teacher', 'completed_at')
