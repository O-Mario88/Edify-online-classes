# Edify Finance - Accounting Models
# Double-entry bookkeeping system with GL, journals, and accounts

from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class Account(models.Model):
    """
    Chart of Accounts - All GL accounts used by the school.
    Supports hierarchical account structure.
    """
    
    ACCOUNT_TYPE_CHOICES = (
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    # Account identification
    account_code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Unique account code (e.g., 1001, 2001, 3001)'
    )
    
    account_name = models.CharField(
        max_length=255,
        help_text='Account name'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Account description'
    )
    
    # Classification
    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES,
        help_text='Account type for balance sheet classification'
    )
    
    account_subtype = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Subtype (e.g., Current Asset, Operating Expense)'
    )
    
    # Hierarchy
    parent_account = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_accounts',
        help_text='Parent account for hierarchy'
    )
    
    is_control_account = models.BooleanField(
        default=False,
        help_text='Is this a control/header account?'
    )
    
    is_summary_account = models.BooleanField(
        default=False,
        help_text='Is this a summary account?'
    )
    
    # Opening balance
    opening_balance_date = models.DateField(
        help_text='Date of opening balance'
    )
    
    opening_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Opening balance'
    )
    
    # Flags
    allow_posting = models.BooleanField(
        default=True,
        help_text='Can transactions be posted to this account?'
    )
    
    requires_cost_center = models.BooleanField(
        default=False,
        help_text='Must cost center be specified for postings?'
    )
    
    is_bank_account = models.BooleanField(
        default=False,
        help_text='Is this a bank account?'
    )
    
    active = models.BooleanField(
        default=True,
        db_index=True,
        help_text='Is this account active?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_accounts',
        help_text='User who created'
    )
    
    class Meta:
        db_table = 'finance_account'
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'
        ordering = ['account_code']
        indexes = [
            models.Index(fields=['account_code']),
            models.Index(fields=['account_type']),
            models.Index(fields=['active']),
        ]
    
    def __str__(self):
        return f"{self.account_code} - {self.account_name}"
    
    def get_balance(self):
        """Calculate current balance from GL entries."""
        from django.db.models import Sum
        ledger = GeneralLedger.objects.filter(account=self).aggregate(
            debits=Sum('debit_amount'),
            credits=Sum('credit_amount')
        )
        
        opening = self.opening_balance
        debits = ledger['debits'] or Decimal('0.00')
        credits = ledger['credits'] or Decimal('0.00')
        
        # Balance depends on account type
        if self.account_type in ['asset', 'expense']:
            return opening + debits - credits
        else:  # liability, equity, income
            return opening + credits - debits


