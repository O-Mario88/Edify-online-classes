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
