from django.contrib import admin
from .models import AdmissionApplication, AdmissionStatusEvent


@admin.register(AdmissionApplication)
class AdmissionApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'institution', 'status', 'submitted_at')
    list_filter = ('status',)


@admin.register(AdmissionStatusEvent)
class AdmissionStatusEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'application', 'from_status', 'to_status', 'actor', 'created_at')
