from django.db import models
from django.conf import settings

class Lesson(models.Model):
    ACCESS_MODE_CHOICES = [
        ('draft', 'Draft / Hidden'),
        ('published', 'Published'),
        ('premium', 'Premium Only')
    ]
    parent_class = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='lessons')
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True, related_name='lessons')
    title = models.CharField(max_length=255)
    access_mode = models.CharField(max_length=20, choices=ACCESS_MODE_CHOICES, default='draft')
    scheduled_at = models.DateTimeField()
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.parent_class.title}"

class LessonNote(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='notes')
    content_blocks = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notes for {self.lesson.title}"

class LessonRecording(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='recordings')
    url = models.URLField(max_length=500)
    duration = models.IntegerField(help_text="Duration in seconds", default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recording for {self.lesson.title}"

class LessonAttendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.full_name} - {self.lesson.title} ({self.status})"
