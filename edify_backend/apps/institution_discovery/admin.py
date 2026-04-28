from django.contrib import admin
from .models import InstitutionDiscoveryProfile, InstitutionRecommendationScore


@admin.register(InstitutionDiscoveryProfile)
class DiscoveryProfileAdmin(admin.ModelAdmin):
    list_display = ('institution', 'admission_status', 'is_listed', 'location_city', 'updated_at')
    list_filter = ('admission_status', 'is_listed', 'boarding_options')
    search_fields = ('institution__name', 'location_city')


@admin.register(InstitutionRecommendationScore)
class RecommendationScoreAdmin(admin.ModelAdmin):
    list_display = ('institution', 'maple_activeness_score', 'growth_index', 'last_computed_at')
    search_fields = ('institution__name',)
    readonly_fields = ('last_computed_at',)
