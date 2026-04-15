"""
Content Management System — Extended models for the full content upload & delivery architecture.

These models extend the existing Resource model with versioning, audit logging,
moderation, tagging, and visibility rules.
"""
import uuid
import os
from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator
from institutions.models import Institution
from curriculum.models import Subject, ClassLevel, Topic, CurriculumTrack, EducationLevel, Country

def content_upload_path(instance, filename):
    """Generate safe upload path: content/<institution_or_global>/<year>/<uuid>_<filename>"""
    ext = os.path.splitext(filename)[1].lower()
    safe_name = f"{uuid.uuid4().hex[:12]}{ext}"
    scope = 'global'
    if instance.owner_institution_id:
        scope = f"inst_{instance.owner_institution_id}"
    from datetime import date
    year = date.today().year
    return f"content/{scope}/{year}/{safe_name}"


def content_thumbnail_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    safe_name = f"thumb_{uuid.uuid4().hex[:8]}{ext}"
    return f"content/thumbnails/{safe_name}"


class ContentItem(models.Model):
    """
    Central content record. Every uploaded resource is a ContentItem.
    Replaces hardcoded content arrays across the platform.
    """

    # ── Content Type Choices ──
    CONTENT_TYPE_CHOICES = [
        ('notes', 'Notes'),
        ('textbook', 'Textbook'),
        ('pdf', 'PDF Document'),
        ('document', 'Word/Document'),
        ('video', 'Video'),
        ('slides', 'Slide Deck / Presentation'),
        ('worksheet', 'Worksheet'),
        ('assignment', 'Assignment'),
        ('project', 'Project'),
        ('activity', 'Activity'),
        ('revision', 'Revision Resource'),
        ('teacher_guide', 'Teacher Guide'),
        ('lesson_attachment', 'Lesson Attachment'),
        ('topic_resource', 'Topic Resource'),
        ('class_resource', 'Class Resource'),
        ('library_resource', 'Library Resource'),
        ('mock_exam', 'Mock Exam Resource'),
        ('intervention', 'Intervention Resource'),
        ('other', 'Other'),
    ]

    # ── Owner Type ──
    OWNER_TYPE_CHOICES = [
        ('teacher', 'Teacher'),
        ('institution', 'Institution Admin'),
        ('platform_admin', 'Platform Admin'),
    ]

    # ── Publication Status ──
    PUBLICATION_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('under_review', 'Under Review'),
        ('published', 'Published'),
        ('archived', 'Archived'),
        ('rejected', 'Rejected'),
        ('hidden', 'Hidden'),
    ]

    # ── Visibility Scope ──
    VISIBILITY_SCOPE_CHOICES = [
        ('global', 'Global / Platform-wide'),
        ('country', 'Country-wide'),
        ('institution', 'Institution-wide'),
        ('class', 'Class-specific'),
        ('assigned_students', 'Assigned Students Only'),
        ('private', 'Private / Draft'),
    ]

    # ── Identity ──
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, default='')
    content_type = models.CharField(max_length=30, choices=CONTENT_TYPE_CHOICES)

    # ── Ownership ──
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='content_items_uploaded'
    )
    owner_type = models.CharField(max_length=20, choices=OWNER_TYPE_CHOICES, default='teacher')
    owner_institution = models.ForeignKey(
        Institution, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_items'
    )

    # ── Academic Scope ──
    school_level = models.CharField(
        max_length=20, blank=True, default='',
        help_text="primary or secondary"
    )
    country = models.ForeignKey(
        Country, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_items'
    )
    curriculum = models.ForeignKey(
        CurriculumTrack, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_items'
    )
    education_level = models.ForeignKey(
        EducationLevel, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_items'
    )
    class_level = models.ForeignKey(
        ClassLevel, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_items'
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_items'
    )
    topic = models.ForeignKey(
        Topic, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_items'
    )
    lesson = models.ForeignKey(
        'lessons.Lesson', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_items'
    )

    # ── Linkage to other entities ──
    assignment = models.ForeignKey(
        'assessments.Assessment', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_attachments'
    )
    intervention = models.ForeignKey(
        'interventions.InterventionPlan', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_attachments'
    )

    # ── Visibility & Publication ──
    visibility_scope = models.CharField(
        max_length=30, choices=VISIBILITY_SCOPE_CHOICES, default='private'
    )
    publication_status = models.CharField(
        max_length=20, choices=PUBLICATION_STATUS_CHOICES, default='draft'
    )
    moderation_status = models.CharField(
        max_length=20, blank=True, default='',
        help_text="approved, rejected, pending"
    )
    rejection_reason = models.TextField(blank=True, default='')

    # ── File / Media ──
    file = models.FileField(
        upload_to=content_upload_path,
        null=True, blank=True,
        validators=[FileExtensionValidator(
            allowed_extensions=[
                'pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls',
                'mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v',
                'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
                'zip', 'txt', 'csv',
            ]
        )]
    )
    external_url = models.URLField(max_length=1000, blank=True, default='')
    thumbnail = models.ImageField(
        upload_to=content_thumbnail_path,
        null=True, blank=True
    )
    mime_type = models.CharField(max_length=100, blank=True, default='')
    file_size = models.BigIntegerField(null=True, blank=True, help_text="File size in bytes")
    duration_seconds = models.IntegerField(
        null=True, blank=True,
        help_text="Duration for video/audio content in seconds"
    )

    # ── Vimeo Integration ──
    vimeo_video_id = models.CharField(max_length=50, blank=True, default='')
    vimeo_upload_status = models.CharField(max_length=20, blank=True, default='none')

    # ── Metadata ──
    language = models.CharField(max_length=10, blank=True, default='en')
    version = models.PositiveIntegerField(default=1)
    is_featured = models.BooleanField(default=False)

    # ── Timestamps ──
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['publication_status', 'visibility_scope']),
            models.Index(fields=['owner_institution', 'school_level']),
            models.Index(fields=['content_type']),
            models.Index(fields=['subject', 'class_level']),
            models.Index(fields=['uploaded_by']),
        ]

    def __str__(self):
        return f"[{self.content_type}] {self.title}"

    @property
    def file_url(self):
        if self.file:
            return self.file.url
        return self.external_url or ''

    @property
    def is_video(self):
        return self.content_type == 'video' or (
            self.mime_type and self.mime_type.startswith('video/')
        )


