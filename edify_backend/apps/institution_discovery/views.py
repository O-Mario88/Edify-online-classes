"""Phase 1 institution discovery endpoints.

Read-only for Phase 1:
  GET  /api/v1/institution-discovery/recommendations/  — top 10 for the user
  GET  /api/v1/institution-discovery/institutions/     — paginated list
  GET  /api/v1/institution-discovery/institutions/<id>/ — detail

Phase 2 will add pings + applications + admission inbox.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from institutions.models import Institution

from .models import InstitutionRecommendationScore
from .serializers import InstitutionCardSerializer, InstitutionDetailSerializer
from .services import build_match_reasoning, recalculate_institution_score


class InstitutionDiscoveryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only browsing of institutions that have opted into discovery.

    Filter rule: only institutions whose discovery_profile.is_listed is True.
    This keeps institutions that signed up but haven't curated their
    profile out of the public hub.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = InstitutionCardSerializer

    def get_queryset(self):
        return (Institution.objects
                .filter(discovery_profile__is_listed=True, is_active=True)
                .select_related('discovery_profile', 'recommendation_score')
                .order_by('-recommendation_score__maple_activeness_score', 'name'))

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InstitutionDetailSerializer
        return InstitutionCardSerializer

    @action(detail=False, methods=['get'], url_path='recommendations')
    def recommendations(self, request):
        """Top 10 institutions the platform would recommend right now.

        v1: ranks purely by Maple Activeness × (1 + growth boost).
        Personalization (class level, weak subjects) lands in Phase 4.
        """
        qs = self.get_queryset()[:10]
        for inst in qs:
            score = getattr(inst, 'recommendation_score', None)
            inst._match_reason = build_match_reasoning(inst, score)
        return Response(
            InstitutionCardSerializer(qs, many=True, context={'request': request}).data
        )


class InstitutionScoreRefreshViewSet(viewsets.ViewSet):
    """Admin-only recompute trigger. Surfaces Phase 4 of the spec early so
    institution admins can preview their score without waiting for the
    nightly job."""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='recalculate')
    def recalculate(self, request):
        institution_id = request.data.get('institution_id')
        if not institution_id:
            return Response({'detail': 'institution_id required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            inst = Institution.objects.get(id=institution_id)
        except Institution.DoesNotExist:
            return Response({'detail': 'Institution not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Only platform admin or a member of that institution may trigger.
        user = request.user
        is_admin = getattr(user, 'role', '') == 'platform_admin'
        is_member = user.institution_memberships.filter(institution=inst, status='active').exists()
        if not (is_admin or is_member):
            return Response({'detail': 'Not permitted.'}, status=status.HTTP_403_FORBIDDEN)
        score = recalculate_institution_score(inst)
        return Response({
            'institution_id': inst.id,
            'maple_activeness_score': score.maple_activeness_score,
            'growth_index': score.growth_index,
            'explanation': score.explanation,
        })
