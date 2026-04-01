from django.db import models
from django.conf import settings

class Notification(models.Model):
    CHANNEL_CHOICES = [
        ('in_app', 'In-App'),
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
        ('sms', 'SMS'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    payload = models.JSONField(help_text="Structured data for the delivery template")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.channel} to {self.user.email} ({self.status})"
