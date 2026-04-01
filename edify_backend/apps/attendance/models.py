from django.db import models
from django.conf import settings
from institutions.models import Institution
from classes.models import Class
from lessons.models import Lesson
from scheduling.models import AcademicTerm

class DailyRegister(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('authorized_absent', 'Authorized Absence'),
        ('unauthorized_absent', 'Unauthorized Absence'),
        ('late', 'Late Arrival')
    ]
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='daily_registers')
    term = models.ForeignKey(AcademicTerm, on_delete=models.CASCADE, related_name='daily_registers')
    
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_attendances')
    record_date = models.DateField()
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='recorded_registers')
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'record_date')

    def __str__(self):
        return f"{self.student.email} on {self.record_date} ({self.status})"

class LessonAttendance(models.Model):
    # This tracks individual period-by-period truancy where a student was registered Present but skipped Chemistry.
    STATUS_CHOICES = [
        ('present', 'Present in Class'),
        ('absent', 'Absent from Class'),
        ('excused', 'Excused (Library, Clinic)')
    ]
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='lesson_attendances')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='focused_lesson_attendances')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    marked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='marked_lesson_registers')
    
    flagged_for_review = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('lesson', 'student')

    def __str__(self):
        return f"{self.student.email} for {self.lesson.title} ({self.status})"
