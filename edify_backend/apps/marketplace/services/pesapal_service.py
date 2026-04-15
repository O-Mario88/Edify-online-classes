import os
import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class PesapalService:
    @staticmethod
    def get_base_url():
        """Returns the appropriate PesaPal URL based on environment."""
        env = os.environ.get('PESAPAL_ENV', 'sandbox').lower()
        if env == 'production':
            return "https://pay.pesapal.com/v3"
        return "https://cybqa.pesapal.com/pesapalv3"
        
    @staticmethod
    def get_credentials():
        """Fetches consumer keys from environment variables."""
        consumer_key = os.environ.get('PESAPAL_CONSUMER_KEY', 'sandbox_key_xyz')
        consumer_secret = os.environ.get('PESAPAL_CONSUMER_SECRET', 'sandbox_secret_abc')
        return consumer_key, consumer_secret

    @classmethod
    def get_bearer_token(cls):
        """Authenticates with PesaPal and returns a bearer token."""
        url = f"{cls.get_base_url()}/api/Auth/RequestToken"
        key, secret = cls.get_credentials()
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        payload = {
            "consumer_key": key,
            "consumer_secret": secret
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get("token")
            logger.error(f"Pesapal Auth Error: {response.text}")
            return None
        except Exception as e:
            logger.error(f"Pesapal Connection Error: {str(e)}")
            return None

    @classmethod
    def register_ipn_url(cls, token, ipn_url):
        """Registers the IPN URL and returns the IPN ID."""
        url = f"{cls.get_base_url()}/api/URLSetup/RegisterIPN"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        payload = {
            "url": ipn_url,
            "ipn_notification_type": "POST"
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get("ipn_id")
            
            # If standard POST fails, Pesapal documentation sometimes suggests GET for previously registered URLs
            logger.error(f"IPN Registration Error: {response.text}")
            
            # Simulated local fallback
            if "sandbox" in cls.get_base_url():
                return "mock_ipn_id_12345"
            return None
        except Exception as e:
            logger.error(f"IPN Registration Exception: {str(e)}")
            return "mock_ipn_id_12345" if "sandbox" in cls.get_base_url() else None

    @classmethod
    def submit_order(cls, amount, description, reference, email, first_name, last_name, phone_number, callback_url, ipn_id):
        """Submits an order to PesaPal and returns the payment redirect URL and order_tracking_id."""
        token = cls.get_bearer_token()
        if not token:
            raise Exception("Failed to authenticate with PesaPal")
            
        url = f"{cls.get_base_url()}/api/Transactions/SubmitOrderRequest"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        payload = {
            "id": reference,
            "currency": "UGX",
            "amount": float(amount),
            "description": description,
            "callback_url": callback_url,
            "notification_id": ipn_id,
            "billing_address": {
                "email_address": email,
                "phone_number": phone_number,
                "country_code": "UG",
                "first_name": first_name,
                "middle_name": "",
                "last_name": last_name,
                "line_1": "",
                "line_2": "",
                "city": "",
                "state": "",
                "postal_code": "",
                "zip_code": ""
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "redirect_url": data.get("redirect_url"),
                    "order_tracking_id": data.get("order_tracking_id")
                }
            
            logger.error(f"Order Submit Error: {response.text}")
            # Mock successfully generated order for Sandbox local testing without keys
            if "cybqa.pesapal" in cls.get_base_url() and os.environ.get('PESAPAL_CONSUMER_KEY') is None:
                logger.warning("[SIMULATION] Returning simulated PesaPal Redirect Frame")
                return {
                    "redirect_url": f"https://cybqa.pesapal.com/pesapaliframe/PesapalIframe3/Index?OrderTrackingId=mock_tracked_order_{reference}",
                    "order_tracking_id": f"mock_tracked_order_{reference}"
                }
            
            raise Exception(f"PesaPal API Error: {response.text}")
            
        except Exception as e:
            logger.error(f"Submit Order Exception: {str(e)}")
            if "cybqa.pesapal" in cls.get_base_url() and os.environ.get('PESAPAL_CONSUMER_KEY') is None:
                return {
                    "redirect_url": f"https://cybqa.pesapal.com/pesapaliframe/PesapalIframe3/Index?OrderTrackingId=mock_tracked_order_{reference}",
                    "order_tracking_id": f"mock_tracked_order_{reference}"
                }
            raise e

    @classmethod
    def get_transaction_status(cls, order_tracking_id):
        """Fetches the status of a specific order tracking ID."""
        token = cls.get_bearer_token()
        if not token:
            raise Exception("Failed to authenticate with PesaPal")
            
        url = f"{cls.get_base_url()}/api/Transactions/GetTransactionStatus?orderTrackingId={order_tracking_id}"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data
            logger.error(f"Get Status Error: {response.text}")
            return None
        except Exception as e:
            logger.error(f"Get Status Exception: {str(e)}")
            return None
