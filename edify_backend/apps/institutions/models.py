from django.db import models
from django.conf import settings
import uuid

class Institution(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)
    logo = models.ImageField(upload_to='institution_logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#000000') # Hex colors
    secondary_color = models.CharField(max_length=7, default='#ffffff')
    
    SCHOOL_LEVEL_CHOICES = [
        ('primary', 'Primary School'),
        ('secondary', 'Secondary School'),
    ]
    
    country_code = models.CharField(max_length=10, default='uganda')
    curriculum_track = models.CharField(max_length=100, default='national')
    
    school_level = models.CharField(max_length=20, choices=SCHOOL_LEVEL_CHOICES, default='secondary')
    grade_offerings = models.JSONField(default=list, help_text="List of internal_canonical_grades this institution offers e.g. [4, 5, 6, 7] for Primary")
    
    subscription_plan = models.CharField(max_length=100, default='free')
    tier_expiration_date = models.DateTimeField(null=True, blank=True)
    in_grace_period = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def active_student_count(self):
        """Returns the number of active enrolled students for billing purposes."""
        return self.members.filter(role='student', status='active').count()

    def __str__(self):
        return self.name


class InstitutionMembership(models.Model):
    ROLE_CHOICES = [
        ('headteacher', 'Headteacher'),
        ('deputy', 'Deputy Headteacher'),
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


# ── Subscription & Activation Models ──────────────────────────────────

class SubscriptionPlan(models.Model):
    """Defines available student subscription packages."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price_ugx = models.DecimalField(max_digits=12, decimal_places=2)
    price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    duration_days = models.IntegerField(default=30, help_text="Number of days the subscription is valid for")
    access_scope = models.CharField(max_length=50, default='full', help_text="e.g. full, basic, premium")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — UGX {self.price_ugx:,.0f}"


class LearnerRegistration(models.Model):
    """Tracks the multi-step student onboarding flow within an institution."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='learner_registrations')
    
    # Step 1: Student Details
    full_name = models.CharField(max_length=255)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)
    stream_section = models.CharField(max_length=100, blank=True, null=True, help_text="Stream or section e.g. 'East', 'A'")
    learner_id_number = models.CharField(max_length=100, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    
    # Step 2: Parent / Guardian Details
    parent_name = models.CharField(max_length=255, blank=True, null=True)
    parent_phone = models.CharField(max_length=20, blank=True, null=True)
    parent_phone_secondary = models.CharField(max_length=20, blank=True, null=True)
    parent_relationship = models.CharField(max_length=50, blank=True, null=True)
    parent_email = models.EmailField(blank=True, null=True)
    parent_address = models.TextField(blank=True, null=True)
    parent_consent = models.BooleanField(default=False)
    
    # Step 3: Parent Account Link
    parent_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='child_registrations')
    
    # Step 4: Subscription
    subscription_plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Step 5: Payment
    PAYMENT_METHOD_CHOICES = [
        ('mtn_momo', 'MTN Mobile Money'),
        ('airtel_money', 'Airtel Money'),
        ('visa_pesapal', 'Visa Card (Pesapal)'),
    ]
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    payer_phone = models.CharField(max_length=20, blank=True, null=True, help_text="Phone number authorizing payment")
    
    # Onboarding State Machine
    ONBOARDING_STATES = [
        ('draft', 'Draft'),
        ('parent_linked', 'Parent Linked'),
        ('subscription_selected', 'Subscription Selected'),
        ('payment_pending', 'Payment Pending'),
        ('payment_in_progress', 'Payment In Progress'),
        ('payment_failed', 'Payment Failed'),
        ('payment_success', 'Payment Successful'),
        ('activated', 'Activated'),
    ]
    status = models.CharField(max_length=30, choices=ONBOARDING_STATES, default='draft')
    
    # Track the linked student user once activated
    student_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='registration_record')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.status})"


class StudentPaymentTransaction(models.Model):
    """Tracks individual payment attempts for student onboarding."""
    PAYMENT_STATES = [
        ('initiated', 'Initiated'),
        ('pending', 'Pending'),
        ('awaiting_authorization', 'Awaiting Authorization'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]
    PAYMENT_METHODS = [
        ('mtn_momo', 'MTN Mobile Money'),
        ('airtel_money', 'Airtel Money'),
        ('visa_pesapal', 'Visa Card (Pesapal)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration = models.ForeignKey(LearnerRegistration, on_delete=models.CASCADE, related_name='payment_attempts')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='payment_transactions')
    subscription_plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    
    student_name = models.CharField(max_length=255)
    parent_name = models.CharField(max_length=255, blank=True)
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='UGX')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payer_phone = models.CharField(max_length=20, blank=True, null=True)
    
    provider_reference = models.CharField(max_length=255, blank=True, null=True, help_text="External reference from payment provider")
    internal_reference = models.UUIDField(default=uuid.uuid4, unique=True)
    
    status = models.CharField(max_length=30, choices=PAYMENT_STATES, default='initiated')
    provider_response = models.JSONField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.student_name} — {self.payment_method} — {self.status} — UGX {self.amount}"


class StudentActivation(models.Model):
    """Tracks the lifecycle state of a student's platform access."""
    ACTIVATION_STATES = [
        ('locked', 'Locked'),
        ('pending_payment', 'Pending Payment'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('expired', 'Expired'),
    ]
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activation')
    registration = models.ForeignKey(LearnerRegistration, on_delete=models.SET_NULL, null=True, blank=True)
    subscription_plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=ACTIVATION_STATES, default='locked')
    activated_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.full_name} — {self.status}"


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
