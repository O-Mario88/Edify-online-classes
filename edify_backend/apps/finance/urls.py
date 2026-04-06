"""
URL routing for Finance ERP System API.

Provides REST API endpoints for all finance operations.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    # Student Financial Profile
    StudentFinancialProfileViewSet, FinancialStatusHistoryViewSet,
    # Fee Management
    FeeCategoryViewSet, FeeTemplateViewSet, FeeTemplateLineItemViewSet, StudentFeeAssignmentViewSet,
    # Invoicing
    InvoiceViewSet, InvoiceLineItemViewSet, CreditNoteViewSet,
    # Payments
    PaymentViewSet, PaymentAllocationViewSet, ReceiptViewSet,
    # Accounting
    AccountViewSet, BankAccountViewSet, FinancialPeriodViewSet,
    JournalEntryViewSet, JournalLineItemViewSet, GeneralLedgerViewSet,
    # Audit
    AuditLogViewSet, FinanceExceptionViewSet,
    # Support
    CostCenterViewSet, FiscalYearViewSet, DiscountRuleViewSet,
)

# Create router and register viewsets
router = DefaultRouter()

# Student Financial Profile
router.register(r'students', StudentFinancialProfileViewSet, basename='studentfinancialprofile')
router.register(r'student-history', FinancialStatusHistoryViewSet, basename='financialstatushistory')

# Fee Management
router.register(r'fee-categories', FeeCategoryViewSet, basename='feecategory')
router.register(r'fee-templates', FeeTemplateViewSet, basename='feetemplate')
router.register(r'fee-template-items', FeeTemplateLineItemViewSet, basename='feetemplatelineitem')
router.register(r'student-fee-assignments', StudentFeeAssignmentViewSet, basename='studentfeeassignment')

# Invoicing
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'invoice-items', InvoiceLineItemViewSet, basename='invoicelineitem')
router.register(r'credit-notes', CreditNoteViewSet, basename='creditnote')

# Payments
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'payment-allocations', PaymentAllocationViewSet, basename='paymentallocation')
router.register(r'receipts', ReceiptViewSet, basename='receipt')

# Accounting
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'bank-accounts', BankAccountViewSet, basename='bankaccount')
router.register(r'financial-periods', FinancialPeriodViewSet, basename='financialperiod')
router.register(r'journal-entries', JournalEntryViewSet, basename='journalentry')
router.register(r'journal-items', JournalLineItemViewSet, basename='journallineitem')
router.register(r'general-ledger', GeneralLedgerViewSet, basename='generalledger')

# Audit & Compliance
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')
router.register(r'exceptions', FinanceExceptionViewSet, basename='exception')

# Support
router.register(r'cost-centers', CostCenterViewSet, basename='costcenter')
router.register(r'fiscal-years', FiscalYearViewSet, basename='fiscalyear')
router.register(r'discount-rules', DiscountRuleViewSet, basename='discountrule')

# Include router URLs
urlpatterns = [
    path('', include(router.urls)),
]
