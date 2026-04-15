import os
from twilio.rest import Client
import logging

logger = logging.getLogger(__name__)

class TwilioWhatsAppService:
    @staticmethod
    def send_message(recipient_phone, message_body):
        """
        Dispatches a WhatsApp message using the Twilio API.
        Falls back gracefully if environment variables are not configuring pointing to sandbox.
        """
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        from_whatsapp_number = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886') # Twilio Sandbox Number
        
        if not account_sid or not auth_token:
            logger.warning("[SIMULATION] Twilio API Keys missing. Simulating WhatsApp Message:")
            logger.warning(f"  To: whatsapp:{recipient_phone}")
            logger.warning(f"  From: {from_whatsapp_number}")
            logger.warning(f"  Msg: {message_body}")
            return {"status": "simulated", "sid": "SM_MOCK_123"}
            
        try:
            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=message_body,
                from_=from_whatsapp_number,
                to=f'whatsapp:{recipient_phone}'
            )
            logger.info(f"WhatsApp Message Sent. SID {message.sid}")
            return {"status": "success", "sid": message.sid}
        except Exception as e:
            logger.error(f"Failed to send Twilio WhatsApp message: {str(e)}")
            return {"status": "error", "error": str(e)}
