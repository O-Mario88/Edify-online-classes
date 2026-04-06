"""
Django signals for automatic General Ledger posting.

This module handles:
1. Auto-posting invoices to AR and income accounts
2. Auto-posting payments to bank and AR accounts
3. GL balance validation
4. Audit logging of all financial transactions
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from decimal import Decimal
from django.utils import timezone

from .models import (
    Invoice, Payment, CreditNote, JournalEntry,
    GeneralLedger, Account, FinancialPeriod, AuditLog
)


@receiver(post_save, sender=Invoice)
def post_invoice_to_gl(sender, instance, created, **kwargs):
    """
    Post invoice to GL when created or issued.
    
    Posting Rules:
    - DR: Student Accounts Receivable (asset)
    - CR: Income from Fees (income)
    """
    if not created or instance.status == 'draft':
        return  # Only post issued invoices
    
    try:
        # Get financial period
        period = FinancialPeriod.objects.get(
            start_date__lte=instance.issue_date,
            end_date__gte=instance.issue_date
        )
        
        # Get or create AR account
        ar_account = Account.objects.get(
            account_code='1200'  # Student Accounts Receivable
        )
        
        # Get income account from fee categories
        # For now, use generic fee income account
        income_account = Account.objects.get(
            account_code='4100'  # Tuition Fee Income
        )
        
        # Create GL entries
        gl_entry = GeneralLedger.objects.create(
            account=ar_account,
            financial_period=period,
            transaction_date=instance.issue_date,
            debit_amount=instance.net_amount,
            credit_amount=Decimal('0.00'),
            description=f"Invoice {instance.invoice_number} posted",
            reference_type='invoice',
            reference_number=str(instance.invoice_number),
            posted_by=instance.created_by,
        )
        
        GeneralLedger.objects.create(
            account=income_account,
            financial_period=period,
            transaction_date=instance.issue_date,
            debit_amount=Decimal('0.00'),
            credit_amount=instance.net_amount,
            description=f"Invoice {instance.invoice_number} posted",
            reference_type='invoice',
            reference_number=str(instance.invoice_number),
            posted_by=instance.created_by,
        )
        
        # Log audit trail
        AuditLog.log_action(
            user=instance.created_by,
            action='posted_invoice_to_gl',
            module='accounting',
            affected_table='GeneralLedger',
            affected_record_id=str(instance.id),
            affected_record_display=instance.invoice_number,
            changes_summary=f'Posted to GL: DR AR ${instance.net_amount}, CR Income ${instance.net_amount}',
        )
        
    except Exception as e:
        # Log error but don't fail
        AuditLog.log_action(
            user=instance.created_by,
            action='failed_posting_invoice',
            module='accounting',
            affected_table='Invoice',
            affected_record_id=str(instance.id),
            affected_record_display=instance.invoice_number,
            error_details=str(e),
            status='failure',
        )


@receiver(post_save, sender=Payment)
def post_payment_to_gl(sender, instance, created, **kwargs):
    """
    Post payment to GL when confirmed.
    
    Posting Rules:
    - DR: Bank Account (asset)
    - CR: Student Accounts Receivable (asset)
    """
    if instance.status != 'confirmed':
        return  # Only post confirmed payments
    
    try:
        # Check if already posted
        if GeneralLedger.objects.filter(
            reference_type='payment',
            reference_number=str(instance.payment_number)
        ).exists():
            return  # Already posted
        
        # Get financial period
        period = FinancialPeriod.objects.get(
            start_date__lte=instance.payment_date,
            end_date__gte=instance.payment_date
        )
        
        # Get bank account based on payment method
        bank_account = None
        if instance.payment_method == 'cash':
            bank_account = Account.objects.get(account_code='1010')  # Cash
        elif instance.payment_method == 'bank_transfer':
            bank_account = Account.objects.get(account_code='1020')  # Bank
        elif instance.payment_method == 'mobile_money':
            bank_account = Account.objects.get(account_code='1030')  # Mobile Money
        
        # Get AR account
        ar_account = Account.objects.get(account_code='1200')
        
        if bank_account:
            # Post bank debit, AR credit
            GeneralLedger.objects.create(
                account=bank_account,
                financial_period=period,
                transaction_date=instance.payment_date,
                debit_amount=instance.amount,
                credit_amount=Decimal('0.00'),
                description=f"Payment {instance.payment_number} posted",
                reference_type='payment',
                reference_number=str(instance.payment_number),
                posted_by=instance.confirmed_by,
            )
            
            GeneralLedger.objects.create(
                account=ar_account,
                financial_period=period,
                transaction_date=instance.payment_date,
                debit_amount=Decimal('0.00'),
                credit_amount=instance.amount,
                description=f"Payment {instance.payment_number} posted",
                reference_type='payment',
                reference_number=str(instance.payment_number),
                posted_by=instance.confirmed_by,
            )
            
            # Log audit
            AuditLog.log_action(
                user=instance.confirmed_by,
                action='posted_payment_to_gl',
                module='accounting',
                affected_table='GeneralLedger',
                affected_record_id=str(instance.id),
                affected_record_display=instance.payment_number,
                changes_summary=f'Posted to GL: DR Bank ${instance.amount}, CR AR ${instance.amount}',
            )
        
    except Exception as e:
        AuditLog.log_action(
            user=instance.confirmed_by or None,
            action='failed_posting_payment',
            module='accounting',
            affected_table='Payment',
            affected_record_id=str(instance.id),
            affected_record_display=instance.payment_number,
            error_details=str(e),
            status='failure',
        )


@receiver(post_save, sender=CreditNote)
def post_credit_note_to_gl(sender, instance, created, **kwargs):
    """
    Post credit note to GL when approved.
    
    Posting Rules:
    - DR: Fee Income (income)
    - CR: Student Accounts Receivable (asset)
    """
    if instance.status != 'posted':
        return  # Only post approved credit notes
    
    try:
        # Check if already posted
        if GeneralLedger.objects.filter(
            reference_type='credit_note',
            reference_number=str(instance.credit_note_number)
        ).exists():
            return
        
        # Get financial period
        period = FinancialPeriod.objects.get(
            start_date__lte=instance.credit_date,
            end_date__gte=instance.credit_date
        )
        
        # Get accounts
        income_account = Account.objects.get(account_code='4100')
        ar_account = Account.objects.get(account_code='1200')
        
        # Post reversing entries
        GeneralLedger.objects.create(
            account=income_account,
            financial_period=period,
            transaction_date=instance.credit_date,
            debit_amount=instance.amount,
            credit_amount=Decimal('0.00'),
            description=f"Credit Note {instance.credit_note_number} posted",
            reference_type='credit_note',
            reference_number=str(instance.credit_note_number),
            posted_by=instance.approved_by,
        )
        
        GeneralLedger.objects.create(
            account=ar_account,
            financial_period=period,
            transaction_date=instance.credit_date,
            debit_amount=Decimal('0.00'),
            credit_amount=instance.amount,
            description=f"Credit Note {instance.credit_note_number} posted",
            reference_type='credit_note',
            reference_number=str(instance.credit_note_number),
            posted_by=instance.approved_by,
        )
        
    except Exception as e:
        AuditLog.log_action(
            user=instance.approved_by,
            action='failed_posting_credit_note',
            module='accounting',
            affected_table='CreditNote',
            affected_record_id=str(instance.id),
            affected_record_display=instance.credit_note_number,
            error_details=str(e),
            status='failure',
        )


@receiver(post_save, sender=JournalEntry)
def validate_journal_balance(sender, instance, **kwargs):
    """
    Validate that journal entries always balance.
    
    Raises an error if debits != credits.
    """
    if instance.total_debit != instance.total_credit and instance.status == 'posted':
        raise ValueError(
            f"Journal {instance.journal_number} does not balance: "
            f"DR {instance.total_debit} != CR {instance.total_credit}"
        )


@receiver(post_save, sender=GeneralLedger)
def update_account_balances(sender, instance, created, **kwargs):
    """
    Update account balances whenever a GL entry is posted.
    
    This is a simple implementation - for high-volume systems,
    use materialized views or balance tables instead.
    """
    if not created:
        return
    
    # Account balance is calculated dynamically via account.get_balance()
    # In a high-volume system, we would update a Balance table here
    pass
