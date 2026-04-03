import uuid
import time

class PesapalMockService:
    """
    Simulates integration with Pesapal MTN/Airtel Money APIs.
    In a real implementation, this handles OAuth tokens, SubmitOrder Request, 
    and IPN payload verification.
    """
    
    @staticmethod
    def submit_order(invoice, merchant_reference=None):
        """
        Simulates submitting an order to Pesapal.
        Returns a mock tracking ID and a mock redirect URL.
        """
        # A real implementation would:
        # 1. Get bearer token
        # 2. POST to /api/PostPesapalDirectOrderV4
        # 3. Handle response extracting tracking_id and redirect_url
        
        tracking_id = f"mock_pesapal_trk_{uuid.uuid4().hex[:12]}"
        redirect_url = f"https://pay.pesapal.com/iframe/mock?id={tracking_id}"
        
        return {
            "status": "200",
            "redirect_url": redirect_url,
            "tracking_id": tracking_id,
            "merchant_reference": merchant_reference or str(invoice.id)
        }

    @staticmethod
    def verify_payment(tracking_id):
        """
        Simulates verifying an IPN callback from Pesapal.
        Returns status COMPLETED for simplicity in this mock.
        """
        # A real implementation queries /api/TransactionStatus?orderTrackingId={tracking_id}
        
        return {
            "status": "200",
            "payment_status_description": "COMPLETED",
            "payment_status_code": 1,
            "currency": "UGX",
            "amount": 50000.00, # In a real scenario, extract from actual payload
            "tracking_id": tracking_id
        }
