from rest_framework import viewsets, permissions
from .models import FeeItem, FeeTemplate, Invoice, Payment, BursaryScheme, ExpenseCategory, ExpenseRecord
from .serializers import (
    FeeItemSerializer, FeeTemplateSerializer, InvoiceSerializer, PaymentSerializer, 
    BursarySchemeSerializer, ExpenseCategorySerializer, ExpenseRecordSerializer
)

from institutions.models import InstitutionMembership

class ScopedByInstitutionMixin:
    """
    Mixin to automatically filter querysets by the requesting user's institution.
    Enforces strict multi-tenant isolation by verifying the user has active membership.
    """
    def get_queryset(self):
        qs = super().get_queryset()
        
        # Superusers bypass tenant isolation for master debugging
        if self.request.user.is_superuser:
            return qs

        # Get institutions where user is active
        user_institutions = InstitutionMembership.objects.filter(
            user=self.request.user, 
            status='active'
        ).values_list('institution_id', flat=True)

        if not user_institutions:
            return qs.none()
            
        qs = qs.filter(institution_id__in=user_institutions)
        
        # Optional further refinement by specific ID
        requested_id = self.request.query_params.get('institution_id')
        if requested_id and str(requested_id) in [str(i) for i in user_institutions]:
            qs = qs.filter(institution_id=requested_id)
            
        return qs

class FeeItemViewSet(ScopedByInstitutionMixin, viewsets.ModelViewSet):
    queryset = FeeItem.objects.select_related('institution').all()
    serializer_class = FeeItemSerializer
    permission_classes = [permissions.IsAuthenticated]

class FeeTemplateViewSet(ScopedByInstitutionMixin, viewsets.ModelViewSet):
    queryset = FeeTemplate.objects.select_related('institution').prefetch_related('applicable_classes', 'fee_items').all()
    serializer_class = FeeTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

class InvoiceViewSet(ScopedByInstitutionMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('institution', 'student').all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

class PaymentViewSet(ScopedByInstitutionMixin, viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('institution', 'student', 'invoice').all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

class BursarySchemeViewSet(ScopedByInstitutionMixin, viewsets.ModelViewSet):
    queryset = BursaryScheme.objects.select_related('institution').all()
    serializer_class = BursarySchemeSerializer
    permission_classes = [permissions.IsAuthenticated]

class ExpenseCategoryViewSet(ScopedByInstitutionMixin, viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.select_related('institution').all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ExpenseRecordViewSet(ScopedByInstitutionMixin, viewsets.ModelViewSet):
    queryset = ExpenseRecord.objects.select_related('institution', 'category').all()
    serializer_class = ExpenseRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
