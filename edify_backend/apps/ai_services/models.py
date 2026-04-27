from django.db import models
from django.conf import settings

class AIJob(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('done', 'Done'),
        ('failed', 'Failed'),
    ]
    requestor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_jobs')
    job_type = models.CharField(max_length=100) # e.g. rubric_generation, parent_summary
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payload = models.JSONField(help_text="Input data for the AI prompt")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Job {self.id} for {self.requestor.email} ({self.status})"

class AIOutput(models.Model):
    job = models.OneToOneField(AIJob, on_delete=models.CASCADE, related_name='output')
    result_blob = models.JSONField()
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Output for AI Job {self.job.id}"


# ── Maple Study Buddy (Phase 10.B) ──────────────────────────────────


class StudyBuddyConversation(models.Model):
    """A single chat thread with the Maple Study Buddy. We keep one
    conversation per user/topic so context can grow across sessions
    without bloating the prompt window."""
    PERSONA_CHOICES = [
        ('student', 'Maple Study Buddy (student)'),
        ('parent',  'Maple Parent Guide'),
        ('teacher', 'Maple Teacher Assistant'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='study_buddy_conversations',
    )
    persona = models.CharField(max_length=12, choices=PERSONA_CHOICES, default='student')
    title = models.CharField(max_length=200, blank=True,
                             help_text='Short label derived from the first user message.')
    subject = models.CharField(max_length=64, blank=True)
    topic = models.CharField(max_length=120, blank=True)
    # When the user / safety system flags the convo, we mark it
    # escalated so a teacher can pick it up via the support inbox.
    escalated = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [models.Index(fields=['user', '-updated_at'])]

    def __str__(self):
        return f'StudyBuddy({self.user.email}, {self.persona}, {self.title or "untitled"})'


class StudyBuddyMessage(models.Model):
    ROLE_CHOICES = [
        ('user',      'User'),
        ('assistant', 'Assistant'),
        ('system',    'System'),
    ]
    conversation = models.ForeignKey(
        StudyBuddyConversation, on_delete=models.CASCADE, related_name='messages',
    )
    role = models.CharField(max_length=12, choices=ROLE_CHOICES)
    content = models.TextField()
    # Optional hint surfaced by the assistant — e.g. "consider asking
    # a real teacher" — that the mobile renders as an escalation chip.
    escalation_hint = models.BooleanField(default=False)
    # For abuse / safety review, we capture which model + tokens were
    # used. None of this is exposed to the user.
    model = models.CharField(max_length=64, blank=True)
    input_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [models.Index(fields=['conversation', 'created_at'])]

    def __str__(self):
        return f'{self.role}: {self.content[:40]}'
