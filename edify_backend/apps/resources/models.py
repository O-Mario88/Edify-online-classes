from django.db import models
from django.conf import settings

class Resource(models.Model):
    RESOURCE_TYPES = [
        ('pdf', 'PDF Document'),
        ('video', 'Video'),
        ('link', 'External Link'),
        ('audio', 'Audio'),
    ]
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.CASCADE, related_name='resources')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='authored_resources')
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=RESOURCE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class ResourceVersion(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='versions')
    file_url = models.URLField(max_length=500)
    version_number = models.IntegerField(default=1)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.resource.title} - v{self.version_number}"

class ResourceDownload(models.Model):
    resource_version = models.ForeignKey(ResourceVersion, on_delete=models.CASCADE, related_name='downloads')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='resource_downloads')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.email} downloaded {self.resource_version.resource.title}"
