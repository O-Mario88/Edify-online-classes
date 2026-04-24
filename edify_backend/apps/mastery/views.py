"""Mastery Tracks endpoints.

GET  /api/v1/mastery/tracks/                              list (published only)
GET  /api/v1/mastery/tracks/<slug_or_id>/                 detail with modules
POST /api/v1/mastery/tracks/<slug_or_id>/enroll/          idempotent enroll
GET  /api/v1/mastery/my-tracks/                           current learner's enrollments
GET  /api/v1/mastery/enrollments/<id>/progress/           progress + which items left
POST /api/v1/mastery/enrollments/<id>/mark-item-complete/ record a completed item
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import MasteryTrack, MasteryTrackItem, MasteryEnrollment
from .serializers import (
    MasteryTrackCardSerializer,
    MasteryTrackDetailSerializer,
    MasteryEnrollmentSerializer,
    MarkItemCompleteSerializer,
)


class MasteryTrackViewSet(viewsets.ReadOnlyModelViewSet):
    """Public-ish: authenticated users browse tracks. Only published ones surface."""
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return MasteryTrack.objects.filter(is_published=True).select_related(
            'subject', 'class_level',
        ).prefetch_related('modules__items')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MasteryTrackDetailSerializer
        return MasteryTrackCardSerializer

    @action(detail=True, methods=['post'], url_path='enroll')
    def enroll(self, request, slug=None):
        track = get_object_or_404(self.get_queryset(), slug=slug)
        enrollment, created = MasteryEnrollment.objects.get_or_create(
            learner=request.user, track=track,
            defaults={'status': 'active'},
        )
        if not created and enrollment.status == 'paused':
            enrollment.status = 'active'
            enrollment.save(update_fields=['status', 'last_activity_at'])
        return Response(
            MasteryEnrollmentSerializer(enrollment).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class MasteryEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    """A learner's own enrollments + progress actions."""
    permission_classes = [IsAuthenticated]
    serializer_class = MasteryEnrollmentSerializer

    def get_queryset(self):
        return (MasteryEnrollment.objects
                .filter(learner=self.request.user)
                .select_related('track'))

    @action(detail=False, methods=['get'], url_path='my-tracks')
    def my_tracks(self, request):
        qs = self.get_queryset()
        return Response(MasteryEnrollmentSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'], url_path='progress')
    def progress(self, request, pk=None):
        enrollment = self.get_object()
        items = list(MasteryTrackItem.objects.filter(
            module__track=enrollment.track,
        ).select_related('module').order_by('module__order', 'order'))
        completed = {str(i) for i in enrollment.completed_item_ids}
        items_payload = [
            {
                'id': str(item.id),
                'module': item.module.title,
                'module_order': item.module.order,
                'item_type': item.item_type,
                'title': item.display_title(),
                'order': item.order,
                'required': item.required_for_completion,
                'completed': str(item.id) in completed,
            }
            for item in items
        ]
        return Response({
            'enrollment': MasteryEnrollmentSerializer(enrollment).data,
            'items': items_payload,
        })

    @action(detail=True, methods=['post'], url_path='mark-item-complete')
    def mark_item_complete(self, request, pk=None):
        enrollment = self.get_object()
        serializer = MarkItemCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item_id = str(serializer.validated_data['item_id'])

        # Validate the item belongs to this track — otherwise a learner
        # could mark any item complete and inflate their progress.
        belongs = MasteryTrackItem.objects.filter(
            id=item_id, module__track=enrollment.track,
        ).exists()
        if not belongs:
            return Response(
                {'detail': 'Item does not belong to this track.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        completed = [str(i) for i in (enrollment.completed_item_ids or [])]
        if item_id not in completed:
            completed.append(item_id)
            enrollment.completed_item_ids = completed

        progress = enrollment.progress_percentage()
        if progress >= 100 and enrollment.status != 'completed':
            enrollment.status = 'completed'
            enrollment.completed_at = timezone.now()
        elif enrollment.status == 'not_started':
            enrollment.status = 'active'

        enrollment.save()
        return Response(MasteryEnrollmentSerializer(enrollment).data)
