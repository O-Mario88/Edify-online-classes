from django.contrib import admin
from .models import MasteryTrack, MasteryTrackModule, MasteryTrackItem, MasteryEnrollment


class ItemInline(admin.TabularInline):
    model = MasteryTrackItem
    extra = 1


class ModuleInline(admin.StackedInline):
    model = MasteryTrackModule
    extra = 1
    show_change_link = True


@admin.register(MasteryTrack)
class MasteryTrackAdmin(admin.ModelAdmin):
    list_display = ('title', 'target_role', 'subject', 'class_level', 'level', 'is_published', 'is_premium', 'is_featured')
    list_filter = ('is_published', 'is_premium', 'is_featured', 'target_role', 'level', 'exam_track')
    search_fields = ('title', 'description', 'tagline')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]


@admin.register(MasteryTrackModule)
class MasteryTrackModuleAdmin(admin.ModelAdmin):
    list_display = ('track', 'title', 'order')
    list_filter = ('track',)
    inlines = [ItemInline]


@admin.register(MasteryEnrollment)
class MasteryEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('learner', 'track', 'status', 'started_at', 'last_activity_at')
    list_filter = ('status', 'track')
    search_fields = ('learner__email', 'track__title')
