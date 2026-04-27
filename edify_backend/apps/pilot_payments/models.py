"""Pilot-1 payment model: manual upgrade-request + admin approval.

For the pilot we do NOT wire Pesapal live checkout (which needs a
merchant account, IPN webhook, and tax setup). Instead, a learner
clicks a pricing CTA → this creates an UpgradeRequest → platform
admin reviews + approves → backend flips a PremiumAccess row that
gates premium surfaces.

When Pesapal is wired in post-pilot, the approval step becomes
automatic on successful IPN callback; everything else stays the same.
"""
import uuid
from django.db import models
from django.conf import settings


PLAN_CHOICES = [
    ('learner_plus', 'Learner Plus'),
    ('parent_premium', 'Parent Premium'),
    ('teacher_pro', 'Teacher Pro'),
    ('school_os', 'School OS'),
    ('school_os_plus', 'School OS Plus'),
]


class UpgradeRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    METHOD_CHOICES = [
        ('mtn_momo', 'MTN Mobile Money'),
        ('airtel_money', 'Airtel Money'),
        ('mpesa', 'M-Pesa'),
        ('cash', 'Cash / Bank Transfer'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='upgrade_requests',
    )
    plan = models.CharField(max_length=30, choices=PLAN_CHOICES)
    contact_phone = models.CharField(max_length=30, blank=True)
    preferred_method = models.CharField(max_length=20, choices=METHOD_CHOICES, blank=True)
    note = models.TextField(blank=True, help_text='Anything the admin should know.')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reviewed_upgrade_requests',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'plan']),
            models.Index(fields=['requester', 'status']),
        ]

    def __str__(self):
        return f'{self.requester_id} → {self.plan} ({self.status})'


class PremiumAccess(models.Model):
    """What a user has been granted. One row per active grant.

    Expiration-aware: a premium grant can be time-bound. The
    `is_active_now()` helper is what gates premium features.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='premium_accesses',
    )
    plan = models.CharField(max_length=30, choices=PLAN_CHOICES)
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text='Leave blank for open-ended.')
    source_request = models.ForeignKey(
        UpgradeRequest, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='grants',
    )

    class Meta:
        ordering = ['-granted_at']
        indexes = [
            models.Index(fields=['user', 'plan']),
        ]

    def is_active_now(self) -> bool:
        if not self.expires_at:
            return True
        from django.utils import timezone
        return timezone.now() < self.expires_at
