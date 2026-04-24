"""Standby Teacher Network — formalizes "real teacher on call" support.

Three concerns, three models:
  TeacherAvailability  — recurring weekly windows a teacher is on standby
                         (office_hours / chat / live_video / review).
  SupportRequest       — a student posts a question / help ask / review
                         request. Teachers accept + resolve.
  SupportSession       — a scheduled 1:1 between student and teacher,
                         with meeting_link + status tracking.

Ties into existing apps:
  - teacher / student → accounts.User
  - subject           → curriculum.Subject
"""
import uuid
from django.db import models
from django.conf import settings


class TeacherAvailability(models.Model):
    DAY_CHOICES = [(i, d) for i, d in enumerate(
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    )]
    MODE_CHOICES = [
        ('chat', 'Chat'),
        ('live_video', 'Live Video'),
        ('review', 'Review (async)'),
        ('office_hours', 'Office Hours'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='standby_availabilities',
    )
    subject = models.ForeignKey(
        'curriculum.Subject', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='standby_availabilities',
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='office_hours')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['day_of_week', 'start_time']
        indexes = [
            models.Index(fields=['is_active', 'day_of_week']),
        ]

    def __str__(self):
        return f'{self.teacher_id} · {self.get_day_of_week_display()} {self.start_time}-{self.end_time} ({self.mode})'


class SupportRequest(models.Model):
    REQUEST_TYPE_CHOICES = [
        ('chat', 'Chat help'),
        ('live_help', 'Live help'),
        ('review', 'Review request'),
        ('booking', 'Book a session'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    PRIORITY_CHOICES = [
        ('normal', 'Normal'),
        ('urgent', 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='standby_support_requests',
    )
    assigned_teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_standby_requests',
    )
    subject = models.ForeignKey(
        'curriculum.Subject', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='standby_support_requests',
    )
    topic = models.CharField(max_length=200, blank=True)
    question = models.TextField()
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES, default='chat')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    resolution_note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['student', 'status']),
        ]


class SupportSession(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('missed', 'Missed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='standby_sessions_as_student',
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='standby_sessions_as_teacher',
    )
    subject = models.ForeignKey(
        'curriculum.Subject', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='standby_sessions',
    )
    topic = models.CharField(max_length=200, blank=True)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    meeting_link = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    related_request = models.ForeignKey(
        SupportRequest, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='sessions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['teacher', 'status']),
        ]
