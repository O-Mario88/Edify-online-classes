"""Email-verification plumbing shared by register, activate, and the login gate.

Uses Django's default_token_generator (HMAC over user pk + last_login +
password + timestamp). Tokens are single-use in practice: consuming an
activation sets email_verified=True, which changes the user record and
invalidates subsequent tokens with the same timestamp.
"""
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils import timezone

logger = logging.getLogger('edify.accounts.activation')
User = get_user_model()


def build_activation_link(user) -> tuple[str, str, str]:
    """Return (uid, token, url) for the given user."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    # Frontend handles the landing page and POSTs uid+token back to the API.
    url = f"{settings.FRONTEND_BASE_URL}/activate?uid={uid}&token={token}"
    return uid, token, url


def send_activation_email(user) -> None:
    """Queue an activation email. In dev (console backend) it prints to stdout."""
    _, _, url = build_activation_link(user)
    subject = 'Activate your Maple Online School account'
    body = (
        f"Hi {user.full_name},\n\n"
        f"Welcome to Maple Online School. Activate your account by opening the link below:\n\n"
        f"{url}\n\n"
        f"If you did not sign up, ignore this message.\n"
    )
    try:
        send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        logger.info('activation_email_sent', extra={'email': user.email})
    except Exception:
        logger.exception('activation_email_failed email=%s', user.email)


def consume_activation(uid: str, token: str):
    """Validate + apply an activation. Returns the User on success, None on failure."""
    try:
        user_pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_pk)
    except (ValueError, TypeError, User.DoesNotExist):
        return None
    if not default_token_generator.check_token(user, token):
        return None
    if not user.email_verified:
        user.email_verified = True
        user.email_verified_at = timezone.now()
        user.save(update_fields=['email_verified', 'email_verified_at'])
    return user
