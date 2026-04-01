from rest_framework import viewsets
from .models import Listing
from .serializers import ListingSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch

class ListingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Listing.objects.filter(visibility_state='published').prefetch_related('topic_bindings__topic')
    serializer_class = ListingSerializer
    filter_backends = [DjangoFilterBackend]
    # To filter by topic: /api/v1/marketplace/listings/?topic_bindings__topic={id}
    filterset_fields = ['topic_bindings__topic']
