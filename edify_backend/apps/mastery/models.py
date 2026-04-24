"""Maple Mastery Studio — Phase 1: Tracks foundation.

Phase 1 only. Later phases add PracticeLab (Phase 2), MasteryProject +
MentorReview (Phase 3), LearningPassport + Credentials (Phase 4), and
ExamSimulation (Phase 5). The MasteryTrackItem.item_type enum already
lists those values so a track can reference them as placeholders today
and we wire real FKs in later phases without touching Phase 1 data.

Design notes:
- We reuse existing models everywhere possible: a TrackItem points to
  an existing ContentItem, Assessment, or LiveSession rather than
  duplicating content.
- MasteryEnrollment.completed_item_ids is a JSON list of TrackItem IDs
  the learner has marked done. Progress is derived, not stored
  separately, so there's only one source of truth.
"""
import uuid
from django.db import models
from django.conf import settings


class MasteryTrack(models.Model):
    TARGET_ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
    ]
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    EXAM_TRACK_CHOICES = [
        ('', 'None'),
        ('PLE', 'PLE'),
        ('UCE', 'UCE'),
        ('UACE', 'UACE'),
        ('KCSE', 'KCSE'),
        ('general', 'General'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    description = models.TextField(blank=True)
    tagline = models.CharField(max_length=255, blank=True, help_text='One-line benefit statement shown on cards.')

    target_role = models.CharField(max_length=20, choices=TARGET_ROLE_CHOICES, default='student')
    country = models.ForeignKey('curriculum.Country', on_delete=models.SET_NULL, null=True, blank=True)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    exam_track = models.CharField(max_length=20, choices=EXAM_TRACK_CHOICES, blank=True, default='')

    estimated_duration_weeks = models.PositiveIntegerField(default=4)
    estimated_hours_per_week = models.PositiveIntegerField(default=3)

    is_published = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    cover_image = models.URLField(blank=True, help_text='Optional cover image URL.')
    outcome_statement = models.TextField(blank=True, help_text="What the learner will be able to do after finishing.")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='created_mastery_tracks',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', 'title']
        indexes = [
            models.Index(fields=['is_published', 'target_role']),
            models.Index(fields=['subject', 'class_level']),
        ]

    def __str__(self):
        return self.title

    @property
    def total_items(self) -> int:
        return MasteryTrackItem.objects.filter(module__track=self).count()

    @property
    def total_required_items(self) -> int:
        return MasteryTrackItem.objects.filter(
            module__track=self, required_for_completion=True,
        ).count()


class MasteryTrackModule(models.Model):
    """Grouping of items inside a track — like a unit or chapter."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    track = models.ForeignKey(MasteryTrack, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']
        unique_together = ('track', 'order')

    def __str__(self):
        return f'{self.track.title} — {self.title}'


class MasteryTrackItem(models.Model):
    """A single learnable unit inside a module.

    Points to an existing ContentItem / Assessment / LiveSession where
    possible so we don't duplicate content. practice_lab and project
    types are allowed in Phase 1 but FK targets land in Phase 2/3;
    until then their placeholder_title describes what the item is.
    """
    ITEM_TYPE_CHOICES = [
        ('content', 'Content / Lesson'),
        ('assessment', 'Assessment / Quiz'),
        ('practice_lab', 'Guided Practice Lab'),
        ('project', 'Mastery Project'),
        ('live_session', 'Live Session'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    module = models.ForeignKey(MasteryTrackModule, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)

    # Polymorphic references — one of these is set depending on item_type.
    content_item = models.ForeignKey(
        'resources.ContentItem', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mastery_track_items',
    )
    assessment = models.ForeignKey(
        'assessments.Assessment', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mastery_track_items',
    )
    live_session = models.ForeignKey(
        'live_sessions.LiveSession', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mastery_track_items',
    )
    practice_lab = models.ForeignKey(
        'practice_labs.PracticeLab', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mastery_track_items',
    )
    # Phase 3 will add the project FK. Until then we accept a placeholder
    # title so a track can be authored end-to-end.
    placeholder_title = models.CharField(
        max_length=255, blank=True,
        help_text='Used for practice_lab/project items until their models land.',
    )
    placeholder_description = models.TextField(blank=True)

    order = models.PositiveIntegerField(default=1)
    required_for_completion = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.module.title} → {self.get_item_type_display()} ({self.order})'

    def display_title(self) -> str:
        if self.content_item_id:
            return self.content_item.title
        if self.assessment_id:
            return self.assessment.title
        if self.live_session_id:
            return getattr(self.live_session, 'title', f'Live session #{self.live_session_id}')
        if self.practice_lab_id:
            return self.practice_lab.title
        return self.placeholder_title or self.get_item_type_display()


class MasteryEnrollment(models.Model):
    """A student's enrollment in a track. One per (student, track)."""
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    learner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='mastery_enrollments',
    )
    track = models.ForeignKey(MasteryTrack, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # UUID strings of items the learner has marked complete.
    completed_item_ids = models.JSONField(default=list, blank=True)

    started_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('learner', 'track')
        ordering = ['-last_activity_at']

    def __str__(self):
        return f'{self.learner_id} on "{self.track.title}" ({self.status})'

    def progress_percentage(self) -> float:
        required = list(MasteryTrackItem.objects.filter(
            module__track=self.track, required_for_completion=True,
        ).values_list('id', flat=True))
        if not required:
            return 0.0
        completed = {str(i) for i in self.completed_item_ids}
        done = sum(1 for i in required if str(i) in completed)
        return round((done / len(required)) * 100, 1)
