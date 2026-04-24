from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import (
    NextBestAction, InterventionPack, InterventionPackAssignment,
    StudyPlan, StudyTask, ParentAction,
    StudentPassport, TeacherPassport,
    PointsLedger, Badge, UserBadge,
    Challenge, ChallengeParticipant, HouseTeam, HouseMembership,
    LearningProgress, NationalExamResult,
    StoryCard, InstitutionHealthSnapshot, ImpactComparison,
)
from .serializers import (
    NextBestActionSerializer, NextBestActionListSerializer,
    InterventionPackSerializer, InterventionPackAssignmentSerializer,
    StudyPlanSerializer, StudyTaskSerializer,
    ParentActionSerializer,
    StudentPassportSerializer, TeacherPassportSerializer,
    PointsLedgerSerializer, BadgeSerializer, UserBadgeSerializer,
    ChallengeSerializer, ChallengeParticipantSerializer,
    HouseTeamSerializer, HouseMembershipSerializer,
    LearningProgressSerializer,
    NationalExamResultSerializer,
    StoryCardSerializer,
    InstitutionHealthSnapshotSerializer,
    ImpactComparisonSerializer,
)


# ─── Next Best Action ───

class NextBestActionViewSet(viewsets.ModelViewSet):
    serializer_class = NextBestActionSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return NextBestActionListSerializer
        return NextBestActionSerializer

    def get_queryset(self):
        return NextBestAction.objects.filter(user=self.request.user, status='pending')

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Trigger NBA generation for the current user."""
        from .services import NextBestActionEngine
        engine = NextBestActionEngine()
        user = request.user
        institution = getattr(user, 'student_profile', None)
        inst = None
        if institution:
            inst = institution.institution

        role = getattr(user, 'role', '')
        if role == 'student':
            actions = engine.generate_for_student(user, inst)
        elif role == 'teacher':
            actions = engine.generate_for_teacher(user, inst)
        elif role == 'parent':
            actions = engine.generate_for_parent(user, inst)
        elif role in ('institution_admin', 'school_admin'):
            actions = engine.generate_for_institution_admin(user, inst)
        else:
            return Response({'detail': 'No NBA generator for this role'}, status=400)

        serializer = NextBestActionListSerializer(actions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss an action."""
        action_obj = self.get_object()
        from django.utils import timezone
        action_obj.status = 'dismissed'
        action_obj.dismissed_at = timezone.now()
        action_obj.save()
        return Response({'status': 'dismissed'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark an action as completed."""
        action_obj = self.get_object()
        from django.utils import timezone
        action_obj.status = 'completed'
        action_obj.completed_at = timezone.now()
        action_obj.save()
        return Response({'status': 'completed'})


# ─── Intervention Packs ───

class InterventionPackViewSet(viewsets.ModelViewSet):
    serializer_class = InterventionPackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('platform_admin', 'institution_admin', 'school_admin'):
            return InterventionPack.objects.all()
        return InterventionPack.objects.filter(created_by=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign the pack to specific students."""
        pack = self.get_object()
        student_ids = request.data.get('student_ids', [])
        from django.contrib.auth import get_user_model
        User = get_user_model()
        assignments = []
        for sid in student_ids:
            try:
                student = User.objects.get(id=sid, role='student')
                assignments.append(InterventionPackAssignment(pack=pack, student=student))
            except User.DoesNotExist:
                continue

        InterventionPackAssignment.objects.bulk_create(assignments, ignore_conflicts=True)
        from django.utils import timezone
        pack.status = 'assigned'
        pack.assigned_at = timezone.now()
        pack.save()
        return Response({'status': 'assigned', 'count': len(assignments)})


class InterventionPackAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = InterventionPackAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return InterventionPackAssignment.objects.filter(student=user)
        if user.role in ('platform_admin',):
            return InterventionPackAssignment.objects.all()
        # Teachers/institution admins only see assignments whose pack
        # belongs to an institution they're a member of, or where they
        # authored the pack.
        from institutions.models import InstitutionMembership
        inst_ids = InstitutionMembership.objects.filter(
            user=user, status='active'
        ).values_list('institution_id', flat=True)
        return InterventionPackAssignment.objects.filter(
            models.Q(pack__institution_id__in=inst_ids) |
            models.Q(pack__created_by=user)
        )


# ─── Study Planner ───

class StudyPlanViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudyPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(student=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a weekly study plan for the current student."""
        from .planner import StudyPlannerEngine
        engine = StudyPlannerEngine()
        plan = engine.generate_weekly_plan(request.user)
        serializer = StudyPlanSerializer(plan)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's tasks for the current student."""
        from .planner import StudyPlannerEngine
        engine = StudyPlannerEngine()
        tasks = engine.get_today_tasks(request.user)
        serializer = StudyTaskSerializer(tasks, many=True)
        return Response(serializer.data)


class StudyTaskViewSet(viewsets.ModelViewSet):
    serializer_class = StudyTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudyTask.objects.filter(plan__student=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark a study task as completed."""
        from .planner import StudyPlannerEngine
        engine = StudyPlannerEngine()
        actual_minutes = request.data.get('actual_minutes')
        task = engine.mark_task_complete(pk, request.user, actual_minutes)
        serializer = StudyTaskSerializer(task)
        return Response(serializer.data)


# ─── Parent Actions ───

class ParentActionViewSet(viewsets.ModelViewSet):
    serializer_class = ParentActionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ParentAction.objects.filter(parent=self.request.user)

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge a parent action."""
        action_obj = self.get_object()
        from django.utils import timezone
        action_obj.status = 'acknowledged'
        action_obj.acknowledged_at = timezone.now()
        action_obj.save()
        return Response({'status': 'acknowledged'})


# ─── Passports ───

class StudentPassportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get the current student's passport."""
        passport, _ = StudentPassport.objects.get_or_create(student=request.user)
        serializer = StudentPassportSerializer(passport)
        return Response(serializer.data)


class TeacherPassportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get the current teacher's passport."""
        passport, _ = TeacherPassport.objects.get_or_create(teacher=request.user)
        serializer = TeacherPassportSerializer(passport)
        return Response(serializer.data)


# ─── Competition ───

class PointsLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PointsLedgerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PointsLedger.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def total(self, request):
        """Get total points for the current user."""
        from django.db.models import Sum
        total = PointsLedger.objects.filter(user=request.user).aggregate(
            total=Sum('points')
        )['total'] or 0
        return Response({'total_points': total})


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user)


class ChallengeViewSet(viewsets.ModelViewSet):
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Challenge.objects.filter(status__in=['upcoming', 'active'])

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a challenge."""
        challenge = self.get_object()
        participant, created = ChallengeParticipant.objects.get_or_create(
            challenge=challenge, user=request.user
        )
        if not created:
            return Response({'detail': 'Already joined'}, status=400)
        return Response({'status': 'joined'})

    @action(detail=True, methods=['get'])
    def leaderboard(self, request, pk=None):
        """Get challenge leaderboard."""
        challenge = self.get_object()
        participants = challenge.participants.order_by('-current_value')[:20]
        serializer = ChallengeParticipantSerializer(participants, many=True)
        return Response(serializer.data)


class HouseTeamViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HouseTeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HouseTeam.objects.all()

    @action(detail=False, methods=['get'])
    def standings(self, request):
        """Get house standings sorted by points."""
        houses = HouseTeam.objects.order_by('-total_points')
        serializer = HouseTeamSerializer(houses, many=True)
        return Response(serializer.data)


# ─── Resume Anywhere ───

class LearningProgressViewSet(viewsets.ModelViewSet):
    serializer_class = LearningProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LearningProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def update_progress(self, request):
        """Update or create learning progress for a content item."""
        content_type = request.data.get('content_type')
        content_id = request.data.get('content_id')
        progress_pct = request.data.get('progress_pct', 0)
        last_position = request.data.get('last_position', {})

        progress, _ = LearningProgress.objects.update_or_create(
            user=request.user,
            content_type=content_type,
            content_id=content_id,
            defaults={
                'progress_pct': progress_pct,
                'last_position': last_position,
                'is_completed': progress_pct >= 100,
            }
        )
        if progress.is_completed and not progress.completed_at:
            from django.utils import timezone
            progress.completed_at = timezone.now()
            progress.save()

        serializer = LearningProgressSerializer(progress)
        return Response(serializer.data)


# ─── National Exams ───

class NationalExamResultViewSet(viewsets.ModelViewSet):
    serializer_class = NationalExamResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'platform_admin':
            return NationalExamResult.objects.all()
        from institutions.models import InstitutionMembership
        inst_ids = InstitutionMembership.objects.filter(
            user=user, status='active'
        ).values_list('institution_id', flat=True)
        return NationalExamResult.objects.filter(institution_id__in=inst_ids)

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


# ─── Story Cards ───

class StoryCardViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StoryCardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StoryCard.objects.filter(user=self.request.user, is_read=False)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate story cards for the current user."""
        from .stories import StoryCardGenerator
        gen = StoryCardGenerator()
        user = request.user
        institution = getattr(user, 'student_profile', None)
        inst = institution.institution if institution else None

        role = getattr(user, 'role', '')
        if role == 'student':
            cards = gen.generate_for_student(user, inst)
        elif role == 'teacher':
            cards = gen.generate_for_teacher(user, inst)
        elif role == 'parent':
            cards = gen.generate_for_parent(user, inst)
        elif role in ('institution_admin', 'school_admin'):
            cards = gen.generate_for_institution_admin(user, inst)
        else:
            return Response({'detail': 'No story generator for this role'}, status=400)

        serializer = StoryCardSerializer(cards, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a story card as read."""
        card = self.get_object()
        card.is_read = True
        card.save()
        return Response({'status': 'read'})


# ─── Institution Health ───

class InstitutionHealthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get or compute today's health snapshot."""
        institution_id = request.query_params.get('institution')
        if not institution_id:
            return Response({'detail': 'institution param required'}, status=400)

        from institutions.models import Institution
        try:
            institution = Institution.objects.get(id=institution_id)
        except Institution.DoesNotExist:
            return Response({'detail': 'Institution not found'}, status=404)

        from .health import InstitutionHealthScorer
        scorer = InstitutionHealthScorer()
        snapshot = scorer.compute(institution)
        serializer = InstitutionHealthSnapshotSerializer(snapshot)
        return Response(serializer.data)


class InstitutionHealthHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InstitutionHealthSnapshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        institution_id = self.request.query_params.get('institution')
        if not institution_id:
            return InstitutionHealthSnapshot.objects.none()
        user = self.request.user
        if getattr(user, 'role', '') == 'platform_admin':
            return InstitutionHealthSnapshot.objects.filter(institution_id=institution_id)
        from institutions.models import InstitutionMembership
        is_member = InstitutionMembership.objects.filter(
            user=user, institution_id=institution_id, status='active',
        ).exists()
        if not is_member:
            return InstitutionHealthSnapshot.objects.none()
        return InstitutionHealthSnapshot.objects.filter(institution_id=institution_id)


# ─── Impact Comparison ───

class ImpactComparisonViewSet(viewsets.ModelViewSet):
    serializer_class = ImpactComparisonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'platform_admin':
            return ImpactComparison.objects.all()
        from institutions.models import InstitutionMembership
        inst_ids = InstitutionMembership.objects.filter(
            user=user, status='active'
        ).values_list('institution_id', flat=True)
        return ImpactComparison.objects.filter(institution_id__in=inst_ids)
