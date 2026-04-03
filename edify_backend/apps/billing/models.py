from django.db import models
from django.conf import settings
import uuid

class SubjectClassProduct(models.Model):
    """
    The monthly subscription product for an independent student.
    A student buys access to one combination of Subject and Class Level.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE, related_name='subscription_products')
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.CASCADE, related_name='subscription_products')
    monthly_price = models.DecimalField(max_digits=12, decimal_places=2, default=50000.00)
    currency = models.CharField(max_length=10, default='UGX')
    is_active = models.BooleanField(default=True)
    is_purchasable = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('subject', 'class_level')

    def __str__(self):
        return f"{self.subject.name} - {self.class_level.name} ({self.monthly_price} {self.currency}/mo)"

class StudentSubscription(models.Model):
    """
    Tracks an independent student's access to a SubjectClassProduct.
    """
    STATUS_CHOICES = [
        ('pending_payment', 'Pending Payment'),
        ('active', 'Active'),
        ('grace_period', 'Grace Period'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    product = models.ForeignKey(SubjectClassProduct, on_delete=models.CASCADE, related_name='subscribed_students')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_payment')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.email} -> {self.product.subject.name} [{self.status}]"

class TeacherAccessFeeAccount(models.Model):
    """
    Tracks the UGX 300,000 Teacher Access Fee obligation.
    The balance is recovered through deductions on biweekly payouts.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='access_fee_account')
    total_obligation = models.DecimalField(max_digits=12, decimal_places=2, default=300000.00)
    recovered_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    is_recovered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def remaining_balance(self):
        return max(0, self.total_obligation - self.recovered_amount)

    def __str__(self):
        return f"Access Fee Acc {self.teacher.email} - Bal: {self.remaining_balance}"

class TeacherFeeInstallment(models.Model):
    """
    Tracks the individual UGX 60K (or partial) deductions from payouts.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(TeacherAccessFeeAccount, on_delete=models.CASCADE, related_name='installments')
    payout_batch = models.ForeignKey('marketplace.TeacherPayoutBatch', on_delete=models.CASCADE, related_name='fee_installments', null=True, blank=True)
    amount_deducted = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Installment {self.amount_deducted} for {self.account.teacher.email}"

class InstitutionBillingPlan(models.Model):
    """
    Admin configurable billing tiers for an institution.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100) # e.g., Monthly Flex Plan
    billing_cycle = models.CharField(max_length=20, choices=[('monthly', 'Monthly'), ('termly', 'Termly'), ('yearly', 'Yearly')])
    price_per_student = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='UGX')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.price_per_student} {self.currency} per student"

class InstitutionBillingProfile(models.Model):
    """
    Centralizes the School OS active-student billing gating logic.
    Schools start in 'setup' and transition to 'active' once payment covers seat counts.
    """
    ACTIVATION_STATUS = [
        ('setup', 'Free Setup Mode'),
        ('active', 'Fully Activated'),
        ('grace_period', 'Grace Period (Overage)'),
        ('suspended', 'Suspended')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.OneToOneField('institutions.Institution', on_delete=models.CASCADE, related_name='billing_profile')
    activation_status = models.CharField(max_length=20, choices=ACTIVATION_STATUS, default='setup')
    paid_seat_count = models.IntegerField(default=0, help_text="How many active student seats this institution has currently paid for")
    active_plan = models.ForeignKey(InstitutionBillingPlan, on_delete=models.SET_NULL, null=True, blank=True)
    currency = models.CharField(max_length=10, default='UGX')
    next_billing_date = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.institution.name} Profile: {self.paid_seat_count} seats ({self.activation_status})"

class Invoice(models.Model):
    """
    Consolidated Invoice reference capturing internal representation of what is due.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, help_text="The individual payer (Platform Fee, Subject Subscription)")
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True, help_text="The paying entity (Institution Mode)")
    
    amount_due = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='UGX')
    description = models.CharField(max_length=255)
    
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        entity = self.institution.name if self.institution else (self.user.email if self.user else "Unknown")
        return f"Invoice {self.id} for {entity} - {self.amount_due} {self.currency}"

class TransactionRecord(models.Model):
    """
    Tracks external payment gateway callbacks (e.g. Pesapal).
    """
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('completed', 'Completed/Verified'),
        ('failed', 'Failed'),
        ('reversed', 'Reversed')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='transactions')
    pesapal_tracking_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    pesapal_merchant_reference = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='UGX')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    payment_method = models.CharField(max_length=50, blank=True, null=True, help_text="MTN Mobile Money, Airtel Money, Visa")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Tx {self.id} -> {self.status}"
