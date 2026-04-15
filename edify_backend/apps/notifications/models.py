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

