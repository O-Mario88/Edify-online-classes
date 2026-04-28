from django.contrib import admin
from .models import UpgradeRequest, PremiumAccess


@admin.register(UpgradeRequest)
class UpgradeRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'requester', 'plan', 'status', 'created_at', 'reviewed_at')
    list_filter = ('status', 'plan', 'preferred_method')


@admin.register(PremiumAccess)
class PremiumAccessAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'granted_at', 'expires_at')
    list_filter = ('plan',)
