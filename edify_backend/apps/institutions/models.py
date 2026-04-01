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

    def __str__(self):
        return self.name

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
