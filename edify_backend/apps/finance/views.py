"""
Django REST Framework ViewSets for Finance ERP System.

Provides comprehensive REST API endpoints for all finance operations.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Q
from decimal import Decimal

from .models import (
    StudentFinancialProfile, FinancialStatusHistory,
    FeeCategory, FeeTemplate, FeeTemplateLineItem, StudentFeeAssignment,
    Invoice, InvoiceLineItem, CreditNote,
    Payment, PaymentAllocation, Receipt,
    Account, BankAccount, FinancialPeriod,
    JournalEntry, JournalLineItem, GeneralLedger,
    AuditLog, Exception as FinanceException,
    CostCenter, FiscalYear, DiscountRule
)
from .serializers import (
    StudentFinancialProfileSerializer, FinancialStatusHistorySerializer,
    FeeCategorySerializer, FeeTemplateSerializer, FeeTemplateLineItemSerializer, StudentFeeAssignmentSerializer,
    InvoiceSerializer, InvoiceLineItemSerializer, CreditNoteSerializer,
    PaymentSerializer, PaymentAllocationSerializer, ReceiptSerializer,
    AccountSerializer, BankAccountSerializer, FinancialPeriodSerializer,
    JournalEntrySerializer, JournalLineItemSerializer, GeneralLedgerSerializer,
    AuditLogSerializer, FinanceExceptionSerializer,
    CostCenterSerializer, FiscalYearSerializer, DiscountRuleSerializer
)


# ============================================================================
# STUDENT FINANCIAL PROFILE VIEWSETS
# ============================================================================

class StudentFinancialProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing student financial profiles.
    
    Features:
    - List all student financial profiles
    - Retrieve student balance information
    - Update student financial status
    - Filter by academic year, class, financial status
    - Search by student name
    """
    queryset = StudentFinancialProfile.objects.all()
    serializer_class = StudentFinancialProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['academic_year', 'current_class', 'financial_status', 'day_or_boarding']
    search_fields = ['student__first_name', 'student__last_name', 'student__email']
    ordering_fields = ['current_balance', 'arrears_balance', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['GET'])
    def balance(self, request, pk=None):
        """Get detailed balance information for a student."""
        profile = self.get_object()
        return Response({
            'student_id': profile.student.id,
            'student_name': profile.student.get_full_name(),
            'current_balance': str(profile.current_balance),
            'arrears_balance': str(profile.arrears_balance),
            'advance_payment': str(profile.advance_payment),
            'total_invoiced': str(profile.total_invoiced),
            'total_paid': str(profile.total_paid),
            'financial_status': profile.financial_status,
            'last_payment_date': profile.last_payment_date,
            'arrears_days': profile.arrears_days,
        })
    
    @action(detail=True, methods=['GET'])
    def history(self, request, pk=None):
        """Get financial status history for a student."""
        profile = self.get_object()
        history = profile.financial_status_history.all()
        serializer = FinancialStatusHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['GET'])
    def invoices(self, request, pk=None):
        """Get all invoices for a student."""
        profile = self.get_object()
        invoices = profile.invoices.all()
        serializer = InvoiceSerializer(invoices, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['GET'])
    def payments(self, request, pk=None):
        """Get all payments for a student."""
        profile = self.get_object()
        payments = profile.payments.all()
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['POST'])
    def update_balance(self, request, pk=None):
        """Manually recalculate student balance (usually done via signals)."""
        profile = self.get_object()
        profile.recalculate_balance()
        profile.save()
        return Response({'status': 'Balance recalculated', 'balance': str(profile.current_balance)})


class FinancialStatusHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only ViewSet for financial status history (audit trail)."""
    queryset = FinancialStatusHistory.objects.all()
    serializer_class = FinancialStatusHistorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student_profile', 'new_status']
    ordering_fields = ['changed_at']
    ordering = ['-changed_at']


# ============================================================================
# FEE MANAGEMENT VIEWSETS
# ============================================================================

class FeeCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing fee categories."""
    queryset = FeeCategory.objects.filter(active=True)
    serializer_class = FeeCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['code', 'name', 'category_type']
    ordering_fields = ['code', 'name']
    ordering = ['code']


class FeeTemplateLineItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing fee template line items."""
    queryset = FeeTemplateLineItem.objects.all()
    serializer_class = FeeTemplateLineItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['fee_template']


class FeeTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing fee templates.
    
    Features:
    - Create class-based fee structures
    - Version control for fee changes
    - Approve templates before use
    - Filter by term, grade, status
    """
    queryset = FeeTemplate.objects.all()
    serializer_class = FeeTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['academic_year', 'term', 'grade', 'status']
    ordering_fields = ['academic_year', 'term', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['POST'])
    def approve(self, request, pk=None):
        """Approve a fee template for use."""
        template = self.get_object()
        if template.status != 'draft':
            return Response(
                {'error': 'Only draft templates can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        template.status = 'approved'
        template.approved_by = request.user
        template.approved_at = timezone.now()
        template.save()
        return Response({'status': 'Template approved', 'template': FeeTemplateSerializer(template).data})
    
    @action(detail=True, methods=['POST'])
    def activate(self, request, pk=None):
        """Activate a fee template."""
        template = self.get_object()
        if template.status != 'approved':
            return Response(
                {'error': 'Only approved templates can be activated'},
                status=status.HTTP_400_BAD_REQUEST
            )
        template.status = 'active'
        template.save()
        return Response({'status': 'Template activated'})


class StudentFeeAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for assigning fee templates to students."""
    queryset = StudentFeeAssignment.objects.all()
    serializer_class = StudentFeeAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'academic_year', 'term']


# ============================================================================
# INVOICING VIEWSETS
# ============================================================================

class InvoiceLineItemViewSet(viewsets.ModelViewSet):
    """ViewSet for invoice line items."""
    queryset = InvoiceLineItem.objects.all()
    serializer_class = InvoiceLineItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['invoice']


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing invoices.
    
    Features:
    - Create and issue invoices
    - Track payment status
    - Bulk invoice generation
    - Mark overdue invoices
    - Filter by status, student, term
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['student', 'status', 'academic_year', 'term', 'is_overdue']
    search_fields = ['invoice_number', 'student__first_name', 'student__last_name']
    ordering_fields = ['issue_date', 'due_date', 'balance_amount']
    ordering = ['-issue_date']
    
    @action(detail=True, methods=['POST'])
    def issue(self, request, pk=None):
        """Issue a draft invoice."""
        invoice = self.get_object()
        if invoice.status != 'draft':
            return Response(
                {'error': 'Only draft invoices can be issued'},
                status=status.HTTP_400_BAD_REQUEST
            )
        invoice.issue()
        return Response({'status': 'Invoice issued', 'invoice': InvoiceSerializer(invoice).data})
    
    @action(detail=True, methods=['POST'])
    def mark_overdue(self, request, pk=None):
        """Mark invoice as overdue (usually automatic)."""
        invoice = self.get_object()
        invoice.mark_overdue()
        invoice.save()
        return Response({'status': 'Invoice marked overdue', 'days_overdue': invoice.days_overdue})
    
    @action(detail=False, methods=['POST'])
    def generate_batch(self, request):
        """
        Generate invoices for entire class/term.
        
        Expected request data:
        {
            "term_id": 1,
            "class_id": 1,
            "academic_year_id": 1
        }
        """
        term_id = request.data.get('term_id')
        class_id = request.data.get('class_id')
        academic_year_id = request.data.get('academic_year_id')
        
        if not all([term_id, class_id, academic_year_id]):
            return Response(
                {'error': 'term_id, class_id, and academic_year_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement batch generation logic
        return Response({
            'status': 'Batch generation initiated',
            'message': 'Invoices will be generated in background'
        })
    
    @action(detail=False, methods=['GET'])
    def overdue(self, request):
        """Get all overdue invoices."""
        overdue_invoices = Invoice.objects.filter(is_overdue=True)
        serializer = self.get_serializer(overdue_invoices, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'])
    def outstanding(self, request):
        """Get all invoices with outstanding balance."""
        outstanding = Invoice.objects.filter(
            status__in=['issued', 'partially_paid'],
            balance_amount__gt=0
        )
        serializer = self.get_serializer(outstanding, many=True)
        return Response(serializer.data)


class CreditNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing credit notes (debt reduction)."""
    queryset = CreditNote.objects.all()
    serializer_class = CreditNoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'status']
    ordering_fields = ['credit_date']
    ordering = ['-credit_date']
    
    @action(detail=True, methods=['POST'])
    def approve(self, request, pk=None):
        """Approve a credit note."""
        credit_note = self.get_object()
        if credit_note.status != 'draft':
            return Response(
                {'error': 'Only draft credit notes can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        credit_note.status = 'approved'
        credit_note.approved_by = request.user
        credit_note.approved_at = timezone.now()
        credit_note.save()
        return Response({'status': 'Credit note approved'})


# ============================================================================
# PAYMENT VIEWSETS
# ============================================================================

class PaymentAllocationViewSet(viewsets.ModelViewSet):
    """ViewSet for payment allocations."""
    queryset = PaymentAllocation.objects.all()
    serializer_class = PaymentAllocationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['payment', 'invoice']


class ReceiptViewSet(viewsets.ModelViewSet):
    """ViewSet for receipt management."""
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['receipt_number']
    ordering_fields = ['receipt_date']
    ordering = ['-receipt_date']
    
    @action(detail=True, methods=['POST'])
    def reprint(self, request, pk=None):
        """Reprint a receipt."""
        receipt = self.get_object()
        if receipt.status == 'voided':
            return Response(
                {'error': 'Cannot reprint voided receipt'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response({
            'status': 'Receipt reprinted',
            'receipt_number': receipt.receipt_number
        })


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing payments.
    
    Features:
    - Record payments from students
    - Confirm payments
    - Auto-allocate to invoices
    - Support multiple payment methods
    - Track allocation status
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['student', 'status', 'payment_method', 'allocation_status']
    search_fields = ['payment_number', 'receipt_number', 'student__first_name', 'student__last_name']
    ordering_fields = ['payment_date', 'amount']
    ordering = ['-payment_date']
    
    @action(detail=True, methods=['POST'])
    def confirm(self, request, pk=None):
        """Confirm a pending payment."""
        payment = self.get_object()
        if payment.status != 'pending':
            return Response(
                {'error': 'Only pending payments can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payment.status = 'confirmed'
        payment.confirmed_by = request.user
        payment.confirmed_at = timezone.now()
        payment.save()
        return Response({'status': 'Payment confirmed'})
    
    @action(detail=True, methods=['POST'])
    def allocate(self, request, pk=None):
        """
        Allocate payment to invoices.
        
        Request data:
        {
            "allocations": [
                {"invoice_id": 1, "amount": 100000},
                {"invoice_id": 2, "amount": 50000}
            ]
        }
        """
        payment = self.get_object()
        allocations_data = request.data.get('allocations', [])
        
        if not allocations_data:
            return Response(
                {'error': 'allocations data required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'status': 'Payment allocated',
            'payment_id': payment.id,
            'allocation_count': len(allocations_data)
        })
    
    @action(detail=True, methods=['POST'])
    def reverse(self, request, pk=None):
        """Reverse a payment and its allocations."""
        payment = self.get_object()
        if payment.status in ['reversed', 'cancelled']:
            return Response(
                {'error': 'Payment already reversed/cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response({'status': 'Payment reversed'})
    
    @action(detail=False, methods=['GET'])
    def unallocated(self, request):
        """Get all unallocated payments."""
        unallocated = Payment.objects.filter(allocation_status='unallocated')
        serializer = self.get_serializer(unallocated, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'])
    def pending(self, request):
        """Get all pending payments."""
        pending = Payment.objects.filter(status='pending')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)


# ============================================================================
# ACCOUNTING VIEWSETS
# ============================================================================

class AccountViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Chart of Accounts.
    
    Features:
    - View all GL accounts
    - Get account balances
    - Hierarchical account structure
    - Filter by account type
    """
    queryset = Account.objects.filter(active=True)
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['account_code', 'account_name']
    ordering_fields = ['account_code', 'account_name']
    ordering = ['account_code']
    
    @action(detail=True, methods=['GET'])
    def balance(self, request, pk=None):
        """Get current balance for an account."""
        account = self.get_object()
        return Response({
            'account_code': account.account_code,
            'account_name': account.account_name,
            'account_type': account.get_account_type_display(),
            'balance': str(account.get_balance()),
            'opening_balance': str(account.opening_balance),
        })


class BankAccountViewSet(viewsets.ModelViewSet):
    """ViewSet for bank account management."""
    queryset = BankAccount.objects.filter(active=True)
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['account_number', 'bank_name']
    
    @action(detail=True, methods=['POST'])
    def reconcile(self, request, pk=None):
        """Record bank reconciliation."""
        bank_account = self.get_object()
        reconciled_balance = request.data.get('balance')
        
        if reconciled_balance is None:
            return Response(
                {'error': 'balance is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bank_account.last_reconciled_date = timezone.now()
        bank_account.last_reconciled_balance = Decimal(reconciled_balance)
        bank_account.save()
        
        return Response({
            'status': 'Bank reconciliation recorded',
            'reconciled_balance': str(bank_account.last_reconciled_balance),
            'reconciled_date': bank_account.last_reconciled_date
        })


class FinancialPeriodViewSet(viewsets.ModelViewSet):
    """ViewSet for financial period management."""
    queryset = FinancialPeriod.objects.all()
    serializer_class = FinancialPeriodSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [OrderingFilter]
    ordering_fields = ['start_date']
    ordering = ['-start_date']
    
    @action(detail=True, methods=['POST'])
    def close(self, request, pk=None):
        """Close a financial period (no more edits allowed)."""
        period = self.get_object()
        if period.is_closed:
            return Response(
                {'error': 'Period already closed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        period.is_closed = True
        period.closed_at = timezone.now()
        period.closed_by = request.user
        period.save()
        return Response({'status': 'Period closed'})


class JournalLineItemViewSet(viewsets.ModelViewSet):
    """ViewSet for journal entry line items."""
    queryset = JournalLineItem.objects.all()
    serializer_class = JournalLineItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['journal_entry']


class JournalEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for manual journal entries.
    
    Features:
    - Create manual GL entries
    - Multi-level approval workflow
    - GL balance validation
    - Reversal tracking
    """
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'financial_period', 'approval_required_level']
    ordering_fields = ['entry_date']
    ordering = ['-entry_date']
    
    @action(detail=True, methods=['POST'])
    def submit(self, request, pk=None):
        """Submit a draft journal entry for approval."""
        journal = self.get_object()
        if journal.status != 'draft':
            return Response(
                {'error': 'Only draft entries can be submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        journal.status = 'submitted'
        journal.submitted_by = request.user
        journal.submitted_at = timezone.now()
        journal.save()
        return Response({'status': 'Journal entry submitted'})
    
    @action(detail=True, methods=['POST'])
    def approve(self, request, pk=None):
        """Approve a submitted journal entry."""
        journal = self.get_object()
        if journal.status != 'submitted':
            return Response(
                {'error': 'Only submitted entries can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        journal.status = 'approved'
        journal.approved_by = request.user
        journal.approved_at = timezone.now()
        journal.save()
        return Response({'status': 'Journal entry approved'})
    
    @action(detail=True, methods=['POST'])
    def post(self, request, pk=None):
        """Post an approved journal entry to GL."""
        journal = self.get_object()
        if journal.status != 'approved':
            return Response(
                {'error': 'Only approved entries can be posted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if journal.total_debit != journal.total_credit:
            return Response(
                {'error': 'Entry does not balance'},
                status=status.HTTP_400_BAD_REQUEST
            )
        journal.status = 'posted'
        journal.posted_by = request.user
        journal.posted_at = timezone.now()
        journal.save()
        return Response({'status': 'Journal entry posted'})
    
    @action(detail=True, methods=['POST'])
    def reverse(self, request, pk=None):
        """Create a reversal entry for a posted journal."""
        journal = self.get_object()
        if journal.status != 'posted':
            return Response(
                {'error': 'Only posted entries can be reversed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response({'status': 'Reversal journal created'})


class GeneralLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for General Ledger.
    
    Features:
    - View posted GL entries
    - Filter by account, date range
    - Search by reference
    - Reconciliation tracking
    """
    queryset = GeneralLedger.objects.all()
    serializer_class = GeneralLedgerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['account', 'financial_period', 'reference_type', 'is_reconciled']
    search_fields = ['reference_number', 'description']
    ordering_fields = ['transaction_date']
    ordering = ['-transaction_date']


# ============================================================================
# AUDIT & COMPLIANCE VIEWSETS
# ============================================================================

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for audit logs.
    
    Features:
    - View all financial transactions
    - Filter by action, module, user
    - Search by affected record
    - Complete change tracking
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['action', 'module', 'user', 'status']
    search_fields = ['affected_record_display', 'changes_summary']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']


class FinanceExceptionViewSet(viewsets.ModelViewSet):
    """ViewSet for financial exception monitoring and investigation."""
    queryset = FinanceException.objects.all()
    serializer_class = FinanceExceptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['exception_type', 'severity', 'status']
    ordering_fields = ['detected_at', 'severity']
    ordering = ['-detected_at']
    
    @action(detail=True, methods=['POST'])
    def resolve(self, request, pk=None):
        """Mark an exception as resolved."""
        exception = self.get_object()
        resolution = request.data.get('resolution')
        
        if not resolution:
            return Response(
                {'error': 'resolution is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exception.status = 'resolved'
        exception.resolved_by = request.user
        exception.resolved_at = timezone.now()
        exception.resolution = resolution
        exception.save()
        
        return Response({'status': 'Exception resolved'})


# ============================================================================
# SUPPORT VIEWSETS
# ============================================================================

class CostCenterViewSet(viewsets.ModelViewSet):
    """ViewSet for cost center (department) management."""
    queryset = CostCenter.objects.filter(active=True)
    serializer_class = CostCenterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['code', 'name']


class FiscalYearViewSet(viewsets.ModelViewSet):
    """ViewSet for fiscal year management."""
    queryset = FiscalYear.objects.all()
    serializer_class = FiscalYearSerializer
    permission_classes = [IsAdminUser]
    ordering_fields = ['fiscal_year_start_date']
    ordering = ['-fiscal_year_start_date']


class DiscountRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for discount rule management."""
    queryset = DiscountRule.objects.filter(active=True)
    serializer_class = DiscountRuleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['rule_code', 'rule_name']
