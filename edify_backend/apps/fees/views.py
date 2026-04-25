"""Fee endpoints — institution admin scope.

Two viewsets:
- /api/v1/fees/assessments/  — CRUD on the per-student fee ledger
- /api/v1/fees/payments/     — append-only receipts

Plus a summary action /api/v1/fees/assessments/summary/ that returns
totals (assessed, collected, outstanding, students-with-balance) for
the calling admin's institution. Powers the FeeCollectionPanel on
the institution dashboard.
"""
from decimal import Decimal
from django.db.models import Sum, F, Q, Count, DecimalField
from django.db.models.functions import Coalesce
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from institutions.models import InstitutionMembership
from .models import FeeAssessment, FeePayment
from .serializers import FeeAssessmentSerializer, FeePaymentSerializer


SCHOOL_ADMIN_ROLES = ('institution_admin', 'headteacher', 'deputy', 'registrar', 'dos')


def _admin_institution_ids(user):
    """The list of institution IDs `user` administers (or all for platform admins)."""
    role = getattr(user, 'role', '')
    if role == 'platform_admin':
        return None  # Sentinel for "no scoping"
    return list(
        InstitutionMembership.objects.filter(
            user=user, status='active', role__in=SCHOOL_ADMIN_ROLES,
        ).values_list('institution_id', flat=True)
    )


class FeeAssessmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FeeAssessmentSerializer

    def get_queryset(self):
        inst_ids = _admin_institution_ids(self.request.user)
        qs = FeeAssessment.objects.select_related('institution', 'student').prefetch_related('payments')
        # Students see their own ledger; admins see their institutions'; nobody else.
        role = getattr(self.request.user, 'role', '')
        if role == 'platform_admin':
            return qs
        if inst_ids:
            return qs.filter(institution_id__in=inst_ids)
        # Fall through: a learner viewing their own assessments.
        return qs.filter(student=self.request.user)

    def perform_create(self, serializer):
        # Restrict to institutions the caller administers.
        inst_ids = _admin_institution_ids(self.request.user)
        institution = serializer.validated_data.get('institution')
        if inst_ids is not None and institution and institution.id not in inst_ids:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only create assessments for institutions you administer.')
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Aggregate assessed / collected / outstanding for the caller's
        institution(s). Returns honest zeros when no assessments exist —
        no fake numbers."""
        qs = self.get_queryset().exclude(status__in=['cancelled', 'waived'])
        # Per-row totals via subquery aggregate
        aggregates = qs.aggregate(
            total_assessed=Coalesce(Sum('amount'), Decimal('0'), output_field=DecimalField(max_digits=14, decimal_places=2)),
        )
        # Sum payments over the visible assessments. Filter payments to those
        # whose parent assessment is in the visible set.
        payments_qs = FeePayment.objects.filter(assessment__in=qs)
        total_collected = payments_qs.aggregate(
            s=Coalesce(Sum('amount'), Decimal('0'), output_field=DecimalField(max_digits=14, decimal_places=2)),
        )['s']

        outstanding = aggregates['total_assessed'] - total_collected
        students_with_balance = qs.filter(status__in=['pending', 'partial']).values('student').distinct().count()
        overdue = qs.filter(status__in=['pending', 'partial'], due_date__isnull=False).filter(due_date__lt=__import__('datetime').date.today()).count()

        return Response({
            'currency': 'UGX',  # Most pilot accounts. Per-row currency is preserved on the assessment itself.
            'total_assessed': str(aggregates['total_assessed']),
            'total_collected': str(total_collected),
            'outstanding': str(outstanding),
            'students_with_balance': students_with_balance,
            'overdue_count': overdue,
            'assessment_count': qs.count(),
        })


class FeePaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FeePaymentSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        inst_ids = _admin_institution_ids(self.request.user)
        qs = FeePayment.objects.select_related('assessment__institution', 'assessment__student')
        role = getattr(self.request.user, 'role', '')
        if role == 'platform_admin':
            return qs
        if inst_ids:
            return qs.filter(assessment__institution_id__in=inst_ids)
        return qs.filter(assessment__student=self.request.user)

    def perform_create(self, serializer):
        inst_ids = _admin_institution_ids(self.request.user)
        assessment = serializer.validated_data['assessment']
        if inst_ids is not None and assessment.institution_id not in (inst_ids or []):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only record payments for institutions you administer.')
        serializer.save(recorded_by=self.request.user)
