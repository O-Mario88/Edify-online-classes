from django.db import models
from django.conf import settings

class Listing(models.Model):
    VISIBILITY_STATES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    CONTENT_TYPES = [
        ('video', 'Video Lesson'),
        ('notes', 'Revision Notes'),
        ('assessment', 'Practice Test'),
    ]
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=255)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES, default='video')
    price_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, blank=True, null=True, help_text="[DEPRECATED] Use billing.SubjectClassProduct for public pricing.")
    currency = models.CharField(max_length=10, default='UGX')
    visibility_state = models.CharField(max_length=20, choices=VISIBILITY_STATES, default='draft')
    average_rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    review_count = models.IntegerField(default=0)
    student_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ListingTopicBinding(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='topic_bindings')
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.CASCADE, related_name='listings')

    class Meta:
        unique_together = ('listing', 'topic')

    def __str__(self):
        return f"{self.listing.title} mapped to {self.topic.name}"

class LicenseDeal(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='licenses')
    purchaser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='purchased_licenses')
    access_granted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.purchaser.email} licensed {self.listing.title}"

class Wallet(models.Model):
    teacher = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    def __str__(self):
        return f"Wallet for {self.teacher.email} - Balance: {self.balance}"

class TeacherPayoutProfile(models.Model):
    teacher = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payout_profile')
    mobile_number = models.CharField(max_length=20, help_text="Mobile Money number used for disbursement")
    network = models.CharField(max_length=50, choices=[('mtn', 'MTN Uganda'), ('airtel', 'Airtel Uganda')], default='mtn')
    account_name = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.teacher.email} - {self.mobile_number}"

class PayoutRequest(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('requested', 'Requested'),
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('reversed', 'Reversed'),
        ('cancelled', 'Cancelled'),
    ]
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payout_requests')
    net_payable = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payout of {self.net_payable} for {self.teacher.email} ({self.status})"

class PayoutTransaction(models.Model):
    TRANSACTION_STATES = [
        ('created', 'Created'),
        ('submitted_to_provider', 'Submitted to Provider'),
        ('provider_pending', 'Provider Pending'),
        ('provider_success', 'Provider Success'),
        ('provider_failed', 'Provider Failed'),
        ('reconciliation_pending', 'Reconciliation Pending'),
        ('reconciled', 'Reconciled'),
    ]
    payout_request = models.OneToOneField(PayoutRequest, on_delete=models.CASCADE, related_name='transaction')
    provider_reference = models.CharField(max_length=255, blank=True, null=True)
    source_wallet = models.CharField(max_length=50, default="CONFIGURED_IN_ENV")
    destination_number = models.CharField(max_length=20)
    status = models.CharField(max_length=50, choices=TRANSACTION_STATES, default='created')
    raw_response = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PayoutAuditLog(models.Model):
    payout_request = models.ForeignKey(PayoutRequest, on_delete=models.CASCADE, related_name='audit_logs')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=100)
    old_status = models.CharField(max_length=50, blank=True, null=True)
    new_status = models.CharField(max_length=50)
    notes = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

import uuid

class TeacherPayoutBatch(models.Model):
    STATUS_CHOICES = [
        ('calculated', 'Calculated'),
        ('pending_disbursement', 'Pending Disbursement'),
        ('disbursed', 'Disbursed'),
        ('failed', 'Failed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payout_batches')
    payout_request = models.ForeignKey(PayoutRequest, on_delete=models.SET_NULL, null=True, blank=True, related_name='batches')
    cycle_start_date = models.DateTimeField()
    cycle_end_date = models.DateTimeField()
    
    gross_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deduction_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    net_payout = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='calculated')
    created_at = models.DateTimeField(auto_now_add=True)
    disbursed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Batch for {self.teacher.email} - Net: {self.net_payout}"
