from django.db import models
from django.conf import settings
from institutions.models import Institution
from classes.models import Class

class AcademicTerm(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='academic_terms')
    name = models.CharField(max_length=100) # e.g., Term 1 2026
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)

    class Meta:
        unique_together = ('institution', 'name')

    def __str__(self):
        return f"{self.name} ({self.institution.name})"

class Room(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=100) # e.g. "Main Chemistry Lab"
    capacity = models.IntegerField(default=30)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('institution', 'name')

    def __str__(self):
        return f"{self.name} ({self.institution.slug})"

class TimetableSlot(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='timetable_slots')
    term = models.ForeignKey(AcademicTerm, on_delete=models.CASCADE, related_name='timetable_slots')
    
    assigned_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='timetable_slots')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.assigned_class.title} on {self.get_day_of_week_display()} at {self.start_time}"
