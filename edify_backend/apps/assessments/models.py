from django.db import models
from django.conf import settings

class AssessmentWindow(models.Model):
    class_reference = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='assessment_windows')
    title = models.CharField(max_length=255)
    open_time = models.DateTimeField()
    close_time = models.DateTimeField()

    def __str__(self):
        return f"{self.title} for {self.class_context.name}"

class Assessment(models.Model):
    ASSESSMENT_TYPES = [
        ('quiz', 'Quiz'),
        ('exam', 'Exam'),
        ('assignment', 'Assignment'),
    ]
    window = models.ForeignKey(AssessmentWindow, on_delete=models.CASCADE, related_name='assessments')
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True, related_name='assessments')
    type = models.CharField(max_length=50, choices=ASSESSMENT_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.window.title} - {self.type}"

class Question(models.Model):
    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('essay', 'Essay'),
        ('short_answer', 'Short Answer'),
    ]
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    type = models.CharField(max_length=50, choices=QUESTION_TYPES)
    content = models.TextField()
    marks = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Question {self.order} for {self.assessment}"

class Submission(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.full_name} - {self.assessment} ({self.status})"