class ContentVersion(models.Model):
    """Tracks file replacement history for a ContentItem."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content_item = models.ForeignKey(
        ContentItem, on_delete=models.CASCADE, related_name='versions'
    )
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to='content/versions/', null=True, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True, default='')
    change_note = models.TextField(blank=True, default='')
    replaced_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='content_version_replacements'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ('content_item', 'version_number')

    def __str__(self):
        return f"{self.content_item.title} v{self.version_number}"


class ContentTag(models.Model):
    """Flexible tagging for content discovery and classification."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ContentItemTag(models.Model):
    """Many-to-many through table for content tags."""
    content_item = models.ForeignKey(
        ContentItem, on_delete=models.CASCADE, related_name='item_tags'
    )
    tag = models.ForeignKey(ContentTag, on_delete=models.CASCADE, related_name='tagged_items')

    class Meta:
        unique_together = ('content_item', 'tag')


class ContentVisibilityRule(models.Model):
    """
    Fine-grained visibility rules beyond the basic scope.
    E.g., assign content to specific classes or student groups.
    """
    content_item = models.ForeignKey(
        ContentItem, on_delete=models.CASCADE, related_name='visibility_rules'
    )
    target_class = models.ForeignKey(
        'classes.Class', on_delete=models.CASCADE,
        null=True, blank=True, related_name='visible_content_rules'
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        null=True, blank=True, related_name='assigned_content_rules'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = self.target_class or self.target_user
        return f"Visibility rule for {self.content_item.title} -> {target}"


class ContentAuditLog(models.Model):
    """Immutable audit trail for all content operations."""
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Metadata Updated'),
        ('file_replaced', 'File Replaced'),
        ('published', 'Published'),
        ('archived', 'Archived'),
        ('rejected', 'Rejected'),
        ('deleted', 'Deleted'),
        ('moderated', 'Moderated'),
        ('visibility_changed', 'Visibility Changed'),
        ('restored', 'Restored'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content_item = models.ForeignKey(
        ContentItem, on_delete=models.CASCADE, related_name='audit_logs'
    )
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='content_audit_actions'
    )
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} on {self.content_item.title} by {self.performed_by}"


class ContentEngagement(models.Model):
    """
    Tracks per-student engagement with a content item.
    Single source of truth for progress, time spent, and completion status.
    Feeds into teacher resource effectiveness, parent views, and analytics.
    """
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('started', 'Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='content_engagements'
    )
    content_item = models.ForeignKey(
        ContentItem, on_delete=models.CASCADE, related_name='engagements'
    )
    institution = models.ForeignKey(
        Institution, on_delete=models.SET_NULL,
        null=True, blank=True
    )

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')

    # Engagement metrics
    view_count = models.PositiveIntegerField(default=0)
    active_time_seconds = models.PositiveIntegerField(default=0)
    completion_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.00
    )
    last_position = models.IntegerField(default=0, help_text="Scroll pos or video timestamp (seconds)")
    is_completed = models.BooleanField(default=False)

    first_accessed = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'content_item')
        ordering = ['-last_accessed']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['content_item', 'status']),
        ]

    def __str__(self):
        return f"{self.student} on {self.content_item.title} ({self.completion_percentage}%)"

    @property
    def remaining_percentage(self):
        return max(0, 100 - float(self.completion_percentage))

    def update_status(self):
        """Compute status from engagement evidence. Call after updating metrics."""
        if self.is_completed or float(self.completion_percentage) >= 95:
            self.status = 'completed'
            if not self.completed_at:
                from django.utils import timezone as tz
                self.completed_at = tz.now()
            self.is_completed = True
        elif float(self.completion_percentage) > 0 or self.active_time_seconds > 10:
            self.status = 'in_progress'
        elif self.first_accessed is not None:
            self.status = 'started'
        else:
            self.status = 'not_started'


