from django.db import models
from django.conf import settings

class MatchRequest(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('matched', 'Matched'),
        ('closed', 'Closed'),
    ]
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tutoring_requests')
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE)
    weakness_area = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.full_name} needs help in {self.subject.name}"

class PeerPointsLedger(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='peer_points')
    points_earned = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.student.full_name} - {self.points_earned} pts"


class TutorProfile(models.Model):
    """A student who offers peer tutoring — displayed in the 'Find a Tutor' tab."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tutor_profile')
    subjects = models.ManyToManyField('curriculum.Subject', blank=True, related_name='peer_tutors')
    bio = models.TextField(blank=True, default='')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    total_sessions = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tutor: {self.user.full_name} ({self.rating}★)"


class TutoringBounty(models.Model):
    """A help request (bounty) posted by a student or assigned by a teacher."""
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    BOUNTY_TYPE_CHOICES = [
        ('community', 'Community'),
        ('teacher_directed', 'Teacher Directed'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tutoring_bounties_posted')
    subject_name = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    points_reward = models.IntegerField(default=30)
    bounty_type = models.CharField(max_length=30, choices=BOUNTY_TYPE_CHOICES, default='community')

    # Teacher-directed fields
    assigned_teacher_name = models.CharField(max_length=255, blank=True, default='')
    assigned_student_count = models.IntegerField(default=0)

    # Acceptance
    accepted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='tutoring_bounties_accepted')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Tutoring Bounties'

    def __str__(self):
        return f"Bounty: {self.topic} ({self.subject_name}) - {self.status}"

