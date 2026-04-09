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

    @classmethod
    def emit(cls, event_name, user=None, institution=None, subject=None, metadata=None, **kwargs):
        """
        Convenience factory for fire-and-forget event logging.
        Usage: AnalyticsEvent.emit('lesson_completed', user=request.user, subject=lesson.topic.subject)
        """
        return cls.objects.create(
            event_name=event_name,
            user=user,
            institution=institution,
            subject=subject,
            metadata=metadata or {},
            **kwargs
        )


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

class TeacherPerformanceSnapshot(models.Model):
    """
    Institution layer analytics: evaluates teacher performance in context.
    """
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_performance_snapshots')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    
    # Context (Fairness markers)
    baseline_difficulty_score = models.DecimalField(max_digits=5, decimal_places=2, default=50.00, help_text="Average historic score of this cohort")
    
    # Analytics
    class_average_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    live_sessions_delivered = models.IntegerField(default=0)
    assignments_published = models.IntegerField(default=0)
    interventions_resolved = models.IntegerField(default=0)
    
    last_computed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.teacher.email} Performance - {self.class_average_score}%"

class TeacherAttendanceSnapshot(models.Model):
    """
    Aggregates online and offline dual-attendance for educators.
    """
    date = models.DateField(db_index=True)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    
    was_present_offline = models.BooleanField(default=True, help_text="Manual headteacher log")
    online_sessions_completed = models.IntegerField(default=0)
    late_starts = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('date', 'teacher')

    def __str__(self):
        return f"{self.teacher.email} Attendance on {self.date}"

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

# ---------------------------------------------------------
# MAPLE INTELLIGENCE SYSTEM (MODULES 1-17)
# ---------------------------------------------------------

class PlatformGrowthFunnel(models.Model):
    """
    Module 16 & 1: Tracks platform usage funnels to locate bottlenecks and monitor health.
    """
    date = models.DateField(unique=True, db_index=True)
    institutions_onboarded = models.IntegerField(default=0)
    institutions_activated = models.IntegerField(default=0)
    institutions_dormant = models.IntegerField(default=0)
    institutions_at_risk = models.IntegerField(default=0)
    
    teachers_onboarded = models.IntegerField(default=0)
    teachers_activated = models.IntegerField(default=0)
    
    students_onboarded = models.IntegerField(default=0)
    students_activated = models.IntegerField(default=0)
    
    parents_linked = models.IntegerField(default=0)
    parents_active = models.IntegerField(default=0)
    
    independent_signups = models.IntegerField(default=0)
    independent_active = models.IntegerField(default=0)

    def __str__(self):
        return f"Funnel Metrics for {self.date}"

class EcosystemComparisonSnapshot(models.Model):
    """
    Module 2: Side-by-side metrics of Institution vs Independent activity
    """
    date = models.DateField(unique=True, db_index=True)
    
    inst_teacher_activity_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    indep_teacher_activity_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    inst_student_engagement_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    indep_student_engagement_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    inst_resource_access_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    indep_resource_access_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    def __str__(self):
        return f"Ecosystem Comparison for {self.date}"

class InstitutionHealthScore(models.Model):
    """
    Module 3 & 9: Computes a standardized 0-100 score and risk flag array.
    """
    institution = models.OneToOneField(Institution, on_delete=models.CASCADE, related_name='health_score')
    
    # 0-100 Indices
    student_attendance_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    teacher_activity_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    assignment_completion_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    resource_engagement_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    parent_engagement_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    online_offline_translation_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    composite_health_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    STATE_CHOICES = [
        ('highly_active', 'Highly Active'),
        ('active', 'Active'),
        ('moderate', 'Moderate Activity'),
        ('low', 'Low Activity'),
        ('dormant', 'Dormant'),
        ('churn_risk', 'Churn Risk'),
    ]
    status = models.CharField(max_length=50, choices=STATE_CHOICES, default='moderate')
    
    last_computed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.institution.name} Health: {self.composite_health_score} ({self.status})"

class ClassActivitySnapshot(models.Model):
    """
    Module 6: Identifies top/bottom engaged actual class groups.
    """
    class_reference = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='activity_snapshots')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    date = models.DateField(db_index=True)
    
    attendance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    assignment_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    resource_open_count = models.IntegerField(default=0)
    live_sessions_attended = models.IntegerField(default=0)
    
    overall_engagement_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    class Meta:
        unique_together = ('class_reference', 'date')

class ResourceEffectivenessSnapshot(models.Model):
    """
    Module 7: Measures exact impact a shared resource has.
    """
    resource_id = models.CharField(max_length=255, db_index=True) # ID of video/doc
    resource_type = models.CharField(max_length=50) # 'library', 'class_posted', 'intervention'
    
    total_opens = models.IntegerField(default=0)
    average_read_time_seconds = models.IntegerField(default=0)
    completion_rate_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    correlation_outcome_lift = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, help_text="Estimated % score lift after usage")
    
    def __str__(self):
        return f"Resource {self.resource_id} Effectiveness"

class EnhancedTeacherEffectivenessIndex(models.Model):
    """
    Module 12: Broad Teacher Intelligence tracking outcome improvements.
    """
    teacher = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='effectiveness_index')
    is_independent = models.BooleanField(default=False)
    
    student_improvement_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    intervention_success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    class_attendance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    student_support_responsiveness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    composite_effectiveness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    def __str__(self):
        return f"{self.teacher.email} Effectiveness: {self.composite_effectiveness_score}"

class ParentEngagementIndex(models.Model):
    """
    Module 13: Activity index for tracking parent behavior against student results.
    """
    parent = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='engagement_index')
    
    dashboard_logins_last_30d = models.IntegerField(default=0)
    alert_view_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    intervention_response_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    associated_student_performance_lift = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

class SubjectDifficultySnapshot(models.Model):
    """
    Module 14: Maps dropping metrics per-subject across instances.
    """
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True)
    
    average_mastery_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    dropout_avoidance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    intervention_frequency = models.IntegerField(default=0)
    
    is_critical_difficulty = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('subject', 'institution')

class InsightStoryCard(models.Model):
    """
    Module 17: Auto-generated intelligence reports.
    """
    SCOPES = [
        ('maple_admin', 'Maple Admin'),
        ('institution', 'Institution'),
        ('teacher', 'Teacher'),
    ]
    scope = models.CharField(max_length=50, choices=SCOPES)
    institution = models.ForeignKey(Institution, null=True, blank=True, on_delete=models.CASCADE)
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    
    impact_level = models.CharField(max_length=20, choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')])
    category = models.CharField(max_length=50) # 'dormancy', 'outcome', 'resource'
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"[{self.scope}] {self.title}"

