from django.db import models
from django.conf import settings
from institutions.models import Institution
from curriculum.models import Subject, ClassLevel, Topic

class Class(models.Model):
    VISIBILITY_CHOICES = [
        ('private', 'Private Internal'),
        ('public', 'Public (Marketplace)'),
    ]
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='classes')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='classes')
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='classes')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='taught_classes')
    
    title = models.CharField(max_length=200) # e.g. "Senior 3 East Biology"
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private')
    is_published = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.institution.name})"

class ClassEnrollment(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('completed', 'Completed')
    ]
    enrolled_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='class_enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('enrolled_class', 'student')

    def __str__(self):
        return f"{self.student.email} enrolled in {self.enrolled_class.title}"


