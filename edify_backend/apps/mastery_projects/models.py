"""Mastery Projects + rubric-based Teacher/Mentor Review.

A student submits a MasteryProject (text + artifacts), a reviewer
(teacher or admin at the same institution) scores it against a rubric
and either approves it or requests revision. All artifacts stay
in-platform — no downloads from the learner's perspective.
"""
import uuid
from django.db import models
from django.conf import settings


class MasteryProject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)

    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True)

    # Rubric schema: [{criterion: "Clarity", description: "...", max_points: 10}]
    rubric = models.JSONField(default=list, blank=True)
    estimated_days = models.PositiveIntegerField(default=3)
    is_group_project = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='authored_mastery_projects',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def total_points(self):
        return sum(c.get('max_points', 0) for c in (self.rubric or []))


class ProjectSubmission(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('revision_requested', 'Revision Requested'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(MasteryProject, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_submissions')
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True, help_text='Learner narrative of their project.')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')

    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    revision_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['project', 'status']),
        ]

    def __str__(self):
        return f'{self.project.title} by {self.student_id} ({self.status})'


class ProjectSubmissionArtifact(models.Model):
    ARTIFACT_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('audio', 'Audio'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('link', 'Link'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(ProjectSubmission, on_delete=models.CASCADE, related_name='artifacts')
    artifact_type = models.CharField(max_length=20, choices=ARTIFACT_TYPE_CHOICES)
    text_content = models.TextField(blank=True)
    file = models.FileField(upload_to='mastery_projects/artifacts/', null=True, blank=True)
    external_url = models.URLField(blank=True)
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ProjectReview(models.Model):
    STATUS_CHOICES = [
        ('passed', 'Passed'),
        ('needs_revision', 'Needs Revision'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(ProjectSubmission, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='project_reviews')
    # rubric_scores: {criterion_name: points_awarded}
    rubric_scores = models.JSONField(default=dict, blank=True)
    score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    feedback = models.TextField(blank=True)
    strengths = models.TextField(blank=True)
    improvements = models.TextField(blank=True)
    next_steps = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='passed')
    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-reviewed_at']
