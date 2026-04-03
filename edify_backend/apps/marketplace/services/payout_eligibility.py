from decimal import Decimal
from marketplace.models import TeacherPayoutBatch, PayoutRequest
from .momo_provider import MobileMoneyDisbursementService

class TeacherPayoutEligibilityService:
    MINIMUM_THRESHOLD = Decimal('50000.00')

    @classmethod
    def check_eligibility(cls, teacher):
        """
        Returns a dict defining if a teacher can request a payout.
        """
        # Rule 1: Public/Independent Role check
        # Assuming the teacher has 'public' visibility classes
        has_public_classes = teacher.taught_classes.filter(visibility='public').exists()
        if not has_public_classes:
            return {'eligible': False, 'reason': 'Only independent teachers are eligible.'}
            
        # Payout Profile check
        if not hasattr(teacher, 'payout_profile') or not teacher.payout_profile.mobile_number:
            return {'eligible': False, 'reason': 'Incomplete payout profile. Missing mobile number.'}
            
        # Pending request check
        if PayoutRequest.objects.filter(teacher=teacher, status__in=['requested', 'processing', 'queued']).exists():
            return {'eligible': False, 'reason': 'A payout request is already currently processing.'}

        # Calculate Available Balances from unprocessed batches
        # These batches have already had deductions applied in the biweekly cycle.
        unprocessed_batches = TeacherPayoutBatch.objects.filter(
            teacher=teacher, 
            status='calculated',
            payout_request__isnull=True
        )
        
        if not unprocessed_batches.exists():
            return {'eligible': False, 'reason': 'No new earnings available for payout.'}
            
        total_gross = sum(b.gross_earnings for b in unprocessed_batches)
        total_deduction = sum(b.deduction_amount for b in unprocessed_batches) 
        net_payable = sum(b.net_payout for b in unprocessed_batches)

        if net_payable <= Decimal('0.00'):
            return {'eligible': False, 'reason': 'Net payable is zero after access-fee deductions.'}

        if net_payable < cls.MINIMUM_THRESHOLD:
            return {'eligible': False, 'reason': f'Net payable ({net_payable}) is below the minimum threshold of {cls.MINIMUM_THRESHOLD}.'}

        # Ensure teacher access fee deduction logic has processed safely
        fee_account = getattr(teacher, 'access_fee_account', None)
        remaining_fee_balance = fee_account.remaining_balance if fee_account else Decimal('0.00')

        return {
            'eligible': True,
            'reason': 'Eligible for payout.',
            'gross_available': total_gross,
            'deduction_due': total_deduction,
            'net_payable': net_payable,
            'remaining_fee_balance': remaining_fee_balance,
            'batch_ids': [b.id for b in unprocessed_batches]
        }

    @classmethod
    def execute_payout_request(cls, teacher, actor=None):
        """
        Locks the balance and generates the PayoutRequest.
        """
        eligibility = cls.check_eligibility(teacher)
        if not eligibility['eligible']:
            return False, eligibility['reason']

        # Create Request
        payout_request = PayoutRequest.objects.create(
            teacher=teacher,
            net_payable=eligibility['net_payable'],
            status='requested'
        )

        from marketplace.models import PayoutAuditLog
        PayoutAuditLog.objects.create(
            payout_request=payout_request,
            actor=actor or teacher,
            action_type="CREATE_REQUEST",
            new_status='requested',
            notes="Payout request manually created by teacher."
        )

        # Lock batches
        TeacherPayoutBatch.objects.filter(id__in=eligibility['batch_ids']).update(
            payout_request=payout_request,
            status='pending_disbursement'
        )

        # Trigger MoMo immediately
        success, ref = MobileMoneyDisbursementService.initiate_disbursement(payout_request)
        
        if success:
            TeacherPayoutBatch.objects.filter(id__in=eligibility['batch_ids']).update(
                status='disbursed'
            )
            return True, payout_request
        else:
            return False, f"Request queued but MoMo failed: {ref}"