class BankAccount(models.Model):
    """
    Bank and cash accounts (subset of GL accounts).
    Specifically for bank reconciliation and cash management.
    """
    
    ACCOUNT_TYPE_CHOICES = (
        ('checking', 'Checking Account'),
        ('savings', 'Savings Account'),
        ('petty_cash', 'Petty Cash'),
        ('imprest', 'Imprest Account'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    account = models.OneToOneField(
        Account,
        on_delete=models.PROTECT,
        related_name='bank_account',
        help_text='Related GL account'
    )
    
    account_name = models.CharField(
        max_length=255,
        help_text='Account name'
    )
    
    account_number = models.CharField(
        max_length=50,
        unique=True,
        help_text='Bank account number'
    )
    
    bank_name = models.CharField(
        max_length=255,
        help_text='Bank name'
    )
    
    currency = models.CharField(
        max_length=3,
        default='UGX',
        help_text='Currency code'
    )
    
    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES,
        default='checking',
        help_text='Bank account type'
    )
    
    opening_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Opening balance'
    )
    
    # Reconciliation
    last_reconciled_date = models.DateField(
        null=True,
        blank=True,
        help_text='Last reconciliation date'
    )
    
    last_reconciled_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Balance at last reconciliation'
    )
    
    current_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Current GL balance'
    )
    
    active = models.BooleanField(
        default=True,
        help_text='Is this account active?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'finance_bankaccount'
        verbose_name = 'Bank Account'
        verbose_name_plural = 'Bank Accounts'
        ordering = ['account_name']
        indexes = [
            models.Index(fields=['account_number']),
            models.Index(fields=['bank_name']),
        ]
    
    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


class FinancialPeriod(models.Model):
    """
    Financial periods for reporting and closing.
    Tracks months, quarters, and fiscal years.
    """
    
    PERIOD_TYPE_CHOICES = (
        ('month', 'Month'),
        ('quarter', 'Quarter'),
        ('year', 'Year'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    period_name = models.CharField(
        max_length=50,
        help_text='Period name (e.g., "2024-01", "Q1 2024")'
    )
    
    period_type = models.CharField(
        max_length=20,
        choices=PERIOD_TYPE_CHOICES,
        default='month',
        help_text='Period type'
    )
    
    start_date = models.DateField(
        help_text='Period start date'
    )
    
    end_date = models.DateField(
        help_text='Period end date'
    )
    
    is_closed = models.BooleanField(
        default=False,
        help_text='Is this period closed for posting?'
    )
    
    closed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When period was closed'
    )
    
    closed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text='User who closed period'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_periods'
    )
    
    class Meta:
        db_table = 'finance_financialperiod'
        verbose_name = 'Financial Period'
        verbose_name_plural = 'Financial Periods'
        ordering = ['start_date']
        indexes = [
            models.Index(fields=['period_name']),
            models.Index(fields=['start_date']),
        ]
        unique_together = [['period_name', 'period_type']]
    
    def __str__(self):
        return f"{self.period_name} ({self.get_period_type_display()})"


class JournalEntry(models.Model):
    """
    Manual journal entries for GL postings.
    Supports multi-level approval workflow.
    """
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('posted', 'Posted'),
        ('rejected', 'Rejected'),
        ('reversed', 'Reversed'),
    )
    
    APPROVAL_LEVEL_CHOICES = (
        ('finance', 'Finance Team'),
        ('headteacher', 'Headteacher'),
        ('director', 'Director'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    # Journal identification
    journal_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Journal number'
    )
    
    entry_date = models.DateField(
        help_text='Date of journal entry'
    )
    
    financial_period = models.ForeignKey(
        FinancialPeriod,
        on_delete=models.PROTECT,
        help_text='Financial period'
    )
    
    # Description
    description = models.TextField(
        help_text='Journal description'
    )
    
    narration = models.TextField(
        blank=True,
        null=True,
        help_text='Detailed narration'
    )
    
    # Amounts
    total_debit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total debits'
    )
    
    total_credit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total credits'
    )
    
    # Status and approval
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True,
        help_text='Journal status'
    )
    
    requires_approval = models.BooleanField(
        default=False,
        help_text='Does this require approval?'
    )
    
    approval_required_level = models.CharField(
        max_length=20,
        choices=APPROVAL_LEVEL_CHOICES,
        default='finance',
        help_text='Approval level required'
    )
    
    submitted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_journals',
        help_text='User who submitted'
    )
    
    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When submitted'
    )
    
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_journals',
        help_text='User who approved'
    )
    
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When approved'
    )
    
    posted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_journals',
        help_text='User who posted'
    )
    
    posted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When posted to GL'
    )
    
    # Reversal tracking
    is_reversal = models.BooleanField(
        default=False,
        help_text='Is this a reversal?'
    )
    
    reversed_journal = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reversals',
        help_text='Journal being reversed'
    )
    
    reversal_reason = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Reason for reversal'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_journals',
        help_text='User who created'
    )
    
    class Meta:
        db_table = 'finance_journalentry'
        verbose_name = 'Journal Entry'
        verbose_name_plural = 'Journal Entries'
        ordering = ['-entry_date']
        indexes = [
            models.Index(fields=['journal_number']),
            models.Index(fields=['entry_date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.journal_number} - {self.description[:50]}"


class JournalLineItem(models.Model):
    """
    Individual lines within a journal entry.
    Must have at least one debit and one credit.
    """
    
    id = models.BigAutoField(primary_key=True)
    
    journal_entry = models.ForeignKey(
        JournalEntry,
        on_delete=models.CASCADE,
        related_name='line_items',
        help_text='Parent journal'
    )
    
    line_number = models.IntegerField(
        help_text='Line number for ordering'
    )
    
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name='journal_lines',
        help_text='GL account'
    )
    
    description = models.CharField(
        max_length=255,
        help_text='Line description'
    )
    
    # Amounts (one will be zero)
    debit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Debit amount'
    )
    
    credit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Credit amount'
    )
    
    # Cost center (optional)
    cost_center = models.ForeignKey(
        'finance.CostCenter',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text='Cost center allocation'
    )
    
    # Cross-reference to source document
    reference_type = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Reference type (invoice, payment, etc.)'
    )
    
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Reference number'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='User who created'
    )
    
    class Meta:
        db_table = 'finance_journallineitem'
        verbose_name = 'Journal Line Item'
        verbose_name_plural = 'Journal Line Items'
        ordering = ['line_number']
        indexes = [
            models.Index(fields=['journal_entry']),
            models.Index(fields=['account']),
        ]
    
    def __str__(self):
        return f"{self.journal_entry.journal_number} - Line {self.line_number}"


class GeneralLedger(models.Model):
    """
    Posted GL entries.
    These are created automatically from journals and transactions(invoices, payments).
    """
    
    id = models.BigAutoField(primary_key=True)
    
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name='ledger_entries',
        help_text='GL account'
    )
    
    financial_period = models.ForeignKey(
        FinancialPeriod,
        on_delete=models.PROTECT,
        help_text='Financial period'
    )
    
    # Transaction details
    transaction_date = models.DateField(
        db_index=True,
        help_text='Transaction date'
    )
    
    debit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Debit amount'
    )
    
    credit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Credit amount'
    )
    
    # Source reference
    journal_entry = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gl_entries',
        help_text='If from manual journal'
    )
    
    journal_line_item = models.ForeignKey(
        JournalLineItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text='If line item from journal'
    )
    
    reference_type = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Source type (invoice, payment, etc.)'
    )
    
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        help_text='Source reference number'
    )
    
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Transaction description'
    )
    
    # Cost center (optional)
    cost_center = models.ForeignKey(
        'finance.CostCenter',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text='Cost center'
    )
    
    # Reconciliation
    is_reconciled = models.BooleanField(
        default=False,
        db_index=True,
        help_text='Is this reconciled?'
    )
    
    reconciled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When reconciled'
    )
    
    # Metadata
    posted_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='User who posted'
    )
    
    posted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'finance_generalledger'
        verbose_name = 'General Ledger Entry'
        verbose_name_plural = 'General Ledger Entries'
        ordering = ['-transaction_date', '-id']
        indexes = [
            models.Index(fields=['account']),
            models.Index(fields=['financial_period']),
            models.Index(fields=['transaction_date']),
            models.Index(fields=['reference_type', 'reference_number']),
            models.Index(fields=['is_reconciled']),
        ]
    
    def __str__(self):
        return f"{self.account.account_code} - {self.transaction_date}"
