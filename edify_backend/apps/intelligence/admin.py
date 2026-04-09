from django.contrib import admin
from .models import (
    NextBestAction, InterventionPack, InterventionPackAssignment,
    StudyPlan, StudyTask, ParentAction,
    StudentPassport, TeacherPassport,
    PointsLedger, Badge, UserBadge,
    Challenge, ChallengeParticipant, HouseTeam, HouseMembership,
    LearningProgress, NationalExamResult,
    StoryCard, InstitutionHealthSnapshot, ImpactComparison,
)


@admin.register(NextBestAction)
class NextBestActionAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'priority', 'category', 'status', 'target_role', 'created_at')
    list_filter = ('priority', 'category', 'status', 'target_role')
    search_fields = ('title', 'user__email')
    readonly_fields = ('created_at',)


@admin.register(InterventionPack)
class InterventionPackAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'trigger_source', 'subject', 'created_by', 'created_at')
    list_filter = ('status', 'trigger_source')
    search_fields = ('title',)


@admin.register(InterventionPackAssignment)
class InterventionPackAssignmentAdmin(admin.ModelAdmin):
    list_display = ('pack', 'student', 'progress_pct', 'completed_at')
    list_filter = ('completed_at',)


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ('student', 'week_start', 'week_end', 'total_estimated_minutes', 'completed_minutes')
    list_filter = ('week_start',)


@admin.register(StudyTask)
class StudyTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'plan', 'task_type', 'status', 'urgency', 'scheduled_date')
    list_filter = ('task_type', 'status', 'urgency')


@admin.register(ParentAction)
class ParentActionAdmin(admin.ModelAdmin):
    list_display = ('title', 'parent', 'child', 'action_type', 'status', 'created_at')
    list_filter = ('action_type', 'status')


@admin.register(StudentPassport)
class StudentPassportAdmin(admin.ModelAdmin):
    list_display = ('student', 'overall_gpa', 'current_streak_days', 'total_lessons_attended', 'updated_at')


@admin.register(TeacherPassport)
class TeacherPassportAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'total_lessons_delivered', 'total_students_impacted', 'intervention_success_rate', 'updated_at')


@admin.register(PointsLedger)
class PointsLedgerAdmin(admin.ModelAdmin):
    list_display = ('user', 'points', 'source', 'description', 'created_at')
    list_filter = ('source',)


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'points_value')
    list_filter = ('category',)


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'earned_at')


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'scope', 'status', 'start_date', 'end_date', 'reward_points')
    list_filter = ('scope', 'status')


@admin.register(ChallengeParticipant)
class ChallengeParticipantAdmin(admin.ModelAdmin):
    list_display = ('challenge', 'user', 'current_value', 'is_winner')


@admin.register(HouseTeam)
class HouseTeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'institution', 'total_points', 'color')


@admin.register(HouseMembership)
class HouseMembershipAdmin(admin.ModelAdmin):
    list_display = ('house', 'student')


@admin.register(LearningProgress)
class LearningProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'content_id', 'progress_pct', 'is_completed', 'last_accessed_at')
    list_filter = ('content_type', 'is_completed')


@admin.register(NationalExamResult)
class NationalExamResultAdmin(admin.ModelAdmin):
    list_display = ('institution', 'exam_type', 'year', 'total_candidates', 'division_1', 'division_2')
    list_filter = ('exam_type', 'year')


@admin.register(StoryCard)
class StoryCardAdmin(admin.ModelAdmin):
    list_display = ('headline', 'audience', 'user', 'tone', 'is_read', 'created_at')
    list_filter = ('audience', 'tone', 'is_read')


@admin.register(InstitutionHealthSnapshot)
class InstitutionHealthSnapshotAdmin(admin.ModelAdmin):
    list_display = ('institution', 'date', 'overall_score', 'risk_level', 'score_change')
    list_filter = ('risk_level',)


@admin.register(ImpactComparison)
class ImpactComparisonAdmin(admin.ModelAdmin):
    list_display = ('institution', 'subject', 'period', 'correlation_coefficient', 'improvement_attribution')
