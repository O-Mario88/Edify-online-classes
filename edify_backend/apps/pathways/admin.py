from django.contrib import admin
from .models import CareerPathway, PathwaySuggestion


@admin.register(CareerPathway)
class CareerPathwayAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published')
    list_filter = ('is_published',)
    prepopulated_fields = {'slug': ('title',)}


@admin.register(PathwaySuggestion)
class PathwaySuggestionAdmin(admin.ModelAdmin):
    list_display = ('student', 'pathway', 'confidence', 'created_at')
