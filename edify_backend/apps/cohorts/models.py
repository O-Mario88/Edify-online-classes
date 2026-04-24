"""Learning Cohorts — structured group journeys led by a teacher.

Examples (from the product spec):
  - PLE 12-Week Revision Cohort
  - S1 Mathematics Catch-Up Cohort
  - Reading Fluency 30-Day Challenge
  - UCE Biology Exam Prep Cohort

Cohorts create urgency (start + end dates), structure (weekly plan),
accountability (a teacher lead), and community (shared peers).
"""
import uuid
from django.db import models
from django.conf import settings


class Cohort(models.Model):
    EXAM_TRACK_CHOICES = [
        ('', 'None'),
        ('PLE', 'PLE'),
        ('UCE', 'UCE'),
        ('UACE', 'UACE'),
        ('KCSE', 'KCSE'),
        ('general', 'General'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    tagline = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    teacher_lead = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='led_cohorts',
    )
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)
    exam_track = models.CharField(max_length=20, choices=EXAM_TRACK_CHOICES, blank=True, default='')

    start_date = models.DateField()
    end_date = models.DateField()

    # weekly_plan schema: [{week: 1, focus: "…", live_classes: [...], projects: [...]}]
    weekly_plan = models.JSONField(default=list, blank=True)

    max_seats = models.PositiveIntegerField(default=0, help_text='0 = unlimited')
    is_premium = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)

    cover_image = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_date']

    def __str__(self):
        return self.title


class CohortEnrollment(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cohort_enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    progress_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('cohort', 'student')
        ordering = ['-enrolled_at']
