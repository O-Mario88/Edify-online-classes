from django.contrib import admin
from .models import MasteryProject, ProjectSubmission, ProjectSubmissionArtifact, ProjectReview


@admin.register(MasteryProject)
class MasteryProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'class_level', 'is_published', 'is_premium')
    list_filter = ('is_published', 'is_premium', 'is_group_project')
    search_fields = ('title',)
    prepopulated_fields = {'slug': ('title',)}


@admin.register(ProjectSubmission)
class ProjectSubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'student', 'status', 'submitted_at')
    list_filter = ('status',)


@admin.register(ProjectReview)
class ProjectReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'submission', 'reviewer', 'status', 'score', 'reviewed_at')
    list_filter = ('status',)
