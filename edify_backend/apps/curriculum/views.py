from rest_framework import viewsets
from .models import Country, Subject, ClassLevel, Topic
from .serializers import CountrySerializer, SubjectSerializer, ClassLevelSerializer, TopicSerializer
from django_filters.rest_framework import DjangoFilterBackend

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class ClassLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer

class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'class_level']

from .models import TopicCompetency, ResourceQualityReview
from .serializers import TopicCompetencySerializer, ResourceQualityReviewSerializer
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

class TopicCompetencyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Exposes NCDC learning objectives per topic for the AI and teacher planners.
    """
    queryset = TopicCompetency.objects.all()
    serializer_class = TopicCompetencySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['topic']

class ResourceQualityReviewViewSet(viewsets.ModelViewSet):
    """
    Moderation queue allowing NCDC or Admin validators to approve platform teaching resources.
    """
    queryset = ResourceQualityReview.objects.all()
    serializer_class = ResourceQualityReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        review = self.get_object()
        score = request.data.get('compliance_score', 100)
        review.status = 'approved'
        review.compliance_score = score
        review.reviewer_notes = request.data.get('notes', 'Passes Quality Assurance.')
        review.save()
        return Response({'status': 'approved'})
