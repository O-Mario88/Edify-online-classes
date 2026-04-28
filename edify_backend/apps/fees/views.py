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
import json
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from institutions.models import InstitutionMembership
from notifications.utils import notify
from .models import FeeAssessment, FeePayment
from .serializers import FeeAssessmentSerializer, FeePaymentSerializer
from .providers import get_provider, IpnRejected


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
        payment = serializer.save(recorded_by=self.request.user)
        # Notify the student so a parent/learner sees the receipt confirmed
        # in the in-app inbox, not only on the school's bursar slip.
        balance_after = assessment.balance
        notify(
            user=assessment.student,
            title=f'Payment recorded: {payment.amount} {assessment.currency}',
            message=(
                f'Thank you. Outstanding balance for {assessment.item} ({assessment.term_label}) '
                f'is now {balance_after} {assessment.currency}.'
            ),
            kind='fee_payment_recorded',
            link='/dashboard/parent',
            extra={'reference': payment.reference, 'method': payment.method},
        )


class FeePaymentIpnView(APIView):
    """POST /api/v1/fees/ipn/<provider>/

    Webhook receiver for Pesapal / Airtel / etc. Converts the provider
    payload into a FeePayment row idempotently — repeat IPNs for the
    same reference create no duplicates.

    Public endpoint (no auth) because providers don't carry our JWTs.
    Each provider's verify_signature() guards against forged calls; in
    stub mode (no credentials configured) we accept everything but log
    a warning so the deploy team knows the gate isn't real yet.

    Reference convention: outbound checkout URLs MUST use
        merchant_reference = f"fee:{assessment.id}:{nonce}"
    so the IPN handler can look up which FeeAssessment was paid.
    """
    permission_classes = [AllowAny]
    authentication_classes: list = []  # ignore SessionAuth/CSRF — provider can't send our cookies

    def post(self, request, provider_name: str, *args, **kwargs):
        try:
            provider = get_provider(provider_name)
        except IpnRejected as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            provider.verify_signature(request.body, dict(request.headers))
        except IpnRejected as e:
            return Response({'detail': str(e)}, status=status.HTTP_403_FORBIDDEN)

        try:
            payload = request.data if isinstance(request.data, dict) else json.loads(request.body or b'{}')
        except (ValueError, TypeError):
            return Response({'detail': 'Invalid JSON body.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            parsed = provider.parse_ipn(payload)
        except (KeyError, ValueError, TypeError) as e:
            return Response({'detail': f'Could not parse IPN: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        if not parsed.status_ok:
            # Not a successful payment — provider may also send pending /
            # failed callbacks. Acknowledge with 200 so they don't retry,
            # but don't write a payment.
            return Response({'detail': 'Payment status not successful; ignored.'}, status=status.HTTP_200_OK)

        if not parsed.assessment_id:
            return Response(
                {'detail': 'IPN reference does not include an assessment id (expected "fee:<id>:...").'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            assessment = FeeAssessment.objects.get(id=parsed.assessment_id)
        except FeeAssessment.DoesNotExist:
            return Response({'detail': 'Unknown assessment.'}, status=status.HTTP_404_NOT_FOUND)

        # Idempotency: if a payment with the same reference already exists
        # for this assessment, return the existing row instead of writing
        # a duplicate. Providers retry IPNs aggressively.
        existing = FeePayment.objects.filter(
            assessment=assessment, reference=parsed.reference,
        ).first()
        if existing:
            return Response(
                {'detail': 'Already recorded.', 'payment_id': existing.id},
                status=status.HTTP_200_OK,
            )

        payment = FeePayment.objects.create(
            assessment=assessment,
            amount=parsed.amount,
            method=parsed.method,
            reference=parsed.reference,
            paid_on=parsed.paid_on,
            notes=f'Auto-imported from {provider.name}'
                  + (' (stub mode — manual verification required)' if provider.stub_mode() else ''),
        )

        # Notify the student so the inbox shows the receipt — same as the
        # manual-record path.
        balance_after = assessment.balance
        notify(
            user=assessment.student,
            title=f'Payment received: {payment.amount} {assessment.currency}',
            message=(
                f'We confirmed your {provider.name.replace("_", " ")} payment for {assessment.item} '
                f'({assessment.term_label}). Outstanding balance is now {balance_after} {assessment.currency}.'
            ),
            kind='fee_payment_received',
            link='/dashboard/parent',
            extra={'reference': parsed.reference, 'method': parsed.method, 'provider': provider.name},
        )

        return Response(
            {
                'payment_id': payment.id,
                'assessment_id': assessment.id,
                'balance': str(balance_after),
                'stub_mode': provider.stub_mode(),
            },
            status=status.HTTP_201_CREATED,
        )
