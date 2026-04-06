"""
Django REST Framework Serializers for Finance ERP System.

Provides comprehensive serialization for all finance models.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
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


# ============================================================================
# USER SERIALIZERS
# ============================================================================

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'first_name', 'last_name']


# ============================================================================
# STUDENT FINANCIAL PROFILE SERIALIZERS
# ============================================================================

class FinancialStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = UserSerializer(source='changed_by', read_only=True)
    
    class Meta:
        model = FinancialStatusHistory
        fields = [
            'id', 'previous_status', 'new_status', 'reason',
            'balance_at_change', 'changed_by', 'changed_by_name',
            'changed_at'
        ]
        read_only_fields = ['changed_at']


class StudentFinancialProfileSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    current_class_name = serializers.CharField(source='current_class.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)
    financial_status_display = serializers.CharField(source='get_financial_status_display', read_only=True)
    
    class Meta:
        model = StudentFinancialProfile
        fields = [
            'id', 'student', 'student_name', 'current_class', 'current_class_name',
            'stream', 'section', 'academic_year', 'academic_year_name',
            'day_or_boarding', 'guardian', 'transport_route', 'hostel',
            'scholarship', 'current_balance', 'arrears_balance', 'advance_payment',
            'total_invoiced', 'total_paid', 'financial_status', 'financial_status_display',
            'last_payment_date', 'arrears_days', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'current_balance', 'arrears_balance', 'total_invoiced', 'total_paid',
            'created_at', 'updated_at', 'financial_status'
        ]


# ============================================================================
# FEE MANAGEMENT SERIALIZERS
# ============================================================================

class FeeCategorySerializer(serializers.ModelSerializer):
    category_type_display = serializers.CharField(source='get_category_type_display', read_only=True)
    
    class Meta:
        model = FeeCategory
        fields = [
            'id', 'code', 'name', 'category_type', 'category_type_display',
            'description', 'gl_account', 'is_mandatory', 'is_recurring',
            'is_waivable', 'is_discountable', 'active'
        ]


class FeeTemplateLineItemSerializer(serializers.ModelSerializer):
    fee_category_detail = FeeCategorySerializer(source='fee_category', read_only=True)
    charge_frequency_display = serializers.CharField(source='get_charge_frequency_display', read_only=True)
    
    class Meta:
        model = FeeTemplateLineItem
        fields = [
            'id', 'fee_category', 'fee_category_detail', 'amount',
            'mandatory', 'optional', 'one_time', 'charge_frequency',
            'charge_frequency_display', 'enable_proration', 'proration_factor',
            'description', 'display_order'
        ]


class FeeTemplateSerializer(serializers.ModelSerializer):
    line_items = FeeTemplateLineItemSerializer(many=True, read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)
    term_name = serializers.CharField(source='term.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = FeeTemplate
        fields = [
            'id', 'academic_year', 'academic_year_name', 'term', 'term_name',
            'grade', 'stream', 'section', 'day_or_boarding', 'student_category',
            'version', 'is_latest_version', 'status', 'status_display',
            'total_amount', 'approved_by', 'approved_at', 'flexible_from',
            'flexible_to', 'line_items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'version', 'is_latest_version', 'total_amount',
            'created_at', 'updated_at'
        ]
    
    def get_total_amount(self, obj):
        return str(obj.calculate_total_amount())


class StudentFeeAssignmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    fee_template_detail = FeeTemplateSerializer(source='fee_template', read_only=True)
    assignment_reason_display = serializers.CharField(source='get_assignment_reason_display', read_only=True)
    
    class Meta:
        model = StudentFeeAssignment
        fields = [
            'id', 'student', 'student_name', 'fee_template', 'fee_template_detail',
            'academic_year', 'term', 'assignment_reason', 'assignment_reason_display',
            'override_template', 'custom_amount', 'override_reason',
            'override_approved_by', 'assigned_on', 'created_at', 'updated_at'
        ]
        read_only_fields = ['assigned_on', 'created_at', 'updated_at']


# ============================================================================
# INVOICING SERIALIZERS
# ============================================================================

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    fee_category_detail = FeeCategorySerializer(source='fee_category', read_only=True)
    discount_approved_by_name = UserSerializer(source='discount_approved_by', read_only=True)
    
    class Meta:
        model = InvoiceLineItem
        fields = [
            'id', 'fee_category', 'fee_category_detail', 'description',
            'quantity', 'unit_amount', 'total_amount', 'discount_amount',
            'discount_percentage', 'discount_reason', 'discount_approved_by',
            'discount_approved_by_name', 'inventory_item',
            'quantity_issued', 'created_at'
        ]
        read_only_fields = ['total_amount', 'created_at']


class CreditNoteSerializer(serializers.ModelSerializer):
    approved_by_name = UserSerializer(source='approved_by', read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    
    class Meta:
        model = CreditNote
        fields = [
            'id', 'credit_note_number', 'invoice', 'student',
            'credit_date', 'amount', 'reason', 'reason_display',
            'description', 'status', 'approved_by', 'approved_by_name',
            'approved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['credit_note_number', 'created_at', 'updated_at']


class InvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)
    term_name = serializers.CharField(source='term.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    invoice_type_display = serializers.CharField(source='get_invoice_type_display', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'student', 'student_name',
            'student_financial_profile', 'academic_year', 'academic_year_name',
            'term', 'term_name', 'invoice_type', 'invoice_type_display',
            'issue_date', 'due_date', 'gross_amount', 'discount_amount',
            'tax_amount', 'net_amount', 'amount_paid', 'amount_outstanding',
            'balance_amount', 'status', 'status_display', 'is_overdue',
            'days_overdue', 'sent_to_parent_date', 'notes',
            'line_items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'invoice_number', 'gross_amount', 'tax_amount', 'net_amount',
            'balance_amount', 'is_overdue', 'days_overdue', 'created_at', 'updated_at'
        ]


# ============================================================================
# PAYMENT SERIALIZERS
# ============================================================================

class PaymentAllocationSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    allocation_type_display = serializers.CharField(source='get_allocation_type_display', read_only=True)
    allocated_by_name = UserSerializer(source='allocated_by', read_only=True)
    
    class Meta:
        model = PaymentAllocation
        fields = [
            'id', 'payment', 'invoice', 'invoice_number', 'amount_allocated',
            'allocation_date', 'allocation_type', 'allocation_type_display',
            'is_partial_allocation', 'allocated_by', 'allocated_by_name',
            'notes', 'created_at'
        ]
        read_only_fields = ['allocation_date', 'created_at']


class ReceiptSerializer(serializers.ModelSerializer):
    printed_by_name = UserSerializer(source='printed_by', read_only=True)
    reprinted_by_name = UserSerializer(source='reprinted_by', read_only=True)
    
    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number', 'payment', 'receipt_date',
            'printed_by', 'printed_by_name', 'printed_date',
            'status', 'original_receipt_number', 'reprinted_at',
            'reprinted_by', 'reprinted_by_name', 'notes',
            'created_at'
        ]
        read_only_fields = ['receipt_number', 'receipt_date', 'created_at']


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    allocation_status_display = serializers.CharField(source='get_allocation_status_display', read_only=True)
    confirmed_by_name = UserSerializer(source='confirmed_by', read_only=True)
    entered_by_name = UserSerializer(source='entered_by', read_only=True)
    allocations = PaymentAllocationSerializer(many=True, read_only=True)
    receipts = ReceiptSerializer(many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_number', 'receipt_number', 'student', 'student_name',
            'amount', 'payment_date', 'payment_method', 'payment_method_display',
            'bank_account', 'mobile_money_ref', 'mobile_money_provider',
            'cheque_number', 'other_reference', 'status', 'status_display',
            'confirmed_by', 'confirmed_by_name', 'confirmed_at',
            'allocation_status', 'allocation_status_display', 'entered_by',
            'entered_by_name', 'payment_source', 'notes',
            'allocations', 'receipts', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'payment_number', 'receipt_number', 'status', 'allocation_status',
            'created_at', 'updated_at'
        ]


# ============================================================================
# ACCOUNTING SERIALIZERS
# ============================================================================

class AccountSerializer(serializers.ModelSerializer):
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)
    parent_account_detail = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Account
        fields = [
            'id', 'account_code', 'account_name', 'account_type',
            'account_type_display', 'description', 'parent_account',
            'parent_account_detail', 'opening_balance_date', 'opening_balance',
            'allow_posting', 'requires_cost_center', 'is_bank_account',
            'is_control_account', 'is_summary_account', 'balance', 'active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['balance', 'created_at', 'updated_at']
    
    def get_parent_account_detail(self, obj):
        if obj.parent_account:
            return {
                'id': obj.parent_account.id,
                'code': obj.parent_account.account_code,
                'name': obj.parent_account.account_name
            }
        return None
    
    def get_balance(self, obj):
        return str(obj.get_balance())


class BankAccountSerializer(serializers.ModelSerializer):
    account_detail = AccountSerializer(source='account', read_only=True)
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)
    
    class Meta:
        model = BankAccount
        fields = [
            'id', 'account', 'account_detail', 'account_number',
            'bank_name', 'currency', 'account_type', 'account_type_display',
            'last_reconciled_date', 'last_reconciled_balance',
            'current_balance', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['current_balance', 'created_at', 'updated_at']


class FinancialPeriodSerializer(serializers.ModelSerializer):
    period_type_display = serializers.CharField(source='get_period_type_display', read_only=True)
    closed_by_name = UserSerializer(source='closed_by', read_only=True)
    
    class Meta:
        model = FinancialPeriod
        fields = [
            'id', 'period_name', 'period_type', 'period_type_display',
            'start_date', 'end_date', 'is_closed', 'closed_at',
            'closed_by', 'closed_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['closed_at', 'created_at', 'updated_at']


class JournalLineItemSerializer(serializers.ModelSerializer):
    account_detail = AccountSerializer(source='account', read_only=True)
    
    class Meta:
        model = JournalLineItem
        fields = [
            'id', 'line_number', 'account', 'account_detail',
            'description', 'debit_amount', 'credit_amount',
            'cost_center', 'reference_type', 'reference_number'
        ]


class JournalEntrySerializer(serializers.ModelSerializer):
    line_items = JournalLineItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approval_required_level_display = serializers.CharField(source='get_approval_required_level_display', read_only=True)
    submitted_by_name = UserSerializer(source='submitted_by', read_only=True)
    approved_by_name = UserSerializer(source='approved_by', read_only=True)
    posted_by_name = UserSerializer(source='posted_by', read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'journal_number', 'entry_date', 'financial_period',
            'description', 'narration', 'total_debit', 'total_credit',
            'status', 'status_display', 'approval_required',
            'approval_required_level', 'approval_required_level_display',
            'submitted_by', 'submitted_by_name', 'submitted_at',
            'approved_by', 'approved_by_name', 'approved_at',
            'posted_by', 'posted_by_name', 'posted_at',
            'is_reversal', 'reversed_journal', 'reversal_reason',
            'line_items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'journal_number', 'total_debit', 'total_credit',
            'created_at', 'updated_at'
        ]


class GeneralLedgerSerializer(serializers.ModelSerializer):
    account_detail = AccountSerializer(source='account', read_only=True)
    
    class Meta:
        model = GeneralLedger
        fields = [
            'id', 'account', 'account_detail', 'financial_period',
            'transaction_date', 'debit_amount', 'credit_amount',
            'description', 'cost_center', 'reference_type', 'reference_number',
            'journal_entry', 'journal_line_item', 'is_reconciled',
            'reconciled_at', 'posted_by', 'posted_at', 'created_at'
        ]
        read_only_fields = ['created_at']


# ============================================================================
# AUDIT & COMPLIANCE SERIALIZERS
# ============================================================================

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = UserSerializer(source='user', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    module_display = serializers.CharField(source='get_module_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'timestamp', 'user', 'user_name', 'action', 'action_display',
            'module', 'module_display', 'affected_table', 'affected_record_id',
            'affected_record_display', 'old_values', 'new_values',
            'changes_summary', 'ip_address', 'user_agent', 'status',
            'error_details', 'requires_approval', 'approved_by', 'approved_at'
        ]
        read_only_fields = ['timestamp']


class FinanceExceptionSerializer(serializers.ModelSerializer):
    exception_type_display = serializers.CharField(source='get_exception_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = FinanceException
        fields = [
            'id', 'exception_type', 'exception_type_display', 'severity',
            'severity_display', 'description', 'affected_record_type',
            'affected_record_id', 'detected_at', 'status', 'status_display',
            'investigation_notes', 'resolved_by', 'resolved_at',
            'resolution', 'created_at'
        ]
        read_only_fields = ['detected_at', 'created_at']


# ============================================================================
# SUPPORT SERIALIZERS
# ============================================================================

class CostCenterSerializer(serializers.ModelSerializer):
    manager_name = UserSerializer(source='manager', read_only=True)
    
    class Meta:
        model = CostCenter
        fields = [
            'id', 'code', 'name', 'description', 'parent_cost_center',
            'manager', 'manager_name', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class FiscalYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiscalYear
        fields = [
            'id', 'fiscal_year_name', 'fiscal_year_start_date',
            'fiscal_year_end_date', 'is_current_fiscal_year',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class DiscountRuleSerializer(serializers.ModelSerializer):
    rule_type_display = serializers.CharField(source='get_rule_type_display', read_only=True)
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)
    
    class Meta:
        model = DiscountRule
        fields = [
            'id', 'rule_code', 'rule_name', 'rule_type', 'rule_type_display',
            'description', 'discount_type', 'discount_type_display',
            'discount_value', 'applicable_to_fee_categories', 'requires_proof',
            'requires_approval', 'max_uses_per_student', 'active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

