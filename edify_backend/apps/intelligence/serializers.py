from rest_framework import serializers
from .models import (
    NextBestAction, InterventionPack, InterventionPackAssignment,
    StudyPlan, StudyTask, ParentAction,
    StudentPassport, TeacherPassport,
    PointsLedger, Badge, UserBadge,
    Challenge, ChallengeParticipant, HouseTeam, HouseMembership,
    LearningProgress, NationalExamResult,
    StoryCard, InstitutionHealthSnapshot, ImpactComparison,
)


# ─── Next Best Action ───

class NextBestActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NextBestAction
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class NextBestActionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for action lists."""
    class Meta:
        model = NextBestAction
        fields = (
            'id', 'title', 'description', 'category', 'priority', 'status',
            'action_type', 'action_url', 'reason', 'confidence_score',
            'target_role', 'created_at', 'expires_at',
        )


# ─── Intervention Packs ───

class InterventionPackSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterventionPack
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')


class InterventionPackAssignmentSerializer(serializers.ModelSerializer):
    pack_title = serializers.CharField(source='pack.title', read_only=True)

    class Meta:
        model = InterventionPackAssignment
        fields = '__all__'


# ─── Study Planner ───

class StudyTaskSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)

    class Meta:
        model = StudyTask
        fields = '__all__'
        read_only_fields = ('plan',)


class StudyPlanSerializer(serializers.ModelSerializer):
    tasks = StudyTaskSerializer(many=True, read_only=True)
    completion_pct = serializers.SerializerMethodField()

    class Meta:
        model = StudyPlan
        fields = '__all__'
        read_only_fields = ('student', 'generated_at')

    def get_completion_pct(self, obj):
        total = obj.tasks.count()
        if total == 0:
            return 0
        completed = obj.tasks.filter(status='completed').count()
        return round((completed / total) * 100)


# ─── Parent Action ───

class ParentActionSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.full_name', read_only=True, default='')

    class Meta:
        model = ParentAction
        fields = '__all__'
        read_only_fields = ('parent', 'created_at')


# ─── Passports ───

class StudentPassportSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True, default='')

    class Meta:
        model = StudentPassport
        fields = '__all__'
        read_only_fields = ('student', 'updated_at')


class TeacherPassportSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True, default='')

    class Meta:
        model = TeacherPassport
        fields = '__all__'
        read_only_fields = ('teacher', 'updated_at')


# ─── Competition ───

class PointsLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointsLedger
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = '__all__'
        read_only_fields = ('user', 'earned_at')


class ChallengeSerializer(serializers.ModelSerializer):
    participant_count = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = '__all__'
        read_only_fields = ('created_by',)

    def get_participant_count(self, obj):
        return obj.participants.count()


class ChallengeParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True, default='')

    class Meta:
        model = ChallengeParticipant
        fields = '__all__'


class HouseTeamSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = HouseTeam
        fields = '__all__'

    def get_member_count(self, obj):
        return obj.members.count()


class HouseMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseMembership
        fields = '__all__'


# ─── Resume Anywhere ───

class LearningProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningProgress
        fields = '__all__'
        read_only_fields = ('user', 'started_at')


# ─── National Exams ───

class NationalExamResultSerializer(serializers.ModelSerializer):
    pass_rate = serializers.SerializerMethodField()

    class Meta:
        model = NationalExamResult
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'uploaded_at')

    def get_pass_rate(self, obj):
        if obj.total_candidates == 0:
            return 0
        return round(
            ((obj.division_1 + obj.division_2 + obj.division_3) / obj.total_candidates) * 100, 1
        )


# ─── Story Cards ───

class StoryCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryCard
        fields = '__all__'
        read_only_fields = ('created_at',)


# ─── Institution Health ───

class InstitutionHealthSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionHealthSnapshot
        fields = '__all__'


# ─── Impact Comparison ───

class ImpactComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactComparison
        fields = '__all__'
