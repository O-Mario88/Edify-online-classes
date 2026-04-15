"""
Mobile Money Collection Service (MTN & Airtel)
Handles *receiving* payments from parents/guardians for student activation.
Separate from the existing momo_provider.py which handles *disbursements* to teachers.
"""

import os
import uuid
import logging
import requests
from django.utils import timezone

logger = logging.getLogger(__name__)


class MobileMoneyCollectionService:
    """
    Handles payment collection via MTN MoMo and Airtel Money APIs.
    
    Supports two flows:
    1. MTN Mobile Money — Uses the MTN Collections API to push a payment prompt
    2. Airtel Money — Uses the Airtel Money API for payment requests
    
    Both flows:
    - Send a push prompt (STK push) to the payer's phone
    - Payer authorizes on their phone
    - Provider sends callback/we poll for status
    """

    # ── MTN MoMo Collection ─────────────────────────────────────────────

    @staticmethod
    def _get_mtn_config():
        return {
            'base_url': os.environ.get(
                'MTN_COLLECTION_URL',
                'https://sandbox.momodeveloper.mtn.com/collection/v1_0'
            ),
            'subscription_key': os.environ.get('MTN_COLLECTION_SUBSCRIPTION_KEY', ''),
            'api_user': os.environ.get('MTN_COLLECTION_API_USER', ''),
            'api_key': os.environ.get('MTN_COLLECTION_API_KEY', ''),
            'target_environment': os.environ.get('MTN_TARGET_ENV', 'sandbox'),
            'callback_url': os.environ.get(
                'MTN_COLLECTION_CALLBACK_URL',
                'https://api.maple-edify.app/api/v1/institutions/payment-callback/'
            ),
        }

    @classmethod
    def request_mtn_payment(cls, phone_number: str, amount: float, reference: str, description: str = '') -> dict:
        """
        Sends an MTN MoMo STK push to the payer's phone.
        
        Returns:
            {
                'success': bool,
                'provider_reference': str,
                'status': str,
                'message': str
            }
        """
        config = cls._get_mtn_config()
        external_id = str(uuid.uuid4())

        # If no real API key configured, use sandbox simulation
        if not config['subscription_key']:
            logger.warning("[SANDBOX] MTN Collection: No API key configured. Simulating payment request.")
            return {
                'success': True,
                'provider_reference': f"MTN-SIM-{external_id[:8]}",
                'status': 'awaiting_authorization',
                'message': f'Simulated STK push sent to {phone_number}. Awaiting approval.',
            }

        headers = {
            'X-Reference-Id': external_id,
            'X-Target-Environment': config['target_environment'],
            'Ocp-Apim-Subscription-Key': config['subscription_key'],
            'Content-Type': 'application/json',
            'X-Callback-Url': config['callback_url'],
        }

        payload = {
            'amount': str(int(amount)),
            'currency': 'UGX',
            'externalId': reference,
            'payer': {
                'partyIdType': 'MSISDN',
                'partyId': cls._normalize_phone(phone_number),
            },
            'payerMessage': description or f'Student activation — Maple Online School',
            'payeeNote': f'Payment ref: {reference}',
        }

        try:
            response = requests.post(
                f"{config['base_url']}/requesttopay",
                headers=headers,
                json=payload,
                timeout=15,
            )

            if response.status_code in [200, 202]:
                return {
                    'success': True,
                    'provider_reference': external_id,
                    'status': 'awaiting_authorization',
                    'message': f'Payment prompt sent to {phone_number}',
                }
            else:
                logger.error(f"MTN Collection Error {response.status_code}: {response.text}")
                return {
                    'success': False,
                    'provider_reference': external_id,
                    'status': 'failed',
                    'message': f'MTN API Error: {response.status_code}',
                }
        except Exception as e:
            logger.error(f"MTN Collection Exception: {str(e)}")
            return {
                'success': False,
                'provider_reference': external_id,
                'status': 'failed',
                'message': str(e),
            }

    @classmethod
    def check_mtn_payment_status(cls, provider_reference: str) -> dict:
        """Check the status of a pending MTN payment."""
        config = cls._get_mtn_config()

        if not config['subscription_key']:
            # Sandbox simulation: auto-succeed after creation
            return {'status': 'SUCCESSFUL', 'reason': 'Sandbox auto-approve'}

        headers = {
            'X-Target-Environment': config['target_environment'],
            'Ocp-Apim-Subscription-Key': config['subscription_key'],
        }

        try:
            response = requests.get(
                f"{config['base_url']}/requesttopay/{provider_reference}",
                headers=headers,
                timeout=10,
            )
            if response.status_code == 200:
                data = response.json()
                return {'status': data.get('status', 'PENDING'), 'reason': data.get('reason', '')}
            return {'status': 'PENDING', 'reason': 'Awaiting provider response'}
        except Exception as e:
            return {'status': 'UNKNOWN', 'reason': str(e)}

    # ── Airtel Money Collection ─────────────────────────────────────────

    @staticmethod
    def _get_airtel_config():
        return {
            'base_url': os.environ.get(
                'AIRTEL_MONEY_URL',
                'https://openapiuat.airtel.africa'
            ),
            'client_id': os.environ.get('AIRTEL_CLIENT_ID', ''),
            'client_secret': os.environ.get('AIRTEL_CLIENT_SECRET', ''),
            'callback_url': os.environ.get(
                'AIRTEL_CALLBACK_URL',
                'https://api.maple-edify.app/api/v1/institutions/payment-callback/'
            ),
        }

    @classmethod
    def _get_airtel_token(cls) -> str:
        config = cls._get_airtel_config()
        if not config['client_id']:
            return 'sandbox_token'
        try:
            response = requests.post(
                f"{config['base_url']}/auth/oauth2/token",
                json={
                    'client_id': config['client_id'],
                    'client_secret': config['client_secret'],
                    'grant_type': 'client_credentials',
                },
                timeout=10,
            )
            if response.status_code == 200:
                return response.json().get('access_token', '')
        except Exception as e:
            logger.error(f"Airtel token error: {e}")
        return ''

    @classmethod
    def request_airtel_payment(cls, phone_number: str, amount: float, reference: str, description: str = '') -> dict:
        """
        Sends an Airtel Money payment request to the payer's phone.
        """
        config = cls._get_airtel_config()

        # Sandbox fallback
        if not config['client_id']:
            logger.warning("[SANDBOX] Airtel Money: No API credentials. Simulating payment request.")
            return {
                'success': True,
                'provider_reference': f"AIRTEL-SIM-{str(uuid.uuid4())[:8]}",
                'status': 'awaiting_authorization',
                'message': f'Simulated payment prompt sent to {phone_number}',
            }

        token = cls._get_airtel_token()
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'X-Country': 'UG',
            'X-Currency': 'UGX',
        }

        payload = {
            'reference': reference,
            'subscriber': {
                'country': 'UG',
                'currency': 'UGX',
                'msisdn': cls._normalize_phone(phone_number),
            },
            'transaction': {
                'amount': int(amount),
                'country': 'UG',
                'currency': 'UGX',
                'id': reference,
            },
        }

        try:
            response = requests.post(
                f"{config['base_url']}/merchant/v1/payments/",
                headers=headers,
                json=payload,
                timeout=15,
            )

            if response.status_code in [200, 202]:
                data = response.json()
                return {
                    'success': True,
                    'provider_reference': data.get('data', {}).get('transaction', {}).get('id', reference),
                    'status': 'awaiting_authorization',
                    'message': f'Payment prompt sent to {phone_number}',
                }
            else:
                return {
                    'success': False,
                    'provider_reference': reference,
                    'status': 'failed',
                    'message': f'Airtel API Error: {response.status_code}',
                }
        except Exception as e:
            logger.error(f"Airtel Money Exception: {str(e)}")
            return {
                'success': False,
                'provider_reference': reference,
                'status': 'failed',
                'message': str(e),
            }

    # ── Shared Helpers ──────────────────────────────────────────────────

    @staticmethod
    def _normalize_phone(phone: str) -> str:
        """Normalize Ugandan phone number to international format (256XXXXXXXXX)."""
        phone = phone.strip().replace(' ', '').replace('-', '')
        if phone.startswith('+'):
            phone = phone[1:]
        if phone.startswith('0'):
            phone = '256' + phone[1:]
        if not phone.startswith('256'):
            phone = '256' + phone
        return phone

    @classmethod
    def request_payment(cls, phone_number: str, amount: float, reference: str, provider: str = 'mtn', description: str = '') -> dict:
        """
        Unified entry point. Routes to the correct provider.
        """
        if provider in ('mtn_momo', 'mtn'):
            return cls.request_mtn_payment(phone_number, amount, reference, description)
        elif provider in ('airtel_money', 'airtel'):
            return cls.request_airtel_payment(phone_number, amount, reference, description)
        else:
            return {'success': False, 'status': 'failed', 'message': f'Unknown provider: {provider}'}
