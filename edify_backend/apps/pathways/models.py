"""Future Pathways — subject-to-career mapping + learner suggestions.

This is guidance, not deterministic labeling. A pathway describes a
family of future possibilities (Health Sciences, Engineering, Arts,
Business, Agriculture Tech, Public Service) and the subjects +
skills that typically lead into it. Suggestions are generated from a
learner's strong/weak subjects and are always phrased as "you may
enjoy", never "you will become".
"""
import uuid
from django.db import models
from django.conf import settings


class CareerPathway(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    tagline = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    # Array of subject names or slugs the pathway favors.
    recommended_subjects = models.JSONField(default=list, blank=True)
    required_skills = models.JSONField(default=list, blank=True, help_text='Soft + hard skills this pathway tends to use.')
    typical_roles = models.JSONField(default=list, blank=True)
    education_levels = models.JSONField(default=list, blank=True, help_text='Typical qualifications — diploma, BSc, etc.')
    related_industries = models.JSONField(default=list, blank=True)

    icon_emoji = models.CharField(max_length=8, blank=True, default='🧭')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class PathwaySuggestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='pathway_suggestions',
    )
    pathway = models.ForeignKey(CareerPathway, on_delete=models.CASCADE, related_name='suggestions')
    confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    reasoning = models.TextField(blank=True, help_text='Parent/student-friendly explanation.')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-confidence', '-created_at']
        unique_together = ('student', 'pathway')
