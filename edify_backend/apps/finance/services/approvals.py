"""
Multi-tier authorization engine for financial transactions.
"""
from decimal import Decimal
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

class ApprovalService:
    """
    Service to handle multi-tiered approvals for financial documents
    based on amount thresholds and user roles.
    """

    # Threshold amount in Base Currency (UGX). Transactions above this require higher authorization (e.g. Director)
    HIGH_VALUE_THRESHOLD = Decimal('500000.00')

    @classmethod
    def can_approve(cls, user, amount=Decimal('0.00')):
        """
        Check if user has clearance to approve a target financial amount.
        """
        roles = [group.name for group in user.groups.all()]
        
        # Superusers and Headteachers/Directors have unrestricted approval
        if user.is_superuser or 'Headteacher' in roles or 'Director' in roles or 'platform_admin' in roles or 'institution_admin' in roles:
            return True
            
        # Bursars can approve up to the HIGH_VALUE_THRESHOLD
        if 'Bursar' in roles or 'Finance Officer' in roles:
            if amount <= cls.HIGH_VALUE_THRESHOLD:
                return True
            else:
                raise PermissionDenied(
                    f"Amount {amount} exceeds your approval limit of {cls.HIGH_VALUE_THRESHOLD}. "
                    "Executive/Director approval required."
                )
        
        raise PermissionDenied("You do not have financial approval permissions.")

    @classmethod
    def approve_journal(cls, journal, user):
        """Approve a JournalEntry."""
        if journal.status != 'submitted':
            raise ValidationError("Only submitted journal entries can be approved.")
            
        total_amount = max(journal.total_debit, journal.total_credit)
        cls.can_approve(user, total_amount)
        
        journal.status = 'approved'
        journal.approved_by = user
        journal.approved_at = timezone.now()
        journal.save(update_fields=['status', 'approved_by', 'approved_at'])
        
        return journal

    @classmethod
    def approve_credit_note(cls, credit_note, user):
        """Approve a CreditNote."""
        if credit_note.status != 'draft':
            raise ValidationError("Only draft credit notes can be approved.")
            
        cls.can_approve(user, credit_note.amount)
        
        credit_note.status = 'approved'
        credit_note.approved_by = user
        credit_note.approved_at = timezone.now()
        credit_note.save(update_fields=['status', 'approved_by', 'approved_at'])
        
        return credit_note

    @classmethod
    def approve_fee_template(cls, fee_template, user):
        """Approve a FeeTemplate. This creates policy, so enforce strict checks."""
        if fee_template.status != 'draft':
            raise ValidationError("Only draft fee templates can be approved.")
        
        # Fee templates define policy and require high clearance regardless of amount
        roles = [group.name for group in user.groups.all()]
        if not (user.is_superuser or 'Headteacher' in roles or 'Director' in roles or 'Bursar' in roles or 'institution_admin' in roles):
             raise PermissionDenied("You do not have permission to approve fee structures.")
        
        fee_template.status = 'approved'
        fee_template.approved_by = user
        fee_template.approved_at = timezone.now()
        fee_template.save(update_fields=['status', 'approved_by', 'approved_at'])
        
        return fee_template
