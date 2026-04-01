from django.db import models
from django.conf import settings
from institutions.models import Institution
from curriculum.models import Subject, ClassLevel, Topic
from classes.models import Class

class Resource(models.Model):
    OWNER_TYPE_CHOICES = [
        ('platform', 'Platform Global'),
        ('institution', 'Institution Scope'),
        ('teacher', 'Teacher Personal')
    ]
    VISIBILITY_CHOICES = [
        ('private', 'Private Internal'),
        ('institution_only', 'Institution Only'),
        ('platform_shared', 'Platform Shared (OER)'),
        ('marketplace_public', 'Marketplace Public')
    ]
    
    owner_type = models.CharField(max_length=20, choices=OWNER_TYPE_CHOICES, default='teacher')
    owner_institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_resources')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_resources')
    
    title = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='resources/', null=True, blank=True)
    external_url = models.URLField(max_length=500, null=True, blank=True)
    
    visibility = models.CharField(max_length=30, choices=VISIBILITY_CHOICES, default='private')
    
    # Optional Academic Binding
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    class_level = models.ForeignKey(ClassLevel, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.visibility}] {self.title}"

class SharedResourceLink(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='class_links')
    target_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='resource_links')
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shared_resource_links')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('resource', 'target_class')

    def __str__(self):
        return f"{self.resource.title} attached to {self.target_class.title}"
