from django.contrib import admin
from .models import PracticeLab, PracticeLabStep, PracticeLabAttempt, PracticeLabStepResponse


class StepInline(admin.TabularInline):
    model = PracticeLabStep
    extra = 1


@admin.register(PracticeLab)
class PracticeLabAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'class_level', 'difficulty', 'is_published', 'is_premium')
    list_filter = ('is_published', 'is_premium', 'difficulty')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [StepInline]


@admin.register(PracticeLabAttempt)
class PracticeLabAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'lab', 'status', 'score_pct', 'badge_earned', 'started_at')
    list_filter = ('status', 'badge_earned')
    search_fields = ('student__email', 'lab__title')
