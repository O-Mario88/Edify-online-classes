# Edify Finance - Student Financial Profile Models
# Core models for tracking student finances, balances, and status

from django.db import models
from django.core.validators import MinValueValidator, DecimalValidator
from django.contrib.auth import get_user_model
from decimal import Decimal
import uuid

User = get_user_model()


class StudentFinancialProfile(models.Model):
    """
    Central financial record for each student.
    Links to student, class, guardian, and tracks all financial metrics.
    """
    
    FINANCIAL_STATUS_CHOICES = (
        ('active', 'Active - Has debt or current billing'),
        ('cleared', 'Cleared - All fees paid'),
        ('in_arrears', 'In Arrears - Overdue payments'),
        ('suspended', 'Suspended - Account suspended'),
        ('inactive', 'Inactive - Student inactive'),
    )
    
    DAY_BOARDING_CHOICES = (
        ('day', 'Day Student'),
        ('boarding', 'Boarding Student'),
        ('mixed', 'Mixed (can be both)'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    # Student relationship
    student = models.OneToOneField(
        User,
        on_delete=models.PROTECT,
        related_name='financial_profile',
        help_text='Link to student user account'
    )
    
    # Class and academic context
    academic_year = models.ForeignKey(
        'curriculum.AcademicYear',
        on_delete=models.PROTECT,
        help_text='Current academic year'
    )
    
    current_class = models.ForeignKey(
        'classes.Class',
        on_delete=models.PROTECT,
        related_name='student_financial_profiles',
        help_text='Current class assignment'
    )
    
    stream = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Stream (e.g., Science, Arts, Commercial)'
    )
    
    section = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Section (e.g., Primary, Secondary, Nursery)'
    )
    
    # Student type
    day_or_boarding = models.CharField(
        max_length=20,
        choices=DAY_BOARDING_CHOICES,
        default='day',
        help_text='Day or boarding status'
    )
    
    # Guardian relationship
    guardian = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='student_financial_profiles_as_guardian',
        help_text='Primary guardian/parent'
    )
    
    # Transport (optional)
    transport_route = models.ForeignKey(
        'finance.TransportRoute',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_profiles',
        help_text='Assigned transport route'
    )
    
    # Hostel (optional, linked in Phase 2)
    hostel_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Hostel/dormitory name if applicable'
    )
    
    # Scholarship/Sponsorship (links in Phase 2)
    scholarship = models.ForeignKey(
        'finance.Scholarship',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_profiles',
        help_text='Active scholarship for this student'
    )
    
    # Financial Balance Tracking
    current_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[DecimalValidator(max_digits=15, decimal_places=2)],
        help_text='Current balance (positive = owes, negative = advance)'
    )
    
    arrears_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[DecimalValidator(max_digits=15, decimal_places=2)],
        help_text='Overdue balance'
    )
    
    advance_payment = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[DecimalValidator(max_digits=15, decimal_places=2)],
        help_text='Advance payment/credit balance'
    )
    
    total_invoiced = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[DecimalValidator(max_digits=15, decimal_places=2)],
        help_text='Total amount invoiced to date'
    )
    
    total_paid = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[DecimalValidator(max_digits=15, decimal_places=2)],
        help_text='Total amount paid to date'
    )
    
    previous_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[DecimalValidator(max_digits=15, decimal_places=2)],
        help_text='Balance carried forward from previous term/year'
    )
    
    # Status Tracking
    financial_status = models.CharField(
        max_length=20,
        choices=FINANCIAL_STATUS_CHOICES,
        default='active',
        db_index=True,
        help_text='Current financial status'
    )
    
    arrears_days = models.IntegerField(
        default=0,
        help_text='Number of days in arrears'
    )
    
    last_payment_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date of last payment recorded'
    )
    
    # Metadata
    notes = models.TextField(
        blank=True,
        null=True,
        help_text='Internal notes about this student'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='student_financial_profiles_created',
        help_text='User who created this profile'
    )
    
    updated_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='student_financial_profiles_updated',
        help_text='User who last updated this profile'
    )
    
    class Meta:
        db_table = 'finance_studentfinancialprofile'
        verbose_name = 'Student Financial Profile'
        verbose_name_plural = 'Student Financial Profiles'
        ordering = ['student__last_name', 'student__first_name']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['current_class']),
            models.Index(fields=['financial_status']),
            models.Index(fields=['arrears_balance']),
            models.Index(fields=['academic_year']),
        ]
        unique_together = [['student', 'academic_year']]  # One profile per student per year
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.get_financial_status_display()}"
    
    def recalculate_balance(self):
        """Recalculate balance from invoices and payments."""
        from .invoicing import Invoice
        from .payments import Payment, PaymentAllocation
        
        # Get all invoices for this student in current academic year
        invoices = Invoice.objects.filter(
            student=self.student,
            academic_year=self.academic_year,
            status__in=['issued', 'partially_paid', 'paid', 'credit_noted']
        ).aggregate(
            total_gross=models.Sum('gross_amount'),
            total_discounts=models.Sum('discount_amount'),
            total_paid=models.Sum('amount_paid')
        )
        
        total_gross = invoices['total_gross'] or Decimal('0.00')
        total_discounts = invoices['total_discounts'] or Decimal('0.00')
        total_paid = invoices['total_paid'] or Decimal('0.00')
        
        # Calculate net and balance
        self.total_invoiced = total_gross
        self.total_paid = total_paid
        
        net_amount = total_gross - total_discounts
        self.current_balance = max(Decimal('0.00'), net_amount - total_paid)
        
        # Update status
        self.update_financial_status()
        
        self.save(update_fields=['total_invoiced', 'total_paid', 'current_balance', 'financial_status'])
    
    def update_financial_status(self):
        """Update financial status based on balance."""
        if self.current_balance == Decimal('0.00'):
            self.financial_status = 'cleared'
        elif self.current_balance > Decimal('0.00'):
            if self.arrears_days > 30:
                self.financial_status = 'in_arrears'
            else:
                self.financial_status = 'active'
        else:
            self.financial_status = 'active'  # Advance payment
    
    @property
    def is_cleared(self):
        """Check if student has no outstanding balance."""
        return self.current_balance == Decimal('0.00')
    
    @property
    def is_in_arrears(self):
        """Check if student has overdue balance."""
        return self.financial_status == 'in_arrears'
    
    def get_payment_due_date(self):
        """Get the nearest upcoming payment due date."""
        from .invoicing import Invoice
        next_invoice = Invoice.objects.filter(
            student=self.student,
            status__in=['issued', 'partially_paid']
        ).order_by('due_date').first()
        return next_invoice.due_date if next_invoice else None


class FinancialStatusHistory(models.Model):
    """
    Audit trail of financial status changes.
    Tracks when and why a student's financial status changed.
    """
    
    STATUS_CHOICES = StudentFinancialProfile.FINANCIAL_STATUS_CHOICES
    
    id = models.BigAutoField(primary_key=True)
    
    student_financial_profile = models.ForeignKey(
        StudentFinancialProfile,
        on_delete=models.CASCADE,
        related_name='status_history',
        help_text='Parent profile'
    )
    
    previous_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        null=True,
        blank=True,
        help_text='Previous status'
    )
    
    new_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        help_text='New status'
    )
    
    reason = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Reason for status change'
    )
    
    balance_at_change = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Balance when status changed'
    )
    
    changed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='User who made the change'
    )
    
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'finance_financialstatushistory'
        verbose_name = 'Financial Status History'
        verbose_name_plural = 'Financial Status Histories'
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['student_financial_profile', '-changed_at']),
        ]
    
    def __str__(self):
        return f"{self.student_financial_profile.student} - {self.previous_status} → {self.new_status}"
