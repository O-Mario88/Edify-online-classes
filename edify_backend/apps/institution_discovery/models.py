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


# ── School Match (Phase 9) ──────────────────────────────────────────
# Two-direction matching: student-to-school (already shipped above)
# and school-to-student (new). Defaults are intentionally restrictive —
# nothing about a learner is visible to any institution until the
# parent flips an explicit opt-in.

from django.conf import settings


class StudentOpportunityPreference(models.Model):
    """Per-student visibility & contact preferences for the school
    match marketplace. Defaults to fully private so a fresh account
    is never surfaced to any institution.

    `parent_approved` is the master gate. Without it, every other flag
    on this row is ignored downstream — institutions cannot discover
    the learner, even if the student themselves toggled openness.
    """
    VISIBILITY_CHOICES = [
        ('private',          'Private — institutions cannot discover me'),
        ('recommended_only', 'I see schools, but schools cannot contact me'),
        ('open_to_contact',  'Verified institutions can send invitations'),
    ]
    SHARE_LEVEL_CHOICES = [
        ('anonymous_summary',  'Anonymous summary'),
        ('academic_summary',   'Academic summary'),
        ('passport_summary',   'Passport summary'),
        ('full_passport',      'Full Learning Passport'),
    ]
    STUDY_MODE_CHOICES = [
        ('day',      'Day only'),
        ('boarding', 'Boarding only'),
        ('any',      'Either day or boarding'),
    ]

    student = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='opportunity_preference',
    )
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='approved_opportunity_preferences',
        help_text='Parent who recorded the approval. Required for minors.',
    )
    parent_approved = models.BooleanField(default=False, db_index=True)

    visibility_status = models.CharField(
        max_length=24, choices=VISIBILITY_CHOICES, default='private', db_index=True,
    )

    # Granular openness flags — only consulted when parent_approved &&
    # visibility_status != 'private'.
    open_to_institution_contact = models.BooleanField(default=False)
    open_to_scholarships = models.BooleanField(default=False)
    open_to_boarding = models.BooleanField(default=False)
    open_to_day = models.BooleanField(default=True)
    open_to_school_visit_invites = models.BooleanField(default=False)
    open_to_preview_class_invites = models.BooleanField(default=False)
    national_search_only = models.BooleanField(
        default=False,
        help_text='When true, only institutions in the same country surface the learner.',
    )

    preferred_countries = models.JSONField(default=list, blank=True)
    preferred_regions = models.JSONField(default=list, blank=True)
    preferred_curriculum = models.CharField(max_length=64, blank=True)
    preferred_entry_level = models.CharField(max_length=64, blank=True)
    preferred_entry_term = models.CharField(max_length=32, blank=True)
    preferred_study_mode = models.CharField(max_length=12, choices=STUDY_MODE_CHOICES, default='any')

    share_level = models.CharField(
        max_length=24, choices=SHARE_LEVEL_CHOICES, default='anonymous_summary',
        help_text='Maximum data the learner is willing to share BEFORE per-request consent.',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Student opportunity preference'

    def is_discoverable(self) -> bool:
        """The single source of truth for "can institutions see this learner?"
        Always require parent approval, an opt-in visibility, and contact-
        flag alignment. Used by every recommended-students query.
        """
        return (
            self.parent_approved
            and self.visibility_status == 'open_to_contact'
            and self.open_to_institution_contact
        )

    def __str__(self):
        return f'OppPref({self.student.email}, parent_approved={self.parent_approved})'


class StudentReadinessProfile(models.Model):
    """Snapshot of the scoring signals that drive student-school match.
    Recalculated by a periodic job; never written by the user directly.
    Kept in a separate row from the preference so a recompute doesn't
    touch parental consent state.

    All score fields are 0..100. `overall_readiness_score` is the
    pre-computed weighted blend used for ranking.
    """
    LANE_CHOICES = [
        ('high_performer', 'High academic performer'),
        ('high_growth',    'High-growth learner'),
        ('not_eligible',   'Not eligible for institution discovery'),
    ]

    student = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='readiness_profile',
    )
    country = models.CharField(max_length=2, blank=True)
    curriculum = models.CharField(max_length=64, blank=True)
    class_level = models.CharField(max_length=32, blank=True)
    region = models.CharField(max_length=64, blank=True)

    # Per-spec score components.
    activity_score = models.FloatField(default=0)
    academic_score = models.FloatField(default=0)
    improvement_score = models.FloatField(default=0)
    exam_readiness_score = models.FloatField(default=0)
    project_score = models.FloatField(default=0)
    teacher_feedback_score = models.FloatField(default=0)
    parent_engagement_score = models.FloatField(default=0)
    overall_readiness_score = models.FloatField(default=0, db_index=True)

    # Two-lane eligibility. `eligible` is the cached AND of the lane
    # gates so queries can be a single indexed lookup instead of
    # recomputing on every read.
    average_score_pct = models.FloatField(
        default=0,
        help_text='Average across all subjects, 0..100. Lane A gate (>=70).',
    )
    improvement_pct_6w = models.FloatField(
        default=0,
        help_text='Improvement over the last 6 weeks, percentage points. Lane B gate (>=15).',
    )
    parent_engaged = models.BooleanField(
        default=False,
        help_text='Whether the parent meets the parent-engagement signal that gates Lane B.',
    )
    lane = models.CharField(max_length=20, choices=LANE_CHOICES, default='not_eligible', db_index=True)
    eligible = models.BooleanField(default=False, db_index=True)

    last_calculated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Student readiness profile'
        ordering = ['-overall_readiness_score']

    def evaluate_lane(self) -> str:
        """Apply the two-lane gating rule:
          - Lane A: average across all subjects >= 70%.
          - Lane B: improvement over 6 weeks >= 15 pp AND parent_engaged.
        Sets `lane` and `eligible`. Caller is responsible for save().
        """
        if self.average_score_pct >= 70:
            self.lane = 'high_performer'
            self.eligible = True
        elif self.improvement_pct_6w >= 15 and self.parent_engaged:
            self.lane = 'high_growth'
            self.eligible = True
        else:
            self.lane = 'not_eligible'
            self.eligible = False
        return self.lane

    def __str__(self):
        return f'Readiness({self.student.email}): lane={self.lane} score={self.overall_readiness_score:.0f}'


