"""Ad-hoc mentor review requests — essays, exams, study plans, general help.

Separate from mastery_projects.ProjectReview: those are bound to a
MasteryProject. This app handles lightweight asks like "review my
essay" where there's no prebuilt project.
"""
import uuid
from django.db import models
from django.conf import settings


class MentorReviewRequest(models.Model):
    REQUEST_TYPE_CHOICES = [
        ('project', 'Project'),
        ('essay', 'Essay'),
        ('exam', 'Exam'),
        ('assignment', 'Assignment'),
        ('study_plan', 'Study Plan'),
        ('general_help', 'General Help'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('in_review', 'In Review'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentor_review_requests')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_mentor_reviews',
    )
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    request_type = models.CharField(max_length=30, choices=REQUEST_TYPE_CHOICES)
    related_submission = models.ForeignKey(
        'mastery_projects.ProjectSubmission', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mentor_review_requests',
    )
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['student', 'status']),
        ]


class MentorReviewResponse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(MentorReviewRequest, on_delete=models.CASCADE, related_name='responses')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentor_review_responses')
    feedback = models.TextField()
    recommended_next_steps = models.TextField(blank=True)
    # Store attachment URLs in JSON — files themselves come in via ProjectSubmissionArtifact.
    attachments = models.JSONField(default=list, blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)
