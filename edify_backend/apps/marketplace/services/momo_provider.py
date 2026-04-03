import os
import uuid
from django.utils import timezone
from marketplace.models import PayoutTransaction, PayoutAuditLog

class MobileMoneyDisbursementService:
    @staticmethod
    def _get_platform_wallet():
        # Do not hardcode frontend logic. Use env variable.
        return os.environ.get('PLATFORM_PAYOUT_WALLET', '0777078032')
        
    @classmethod
    def initiate_disbursement(cls, payout_request):
        """
        Creates the PayoutTransaction and initiates MoMo api call.
        """
        if payout_request.status != 'requested':
            return False, "Request is not in 'requested' state."

        # Grab profile
        profile = payout_request.teacher.payout_profile
        if not profile or not profile.mobile_number:
            return False, "Teacher has no payout profile or mobile number."

        # Create Transaction
        transaction = PayoutTransaction.objects.create(
            payout_request=payout_request,
            source_wallet=cls._get_platform_wallet(),
            destination_number=profile.mobile_number,
            status='created'
        )

        payout_request.status = 'processing'
        payout_request.save()

        PayoutAuditLog.objects.create(
            payout_request=payout_request,
            action_type="INITIATE_DISBURSEMENT",
            old_status='requested',
            new_status='processing',
            notes="Created transaction record and initiated MoMo call."
        )

        # Mock API Call here for MoMo integration
        # In real life, we would use something like MTN MoMo API or Flutterwave
        # simulating success logic for the backend authoritative state mapping
        try:
            # Fake HTTP req
            transaction.provider_reference = f"MOCK-REF-{uuid.uuid4().hex[:8].upper()}"
            transaction.status = 'provider_success'
            transaction.raw_response = {"status": "SUCCESS", "message": "Disbursement completed"}
            transaction.save()

            payout_request.status = 'paid'
            payout_request.processed_at = timezone.now()
            payout_request.save()

            PayoutAuditLog.objects.create(
                payout_request=payout_request,
                action_type="PROVIDER_RESPONSE",
                old_status='processing',
                new_status='paid',
                notes="Provider confirmed successful disbursement."
            )
            return True, transaction
        except Exception as e:
            transaction.status = 'provider_failed'
            transaction.raw_response = {"error": str(e)}
            transaction.save()
            
            payout_request.status = 'failed'
            payout_request.save()

            PayoutAuditLog.objects.create(
                payout_request=payout_request,
                action_type="PROVIDER_ERROR",
                old_status='processing',
                new_status='failed',
                notes=f"Provider failed: {str(e)}"
            )
            return False, str(e)
