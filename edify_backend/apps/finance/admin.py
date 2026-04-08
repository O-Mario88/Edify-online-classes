"""
Django Admin interface for Finance ERP System.

Provides comprehensive admin interface for managing all finance data.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Sum
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


class ReadOnlyInline(admin.TabularInline):
    """Base inline for read-only display."""
    extra = 0
    can_delete = False
    
    def has_add_permission(self, request):
        return False


class InvoiceLineItemInline(ReadOnlyInline):
    model = InvoiceLineItem
    fields = ['fee_category', 'description', 'quantity', 'unit_amount', 'total_amount', 'discount_amount']
    readonly_fields = ['fee_category', 'description', 'quantity', 'unit_amount', 'total_amount', 'discount_amount']


class PaymentAllocationInline(ReadOnlyInline):
    model = PaymentAllocation
    fields = ['invoice', 'amount_allocated', 'allocation_type']
    readonly_fields = ['invoice', 'amount_allocated', 'allocation_type']


class FeeTemplateLineItemInline(admin.TabularInline):
    model = FeeTemplateLineItem
    extra = 1
    fields = ['fee_category', 'amount', 'is_mandatory', 'is_optional', 'is_one_time', 'charge_frequency', 'display_order']


@admin.register(StudentFinancialProfile)
class StudentFinancialProfileAdmin(admin.ModelAdmin):
    list_display = ('student_name', 'current_class', 'current_balance_display', 'financial_status_badge', 'arrears_balance_display', 'academic_year')
    list_filter = ('financial_status', 'academic_year', 'current_class', 'day_or_boarding')
    search_fields = ('student__first_name', 'student__last_name', 'student__email')
    readonly_fields = ('created_at', 'updated_at', 'current_balance', 'arrears_balance', 'total_invoiced', 'total_paid')
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'current_class', 'stream', 'section', 'academic_year')
        }),
        ('Financial Status', {
            'fields': ('financial_status', 'current_balance', 'arrears_balance', 'advance_payment')
        }),
        ('Summary', {
            'fields': ('total_invoiced', 'total_paid', 'guardian', 'day_or_boarding')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name()
    student_name.short_description = 'Student'
    
    def current_balance_display(self, obj):
        color = 'red' if obj.current_balance < 0 else 'green'
        return format_html(
            '<span style="color: {}; font-weight: bold;">UGX {}</span>',
            color,
            f"{obj.current_balance:,.2f}"
        )
    current_balance_display.short_description = 'Balance'
    
    def arrears_balance_display(self, obj):
        if obj.arrears_balance > 0:
            return format_html(
                '<span style="color: red; font-weight: bold;">UGX {}</span>',
                f"{obj.arrears_balance:,.2f}"
            )
        return 'Clear'
    arrears_balance_display.short_description = 'Arrears'
    
    def financial_status_badge(self, obj):
        colors = {
            'active': 'blue',
            'cleared': 'green',
            'in_arrears': 'red',
            'suspended': 'orange',
            'inactive': 'gray'
        }
        color = colors.get(obj.financial_status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_financial_status_display()
        )
    financial_status_badge.short_description = 'Status'


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'student_name', 'net_amount_display', 'balance_display', 'status_badge', 'due_date', 'is_overdue_display')
    list_filter = ('status', 'academic_year', 'term', 'issue_date', 'is_overdue')
    search_fields = ('invoice_number', 'student__first_name', 'student__last_name')
    readonly_fields = ('invoice_number', 'created_at', 'updated_at', 'gross_amount', 'discount_amount', 'net_amount', 'balance_amount')
    inlines = [InvoiceLineItemInline]
    
    fieldsets = (
        ('Invoice Details', {
            'fields': ('invoice_number', 'student', 'academic_year', 'term', 'invoice_type')
        }),
        ('Amounts', {
            'fields': ('gross_amount', 'discount_amount', 'net_amount', 'amount_paid', 'amount_outstanding', 'balance_amount')
        }),
        ('Status', {
            'fields': ('status', 'is_overdue', 'days_overdue')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'sent_to_parent_date')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name()
    student_name.short_description = 'Student'
    
    def net_amount_display(self, obj):
        return format_html('UGX {:,.2f}', obj.net_amount)
    net_amount_display.short_description = 'Amount'
    
    def balance_display(self, obj):
        color = 'red' if obj.balance_amount > 0 else 'green'
        return format_html(
            '<span style="color: {};">UGX {:,.2f}</span>',
            color,
            obj.balance_amount
        )
    balance_display.short_description = 'Outstanding'
    
    def status_badge(self, obj):
        colors = {
            'draft': 'gray',
            'issued': 'blue',
            'partially_paid': 'orange',
            'paid': 'green',
            'cancelled': 'red',
            'credit_noted': 'purple'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def is_overdue_display(self, obj):
        if obj.is_overdue:
            return format_html(
                '<span style="color: red; font-weight: bold;">{} days</span>',
                obj.days_overdue
            )
        return 'On time'
    is_overdue_display.short_description = 'Overdue'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_number', 'student_name', 'amount_display', 'payment_method_display', 'status_badge', 'payment_date')
    list_filter = ('payment_method', 'status', 'payment_date', 'allocation_status')
    search_fields = ('payment_number', 'student__first_name', 'student__last_name', 'receipt_number')
    readonly_fields = ('payment_number', 'receipt_number', 'created_at', 'updated_at')
    inlines = [PaymentAllocationInline]
    
    fieldsets = (
        ('Payment Details', {
            'fields': ('payment_number', 'receipt_number', 'student', 'amount', 'payment_date')
        }),
        ('Method Details', {
            'fields': ('payment_method', 'bank_account', 'mobile_money_ref', 'mobile_money_provider', 'cheque_number')
        }),
        ('Status', {
            'fields': ('status', 'allocation_status', 'confirmed_by', 'confirmed_at')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name()
    student_name.short_description = 'Student'
    
    def amount_display(self, obj):
        return format_html('UGX {:,.2f}', obj.amount)
    amount_display.short_description = 'Amount'
    
    def payment_method_display(self, obj):
        return obj.get_payment_method_display()
    payment_method_display.short_description = 'Method'
    
    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'confirmed': 'blue',
            'receipted': 'green',
            'reconciled': 'darkgreen',
            'reversed': 'red',
            'cancelled': 'gray'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_code', 'account_name', 'account_type_display', 'balance_display', 'active_display')
    list_filter = ('account_type', 'active')
    search_fields = ('account_code', 'account_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Account Information', {
            'fields': ('account_code', 'account_name', 'account_type', 'description')
        }),
        ('Configuration', {
            'fields': ('allow_posting', 'requires_cost_center', 'is_bank_account', 'is_control_account', 'is_summary_account')
        }),
        ('Opening Balance', {
            'fields': ('opening_balance_date', 'opening_balance')
        }),
        ('Status', {
            'fields': ('active',)
        }),
        ('Hierarchy', {
            'fields': ('parent_account',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def account_type_display(self, obj):
        return obj.get_account_type_display()
    account_type_display.short_description = 'Type'
    
    def balance_display(self, obj):
        colors = {
            'asset': 'blue',
            'liability': 'red',
            'equity': 'purple',
            'income': 'green',
            'expense': 'orange'
        }
        color = colors.get(obj.account_type, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">UGX {:,.2f}</span>',
            color,
            obj.get_balance()
        )
    balance_display.short_description = 'Balance'
    
    def active_display(self, obj):
        color = 'green' if obj.active else 'red'
        status = '✓ Active' if obj.active else '✗ Inactive'
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            status
        )
    active_display.short_description = 'Status'


@admin.register(FeeTemplate)
class FeeTemplateAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'academic_year', 'term', 'total_amount_display', 'status_badge', 'version')
    list_filter = ('status', 'academic_year', 'term', 'day_or_boarding')
    search_fields = ('academic_year__year', 'term__name')
    inlines = [FeeTemplateLineItemInline]
    
    fieldsets = (
        ('Template Details', {
            'fields': ('template_code', 'name', 'academic_year', 'term', 'fee_class', 'stream', 'section', 'day_or_boarding', 'student_category')
        }),
        ('Fee Rules', {
            'fields': ('version', 'is_latest_version')
        }),
        ('Approval', {
            'fields': ('status', 'approved_by', 'approved_at')
        }),
        ('Dates', {
            'fields': ('effective_from', 'effective_to')
        }),
    )
    
    def display_name(self, obj):
        term_name = obj.term.name if obj.term else 'All Terms'
        return f"{obj.academic_year} - {term_name} - {obj.fee_class}"
    display_name.short_description = 'Template'
    
    def total_amount_display(self, obj):
        return format_html('UGX {:,.2f}', obj.calculate_total_amount())
    total_amount_display.short_description = 'Total Amount'
    
    def status_badge(self, obj):
        colors = {
            'draft': 'gray',
            'approved': 'blue',
            'active': 'green',
            'archived': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('journal_number', 'entry_date', 'total_debit_display', 'status_badge')
    list_filter = ('status', 'entry_date', 'financial_period')
    search_fields = ('journal_number', 'description')
    readonly_fields = ('journal_number', 'total_debit', 'total_credit', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Journal Details', {
            'fields': ('journal_number', 'entry_date', 'financial_period', 'description', 'narration')
        }),
        ('Amounts', {
            'fields': ('total_debit', 'total_credit')
        }),
        ('Approval Workflow', {
            'fields': ('status', 'approval_required', 'approval_required_level', 'submitted_by', 'submitted_at', 'approved_by', 'approved_at', 'posted_by', 'posted_at')
        }),
        ('Reversal', {
            'fields': ('is_reversal', 'reversed_journal', 'reversal_reason')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_debit_display(self, obj):
        return format_html('UGX {:,.2f}', obj.total_debit)
    total_debit_display.short_description = 'Amount'
    
    def status_badge(self, obj):
        colors = {
            'draft': 'gray',
            'submitted': 'blue',
            'approved': 'green',
            'posted': 'darkgreen',
            'rejected': 'red',
            'reversed': 'orange'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(GeneralLedger)
class GeneralLedgerAdmin(admin.ModelAdmin):
    list_display = ('account_display', 'transaction_date', 'debit_display', 'credit_display', 'reference_display')
    list_filter = ('account__account_type', 'financial_period', 'transaction_date')
    search_fields = ('account__account_code', 'account__account_name', 'reference_number')
    readonly_fields = ('posted_at',)
    
    fieldsets = (
        ('GL Entry', {
            'fields': ('account', 'financial_period', 'transaction_date')
        }),
        ('Amounts', {
            'fields': ('debit_amount', 'credit_amount')
        }),
        ('Details', {
            'fields': ('description', 'reference_type', 'reference_number')
        }),
        ('Metadata', {
            'fields': ('posted_at',),
            'classes': ('collapse',)
        }),
    )
    
    def account_display(self, obj):
        return f"{obj.account.account_code} - {obj.account.account_name}"
    account_display.short_description = 'Account'
    
    def debit_display(self, obj):
        if obj.debit_amount > 0:
            return format_html('UGX {:,.2f}', obj.debit_amount)
        return '-'
    debit_display.short_description = 'Debit'
    
    def credit_display(self, obj):
        if obj.credit_amount > 0:
            return format_html('UGX {:,.2f}', obj.credit_amount)
        return '-'
    credit_display.short_description = 'Credit'
    
    def reference_display(self, obj):
        return f"{obj.reference_type} {obj.reference_number}"
    reference_display.short_description = 'Reference'


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'user_display', 'action_display', 'module_display', 'affected_record_display')
    list_filter = ('action', 'module', 'timestamp', 'status')
    search_fields = ('user__first_name', 'user__last_name', 'action', 'affected_record_display')
    readonly_fields = ('timestamp', 'user', 'action', 'module', 'affected_table', 'affected_record_id', 'ip_address', 'user_agent')
    
    fieldsets = (
        ('Audit Details', {
            'fields': ('timestamp', 'user', 'action', 'module')
        }),
        ('Affected Record', {
            'fields': ('affected_table', 'affected_record_id', 'affected_record_display')
        }),
        ('Changes', {
            'fields': ('old_values', 'new_values', 'changes_summary')
        }),
        ('Status', {
            'fields': ('status', 'error_details')
        }),
        ('Source', {
            'fields': ('ip_address', 'user_agent')
        }),
    )
    
    def user_display(self, obj):
        if obj.user:
            return obj.user.get_full_name()
        return 'System'
    user_display.short_description = 'User'
    
    def action_display(self, obj):
        return obj.get_action_display()
    action_display.short_description = 'Action'
    
    def module_display(self, obj):
        return obj.get_module_display()
    module_display.short_description = 'Module'


@admin.register(FinancialPeriod)
class FinancialPeriodAdmin(admin.ModelAdmin):
    list_display = ('period_name', 'period_type_display', 'start_date', 'end_date', 'is_closed_display')
    list_filter = ('period_type', 'is_closed')
    search_fields = ('period_name',)
    readonly_fields = ('created_at',)
    
    def period_type_display(self, obj):
        return obj.get_period_type_display()
    period_type_display.short_description = 'Type'
    
    def is_closed_display(self, obj):
        color = 'red' if obj.is_closed else 'green'
        status = 'Closed' if obj.is_closed else 'Open'
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            status
        )
    is_closed_display.short_description = 'Status'


@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category_type_display', 'mandatory_display', 'active_display')
    list_filter = ('category_type', 'is_mandatory', 'active')
    search_fields = ('code', 'name')
    
    def category_type_display(self, obj):
        return obj.get_category_type_display()
    category_type_display.short_description = 'Type'
    
    def mandatory_display(self, obj):
        color = 'green' if obj.is_mandatory else 'gray'
        status = '✓ Required' if obj.is_mandatory else 'Optional'
        return format_html('<span style="color: {};">{}</span>', color, status)
    mandatory_display.short_description = 'Mandatory'
    
    def active_display(self, obj):
        color = 'green' if obj.active else 'red'
        status = '✓ Active' if obj.active else '✗ Inactive'
        return format_html('<span style="color: {};">{}</span>', color, status)
    active_display.short_description = 'Status'


@admin.register(CostCenter)
class CostCenterAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'manager', 'active_display')
    list_filter = ('active',)
    search_fields = ('code', 'name')
    
    def active_display(self, obj):
        color = 'green' if obj.active else 'red'
        status = '✓ Active' if obj.active else '✗ Inactive'
        return format_html('<span style="color: {};">{}</span>', color, status)
    active_display.short_description = 'Status'


@admin.register(FiscalYear)
class FiscalYearAdmin(admin.ModelAdmin):
    list_display = ('fiscal_year_name', 'fiscal_year_start_date', 'fiscal_year_end_date', 'is_current_display')
    list_filter = ('is_current_fiscal_year',)
    search_fields = ('fiscal_year_name',)
    
    def is_current_display(self, obj):
        if obj.is_current_fiscal_year:
            return format_html('<span style="color: green;">✓ Current</span>')
        return 'Previous'
    is_current_display.short_description = 'Status'


@admin.register(DiscountRule)
class DiscountRuleAdmin(admin.ModelAdmin):
    list_display = ('rule_code', 'rule_name', 'rule_type_display', 'discount_display', 'active_display')
    list_filter = ('rule_type', 'active')
    search_fields = ('rule_code', 'rule_name')
    
    def rule_type_display(self, obj):
        return obj.get_rule_type_display()
    rule_type_display.short_description = 'Type'
    
    def discount_display(self, obj):
        if obj.discount_type == 'percentage':
            return f"{obj.discount_value}%"
        return f"UGX {obj.discount_value:,.2f}"
    discount_display.short_description = 'Discount'
    
    def active_display(self, obj):
        color = 'green' if obj.active else 'red'
        status = '✓' if obj.active else '✗'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            status
        )
    active_display.short_description = 'Active'