class InstitutionMatchEligibility(models.Model):
    """Trust + activity gate that controls whether an institution can
    discover students. Two access levels:
      - can_view_student_matches: see anonymized match cards
      - can_send_invitations:     send invitations / passport requests

    Both are cached booleans recomputed by a periodic job from the
    underlying signals. The institution-side views check these flags
    on every request — defense in depth.
    """
    institution = models.OneToOneField(
        'institutions.Institution', on_delete=models.CASCADE,
        related_name='match_eligibility',
    )
    verified = models.BooleanField(default=False)
    safeguarding_approved = models.BooleanField(default=False)
    admission_open = models.BooleanField(default=False)
    activeness_score = models.FloatField(default=0, db_index=True)
    minimum_activity_met = models.BooleanField(default=False)

    can_view_student_matches = models.BooleanField(default=False, db_index=True)
    can_send_invitations = models.BooleanField(default=False, db_index=True)

    notes = models.TextField(blank=True, help_text='Why view/invite was granted or revoked.')
    last_checked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Institution match eligibility'

    def __str__(self):
        return (
            f'MatchElig({self.institution.name}): view={self.can_view_student_matches} '
            f'invite={self.can_send_invitations}'
        )


class StudentInstitutionMatch(models.Model):
    """Pre-computed (student, institution) match row. Created by the
    matching job; status moves through the lifecycle as either side
    interacts. Kept distinct from `Invitation` so we can show a card
    *before* anyone has invited / been invited.
    """
    STATUS_CHOICES = [
        ('suggested_to_student',     'Suggested to student'),
        ('suggested_to_institution', 'Suggested to institution'),
        ('student_hidden',           'Hidden by student'),
        ('institution_hidden',       'Hidden by institution'),
        ('invited',                  'Invited'),
        ('accepted',                 'Accepted'),
        ('declined',                 'Declined'),
        ('applied',                  'Applied'),
        ('enrolled',                 'Enrolled'),
        ('expired',                  'Expired'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='institution_matches',
    )
    institution = models.ForeignKey(
        'institutions.Institution', on_delete=models.CASCADE,
        related_name='student_matches',
    )
    match_score = models.FloatField(default=0, db_index=True)
    match_reasons = models.JSONField(default=list, blank=True)
    student_readiness_snapshot = models.JSONField(default=dict, blank=True)
    institution_strength_snapshot = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='suggested_to_institution', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('student', 'institution')]
        ordering = ['-match_score']
        verbose_name = 'Student↔institution match'

    def __str__(self):
        return f'Match(s={self.student.email}, i={self.institution.name}, score={self.match_score:.0f})'


