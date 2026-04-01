from django.db import models
from django.conf import settings

class ClassContext(models.Model):
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='classes', null=True, blank=True)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.CASCADE, related_name='classes')
    name = models.CharField(max_length=200) # e.g. "Senior 3 East"
    academic_year = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.academic_year})"

class ClassTeacher(models.Model):
    class_context = models.ForeignKey(ClassContext, on_delete=models.CASCADE, related_name='teachers')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teaching_classes')
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.teacher.full_name} -> {self.class_context.name}"

class ClassEnrollment(models.Model):
    class_context = models.ForeignKey(ClassContext, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='class_enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.full_name} enrolled in {self.class_context.name}"

class ClassSchedule(models.Model):
    class_context = models.ForeignKey(ClassContext, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField() # 0 = Monday, 6 = Sunday
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.class_context.name} Schedule: Day {self.day_of_week}"
