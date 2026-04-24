from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from institutions.models import InstitutionMembership
from passport.models import LearningPassport

from .models import AdmissionApplication, AdmissionStatusEvent
from .serializers import AdmissionApplicationSerializer, StatusChangeSerializer


def _is_institution_reviewer(user, institution_id) -> bool:
    role = getattr(user, 'role', '')
    if role == 'platform_admin':
        return True
    return InstitutionMembership.objects.filter(
        user=user, institution_id=institution_id, status='active',
        role__in=('headteacher', 'deputy', 'registrar', 'dos', 'institution_admin'),
    ).exists() or role == 'institution_admin' and InstitutionMembership.objects.filter(
        user=user, institution_id=institution_id, status='active',
    ).exists()


class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AdmissionApplicationSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')
        if role == 'platform_admin':
            return AdmissionApplication.objects.all().select_related('institution').prefetch_related('events')
        if role in ('institution_admin',):
            inst_ids = InstitutionMembership.objects.filter(
                user=user, status='active',
            ).values_list('institution_id', flat=True)
            return AdmissionApplication.objects.filter(
                institution_id__in=inst_ids,
            ).select_related('institution').prefetch_related('events')
        # Students / parents see their own only.
        return AdmissionApplication.objects.filter(student=user).select_related('institution').prefetch_related('events')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'], url_path='my')
    def my_applications(self, request):
        qs = AdmissionApplication.objects.filter(student=request.user).select_related('institution').prefetch_related('events')
        return Response(AdmissionApplicationSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='institution-inbox')
    def institution_inbox(self, request):
        role = getattr(request.user, 'role', '')
        if role not in ('institution_admin', 'platform_admin'):
            return Response({'detail': 'Institution admin role required.'}, status=status.HTTP_403_FORBIDDEN)
        inst_ids = InstitutionMembership.objects.filter(
            user=request.user, status='active',
        ).values_list('institution_id', flat=True)
        qs = AdmissionApplication.objects.filter(
            institution_id__in=inst_ids,
            status__in=('submitted', 'under_review', 'more_info_requested', 'interview_invited'),
        ).select_related('institution').prefetch_related('events')
        return Response(AdmissionApplicationSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        app = self.get_object()
        if app.student_id != request.user.id:
            return Response({'detail': 'Only the applicant can submit.'}, status=status.HTTP_403_FORBIDDEN)
        if app.status not in ('draft', 'more_info_requested'):
            return Response({'detail': f'Cannot submit from status "{app.status}".'}, status=status.HTTP_400_BAD_REQUEST)

        # Snapshot the passport share token if requested.
        if app.share_passport:
            passport, _ = LearningPassport.objects.get_or_create(student=request.user)
            if passport.visibility != 'shareable' or not passport.public_share_token:
                passport.enable_public_share()
            app.shared_passport_token = passport.public_share_token or ''

        from_status = app.status
        app.status = 'submitted'
        app.submitted_at = timezone.now()
        app.save()
        AdmissionStatusEvent.objects.create(
            application=app, from_status=from_status, to_status='submitted',
            actor=request.user, note='Application submitted.',
        )
        app.refresh_from_db()
        return Response(AdmissionApplicationSerializer(app).data)

    @action(detail=True, methods=['post'], url_path='change-status')
    def change_status(self, request, pk=None):
        app = self.get_object()
        if not _is_institution_reviewer(request.user, app.institution_id):
            return Response({'detail': 'Institution reviewer role required.'}, status=status.HTTP_403_FORBIDDEN)
        s = StatusChangeSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        to_status = s.validated_data['to_status']
        note = s.validated_data.get('note', '')
        from_status = app.status
        app.status = to_status
        app.reviewed_at = timezone.now()
        app.save()
        AdmissionStatusEvent.objects.create(
            application=app, from_status=from_status, to_status=to_status,
            actor=request.user, note=note,
        )
        app.refresh_from_db()
        return Response(AdmissionApplicationSerializer(app).data)
