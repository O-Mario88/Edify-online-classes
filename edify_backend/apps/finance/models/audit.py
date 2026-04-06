# Edify Finance - Audit and Compliance Models
# Complete audit trail for all financial transactions

from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import JSONField
import json

User = get_user_model()


class AuditLog(models.Model):
    """
    Complete audit trail of all financial actions.
    Every transaction creates an audit entry.
    """
    
    ACTION_CHOICES = (
        ('created_invoice', 'Created Invoice'),
        ('updated_invoice', 'Updated Invoice'),
        ('issued_invoice', 'Issued Invoice'),
        ('cancelled_invoice', 'Cancelled Invoice'),
        ('recorded_payment', 'Recorded Payment'),
        ('allocated_payment', 'Allocated Payment'),
        ('reversed_payment', 'Reversed Payment'),
        ('confirmed_payment', 'Confirmed Payment'),
        ('issued_receipt', 'Issued Receipt'),
        ('reprinted_receipt', 'Reprinted Receipt'),
        ('created_credit_note', 'Created Credit Note'),
        ('approved_credit_note', 'Approved Credit Note'),
        ('posted_journal', 'Posted Journal Entry'),
        ('approved_journal', 'Approved Journal Entry'),
        ('recorded_expense', 'Recorded Expense'),
        ('approved_expense', 'Approved Expense'),
        ('created_fee_template', 'Created Fee Template'),
        ('approved_fee_template', 'Approved Fee Template'),
        ('registered_student', 'Registered Student'),
        ('updated_student_profile', 'Updated Student Profile'),
        ('created_budget', 'Created Budget'),
        ('approved_budget', 'Approved Budget'),
        ('other', 'Other'),
    )
    
    MODULE_CHOICES = (
        ('billing', 'Billing'),
        ('payment', 'Payment'),
        ('accounting', 'Accounting'),
        ('budgeting', 'Budgeting'),
        ('expenses', 'Expenses'),
        ('reports', 'Reports'),
        ('setup', 'Setup'),
        ('other', 'Other'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    # Event details
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='audit_logs',
        help_text='User who performed action'
    )
    
    action = models.CharField(
        max_length=255,
        choices=ACTION_CHOICES,
        help_text='Action performed'
    )
    
    # Module and source
    module = models.CharField(
        max_length=100,
        choices=MODULE_CHOICES,
        help_text='Finance module'
    )
    
    affected_table = models.CharField(
        max_length=255,
        help_text='Database table affected'
    )
    
    affected_record_id = models.BigIntegerField(
        db_index=True,
        help_text='Record ID affected'
    )
    
    affected_record_display = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Display value (e.g., invoice number)'
    )
    
    # Old and new values
    old_values = JSONField(
        default=dict,
        help_text='Previous values (JSON)'
    )
    
    new_values = JSONField(
        default=dict,
        help_text='New values (JSON)'
    )
    
    changes_summary = models.TextField(
        blank=True,
        null=True,
        help_text='Summary of changes'
    )
    
    # Request context
    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True,
        help_text='IP address of request'
    )
    
    user_agent = models.TextField(
        blank=True,
        null=True,
        help_text='User agent/browser'
    )
    
    reason = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Reason for action'
    )
    
    # Execution
    status = models.CharField(
        max_length=20,
        choices=(
            ('success', 'Success'),
            ('failure', 'Failure'),
        ),
        default='success',
        help_text='Action result'
    )
    
    error_details = models.TextField(
        blank=True,
        null=True,
        help_text='Error message if failed'
    )
    
    # Approval chain (if needed)
    requires_approval = models.BooleanField(
        default=False,
        help_text='Does action require approval?'
    )
    
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_audit_logs',
        help_text='User who approved'
    )
    
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When approved'
    )
    
    class Meta:
        db_table = 'finance_auditlog'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['user']),
            models.Index(fields=['action']),
            models.Index(fields=['module']),
            models.Index(fields=['affected_table', 'affected_record_id']),
        ]
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.affected_record_display} by {self.user.username}"
    
    @staticmethod
    def log_action(user, action, module, affected_table, affected_record_id,
                   affected_record_display=None, old_values=None, new_values=None,
                   ip_address=None, reason=None, status='success', error_details=None):
        """
        Helper method to log an action.
        """
        audit_log = AuditLog.objects.create(
            user=user,
            action=action,
            module=module,
            affected_table=affected_table,
            affected_record_id=affected_record_id,
            affected_record_display=affected_record_display,
            old_values=old_values or {},
            new_values=new_values or {},
            ip_address=ip_address,
            reason=reason,
            status=status,
            error_details=error_details,
        )
        return audit_log


class Exception(models.Model):
    """
    Flag unusual financial transactions for investigation.
    """
    
    EXCEPTION_TYPE_CHOICES = (
        ('large_payment', 'Large Payment'),
        ('unusual_time', 'Unusual Time'),
        ('duplicate_receipt', 'Duplicate Receipt'),
        ('missing_receipt_sequence', 'Missing Receipt Sequence'),
        ('unreconciled_entry', 'Unreconciled Entry'),
        ('suspicion_fraud', 'Suspected Fraud'),
        ('data_inconsistency', 'Data Inconsistency'),
        ('other', 'Other'),
    )
    
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('under_investigation', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('false_alarm', 'False Alarm'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    exception_type = models.CharField(
        max_length=50,
        choices=EXCEPTION_TYPE_CHOICES,
        help_text='Exception type'
    )
    
    affected_table = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Affected table'
    )
    
    affected_record_id = models.BigIntegerField(
        blank=True,
        null=True,
        help_text='Affected record'
    )
    
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Reference (e.g., invoice number)'
    )
    
    description = models.TextField(
        help_text='Exception description'
    )
    
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='medium',
        help_text='Severity level'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open',
        db_index=True,
        help_text='Investigation status'
    )
    
    investigation_notes = models.TextField(
        blank=True,
        null=True,
        help_text='Investigation notes'
    )
    
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_exceptions',
        help_text='User who resolved'
    )
    
    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When resolved'
    )
    
    resolution = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Resolution'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_exceptions',
        help_text='User who reported'
    )
    
    class Meta:
        db_table = 'finance_exception'
        verbose_name = 'Exception'
        verbose_name_plural = 'Exceptions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['exception_type']),
            models.Index(fields=['status']),
            models.Index(fields=['severity']),
        ]
    
    def __str__(self):
        return f"{self.get_exception_type_display()} - {self.reference_number}"
