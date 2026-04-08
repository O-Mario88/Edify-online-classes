# Edify Finance - Payment Models
# Payment recording, allocation, and receipt tracking

from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import date

User = get_user_model()


class Payment(models.Model):
    """
    Record of a payment made by or on behalf of a student.
    Supports multiple payment methods: cash, bank, mobile money, card.
    """
    
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('card', 'Card/Debit Card'),
        ('cheque', 'Cheque'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending - Not Yet Confirmed'),
        ('confirmed', 'Confirmed - Verified'),
        ('receipted', 'Receipted - Receipt Issued'),
        ('reconciled', 'Reconciled - Matched to Bank'),
        ('reversed', 'Reversed - Payment Cancelled'),
        ('cancelled', 'Cancelled'),
    )
    
    ALLOCATION_STATUS_CHOICES = (
        ('unallocated', 'Not Yet Allocated'),
        ('partially_allocated', 'Partially Allocated'),
        ('fully_allocated', 'Fully Allocated'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    # Structural Isolation
    institution = models.ForeignKey(
        'institutions.Institution',
        on_delete=models.CASCADE,
        related_name='payments',
        help_text='Institution receiving the payment'
    )
    
    # Payment numbering
    payment_number = models.CharField(
        max_length=50,
        db_index=True,
        help_text='Unique payment number (e.g., PMT-2024-00001)'
    )
    
    receipt_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Receipt number'
    )
    
    # Student relationship
    student = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='payments_made',
        help_text='Student making payment'
    )
    
    # Payment details
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Amount paid'
    )
    
    payment_date = models.DateField(
        help_text='Date payment was made'
    )
    
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        help_text='Method of payment'
    )
    
    # Method-specific references
    bank_account = models.ForeignKey(
        'finance.BankAccount',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments_received',
        help_text='Bank account (if bank transfer)'
    )
    
    mobile_money_ref = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Mobile money reference (if mobile payment)'
    )
    
    mobile_money_provider = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        choices=(
            ('mtn', 'MTN Mobile Money'),
            ('airtel', 'Airtel Money'),
            ('equitel', 'Equitel'),
            ('other', 'Other'),
        ),
        help_text='Mobile money provider'
    )
    
    cheque_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Cheque number (if cheque payment)'
    )
    
    other_reference = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Other reference info'
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True,
        help_text='Payment status'
    )
    
    confirmed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments_confirmed',
        help_text='User who confirmed payment'
    )
    
    confirmed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When payment was confirmed'
    )
    
    # Allocation status
    allocation_status = models.CharField(
        max_length=20,
        choices=ALLOCATION_STATUS_CHOICES,
        default='unallocated',
        db_index=True,
        help_text='Has this payment been allocated?'
    )
    
    # Metadata
    notes = models.TextField(
        blank=True,
        null=True,
        help_text='Payment notes (e.g., "Paid by mother")'
    )
    
    entered_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='payments_entered',
        help_text='User who entered payment'
    )
    
    entered_at = models.DateTimeField(auto_now_add=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'finance_payment'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-payment_date', '-created_at']
        indexes = [
            models.Index(fields=['institution', 'payment_number']),
            models.Index(fields=['institution', 'receipt_number']),
            models.Index(fields=['institution', 'student']),
            models.Index(fields=['institution', 'payment_date']),
            models.Index(fields=['institution', 'status']),
            models.Index(fields=['institution', 'allocation_status']),
        ]
        unique_together = [['institution', 'payment_number']]
    
    def __str__(self):
        return f"{self.payment_number} - {self.student.get_full_name()} ({self.amount})"
    
    def confirm(self, confirmed_by):
        """Mark payment as confirmed."""
        from django.utils import timezone
        self.status = 'confirmed'
        self.confirmed_by = confirmed_by
        self.confirmed_at = timezone.now()
        self.save(update_fields=['status', 'confirmed_by', 'confirmed_at'])
    
    def reverse(self):
        """Mark payment as reversed (refund)."""
        self.status = 'reversed'
        self.save(update_fields=['status'])
        
        # Also reverse allocations
        self.allocations.all().delete()
        self.allocation_status = 'unallocated'
        self.save(update_fields=['allocation_status'])


class PaymentAllocation(models.Model):
    """
    Allocation of a payment to specific invoices.
    A single payment can be split across multiple invoices.
    """
    
    ALLOCATION_TYPE_CHOICES = (
        ('oldest_first', 'Oldest Invoice First'),
        ('specific_charge', 'Specific Fee Category'),
        ('manual', 'Manual Selection'),
        ('partial', 'Partial Invoice Payment'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    # Structural Isolation
    institution = models.ForeignKey(
        'institutions.Institution',
        on_delete=models.CASCADE,
        related_name='payment_allocations',
        help_text='Institution context'
    )
    
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='allocations',
        help_text='Parent payment'
    )
    
    invoice = models.ForeignKey(
        'finance.Invoice',
        on_delete=models.PROTECT,
        related_name='payment_allocations',
        help_text='Invoice being paid'
    )
    
    amount_allocated = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Amount allocated to this invoice'
    )
    
    allocation_date = models.DateField(
        help_text='Date of allocation'
    )
    
    allocation_type = models.CharField(
        max_length=20,
        choices=ALLOCATION_TYPE_CHOICES,
        default='manual',
        help_text='Type of allocation'
    )
    
    # For partial payments
    is_partial_allocation = models.BooleanField(
        default=False,
        help_text='Is this a partial payment of invoice?'
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        help_text='Allocation notes'
    )
    
    allocated_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='User who made allocation'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'finance_paymentallocation'
        verbose_name = 'Payment Allocation'
        verbose_name_plural = 'Payment Allocations'
        ordering = ['allocation_date']
        indexes = [
            models.Index(fields=['payment']),
            models.Index(fields=['invoice']),
        ]
        unique_together = [['payment', 'invoice']]  # One allocation per payment-invoice pair
    
    def __str__(self):
        return f"{self.payment.payment_number} → {self.invoice.invoice_number} ({self.amount_allocated})"


class Receipt(models.Model):
    """
    Receipt document.
    Tracks printed receipts for audit trail.
    """
    
    STATUS_CHOICES = (
        ('issued', 'Issued'),
        ('reprinted', 'Reprinted'),
        ('cancelled', 'Cancelled'),
        ('voided', 'Voided'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    # Structural Isolation
    institution = models.ForeignKey(
        'institutions.Institution',
        on_delete=models.CASCADE,
        related_name='receipts',
        help_text='Institution issuing receipt'
    )
    
    receipt_number = models.CharField(
        max_length=50,
        db_index=True,
        help_text='Receipt number'
    )
    
    payment = models.OneToOneField(
        Payment,
        on_delete=models.PROTECT,
        related_name='receipt',
        help_text='Related payment'
    )
    
    receipt_date = models.DateField(
        help_text='Receipt date'
    )
    
    printed_date = models.DateTimeField(
        help_text='When receipt was printed'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='issued',
        help_text='Receipt status'
    )
    
    # For reprints
    original_receipt_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='If this is a reprint, original receipt number'
    )
    
    reprinted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When reprinted'
    )
    
    reprinted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reprinted_receipts',
        help_text='User who did reprint'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='User who created receipt'
    )
    
    class Meta:
        db_table = 'finance_receipt'
        verbose_name = 'Receipt'
        verbose_name_plural = 'Receipts'
        ordering = ['-receipt_date']
        indexes = [
            models.Index(fields=['institution', 'receipt_number']),
            models.Index(fields=['institution', 'payment']),
            models.Index(fields=['institution', 'receipt_date']),
        ]
        unique_together = [['institution', 'receipt_number']]
    
    def __str__(self):
        return f"Receipt {self.receipt_number}"
    
    def reprint(self, reprinted_by):
        """Record a reprint."""
        from django.utils import timezone
        new_receipt = Receipt.objects.create(
            receipt_number=f"{self.receipt_number}-R",
            payment=self.payment,
            receipt_date=date.today(),
            printed_date=timezone.now(),
            original_receipt_number=self.receipt_number,
            reprinted_by=reprinted_by,
            created_by=reprinted_by,
        )
        return new_receipt
