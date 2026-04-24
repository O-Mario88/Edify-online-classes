from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.curriculum.stage_filter import filter_queryset_by_stage
from .models import CareerPathway, PathwaySuggestion
from .serializers import CareerPathwaySerializer, PathwaySuggestionSerializer
from .services import recompute_for_student


class CareerPathwayViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CareerPathwaySerializer
    lookup_field = 'slug'

    def get_queryset(self):
        qs = CareerPathway.objects.filter(is_published=True)
        return filter_queryset_by_stage(qs, self.request.user, direct_stage_field='stage')

    @action(detail=False, methods=['get'], url_path='my-suggestions')
    def my_suggestions(self, request):
        """Personalised pathway suggestions based on the learner's strongest subjects.

        v1 is rules-based. Recomputes on every fetch so newcomers see
        fresh guidance the moment they log their first subject scores.
        """
        suggestions = recompute_for_student(request.user)
        return Response(PathwaySuggestionSerializer(suggestions, many=True).data)
