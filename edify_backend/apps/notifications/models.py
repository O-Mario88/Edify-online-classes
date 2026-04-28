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
    read_at = models.DateTimeField(null=True, blank=True, help_text="Set when the recipient marks this read in-app")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.channel} to {self.user.email} ({self.status})"

class TeacherLessonNotification(models.Model):
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_notifications')
    timetable_slot = models.ForeignKey('scheduling.TimetableSlot', on_delete=models.CASCADE)
    dispatched_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    is_acknowledged = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Reminder for {self.teacher.email} ({self.timetable_slot})"

class WhatsAppMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_whatsapp_msgs')
    recipient_id = models.CharField(max_length=50) # To group chats with specific tutors by their ID
    recipient_phone = models.CharField(max_length=20)
    message_body = models.TextField()
    direction = models.CharField(max_length=20, choices=[('outbound', 'Outbound'), ('inbound', 'Inbound')])
    status = models.CharField(max_length=20, default='sent')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"WhatsApp {self.direction} ({self.status}) for {self.recipient_phone}"


class DeviceToken(models.Model):
    """Per-device push token. Mobile clients POST one of these on every
    cold start; we upsert on (user, token) so multiple devices per user
    are supported without duplicates.
    """
    PLATFORM_CHOICES = [
        ('ios', 'iOS'),
        ('android', 'Android'),
        ('web', 'Web'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='device_tokens',
    )
    token = models.CharField(max_length=512, db_index=True,
                             help_text='Expo push token or platform-native token.')
    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES, default='android')
    app_version = models.CharField(max_length=32, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('user', 'token')]
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.platform} token for {self.user.email}"


class NotificationPreference(models.Model):
    """Per-user, per-event delivery preferences.

    `notification_type` is a stable string key that the dispatch layer
    checks before sending — e.g. "live_class_reminder", "assignment_due".
    `channels` is a JSON list (push / email / whatsapp / sms) of the
    channels this event should be delivered on.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='notification_preferences',
    )
    notification_type = models.CharField(max_length=64, db_index=True)
    enabled = models.BooleanField(default=True)
    channels = models.JSONField(default=list,
                                help_text='List of channel keys: push / email / whatsapp / sms.')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('user', 'notification_type')]
        ordering = ['notification_type']

    def __str__(self):
        return f"{self.notification_type} for {self.user.email}"

