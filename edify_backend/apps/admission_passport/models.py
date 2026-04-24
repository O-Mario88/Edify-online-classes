"""Admission Passport — Phase 6 of Mastery Studio.

The bridge between Mastery Studio and Institution Discovery: a student
can formally apply to an institution and optionally share their
Learning Passport as proof of progress. The institution's admission
officers see the passport inline next to the application.

Models:
  AdmissionApplication — one per (student, institution, class_level)
  AdmissionStatusEvent — audit trail of status transitions
"""
import uuid
from django.db import models
from django.conf import settings


class AdmissionApplication(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('more_info_requested', 'More Info Requested'),
        ('interview_invited', 'Interview Invited'),
        ('accepted', 'Accepted'),
        ('waitlisted', 'Waitlisted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    STUDY_MODE_CHOICES = [
        ('day', 'Day'),
        ('boarding', 'Boarding'),
        ('hybrid', 'Hybrid'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admission_applications')
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='child_admission_applications',
    )
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='admission_applications')
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)

    entry_term = models.CharField(max_length=60, blank=True, help_text='e.g. "Term 1 2026"')
    study_mode = models.CharField(max_length=20, choices=STUDY_MODE_CHOICES, blank=True)
    current_school = models.CharField(max_length=255, blank=True)
    academic_summary = models.TextField(blank=True)

    # Passport sharing — if share_passport=True we copy the passport's
    # share token at submission time and the admission officer can view
    # the redacted passport inline. Storing the token captures a
    # snapshot: if the learner later revokes the passport share, this
    # application still has its link.
    share_passport = models.BooleanField(default=True)
    shared_passport_token = models.CharField(max_length=40, blank=True)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['institution', 'status']),
        ]

    def __str__(self):
        return f'{self.student_id} → {self.institution.name} ({self.status})'


class AdmissionStatusEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(AdmissionApplication, on_delete=models.CASCADE, related_name='events')
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
