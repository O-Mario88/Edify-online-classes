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
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    whatsapp_opt_in = models.BooleanField(default=False)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
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
