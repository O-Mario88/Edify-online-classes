from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import MatchRequest, PeerPointsLedger, TutorProfile, TutoringBounty
from .serializers import (
    MatchRequestSerializer, PeerPointsLedgerSerializer,
    TutorProfileSerializer, TutoringBountySerializer,
)


class MatchRequestViewSet(viewsets.ModelViewSet):
    queryset = MatchRequest.objects.all()
    serializer_class = MatchRequestSerializer
    permission_classes = [IsAuthenticated]


class PeerPointsLedgerViewSet(viewsets.ModelViewSet):
    queryset = PeerPointsLedger.objects.all()
    serializer_class = PeerPointsLedgerSerializer
    permission_classes = [IsAuthenticated]


class TutorProfileViewSet(viewsets.ModelViewSet):
    queryset = TutorProfile.objects.filter(is_active=True).select_related('user').prefetch_related('subjects')
    serializer_class = TutorProfileSerializer
    permission_classes = [AllowAny]


class TutoringBountyViewSet(viewsets.ModelViewSet):
    serializer_class = TutoringBountySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = TutoringBounty.objects.select_related('requester', 'accepted_by').order_by('-created_at')
        bounty_type = self.request.query_params.get('type')
        if bounty_type:
            qs = qs.filter(bounty_type=bounty_type)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class PeerTutoringDashboardView(APIView):
    """
    Aggregate endpoint for the PeerTutoringHub page.
    Returns tutors, community bounties, teacher-directed bounties, and user's reputation points.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Reputation points for current user
        reputation_points = 0
        if request.user.is_authenticated:
            ledger = PeerPointsLedger.objects.filter(student=request.user).first()
            if ledger:
                reputation_points = ledger.points_earned

        # Active tutors
        tutors = TutorProfile.objects.filter(is_active=True).select_related('user').prefetch_related('subjects')
        tutors_data = TutorProfileSerializer(tutors, many=True).data

        # Community bounties
        community = TutoringBounty.objects.filter(
            bounty_type='community', status='open'
        ).select_related('requester').order_by('-created_at')
        community_data = TutoringBountySerializer(community, many=True).data

        # Teacher-directed interventions
        teacher_directed = TutoringBounty.objects.filter(
            bounty_type='teacher_directed', status='open'
        ).select_related('requester').order_by('-created_at')
        teacher_directed_data = TutoringBountySerializer(teacher_directed, many=True).data

        return Response({
            'reputation_points': reputation_points,
            'tutors': tutors_data,
            'community_bounties': community_data,
            'teacher_directed': teacher_directed_data,
        })
