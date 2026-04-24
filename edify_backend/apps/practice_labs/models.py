"""Guided Practice Labs — Phase 2 of Maple Mastery Studio.

A lab is a short, step-by-step learning activity that follows:
  Learn → Try → Hint → Submit → Feedback → Retry → Badge

Each lab has ordered steps (instruction / question / reflection /
upload / short_answer / mcq). A learner's Attempt tracks their
responses per step and gets a computed score + automated feedback.
Attempts can be retried — the latest attempt wins on the dashboard.

Reuses existing subject/class_level/topic foreign keys so labs slot
into the existing curriculum taxonomy. Also reuses MasteryTrackItem
from Phase 1 by pointing its practice_lab FK here.
"""
import uuid
from django.db import models
from django.conf import settings


class PracticeLab(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True, help_text='Shown at the start of the lab.')

    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True)

    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    estimated_minutes = models.PositiveIntegerField(default=15)

    pass_threshold_pct = models.PositiveIntegerField(default=70, help_text='Min % to pass and earn the badge.')
    badge_label = models.CharField(max_length=120, blank=True, help_text='e.g. "Fluency Starter"')

    is_published = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='authored_practice_labs',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class PracticeLabStep(models.Model):
    STEP_TYPE_CHOICES = [
        ('instruction', 'Instruction'),
        ('question', 'Open Question'),
        ('reflection', 'Reflection'),
        ('upload', 'File Upload'),
        ('short_answer', 'Short Answer'),
        ('mcq', 'Multiple Choice'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lab = models.ForeignKey(PracticeLab, on_delete=models.CASCADE, related_name='steps')
    order = models.PositiveIntegerField(default=1)
    step_type = models.CharField(max_length=20, choices=STEP_TYPE_CHOICES)
    prompt = models.TextField()
    hint = models.TextField(blank=True)
    options = models.JSONField(default=list, blank=True, help_text='MCQ options.')
    expected_answer = models.CharField(max_length=500, blank=True, help_text='For mcq + short_answer auto-grading.')
    points = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']
        unique_together = ('lab', 'order')

    def __str__(self):
        return f'{self.lab.title} step {self.order}'


class PracticeLabAttempt(models.Model):
    STATUS_CHOICES = [
        ('started', 'Started'),
        ('submitted', 'Submitted'),
        ('completed', 'Completed'),
        ('needs_retry', 'Needs Retry'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lab = models.ForeignKey(PracticeLab, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='practice_lab_attempts')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='started')

    score_points = models.PositiveIntegerField(default=0)
    max_points = models.PositiveIntegerField(default=0)
    score_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    feedback = models.TextField(blank=True)
    badge_earned = models.BooleanField(default=False)

    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['student', 'lab']),
        ]

    def __str__(self):
        return f'Attempt {self.id} · {self.student_id} on {self.lab_id} ({self.status})'


class PracticeLabStepResponse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempt = models.ForeignKey(PracticeLabAttempt, on_delete=models.CASCADE, related_name='responses')
    step = models.ForeignKey(PracticeLabStep, on_delete=models.CASCADE, related_name='responses')
    response_text = models.TextField(blank=True)
    selected_option = models.CharField(max_length=500, blank=True)
    uploaded_file = models.FileField(upload_to='practice_labs/uploads/', null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    feedback = models.TextField(blank=True)

    class Meta:
        unique_together = ('attempt', 'step')
