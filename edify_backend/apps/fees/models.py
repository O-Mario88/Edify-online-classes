"""Minimal fee-collection ledger for institution admins.

Two models, both manually managed by school admins for the pilot:

- FeeAssessment: "this student owes this much for this term".
  One row per student per term per fee item.
- FeePayment: "this student paid this amount on this date" — append-only,
  one row per receipt. Linked to its assessment.

A student's outstanding balance for an assessment is
    assessment.amount - sum(payments.amount).

Post-pilot integrations (Pesapal, MoMo) will write FeePayment rows in
response to webhooks; the same tables drive the institution dashboard's
fee-collection table either way.
"""
from decimal import Decimal
from django.db import models
from django.conf import settings


class FeeAssessment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partially paid'),
        ('paid', 'Paid in full'),
        ('waived', 'Waived'),
        ('cancelled', 'Cancelled'),
    ]

    institution = models.ForeignKey(
        'institutions.Institution', on_delete=models.CASCADE, related_name='fee_assessments',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fee_assessments',
    )
    term_label = models.CharField(
        max_length=40,
        help_text='e.g. "2026 Term 1". Free-form so admins can match their own labelling.',
    )
    item = models.CharField(
        max_length=120, default='Tuition',
        help_text='What the fee is for: tuition, transport, lunch, exam, etc.',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='UGX')
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='fee_assessments_created',
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-due_date', '-created_at']
        indexes = [models.Index(fields=['institution', 'status'])]

    def __str__(self) -> str:
        return f'{self.student.email} — {self.item} ({self.amount} {self.currency})'

    @property
    def total_paid(self) -> Decimal:
        return self.payments.aggregate(s=models.Sum('amount'))['s'] or Decimal('0')

    @property
    def balance(self) -> Decimal:
        return self.amount - self.total_paid

    def recompute_status(self) -> None:
        if self.status in ('waived', 'cancelled'):
            return
        bal = self.balance
        if bal <= 0:
            self.status = 'paid'
        elif self.total_paid > 0:
            self.status = 'partial'
        else:
            self.status = 'pending'


class FeePayment(models.Model):
    METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('mobile_money', 'Mobile money'),
        ('bank', 'Bank transfer'),
        ('card', 'Card'),
        ('other', 'Other'),
    ]

    assessment = models.ForeignKey(FeeAssessment, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cash')
    reference = models.CharField(max_length=120, blank=True, default='', help_text='Receipt ID, transaction ID, etc.')
    paid_on = models.DateField()
    notes = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='fee_payments_recorded',
    )

    class Meta:
        ordering = ['-paid_on', '-created_at']

    def __str__(self) -> str:
        return f'Payment {self.amount} {self.assessment.currency} on {self.paid_on}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Keep the parent assessment's status in sync.
        a = self.assessment
        a.recompute_status()
        a.save(update_fields=['status', 'updated_at'])
