"""Exam Simulator — Phase 5 of Maple Mastery Studio.

Reuses existing assessments.Question by linking ExamSimulation to a
curated set of Questions. Auto-marks MCQ + short_answer server-side.
Essay-style questions get teacher-marked via the existing grading
loop (out of scope for Phase 5).

Each Attempt produces a readiness_band derived from score_pct:
  ≥80 strong, 60–79 moderate, <60 low.

Wrong answers from each attempt are auto-persisted as
MistakeNotebookEntry rows — a per-learner journal of what to revise.
"""
import uuid
from django.db import models
from django.conf import settings


class ExamSimulation(models.Model):
    EXAM_TRACK_CHOICES = [
        ('PLE', 'Primary Leaving Examination'),
        ('UCE', 'Uganda Certificate of Education'),
        ('UACE', 'Uganda Advanced Certificate of Education'),
        ('KCSE', 'Kenya Certificate of Secondary Education'),
        ('GENERAL', 'General Practice'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    exam_track = models.CharField(max_length=20, choices=EXAM_TRACK_CHOICES)
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)

    duration_minutes = models.PositiveIntegerField(default=60)
    instructions = models.TextField(blank=True)

    # Curated question bank for this simulation.
    questions = models.ManyToManyField(
        'assessments.Question',
        related_name='exam_simulations',
        blank=True,
    )

    is_premium = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='authored_exam_simulations',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ExamSimulationAttempt(models.Model):
    STATUS_CHOICES = [
        ('started', 'Started'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    READINESS_CHOICES = [
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('strong', 'Strong'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(ExamSimulation, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exam_sim_attempts')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='started')

    answers = models.JSONField(default=dict, blank=True, help_text='{question_id: submitted_answer}')
    score_points = models.PositiveIntegerField(default=0)
    max_points = models.PositiveIntegerField(default=0)
    score_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    readiness_band = models.CharField(max_length=10, choices=READINESS_CHOICES, blank=True)

    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['student', 'exam']),
        ]


class MistakeNotebookEntry(models.Model):
    RETRY_STATUS_CHOICES = [
        ('open', 'Open'),
        ('retried_correct', 'Retried Correct'),
        ('retried_incorrect', 'Retried Incorrect'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mistake_notebook_entries')
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True)

    question = models.ForeignKey('assessments.Question', on_delete=models.CASCADE, related_name='mistake_notebook_entries')
    learner_answer = models.TextField(blank=True)
    correct_answer = models.TextField(blank=True)
    explanation = models.TextField(blank=True)
    retry_status = models.CharField(max_length=20, choices=RETRY_STATUS_CHOICES, default='open')
    source_attempt = models.ForeignKey(
        ExamSimulationAttempt, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mistake_entries',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'retry_status']),
        ]
