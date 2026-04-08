# Edify Finance - Invoicing Models
# Core models for student invoices and billing documents

from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import uuid

User = get_user_model()


class Invoice(models.Model):
    """
    Core invoice document.
    Each student gets invoices for their fees by term or on-demand.
    """
    
    STATUS_CHOICES = (
        ('draft', 'Draft - Not Yet Issued'),
        ('issued', 'Issued - Awaiting Payment'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid in Full'),
        ('cancelled', 'Cancelled'),
        ('credit_noted', 'Credit Noted'),
    )
    
    INVOICE_TYPE_CHOICES = (
        ('term_opening', 'Term Opening Invoice'),
        ('mid_term', 'Mid-Term Adjustment'),
        ('supplementary', 'Supplementary Invoice'),
        ('one_time', 'One-Time Charge'),
        ('credit_note', 'Credit Note'),
        ('debit_note', 'Debit Note'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    # Structural Isolation
    institution = models.ForeignKey(
        'institutions.Institution',
        on_delete=models.CASCADE,
        related_name='invoices',
        help_text='Institution this invoice belongs to'
    )
    
    # Invoice numbering
    invoice_number = models.CharField(
        max_length=50,
        db_index=True,
        help_text='Unique invoice number (e.g., INV-2024-00001)'
    )
    
    # Student relationship
    student = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='invoices_received',
        help_text='Student being invoiced'
    )
    
    student_financial_profile = models.ForeignKey(
        'finance.StudentFinancialProfile',
        on_delete=models.PROTECT,
        related_name='invoices',
        help_text='Student financial profile'
    )
    
    # Period context
    academic_year = models.ForeignKey(
        'curriculum.AcademicYear',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text='Academic year'
    )
    
    term = models.ForeignKey(
        'curriculum.Term',
        on_delete=models.PROTECT,
        help_text='Term (if applicable)'
    )
    
    # Invoice dates
    issue_date = models.DateField(
        help_text='Date invoice was issued'
    )
    
    due_date = models.DateField(
        help_text='Payment due date'
    )
    
    # Amounts - ALL in UGX (never use FLOAT for money!)
    gross_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Gross invoice amount'
    )
    
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Total discounts applied'
    )
    
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Tax if applicable'
    )
    
    net_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Net invoice amount (gross - discount + tax)'
    )
    
    # Payment tracking
    amount_paid = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Amount paid so far'
    )
    
    amount_outstanding = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Outstanding amount (calculated)'
    )
    
    balance_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Remaining balance'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True,
        help_text='Invoice status'
    )
    
    is_overdue = models.BooleanField(
        default=False,
        db_index=True,
        help_text='Is this invoice overdue?'
    )
    
    days_overdue = models.IntegerField(
        default=0,
        help_text='Number of days overdue'
    )
    
    # Invoice classification
    invoice_type = models.CharField(
        max_length=20,
        choices=INVOICE_TYPE_CHOICES,
        default='term_opening',
        help_text='Type of invoice'
    )
    
    # Notification
    sent_to_parent_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When parent was notified'
    )
    
    # Metadata
    notes = models.TextField(
        blank=True,
        null=True,
        help_text='Internal notes'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='invoices_created',
        help_text='User who created invoice'
    )
    
    updated_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='invoices_updated',
        help_text='User who last updated invoice'
    )
    
    class Meta:
        db_table = 'finance_invoice'
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
        ordering = ['-issue_date', '-created_at']
        indexes = [
            models.Index(fields=['institution', 'invoice_number']),
            models.Index(fields=['institution', 'student']),
            models.Index(fields=['institution', 'status']),
            models.Index(fields=['institution', 'issue_date']),
            models.Index(fields=['due_date']),
            models.Index(fields=['amount_outstanding']),
            models.Index(fields=['academic_year']),
        ]
        unique_together = [['institution', 'invoice_number']]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.student.get_full_name()}"
    
    def calculate_balance(self):
        """Recalculate balance from payments."""
        self.amount_outstanding = max(Decimal('0.00'), self.net_amount - self.amount_paid)
        self.balance_amount = self.amount_outstanding
        
        # Update status
        if self.amount_outstanding == Decimal('0.00'):
            self.status = 'paid'
        elif self.amount_paid > Decimal('0.00'):
            self.status = 'partially_paid'
        
        return self.amount_outstanding
    
    def mark_overdue(self):
        """Check and mark if invoice is overdue."""
        if self.status in ['issued', 'partially_paid']:
            days_overdue = (timezone.now().date() - self.due_date).days
            if days_overdue > 0:
                self.is_overdue = True
                self.days_overdue = days_overdue
            else:
                self.is_overdue = False
                self.days_overdue = 0
    
    def issue(self, issued_by=None):
        """Change status to issued and notify parent."""
        self.status = 'issued'
        if issued_by:
            self.updated_by = issued_by
        self.save(update_fields=['status', 'updated_by', 'updated_at'])
        # TODO: Send notification to parent


