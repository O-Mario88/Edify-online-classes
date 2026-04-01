from django.db import models
from django.conf import settings

class Institution(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50) # secondary, primary, tertiary, etc.
    country_code = models.CharField(max_length=10)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Campus(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='campuses')
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.institution.name} - {self.name}"

class InstitutionMembership(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.institution.name} ({self.role})"

class Subscription(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='subscriptions')
    plan_type = models.CharField(max_length=100)
    valid_until = models.DateTimeField()
    seat_limit = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.institution.name} - {self.plan_type}"

class SeatAllocation(models.Model):
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='allocations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seat_allocations')
    allocated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} allocated on {self.subscription}"
