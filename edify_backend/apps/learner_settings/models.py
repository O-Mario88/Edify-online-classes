"""Per-learner preferences driving the low-data / mobile experience.

Design:
  - One row per user (OneToOne), auto-created on first fetch.
  - Flags drive frontend behavior (lower-res images, audio-first lessons,
    skip autoplay, defer heavy dashboards). The backend doesn't enforce
    bandwidth — the frontend consults these flags and adapts.
  - WhatsApp / SMS reminder opt-in is captured here but the actual
    delivery pipeline is out of scope (existing notifications app
    handles the provider integration).
"""
from django.db import models
from django.conf import settings


class LearnerSettings(models.Model):
    DELIVERY_CHOICES = [
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
        ('sms', 'SMS'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='learner_settings',
    )
    # Low-data flags
    low_data_mode = models.BooleanField(
        default=False,
        help_text='Serve lower-res images, skip autoplay, prefer audio lessons.',
    )
    prefer_audio_lessons = models.BooleanField(default=False)
    allow_offline_downloads = models.BooleanField(
        default=True,
        help_text='Allow cached lesson notes for offline reading.',
    )

    # Reminders
    whatsapp_optin = models.BooleanField(default=False)
    sms_optin = models.BooleanField(default=False)
    weekly_brief_delivery = models.CharField(
        max_length=20, choices=DELIVERY_CHOICES, default='email',
    )
    contact_phone = models.CharField(max_length=20, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Settings for {self.user_id}'
