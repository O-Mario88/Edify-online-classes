from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.curriculum.stage_filter import filter_queryset_by_stage
from .models import Cohort, CohortEnrollment
from .serializers import CohortCardSerializer, CohortDetailSerializer, CohortEnrollmentSerializer


class CohortViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Cohort.objects.filter(is_published=True).select_related('teacher_lead', 'subject', 'class_level')
        return filter_queryset_by_stage(qs, self.request.user)

    def get_serializer_class(self):
        return CohortDetailSerializer if self.action == 'retrieve' else CohortCardSerializer

    @action(detail=True, methods=['post'], url_path='enroll')
    def enroll(self, request, slug=None):
        cohort = get_object_or_404(self.get_queryset(), slug=slug)
        # Seat-cap guard — skip if this student is already in the cohort.
        already_in = cohort.enrollments.filter(student=request.user).exists()
        if cohort.max_seats and not already_in:
            active = cohort.enrollments.filter(status='active').count()
            if active >= cohort.max_seats:
                return Response(
                    {'detail': 'This cohort is full. Join the waitlist on the next one.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        enrollment, created = CohortEnrollment.objects.get_or_create(
            cohort=cohort, student=request.user,
            defaults={'status': 'active'},
        )
        if not created and enrollment.status == 'dropped':
            enrollment.status = 'active'
            enrollment.save(update_fields=['status'])
        return Response(
            CohortEnrollmentSerializer(enrollment).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class CohortEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CohortEnrollmentSerializer

    def get_queryset(self):
        return CohortEnrollment.objects.filter(student=self.request.user).select_related('cohort')

    @action(detail=False, methods=['get'], url_path='my')
    def my_cohorts(self, request):
        return Response(CohortEnrollmentSerializer(self.get_queryset(), many=True).data)
