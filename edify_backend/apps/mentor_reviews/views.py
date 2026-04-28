from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from institutions.models import InstitutionMembership
from .models import MentorReviewRequest, MentorReviewResponse
from .serializers import MentorReviewRequestSerializer, RespondSerializer, MentorReviewResponseSerializer


REVIEWER_ROLES = ('teacher', 'independent_teacher', 'institution_teacher', 'institution_admin', 'platform_admin')


class MentorReviewRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MentorReviewRequestSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')
        if role == 'platform_admin':
            return MentorReviewRequest.objects.all().prefetch_related('responses')
        if role in REVIEWER_ROLES:
            inst_ids = InstitutionMembership.objects.filter(
                user=user, status='active',
            ).values_list('institution_id', flat=True)
            # Teacher queue: assigned to me + unassigned from my tenant.
            return MentorReviewRequest.objects.filter(
                models_Q_teacher_or_tenant(user, inst_ids)
            ).distinct().prefetch_related('responses')
        return MentorReviewRequest.objects.filter(student=user).prefetch_related('responses')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-requests')
    def my_requests(self, request):
        qs = MentorReviewRequest.objects.filter(student=request.user).prefetch_related('responses')
        return Response(MentorReviewRequestSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='teacher-queue')
    def teacher_queue(self, request):
        if getattr(request.user, 'role', '') not in REVIEWER_ROLES:
            return Response({'detail': 'Reviewer role required.'}, status=status.HTTP_403_FORBIDDEN)
        qs = self.get_queryset().filter(status__in=('pending', 'assigned', 'in_review'))
        return Response(MentorReviewRequestSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='accept')
    def accept(self, request, pk=None):
        if getattr(request.user, 'role', '') not in REVIEWER_ROLES:
            return Response({'detail': 'Reviewer role required.'}, status=status.HTTP_403_FORBIDDEN)
        req = self.get_object()
        req.teacher = request.user
        req.status = 'in_review'
        req.save()
        return Response(MentorReviewRequestSerializer(req).data)

    @action(detail=True, methods=['post'], url_path='respond')
    def respond(self, request, pk=None):
        if getattr(request.user, 'role', '') not in REVIEWER_ROLES:
            return Response({'detail': 'Reviewer role required.'}, status=status.HTTP_403_FORBIDDEN)
        req = self.get_object()
        s = RespondSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        MentorReviewResponse.objects.create(
            request=req, teacher=request.user,
            feedback=s.validated_data['feedback'],
            recommended_next_steps=s.validated_data.get('recommended_next_steps', ''),
            attachments=s.validated_data.get('attachments', []),
        )
        req.status = 'completed'
        req.completed_at = timezone.now()
        req.save()
        req.refresh_from_db()
        return Response(MentorReviewRequestSerializer(req).data)


def models_Q_teacher_or_tenant(user, inst_ids):
    """Helper — returns a Q() for teacher visibility on the review queue."""
    from django.db.models import Q
    return (
        Q(teacher=user)
        | Q(teacher__isnull=True, student__institution_memberships__institution_id__in=inst_ids)
    )
