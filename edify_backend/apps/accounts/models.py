from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, full_name, country_code, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, country_code=country_code, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, country_code, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, full_name, country_code, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    country_code = models.CharField(max_length=10) # e.g. UG, KE, RW
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Administrator'),
        ('institution', 'Institution'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    # Primary (P4–P7) vs Secondary (S1–S6) — the two parallel platforms.
    # Chosen at registration; used to filter every content surface.
    STAGE_CHOICES = [
        ('primary', 'Primary (P4–P7)'),
        ('secondary', 'Secondary (S1–S6)'),
    ]
    stage = models.CharField(
        max_length=10, choices=STAGE_CHOICES, default='secondary',
        help_text='Which platform this user sees. Set at registration; cannot mix.',
    )

    phone = models.CharField(max_length=20, blank=True, null=True)
    whatsapp_opt_in = models.BooleanField(default=False)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    # Email verification. Existing users get verified=True via data migration
    # so they aren't locked out; new registrations start False and flip True
    # only after the activation link is consumed.
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'country_code']

    def __str__(self):
        return self.email

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    onboarding_status = models.CharField(max_length=50, default='pending')
    default_institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Auto-generated identifiers for lab logins without email
    system_username = models.CharField(max_length=150, blank=True, null=True, unique=True)
    student_id_number = models.CharField(max_length=100, blank=True, null=True, unique=True)
    
    def __str__(self):
        return f"Student: {self.user.full_name}"

class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    verification_status = models.CharField(max_length=50, default='unverified')
    bio = models.TextField(blank=True)
    years_of_experience = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Teacher: {self.user.full_name}"

class ParentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    
    def __str__(self):
        return f"Parent: {self.user.full_name}"

class InstitutionAdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='institution_admin_profile')

    def __str__(self):
        return f"Inst Admin: {self.user.full_name}"


class PilotFeedback(models.Model):
    """A user-submitted bug or comment from the in-app Report-an-issue button.

    Deliberately shallow: no triage workflow, no labels, no status transitions.
    The point is to capture everything a pilot user hits, ordered by time, read
    via Django admin or a shell query. Upgrade once a real process exists.
    """
    SEVERITY_CHOICES = [
        ('bug', 'Bug / broken thing'),
        ('confusing', 'Confusing / unclear'),
        ('idea', 'Feature idea'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='feedback_items',
    )
    # Snapshot of the user's role at submission time — role can change
    # and we want the historical value.
    user_role = models.CharField(max_length=50, blank=True, default='')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='bug')
    message = models.TextField()
    page_url = models.CharField(max_length=500, blank=True, default='')
    user_agent = models.CharField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pilot feedback'
        verbose_name_plural = 'Pilot feedback'

    def __str__(self):
        who = self.user.email if self.user else 'anonymous'
        return f"[{self.severity}] {who} — {self.message[:60]}"
