"""Institution discovery models.

Phase 1 only: we add *discovery profiles* and *recommendation scores*
alongside the existing Institution model. Phase 2+ will layer on pings,
applications, and inbox workflow.

Every institution can have a DiscoveryProfile — the public-facing
admissions view seen by students/parents. Scores are stored
separately so they can be recomputed nightly without touching the
profile editor surface.
"""
from django.db import models


class InstitutionDiscoveryProfile(models.Model):
    """Public-facing admissions profile shown on the discovery hub.

    Institutions fill this in voluntarily. If a profile row doesn't
    exist we fall back to the Institution model's own fields.
    """
    ADMISSION_STATUS_CHOICES = [
        ('open', 'Admissions Open'),
        ('invitation_only', 'Invitation Only'),
        ('waitlist', 'Waitlist'),
        ('closed', 'Admissions Closed'),
    ]
    BOARDING_CHOICES = [
        ('day', 'Day only'),
        ('boarding', 'Boarding only'),
        ('day_and_boarding', 'Day and Boarding'),
    ]

    institution = models.OneToOneField(
        'institutions.Institution',
        on_delete=models.CASCADE,
        related_name='discovery_profile',
    )

    # Location (denormalized so we don't depend on another app's geo model).
    location_city = models.CharField(max_length=120, blank=True)
    location_region = models.CharField(max_length=120, blank=True)

    # Free-form about + admissions copy.
    about = models.TextField(blank=True, help_text='Public intro shown on the institution profile page.')
    admission_blurb = models.TextField(blank=True, help_text='What prospective parents should know about applying.')

    boarding_options = models.CharField(max_length=40, choices=BOARDING_CHOICES, blank=True)
    admission_status = models.CharField(max_length=40, choices=ADMISSION_STATUS_CHOICES, default='open')

    # JSON lists — keep denormalized & fast to read.
    levels_offered = models.JSONField(default=list, blank=True, help_text='e.g. ["P1","P7","S1","S6"]')
    subjects_offered = models.JSONField(default=list, blank=True, help_text='Human-readable subject names.')

    # Admission contact points.
    admission_contact_name = models.CharField(max_length=200, blank=True)
    admission_contact_email = models.EmailField(blank=True)
    admission_contact_phone = models.CharField(max_length=30, blank=True)
    website = models.URLField(blank=True)

    # Publication gate.
    is_listed = models.BooleanField(
        default=False,
        help_text="If False the profile is hidden from the public discovery hub.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'DiscoveryProfile for {self.institution.name}'


class InstitutionRecommendationScore(models.Model):
    """Computed Maple Activeness + Growth scoring for an institution.

    Components are stored so the UI can show an explainable breakdown.
    Total is the weighted sum of the component scores (each 0–100).
    Computation lives in services.py so the model stays thin.
    """
    institution = models.OneToOneField(
        'institutions.Institution',
        on_delete=models.CASCADE,
        related_name='recommendation_score',
    )

    # Composite scores (each 0–100).
    maple_activeness_score = models.FloatField(default=0)
    growth_index = models.FloatField(default=0)

    # Component breakdown — each 0–100.
    verified_lesson_delivery = models.FloatField(default=0)
    assessment_activity = models.FloatField(default=0)
    attendance_tracking = models.FloatField(default=0)
    parent_reporting = models.FloatField(default=0)
    teacher_responsiveness = models.FloatField(default=0)
    peer_learning_activity = models.FloatField(default=0)
    student_engagement = models.FloatField(default=0)
    platform_consistency = models.FloatField(default=0)

    # Soft signals surfaced on the card.
    exam_readiness_strength = models.FloatField(default=0)
    standby_teachers_available = models.IntegerField(default=0)

    # Explain text shown under the score so learners/parents know what
    # the number is built from. Kept inside the model so recomputation
    # and UI are always in sync.
    explanation = models.TextField(blank=True)

    last_computed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-maple_activeness_score', '-growth_index']

    def __str__(self):
        return f'Score({self.institution.name}): active={self.maple_activeness_score:.0f} growth={self.growth_index:.0f}'
