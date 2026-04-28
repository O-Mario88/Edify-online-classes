from django.contrib import admin
from .models import Cohort, CohortEnrollment


@admin.register(Cohort)
class CohortAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher_lead', 'subject', 'start_date', 'end_date', 'is_published', 'is_premium')
    list_filter = ('is_published', 'is_premium', 'exam_track')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(CohortEnrollment)
class CohortEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'cohort', 'student', 'status', 'progress_pct', 'enrolled_at')
    list_filter = ('status',)
