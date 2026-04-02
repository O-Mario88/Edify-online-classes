from django.db import models

class LiveSession(models.Model):
    PROVIDERS = [
        ('google_meet', 'Google Meet'),
        ('zoom', 'Zoom'),
    ]
    lesson = models.OneToOneField('lessons.Lesson', on_delete=models.CASCADE, related_name='live_session')
    meeting_link = models.URLField(max_length=500)
    provider = models.CharField(max_length=50, choices=PROVIDERS, default='google_meet')
    provider_event_id = models.CharField(max_length=255, blank=True, null=True)

    # Added Frontend Requirements
    scheduled_start = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=60)
    capacity = models.IntegerField(default=100)
    enrolled_count = models.IntegerField(default=0)

    def __str__(self):
        return f"Live Session for {self.lesson.title}"

class SessionReminder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    session = models.ForeignKey(LiveSession, on_delete=models.CASCADE, related_name='reminders')
    send_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Reminder for {self.session} at {self.send_at}"
