from django.contrib import admin
from .models import PilotFeedback


@admin.register(PilotFeedback)
class PilotFeedbackAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'severity', 'user', 'user_role', 'short_message', 'page_url')
    list_filter = ('severity', 'user_role', 'created_at')
    search_fields = ('message', 'user__email', 'page_url')
    readonly_fields = ('created_at', 'user_agent')
    date_hierarchy = 'created_at'
    list_per_page = 50

    def short_message(self, obj):
        if len(obj.message) <= 80:
            return obj.message
        return obj.message[:77] + '…'
    short_message.short_description = 'Message'
