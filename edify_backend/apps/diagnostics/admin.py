from django.contrib import admin
from .models import DiagnosticSession


@admin.register(DiagnosticSession)
class DiagnosticSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'class_level', 'state', 'score_pct', 'started_at', 'submitted_at')
    list_filter = ('state', 'class_level')
    search_fields = ('student__email',)
    readonly_fields = ('id', 'started_at', 'submitted_at')
