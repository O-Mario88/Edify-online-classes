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
