from django.contrib import admin
from .models import LearnerSettings


@admin.register(LearnerSettings)
class LearnerSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'low_data_mode', 'prefer_audio_lessons', 'weekly_brief_delivery', 'updated_at')
    list_filter = ('low_data_mode', 'weekly_brief_delivery')
