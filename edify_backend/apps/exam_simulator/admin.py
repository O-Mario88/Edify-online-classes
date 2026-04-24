from django.contrib import admin
from .models import ExamSimulation, ExamSimulationAttempt, MistakeNotebookEntry


@admin.register(ExamSimulation)
class ExamSimulationAdmin(admin.ModelAdmin):
    list_display = ('title', 'exam_track', 'subject', 'class_level', 'is_published', 'is_premium')
    list_filter = ('exam_track', 'is_published', 'is_premium')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('questions',)


@admin.register(ExamSimulationAttempt)
class ExamSimulationAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'exam', 'status', 'score_pct', 'readiness_band')
    list_filter = ('status', 'readiness_band')


@admin.register(MistakeNotebookEntry)
class MistakeNotebookEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'subject', 'topic', 'retry_status', 'created_at')
    list_filter = ('retry_status', 'subject')
