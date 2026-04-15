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

        # Real Sandbox MoMo Call using requests
        import requests
        try:
            momo_sandbox_url = os.environ.get('MOMO_SANDBOX_DISBURSEMENT_URL', 'https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer')
            momo_subscription_key = os.environ.get('MOMO_SUBSCRIPTION_KEY', 'sandbox_mock_key')
            momo_api_user = os.environ.get('MOMO_API_USER', 'sandbox_user')
            
            headers = {
                'X-Reference-Id': str(uuid.uuid4()),
                'X-Target-Environment': 'sandbox',
                'Ocp-Apim-Subscription-Key': momo_subscription_key,
                'Content-Type': 'application/json'
            }
            
            payload = {
                "amount": str(payout_request.amount),
                "currency": "UGX",
                "externalId": f"EDF-PAY-{payout_request.id}",
                "payee": {
                    "partyIdType": "MSISDN",
                    "partyId": profile.mobile_number
                },
                "payerMessage": f"Edify Teacher Payout: {payout_request.amount} UGX",
                "payeeNote": "Thank you for teaching with Edify"
            }
            
            response = requests.post(momo_sandbox_url, headers=headers, json=payload, timeout=10)
            
            if response.status_code in [200, 202]:
                transaction.provider_reference = headers['X-Reference-Id']
                transaction.status = 'provider_success'
                transaction.raw_response = {"status": "SUCCESS", "message": "Disbursement accepted by provider"}
                transaction.save()

                payout_request.status = 'paid'
                payout_request.processed_at = timezone.now()
                payout_request.save()

                PayoutAuditLog.objects.create(
                    payout_request=payout_request,
                    action_type="PROVIDER_RESPONSE",
                    old_status='processing',
                    new_status='paid',
                    notes="Provider accepted successful disbursement."
                )
                return True, transaction
            else:
                raise Exception(f"Provider returned {response.status_code}: {response.text}")
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
