from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_password_reset_email_task(email, reset_url):
    """
    Simulated dispatch of password reset email via Celery.
    In a real-world scenario, this would use django.core.mail.send_mail
    or an external API (like SendGrid/AWS SES).
    """
    logger.info("========== PASSWORD RESET EMAIL ==========")
    logger.info(f"To: {email}")
    logger.info("Subject: Reset your Edify Password")
    logger.info("Body: Click the link below to reset your password:")
    logger.info(reset_url)
    logger.info("==========================================")
    
    # Just to simulate a bit of terminal output directly:
    print(f"========== PASSWORD RESET EMAIL ==========")
    print(f"To: {email}")
    print(f"Subject: Reset your Edify Password")
    print(f"Body: Click the link below to reset your password:")
    print(f"{reset_url}")
    print(f"==========================================")
    
    return True