class ContentAssignment(models.Model):
    """
    A teacher, institution, or platform assigns a content item to one or more students.
    Each row = one student assignment. Bulk assigns create multiple rows.
    """
    ASSIGNED_BY_TYPE_CHOICES = [
        ('teacher', 'Teacher'),
        ('ai', 'AI Engine'),
        ('institution', 'Institution'),
        ('platform', 'Platform'),
    ]
    ASSIGNMENT_TYPE_CHOICES = [
        ('required', 'Required'),
        ('recommended', 'Recommended'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # What
    content_item = models.ForeignKey(
        ContentItem, on_delete=models.CASCADE, related_name='assignments'
    )

    # Who (target)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='content_assignments'
    )

    # Who (source)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_assignments_made'
    )
    assigned_by_type = models.CharField(max_length=20, choices=ASSIGNED_BY_TYPE_CHOICES, default='teacher')

    # Assignment metadata
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPE_CHOICES, default='required')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    note = models.TextField(blank=True, default='', help_text="Reason or instruction for the student")

    # Academic context
    target_class = models.ForeignKey(
        'classes.Class', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_assignments'
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_assignments'
    )
    topic = models.ForeignKey(
        Topic, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_assignments'
    )
    lesson = models.ForeignKey(
        'lessons.Lesson', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_assignments'
    )

    # Deadline
    due_date = models.DateTimeField(null=True, blank=True)

    # Lifecycle
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('content_item', 'student', 'assigned_by_type')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'is_active']),
            models.Index(fields=['assigned_by', 'is_active']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"{self.content_item.title} → {self.student} ({self.assigned_by_type})"


class ContentRecommendation(models.Model):
    """
    AI or system-generated content recommendations for a student.
    Separate from assignments to preserve source attribution.
    """
    SOURCE_CHOICES = [
        ('ai_weak_topic', 'AI - Weak Topic'),
        ('ai_exam_readiness', 'AI - Exam Readiness'),
        ('ai_missed_lesson', 'AI - Missed Lesson'),
        ('ai_low_engagement', 'AI - Low Engagement'),
        ('ai_practice_gap', 'AI - Practice Gap'),
        ('teacher', 'Teacher Recommendation'),
        ('institution', 'Institution Recommendation'),
        ('platform', 'Platform Curated'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('dismissed', 'Dismissed'),
        ('accepted', 'Accepted'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='content_recommendations'
    )
    content_item = models.ForeignKey(
        ContentItem, on_delete=models.CASCADE, related_name='recommendations'
    )

    source = models.CharField(max_length=30, choices=SOURCE_CHOICES)
    reason = models.TextField(blank=True, default='', help_text="Human-readable explanation")
    confidence_score = models.DecimalField(
        max_digits=4, decimal_places=2, default=0.80,
        help_text="AI confidence 0-1"
    )

    # Academic context for grouping
    subject = models.ForeignKey(
        Subject, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_recommendations'
    )
    topic = models.ForeignKey(
        Topic, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='content_recommendations'
    )

    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    dismissed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['source']),
        ]

    def __str__(self):
        return f"[{self.source}] {self.content_item.title} → {self.student}"


class ContentAccessSession(models.Model):
    """
    Individual engagement session record.
    Each time a student opens content, a session is created.
    Heartbeats update active_seconds. Builds cumulative history.
    """
    INTERACTION_TYPE_CHOICES = [
        ('document', 'Document / Notes / PDF'),
        ('video', 'Video'),
        ('interactive', 'Interactive / Exercise'),
        ('slides', 'Slides / Presentation'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='content_access_sessions'
    )
    content_item = models.ForeignKey(
        ContentItem, on_delete=models.CASCADE, related_name='access_sessions'
    )
    engagement = models.ForeignKey(
        ContentEngagement, on_delete=models.CASCADE,
        related_name='sessions', null=True, blank=True
    )

    session_started_at = models.DateTimeField(auto_now_add=True)
    session_ended_at = models.DateTimeField(null=True, blank=True)
    active_seconds = models.PositiveIntegerField(default=0)

    interaction_type = models.CharField(
        max_length=20, choices=INTERACTION_TYPE_CHOICES, default='document'
    )
    client_type = models.CharField(max_length=10, default='web', help_text="web or app")

    # Progress snapshot at session end
    progress_at_start = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    progress_at_end = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    position_at_end = models.IntegerField(default=0)

    class Meta:
        ordering = ['-session_started_at']
        indexes = [
            models.Index(fields=['student', 'content_item']),
        ]

    def __str__(self):
        return f"Session {self.student} on {self.content_item.title} ({self.active_seconds}s)"
