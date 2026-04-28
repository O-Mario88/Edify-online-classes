from django.contrib import admin
from .models import TeacherAvailability, SupportRequest, SupportSession


@admin.register(TeacherAvailability)
class TeacherAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'subject', 'day_of_week', 'start_time', 'end_time', 'mode', 'is_active')
    list_filter = ('is_active', 'mode', 'day_of_week')


@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'subject', 'request_type', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority', 'request_type')


@admin.register(SupportSession)
class SupportSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'teacher', 'subject', 'scheduled_at', 'status')
    list_filter = ('status',)