class InstitutionStudentInvitation(models.Model):
    """Invitation sent by an institution to a parent (since parents are
    the contact point for minors). Tracks the eight-state workflow
    described in the spec.
    """
    INVITATION_TYPE_CHOICES = [
        ('apply',                  'Invite to apply'),
        ('interview',              'Invite for interview'),
        ('entrance_assessment',    'Invite for entrance assessment'),
        ('school_visit',           'Invite for school visit'),
        ('preview_class',          'Invite to preview class'),
        ('scholarship',            'Offer scholarship/bursary'),
        ('boarding_admission',     'Boarding admission discussion'),
        ('passport_access_request', 'Request Learning Passport access'),
        ('information_request',    'Request more information'),
    ]
    STATUS_CHOICES = [
        ('sent',                  'Sent'),
        ('viewed',                'Viewed'),
        ('accepted',              'Accepted'),
        ('declined',              'Declined'),
        ('expired',               'Expired'),
        ('application_started',   'Application started'),
        ('application_submitted', 'Application submitted'),
        ('interview_scheduled',   'Interview scheduled'),
        ('offer_made',            'Offer made'),
        ('enrolled',              'Enrolled'),
    ]

    institution = models.ForeignKey(
        'institutions.Institution', on_delete=models.CASCADE,
        related_name='sent_invitations',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='received_school_invitations',
    )
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='received_parent_invitations',
    )
    invitation_type = models.CharField(max_length=32, choices=INVITATION_TYPE_CHOICES)
    message = models.TextField(blank=True)
    why_interested = models.JSONField(
        default=list, blank=True,
        help_text='Bullet reasons surfaced to the parent on the invitation card.',
    )
    requested_share_level = models.CharField(
        max_length=24, choices=StudentOpportunityPreference.SHARE_LEVEL_CHOICES,
        default='academic_summary',
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='sent', db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='created_school_invitations',
    )
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return (
            f'Invite({self.invitation_type}, '
            f'i={self.institution.name}, s={self.student.email}, status={self.status})'
        )


class ScholarshipOpportunity(models.Model):
    """An institution-managed bursary / scholarship offering. Surfaces
    on the institution scholarship management screen and gates the
    "scholarship_only" filter on recommended-students.

    Sponsors / NGOs can be layered on post-pilot via a separate
    sponsor table; for now the institution itself is the issuer.
    """
    KIND_CHOICES = [
        ('academic',         'Academic merit'),
        ('financial_need',   'Financial need'),
        ('exam_candidate',   'Exam candidate support'),
        ('boarding',         'Boarding scholarship'),
        ('girl_child_stem',  'Girl-child STEM'),
        ('orphan',           'Orphan / vulnerable learner'),
        ('high_performer',   'High-performing learner award'),
        ('other',            'Other'),
    ]
    AMOUNT_BAND_CHOICES = [
        ('partial_25',  'Partial — 25%'),
        ('partial_50',  'Partial — 50%'),
        ('partial_75',  'Partial — 75%'),
        ('full',        'Full scholarship'),
        ('stipend',     'Stipend / allowance'),
        ('custom',      'Custom — see description'),
    ]

    institution = models.ForeignKey(
        'institutions.Institution', on_delete=models.CASCADE,
        related_name='scholarship_opportunities',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    kind = models.CharField(max_length=24, choices=KIND_CHOICES, default='academic')
    amount_band = models.CharField(max_length=24, choices=AMOUNT_BAND_CHOICES, default='partial_50')
    target_class_levels = models.JSONField(
        default=list, blank=True,
        help_text='List of class level codes the scholarship is open to.',
    )
    target_subjects = models.JSONField(default=list, blank=True)
    deadline = models.DateField(null=True, blank=True)
    active = models.BooleanField(default=True, db_index=True)
    seats_available = models.PositiveIntegerField(default=1)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='scholarship_opportunities_created',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Scholarship({self.institution.name}, {self.title})'


class PassportAccessRequest(models.Model):
    """Consent-driven Passport sharing. An institution requests one or
    more sections; the parent approves or declines. Approved requests
    expire so an institution can't keep peeking forever.
    """
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
        ('expired',  'Expired'),
        ('revoked',  'Revoked'),
    ]
    SECTION_CHOICES = [
        'completed_lessons',
        'assessment_results',
        'projects',
        'certificates',
        'exam_readiness',
        'teacher_feedback',
        'practice_lab_results',
        'attendance_history',
        'peer_learning',
    ]

    institution = models.ForeignKey(
        'institutions.Institution', on_delete=models.CASCADE,
        related_name='passport_access_requests',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='passport_access_requests',
    )
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reviewed_passport_access_requests',
    )
    requested_sections = models.JSONField(
        default=list,
        help_text='List of section keys (see SECTION_CHOICES).',
    )
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'PassportAccess(i={self.institution.name}, s={self.student.email}, status={self.status})'