class InvoiceLineItem(models.Model):
    """
    Detail line on an invoice.
    Also used for inventory issues (uniforms, books, etc.) that are auto-charged.
    """
    
    id = models.BigAutoField(primary_key=True)
    
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='line_items',
        help_text='Parent invoice'
    )
    
    fee_category = models.ForeignKey(
        'finance.FeeCategory',
        on_delete=models.PROTECT,
        help_text='Fee category'
    )
    
    description = models.CharField(
        max_length=255,
        help_text='Description of charge'
    )
    
    quantity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text='Quantity (usually 1 for fees)'
    )
    
    unit_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Unit price'
    )
    
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Total for this line (qty × unit_amount)'
    )
    
    # Line-level discount
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Discount on this line'
    )
    
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Discount percentage'
    )
    
    discount_reason = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Reason for discount'
    )
    
    discount_approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_line_discounts',
        help_text='User who approved discount'
    )
    
    # For inventory issues
    inventory_item = models.ForeignKey(
        'finance.InventoryItem',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text='If this charge is for an issued item'
    )
    
    quantity_issued = models.IntegerField(
        default=0,
        help_text='Quantity of item issued'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='User who created line'
    )
    
    class Meta:
        db_table = 'finance_invoicelineitem'
        verbose_name = 'Invoice Line Item'
        verbose_name_plural = 'Invoice Line Items'
        ordering = ['id']
        indexes = [
            models.Index(fields=['invoice']),
            models.Index(fields=['fee_category']),
        ]
    
    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.description}"


class CreditNote(models.Model):
    """
    Credit note to reduce student debt.
    Issued when student has been overcharged or for other valid reasons.
    """
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('posted', 'Posted'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    # Structural Isolation
    institution = models.ForeignKey(
        'institutions.Institution',
        on_delete=models.CASCADE,
        related_name='credit_notes',
        help_text='Institution issuing credit'
    )
    
    credit_note_number = models.CharField(
        max_length=50,
        db_index=True,
        help_text='Unique credit note number'
    )
    
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.PROTECT,
        related_name='credit_notes',
        help_text='Related invoice'
    )
    
    student = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='credit_notes',
        help_text='Student'
    )
    
    credit_date = models.DateField(
        help_text='Date credit note issued'
    )
    
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Credit amount'
    )
    
    reason = models.CharField(
        max_length=255,
        help_text='Reason for credit'
    )
    
    description = models.TextField(
        help_text='Detailed description'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        help_text='Status'
    )
    
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_credit_notes',
        help_text='User who approved'
    )
    
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When approved'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='User who created'
    )
    
    class Meta:
        db_table = 'finance_creditnote'
        verbose_name = 'Credit Note'
        verbose_name_plural = 'Credit Notes'
        ordering = ['-credit_date']
        indexes = [
            models.Index(fields=['institution', 'credit_note_number']),
            models.Index(fields=['institution', 'student']),
            models.Index(fields=['institution', 'invoice']),
        ]
        unique_together = [['institution', 'credit_note_number']]
    
    def __str__(self):
        return f"{self.credit_note_number}"
