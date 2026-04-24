"""Diagnostic session models.

The diagnostic runs immediately after a student signs up. The platform
auto-samples questions from the existing Question bank filtered to the
student's class-level, grades their answers, and produces an HTML-ready
Learning Level Report that drives the first payment CTA.

One DiagnosticSession per attempt per student. We don't copy questions
into a join table — we snapshot the sampled question IDs on the session
and record answers keyed by question ID. That keeps the schema small
and lets the existing assessments.Question bank be the single source
of truth for questions.
"""
import uuid
from django.db import models
from django.conf import settings


class DiagnosticSession(models.Model):
    STATE_CHOICES = [
        ('started', 'Started'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('abandoned', 'Abandoned'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='diagnostic_sessions',
    )
    class_level = models.ForeignKey(
        'curriculum.ClassLevel',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='diagnostic_sessions',
        help_text='The class-level the student says they are joining from. Drives question sampling.',
    )
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='started')

    # Snapshot: list of question IDs sampled for this session.
    sampled_question_ids = models.JSONField(default=list, blank=True)

    # Answers keyed by question_id (string): {question_id: submitted_answer}
    answers = models.JSONField(default=dict, blank=True)

    # Grading output: {question_id: {correct: bool, score: float}}
    grades = models.JSONField(default=dict, blank=True)

    # Computed rollups used by the report.
    total_questions = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    score_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # per_subject_scores: [{subject_id, subject_name, total, correct, pct}]
    per_subject_scores = models.JSONField(default=list, blank=True)
    # per_topic_scores: [{topic_id, topic_name, subject_name, total, correct, pct}]
    per_topic_scores = models.JSONField(default=list, blank=True)

    # Full report payload consumed by the frontend (learning level label,
    # strong/weak summaries, study plan skeleton, CTA hints).
    report_data = models.JSONField(default=dict, blank=True)

    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['student', 'state']),
        ]

    def __str__(self):
        return f'Diagnostic {self.id} for {self.student_id} — {self.state}'
