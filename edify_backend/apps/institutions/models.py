from django.db import models
from django.conf import settings

class Institution(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)
    logo = models.ImageField(upload_to='institution_logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#000000') # Hex colors
    secondary_color = models.CharField(max_length=7, default='#ffffff')
    
    country_code = models.CharField(max_length=10, default='uganda')
    curriculum_track = models.CharField(max_length=100, default='national')
    
    subscription_plan = models.CharField(max_length=100, default='free')
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def active_student_count(self):
        """Returns the number of active enrolled students for billing purposes."""
        return self.members.filter(role='student', status='active').count()

    def __str__(self):
        return self.name

class SubscriptionLedger(models.Model):
    institution = models.OneToOneField(Institution, on_delete=models.CASCADE, related_name='ledger')
    plan_tier = models.CharField(max_length=50, default='free') # free, essential, premium
    monthly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default='UGX')
    next_billing_date = models.DateField(null=True, blank=True)
    is_suspended = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.institution.name} [{self.plan_tier}] - Balance: {self.outstanding_balance}"

class InstitutionMembership(models.Model):
    ROLE_CHOICES = [
        ('headteacher', 'Headteacher'),
        ('deputy', 'Deputy Headteacher'),
        ('bursar', 'Bursar / Finance'),
        ('registrar', 'Registrar / Admissions'),
        ('dos', 'Director of Studies'),
        ('class_teacher', 'Class Teacher'),
        ('subject_teacher', 'Subject Teacher'),
        ('librarian', 'Librarian'),
        ('counselor', 'Counselor'),
        ('exam_officer', 'Exam Officer'),
        ('ict_admin', 'ICT Administrator'),
        ('parent', 'Parent / Guardian'),
        ('student', 'Student')
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('suspended', 'Suspended')
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='institution_memberships')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'institution', 'role')

    def __str__(self):
        return f"{self.user.email} - {self.institution.name} ({self.role})"

class InstitutionSubject(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='active_subjects')
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE, related_name='active_in_institutions')
    is_offered = models.BooleanField(default=True)
    custom_name = models.CharField(max_length=200, blank=True, null=True, help_text="Optional local override for the global subject name")
    
    class Meta:
        unique_together = ('institution', 'subject')

    def __str__(self):
        name = self.custom_name if self.custom_name else self.subject.name
        return f"{name} ({self.institution.name})"

class InstitutionImplementationScorecard(models.Model):
    institution = models.OneToOneField(Institution, on_delete=models.CASCADE, related_name='compliance_scorecard')
    syllabus_coverage_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="e.g. 85.50%")
    assessment_compliance_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Measures formative/summative alignment")
    practical_learning_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    last_computed = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.institution.name} - Coverage: {self.syllabus_coverage_pct}%"

class TeacherQualityScore(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quality_score')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='teacher_scores', null=True, blank=True)
    consistency_score = models.IntegerField(default=0, help_text="0-100 score based on lesson delivery timing")
    curriculum_fidelity_score = models.IntegerField(default=0, help_text="0-100 score based on topic competency tagging")
    is_ncdc_verified = models.BooleanField(default=False, help_text="Has the teacher been verified by external moderation bodies?")
    
    def __str__(self):
        return f"Quality Score for {self.user.email}"

import uuid

class LearnerRegistration(models.Model):
    """Tracks the 3-step student onboarding flow within an institution"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='learner_registrations')
    full_name = models.CharField(max_length=255)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)
    learner_id_number = models.CharField(max_length=100, blank=True, null=True)
    
    parent_name = models.CharField(max_length=255, blank=True, null=True)
    parent_phone = models.CharField(max_length=20, blank=True, null=True)
    parent_relationship = models.CharField(max_length=50, blank=True, null=True)
    
    STATE_CHOICES = [
        ('draft', 'Draft'),
        ('pending_payment', 'Pending Payment'),
        ('payment_verified', 'Payment Verified'),
        ('account_creation_pending', 'Account Creation Pending'),
        ('active', 'Active'),
        ('failed', 'Failed')
    ]
    status = models.CharField(max_length=50, choices=STATE_CHOICES, default='draft')
    
    # Track the linked user once active
    student_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='registration_record')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} ({self.status})"

class TemporaryPinReset(models.Model):
    """Audit log and tracking for PIN resets via SMS or Admin"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pin_resets')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='initiated_resets')
    method = models.CharField(max_length=20, choices=[('sms', 'Parent SMS'), ('admin', 'School Admin')])
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reset for {self.student.email} via {self.method}"
