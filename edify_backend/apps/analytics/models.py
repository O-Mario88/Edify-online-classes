from django.db import models
from django.conf import settings
from institutions.models import Institution
from curriculum.models import Subject

# ---------------------------------------------------------
# TRANSACTIONAL APPEND-ONLY TABLE
# ---------------------------------------------------------

class AnalyticsEvent(models.Model):
    """
    Append-only log of every notable behavior on the platform.
    Used for raw queries and compiling aggregate snapshots via background jobs.
    """
    # Standard metadata
    id = models.BigAutoField(primary_key=True)
    occurred_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # E.g. "user_signed_up", "lesson_opened", "quiz_submitted", "payment_completed"
    event_name = models.CharField(max_length=100, db_index=True)
    
    # Actors
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='analytics_events')
    institution = models.ForeignKey(Institution, null=True, blank=True, on_delete=models.SET_NULL)
    country_code = models.CharField(max_length=10, blank=True)
    
    # Deep Links (For granular drill-downs)
    subject = models.ForeignKey(Subject, null=True, blank=True, on_delete=models.SET_NULL)
    class_level_id = models.CharField(max_length=100, blank=True)  # flexible IDs to avoid rigid dependencies
    topic_id = models.CharField(max_length=100, blank=True)
    
    # Generic linking for any object (quiz, document, session)
    object_type = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=100, blank=True)
    
    # Payload
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-occurred_at']
        indexes = [
            models.Index(fields=['event_name', 'occurred_at']),
            models.Index(fields=['institution', 'occurred_at']),
        ]

    def __str__(self):
        return f"{self.event_name} at {self.occurred_at}"


# ---------------------------------------------------------
# ROLLUP & AGGREGATE TABLES (Populated via Celery jobs)
# ---------------------------------------------------------

class DailyPlatformMetric(models.Model):
    """
    Super-Admin Level Dashboard aggregates.
    Computed nightly based on AnalyticsEvent and User state.
    """
    date = models.DateField(unique=True, db_index=True)
    
    # Growth
    total_active_users = models.IntegerField(default=0)
    dau = models.IntegerField(default=0, help_text="Daily Active Users")
    active_institutions = models.IntegerField(default=0)
    paying_institutions = models.IntegerField(default=0)
    
    # Activity
    live_classes_held = models.IntegerField(default=0)
    lessons_completed = models.IntegerField(default=0)
    assessments_submitted = models.IntegerField(default=0)
    
    # Commercial
    mrr = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    marketplace_gmv = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    payout_liabilities = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # National Exams (Specific to Edify)
    exam_registrations_pending = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Platform Metrics for {self.date}"


class DailyInstitutionMetric(models.Model):
    """
    Institution Headteacher Level aggregates.
    Computed nightly per institution.
    """
    date = models.DateField(db_index=True)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    
    # Enrollment & Ops
    total_students = models.IntegerField(default=0)
    total_teachers = models.IntegerField(default=0)
    student_teacher_ratio = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    # Academic Tracking
    average_attendance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    lessons_published_count = models.IntegerField(default=0)
    
    # Commercial / Admin
    fee_collection_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    outstanding_invoices_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('date', 'institution')

    def __str__(self):
        return f"{self.institution.name} metrics for {self.date}"


class SubjectPerformanceSnapshot(models.Model):
    """
    Learning & Teacher Analytics Level.
    Tracks mastery and readiness scores for specific entities over time or as a rolling state.
    """
    # E.g., S3 Mathematics
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='performance_snapshots')
    institution = models.ForeignKey(Institution, null=True, blank=True, on_delete=models.SET_NULL)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    
    # Derived from assessments and watch times via Celery
    average_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    exam_readiness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Predicts passing threshold
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Flags for UI Interventions
    is_at_risk = models.BooleanField(default=False)
    
    last_computed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'subject')

    def __str__(self):
        return f"{self.student.email} mastery in {self.subject.name}: {self.average_score}%"

class SystemHealthSnapshot(models.Model):
    """
    Operations & DevOps Dashboard Level.
    Logged by the scheduler to create trend lines of system errors.
    """
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    celery_queue_depth = models.IntegerField(default=0)
    failed_background_jobs = models.IntegerField(default=0)
    offline_sync_backlog = models.IntegerField(default=0)
    average_db_latency_ms = models.IntegerField(default=0)
    
    def __str__(self):
        return f"System Health at {self.timestamp}"
