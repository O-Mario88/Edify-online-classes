"""
Platform Intelligence Engine — Unified Models
Covers: Next Best Action, Interventions, Study Planner, Passports,
Competition, Resume-Anywhere, Notifications, Story Cards,
Resource Intelligence, National Exam Tracking, Institution Health.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone


# ─────────────────────────────────────────
# PILLAR 1: NEXT BEST ACTION ENGINE
# ─────────────────────────────────────────

class NextBestAction(models.Model):
    """A role-aware recommended action for any user."""
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('dismissed', 'Dismissed'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]
    CATEGORY_CHOICES = [
        ('academic', 'Academic'),
        ('attendance', 'Attendance'),
        ('assessment', 'Assessment'),
        ('intervention', 'Intervention'),
        ('resource', 'Resource'),
        ('engagement', 'Engagement'),
        ('operational', 'Operational'),
        ('finance', 'Finance'),
        ('communication', 'Communication'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='next_actions')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, null=True, blank=True)

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Explainability
    reason = models.TextField(help_text="Why this action was recommended")
    data_inputs = models.JSONField(default=dict, help_text="What data drove this recommendation")
    confidence_score = models.FloatField(default=0.7, help_text="0.0-1.0 confidence in recommendation")

    # Linking
    action_type = models.CharField(max_length=50, help_text="e.g. revise_topic, follow_up_student, launch_intervention")
    action_url = models.CharField(max_length=500, blank=True, help_text="Frontend route to execute this action")
    action_payload = models.JSONField(default=dict, help_text="Context data for the action")

    # Targeting
    target_role = models.CharField(max_length=30, help_text="student, parent, teacher, institution_admin, platform_admin")

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    dismissed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['user', 'status', '-created_at']),
            models.Index(fields=['target_role', 'status']),
        ]

    def __str__(self):
        return f"[{self.priority}] {self.title} → {self.user}"


# ─────────────────────────────────────────
# PILLAR 2: ONE-CLICK INTERVENTION PACKS
# ─────────────────────────────────────────

class InterventionPack(models.Model):
    """A bundled intervention package that can be launched with one click."""
    STATUS_CHOICES = [
        ('drafted', 'Drafted'),
        ('generated', 'Generated'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('ineffective', 'Ineffective'),
        ('improved', 'Improved Outcomes'),
    ]
    TRIGGER_CHOICES = [
        ('weak_topic', 'Weak Topic Performance'),
        ('low_attendance', 'Low Attendance'),
        ('poor_completion', 'Poor Assignment Completion'),
        ('offline_decline', 'Offline Result Decline'),
        ('exam_risk', 'National Exam Risk'),
        ('manual', 'Teacher Manual Trigger'),
    ]

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_packs')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='drafted')
    trigger_source = models.CharField(max_length=30, choices=TRIGGER_CHOICES)

    # Academic targeting
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True)
    target_class = models.ForeignKey('classes.Class', on_delete=models.SET_NULL, null=True, blank=True)

    # Pack contents
    contents = models.JSONField(default=dict, help_text="Pack contents: notes, videos, quizzes, etc.")
    """
    contents schema:
    {
        "notes": [resource_id, ...],
        "videos": [resource_id, ...],
        "practice_questions": [...],
        "assignments": [assessment_id, ...],
        "discussion_prompt": "string",
        "parent_note": "string",
        "follow_up_dates": ["2026-04-15", ...]
    }
    """

    # Effectiveness
    baseline_score = models.FloatField(null=True, blank=True)
    post_score = models.FloatField(null=True, blank=True)
    improvement_pct = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.status}] {self.title}"


class InterventionPackAssignment(models.Model):
    """Links a pack to specific students."""
    pack = models.ForeignKey(InterventionPack, on_delete=models.CASCADE, related_name='assignments')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='intervention_pack_assignments')
    progress_pct = models.FloatField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('pack', 'student')


# ─────────────────────────────────────────
# PILLAR 3: STUDENT STUDY PLANNER
# ─────────────────────────────────────────

class StudyPlan(models.Model):
    """A weekly study plan for a student."""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_plans')
    week_start = models.DateField()
    week_end = models.DateField()
    generated_at = models.DateTimeField(auto_now_add=True)
    total_estimated_minutes = models.IntegerField(default=0)
    completed_minutes = models.IntegerField(default=0)

    # Inputs that drove the plan
    inputs_snapshot = models.JSONField(default=dict, help_text="Snapshot of data used to generate the plan")

    class Meta:
        unique_together = ('student', 'week_start')
        ordering = ['-week_start']


class StudyTask(models.Model):
    """Individual task within a study plan."""
    TYPE_CHOICES = [
        ('revision', 'Revision'),
        ('assignment', 'Assignment'),
        ('practice', 'Practice'),
        ('video', 'Watch Video'),
        ('reading', 'Reading'),
        ('intervention', 'Intervention Pack'),
        ('live_session', 'Live Session'),
        ('project', 'Project Work'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
        ('rescheduled', 'Rescheduled'),
    ]
    URGENCY_CHOICES = [
        ('urgent', 'Urgent'),
        ('normal', 'Normal'),
        ('optional', 'Optional'),
    ]

    plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=300)
    task_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='normal')

    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True)

    scheduled_date = models.DateField()
    estimated_minutes = models.IntegerField(default=30)
    actual_minutes = models.IntegerField(null=True, blank=True)

    # Link to source entity
    linked_resource = models.ForeignKey('resources.Resource', on_delete=models.SET_NULL, null=True, blank=True)
    linked_assessment = models.ForeignKey('assessments.Assessment', on_delete=models.SET_NULL, null=True, blank=True)

    reason = models.CharField(max_length=300, blank=True, help_text="Why this task was suggested")
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['scheduled_date', '-urgency']


# ─────────────────────────────────────────
# PILLAR 4: PARENT ACTION CENTER
# ─────────────────────────────────────────

class ParentAction(models.Model):
    """An actionable item for a parent about their child."""
    TYPE_CHOICES = [
        ('alert_acknowledge', 'Acknowledge Alert'),
        ('home_follow_up', 'Confirm Home Follow-up'),
        ('view_tasks', 'View Weekly Tasks'),
        ('teacher_contact', 'Request Teacher Contact'),
        ('intervention_response', 'Respond to Intervention'),
        ('attendance_issue', 'View Attendance Issue'),
        ('payment', 'Payment Required'),
        ('celebration', 'Celebrate Achievement'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('acknowledged', 'Acknowledged'),
        ('acted_on', 'Acted On'),
        ('dismissed', 'Dismissed'),
    ]

    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='parent_actions')
    child = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='parent_actions_about_me')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True)

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    action_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    data_payload = models.JSONField(default=dict)
    action_url = models.CharField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']


# ─────────────────────────────────────────
# PILLAR 8 & 9: PASSPORTS
# ─────────────────────────────────────────

class StudentPassport(models.Model):
    """Long-term student growth profile."""
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='passport')

    # Academic
    strongest_subjects = models.JSONField(default=list)
    weakest_subjects = models.JSONField(default=list)
    overall_gpa = models.FloatField(default=0)

    # Engagement
    total_lessons_attended = models.IntegerField(default=0)
    total_resources_completed = models.IntegerField(default=0)
    total_assessments_submitted = models.IntegerField(default=0)
    current_streak_days = models.IntegerField(default=0)
    longest_streak_days = models.IntegerField(default=0)

    # Achievements
    badges = models.JSONField(default=list, help_text="List of badge objects {id, name, earned_at, category}")
    commendations = models.JSONField(default=list)
    leadership_roles = models.JSONField(default=list)

    # Interventions
    interventions_completed = models.IntegerField(default=0)
    peer_support_given = models.IntegerField(default=0)
    peer_support_received = models.IntegerField(default=0)

    # Career
    career_interests = models.JSONField(default=list)
    recommended_paths = models.JSONField(default=list)

    # Growth story timeline
    timeline = models.JSONField(default=list, help_text="Ordered list of milestone events")

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Passport: {self.student}"


class TeacherPassport(models.Model):
    """Long-term teacher growth and impact profile."""
    teacher = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_passport')

    # Teaching stats
    total_lessons_delivered = models.IntegerField(default=0)
    total_classes_taught = models.IntegerField(default=0)
    total_resources_created = models.IntegerField(default=0)
    total_students_impacted = models.IntegerField(default=0)

    # Impact
    average_student_improvement = models.FloatField(default=0, help_text="Avg % improvement in student scores")
    interventions_launched = models.IntegerField(default=0)
    intervention_success_rate = models.FloatField(default=0)

    # Recognition
    badges = models.JSONField(default=list)
    commendations = models.JSONField(default=list)
    challenge_wins = models.IntegerField(default=0)

    # Subject effectiveness
    subject_effectiveness = models.JSONField(default=dict, help_text="{subject_id: {score, trend, students}}")

    # Independent teacher extras
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    marketplace_rating = models.FloatField(default=0)

    # Timeline
    milestones = models.JSONField(default=list)

    updated_at = models.DateTimeField(auto_now=True)


# ─────────────────────────────────────────
# PILLAR 10: SMART COMPETITION ENGINE
# ─────────────────────────────────────────

class PointsLedger(models.Model):
    """Unified points system across all gamification."""
    POINT_SOURCES = [
        ('attendance', 'Attendance'),
        ('assignment', 'Assignment Completion'),
        ('assessment', 'Assessment Score'),
        ('resource', 'Resource Engagement'),
        ('streak', 'Streak Bonus'),
        ('peer_help', 'Peer Support'),
        ('challenge', 'Challenge Win'),
        ('improvement', 'Improvement Bonus'),
        ('leadership', 'Leadership'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='points_ledger')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True)
    points = models.IntegerField()
    source = models.CharField(max_length=30, choices=POINT_SOURCES)
    description = models.CharField(max_length=300)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class Badge(models.Model):
    """Badge definition."""
    CATEGORY_CHOICES = [
        ('academic', 'Academic'),
        ('attendance', 'Attendance'),
        ('leadership', 'Leadership'),
        ('improvement', 'Improvement'),
        ('peer_support', 'Peer Support'),
        ('consistency', 'Consistency'),
        ('effort', 'Effort'),
    ]

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=300)
    icon = models.CharField(max_length=50, help_text="Lucide icon name")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    criteria = models.JSONField(help_text="Conditions to earn this badge")
    points_value = models.IntegerField(default=10)

    class Meta:
        ordering = ['category', 'name']


class UserBadge(models.Model):
    """Badge earned by a user."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='earned_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        unique_together = ('user', 'badge')


class Challenge(models.Model):
    """A time-bound competition."""
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]
    SCOPE_CHOICES = [
        ('class', 'Class'),
        ('subject', 'Subject'),
        ('institution', 'Institution'),
        ('platform', 'Platform'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')

    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    target_class = models.ForeignKey('classes.Class', on_delete=models.SET_NULL, null=True, blank=True)

    metric = models.CharField(max_length=50, help_text="e.g. attendance_rate, assignment_completion, improvement")
    goal_value = models.FloatField(help_text="Target value to achieve")
    reward_points = models.IntegerField(default=50)
    reward_badge = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)

    start_date = models.DateField()
    end_date = models.DateField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-start_date']


class ChallengeParticipant(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    current_value = models.FloatField(default=0)
    is_winner = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('challenge', 'user')


class HouseTeam(models.Model):
    """Institution house/team for house-based competitions."""
    name = models.CharField(max_length=100)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='houses')
    color = models.CharField(max_length=7, default='#3B82F6')
    total_points = models.IntegerField(default=0)

    class Meta:
        unique_together = ('name', 'institution')


class HouseMembership(models.Model):
    house = models.ForeignKey(HouseTeam, on_delete=models.CASCADE, related_name='members')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('house', 'student')


# ─────────────────────────────────────────
# PILLAR 11: RESUME-ANYWHERE
# ─────────────────────────────────────────

class LearningProgress(models.Model):
    """Tracks resume-anywhere state for each user+content combo."""
    CONTENT_TYPES = [
        ('resource', 'Resource'),
        ('lesson', 'Lesson'),
        ('topic', 'Topic'),
        ('assessment', 'Assessment'),
        ('intervention_pack', 'Intervention Pack'),
        ('video', 'Video'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_progress')
    content_type = models.CharField(max_length=30, choices=CONTENT_TYPES)
    content_id = models.IntegerField()

    # Progress state
    progress_pct = models.FloatField(default=0)
    last_position = models.JSONField(default=dict, help_text="e.g. {page: 5}, {timestamp: 120}, {question: 3}")
    is_completed = models.BooleanField(default=False)

    started_at = models.DateTimeField(auto_now_add=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'content_type', 'content_id')
        ordering = ['-last_accessed_at']


# ─────────────────────────────────────────
# PILLAR 14: NATIONAL EXAM TRACKING
# ─────────────────────────────────────────

class NationalExamResult(models.Model):
    """Uploaded national exam results for year-over-year tracking."""
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='national_results')
    exam_type = models.CharField(max_length=20, help_text="UCE, UACE, KCSE, etc.")
    year = models.IntegerField()

    # Aggregate results
    total_candidates = models.IntegerField(default=0)
    division_1 = models.IntegerField(default=0)
    division_2 = models.IntegerField(default=0)
    division_3 = models.IntegerField(default=0)
    division_4 = models.IntegerField(default=0)
    failures = models.IntegerField(default=0)

    # Subject-level breakdown
    subject_results = models.JSONField(default=list, help_text="[{subject, distinctions, credits, passes, failures}]")

    # Metadata
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        unique_together = ('institution', 'exam_type', 'year')
        ordering = ['-year']


# ─────────────────────────────────────────
# PILLAR 15: MULTI-ROLE STORY CARDS
# ─────────────────────────────────────────

class StoryCard(models.Model):
    """Narrative insight cards translated from analytics."""
    AUDIENCE_CHOICES = [
        ('student', 'Student'),
        ('parent', 'Parent'),
        ('teacher', 'Teacher'),
        ('institution_admin', 'Institution Admin'),
        ('platform_admin', 'Platform Admin'),
    ]
    TONE_CHOICES = [
        ('positive', 'Positive'),
        ('warning', 'Warning'),
        ('neutral', 'Neutral'),
        ('celebration', 'Celebration'),
    ]

    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='story_cards')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, null=True, blank=True)

    headline = models.CharField(max_length=300)
    body = models.TextField()
    tone = models.CharField(max_length=20, choices=TONE_CHOICES, default='neutral')

    # Explainability
    data_sources = models.JSONField(default=list, help_text="What data generated this story")
    confidence = models.FloatField(default=0.8)

    # Linking
    action_url = models.CharField(max_length=500, blank=True)
    related_subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']


# ─────────────────────────────────────────
# PILLAR 19: INSTITUTION HEALTH SCORE
# ─────────────────────────────────────────

class InstitutionHealthSnapshot(models.Model):
    """Composite institution health score with explainable breakdown."""
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='health_snapshots')
    date = models.DateField()

    # Composite score (0-100)
    overall_score = models.FloatField()

    # Breakdown components (each 0-100)
    teacher_activity_score = models.FloatField(default=0)
    student_attendance_score = models.FloatField(default=0)
    assignment_completion_score = models.FloatField(default=0)
    resource_engagement_score = models.FloatField(default=0)
    parent_engagement_score = models.FloatField(default=0)
    intervention_completion_score = models.FloatField(default=0)
    offline_result_trend_score = models.FloatField(default=0)
    online_result_trend_score = models.FloatField(default=0)
    adoption_depth_score = models.FloatField(default=0)

    # Risk flags
    risk_level = models.CharField(max_length=20, default='healthy', help_text="healthy, at_risk, critical, dormant")
    risk_factors = models.JSONField(default=list)

    # Trend
    previous_score = models.FloatField(null=True, blank=True)
    score_change = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('institution', 'date')
        ordering = ['-date']


# ─────────────────────────────────────────
# PILLAR 7: OFFLINE VS ONLINE IMPACT
# ─────────────────────────────────────────

class ImpactComparison(models.Model):
    """Comparison of online engagement vs offline exam results."""
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, null=True, blank=True)
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    target_class = models.ForeignKey('classes.Class', on_delete=models.SET_NULL, null=True, blank=True)
    period = models.CharField(max_length=20, help_text="Term 1 2026, etc.")

    # Online metrics
    online_engagement_rate = models.FloatField(default=0)
    online_avg_score = models.FloatField(default=0)
    resource_completion_rate = models.FloatField(default=0)
    session_attendance_rate = models.FloatField(default=0)

    # Offline metrics
    offline_avg_score = models.FloatField(default=0)
    offline_pass_rate = models.FloatField(default=0)

    # Impact analysis
    correlation_coefficient = models.FloatField(null=True, blank=True)
    improvement_attribution = models.FloatField(null=True, blank=True, help_text="Estimated % improvement due to online")
    summary = models.TextField(blank=True)

    computed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-computed_at']


# ─────────────────────────────────────────
# P7 READINESS ENGINE
# ─────────────────────────────────────────

class P7ReadinessProfile(models.Model):
    """Tracks P7 learner readiness for PLE (Primary Leaving Examination)."""
    READINESS_STATES = [
        ('highly_ready', 'Highly Ready'),
        ('on_track', 'On Track'),
        ('needs_support', 'Needs Support'),
        ('high_risk', 'High Risk'),
        ('critical_exam_risk', 'Critical Exam Risk'),
    ]
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='p7_readiness')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='p7_readiness_profiles')
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)

    overall_readiness_score = models.FloatField(default=0, help_text="0-100 composite readiness score")
    readiness_state = models.CharField(max_length=30, choices=READINESS_STATES, default='needs_support')

    # Dimension scores (all 0-100)
    attendance_score = models.FloatField(default=0)
    lesson_completion_score = models.FloatField(default=0)
    assignment_completion_score = models.FloatField(default=0)
    mock_exam_score = models.FloatField(default=0)
    offline_test_score = models.FloatField(default=0)
    resource_engagement_score = models.FloatField(default=0)
    intervention_completion_score = models.FloatField(default=0)
    parent_followup_score = models.FloatField(default=0)
    revision_participation_score = models.FloatField(default=0)

    # Aggregated subject data
    strongest_subject = models.CharField(max_length=200, blank=True)
    weakest_subject = models.CharField(max_length=200, blank=True)
    weak_subject_alerts = models.JSONField(default=list, help_text="List of subject names needing urgent revision")
    weak_topic_alerts = models.JSONField(default=list, help_text="List of topic names needing urgent attention")
    revision_priority_list = models.JSONField(default=list, help_text="Ordered list of subjects/topics to revise")

    last_computed = models.DateTimeField(auto_now=True)

    def compute_readiness(self):
        """Compute overall readiness from dimension scores with weights."""
        weights = {
            'attendance': 0.10,
            'lesson_completion': 0.12,
            'assignment_completion': 0.12,
            'mock_exam': 0.20,
            'offline_test': 0.15,
            'resource_engagement': 0.08,
            'intervention_completion': 0.08,
            'parent_followup': 0.05,
            'revision_participation': 0.10,
        }
        self.overall_readiness_score = (
            self.attendance_score * weights['attendance'] +
            self.lesson_completion_score * weights['lesson_completion'] +
            self.assignment_completion_score * weights['assignment_completion'] +
            self.mock_exam_score * weights['mock_exam'] +
            self.offline_test_score * weights['offline_test'] +
            self.resource_engagement_score * weights['resource_engagement'] +
            self.intervention_completion_score * weights['intervention_completion'] +
            self.parent_followup_score * weights['parent_followup'] +
            self.revision_participation_score * weights['revision_participation']
        )
        if self.overall_readiness_score >= 80:
            self.readiness_state = 'highly_ready'
        elif self.overall_readiness_score >= 65:
            self.readiness_state = 'on_track'
        elif self.overall_readiness_score >= 45:
            self.readiness_state = 'needs_support'
        elif self.overall_readiness_score >= 25:
            self.readiness_state = 'high_risk'
        else:
            self.readiness_state = 'critical_exam_risk'
        self.save()

    def __str__(self):
        return f"P7 Readiness: {self.student.full_name} ({self.overall_readiness_score:.0f}%)"


class SubjectReadinessScore(models.Model):
    """Per-subject readiness tracking for a P7 learner."""
    readiness_profile = models.ForeignKey(P7ReadinessProfile, on_delete=models.CASCADE, related_name='subject_scores')
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE)

    average_score = models.FloatField(default=0)
    mock_score = models.FloatField(default=0)
    offline_score = models.FloatField(default=0)
    completion_pct = models.FloatField(default=0)
    resource_engagement_pct = models.FloatField(default=0)
    intervention_exposure = models.IntegerField(default=0)
    teacher_support_count = models.IntegerField(default=0)
    improvement_trend = models.FloatField(default=0, help_text="Positive = improving, negative = declining")
    is_weak = models.BooleanField(default=False)
    needs_urgent_revision = models.BooleanField(default=False)

    class Meta:
        unique_together = ('readiness_profile', 'subject')

    def __str__(self):
        return f"{self.subject.name}: {self.average_score:.0f}%"


class MockExamRecord(models.Model):
    """Records mock exam results for P7 learners."""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mock_exams')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='mock_exams')
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True)

    exam_title = models.CharField(max_length=255)
    score_pct = models.FloatField(default=0)
    max_marks = models.FloatField(default=100)
    obtained_marks = models.FloatField(default=0)
    exam_date = models.DateField()
    term = models.CharField(max_length=50, blank=True)

    # Comparison data
    class_average = models.FloatField(default=0, help_text="Average score for the class on this mock")
    school_test_comparison = models.FloatField(default=0, help_text="Compared to latest offline school test")
    online_activity_comparison = models.FloatField(default=0, help_text="Compared to online quiz/assignment performance")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-exam_date']

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} Mock: {self.score_pct}%"


class RevisionTask(models.Model):
    """Assigned revision tasks for P7 learners."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='revision_tasks')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE)
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE)
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='assigned_revision_tasks')

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.IntegerField(default=1, help_text="1=highest priority")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    linked_resources = models.JSONField(default=list, help_text="IDs of linked revision resources")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priority', 'due_date']

    def __str__(self):
        return f"{self.title} - {self.student.full_name}"


class P7InterventionPack(models.Model):
    """Exam-focused support packs for P7 learners."""
    PACK_TYPES = [
        ('subject_rescue', 'Subject Rescue Pack'),
        ('weak_topic_revision', 'Weak Topic Revision Pack'),
        ('attendance_recovery', 'Low Attendance Recovery Pack'),
        ('parent_home_revision', 'Parent-Guided Home Revision Pack'),
        ('mock_exam_recovery', 'Mock Exam Recovery Pack'),
        ('exam_confidence', 'Exam Confidence Pack'),
    ]
    title = models.CharField(max_length=255)
    pack_type = models.CharField(max_length=30, choices=PACK_TYPES)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='p7_intervention_packs')
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True)

    contents = models.JSONField(default=dict, help_text="Pack contents: notes, videos, assignments, activities, practice items, parent_action_note, teacher_followup_note")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_pack_type_display()})"


class P7InterventionAssignment(models.Model):
    """Tracks assignment of intervention packs to P7 learners."""
    pack = models.ForeignKey(P7InterventionPack, on_delete=models.CASCADE, related_name='assignments')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='p7_interventions')
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='p7_intervention_assignments')

    started = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    score_before = models.FloatField(default=0)
    score_after = models.FloatField(default=0, help_text="Score after intervention, 0 if not yet measured")
    readiness_improved = models.BooleanField(default=False)

    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.pack.title} → {self.student.full_name}"


class P7RiskFlag(models.Model):
    """Flags learners, subjects, or classes needing urgent attention."""
    RISK_TYPES = [
        ('learner', 'High-Risk Learner'),
        ('subject', 'High-Risk Subject'),
        ('class', 'High-Risk Class'),
    ]
    SEVERITY_CHOICES = [
        ('warning', 'Warning'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='p7_risk_flags')
    risk_type = models.CharField(max_length=20, choices=RISK_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='warning')

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='p7_risk_flags')
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE, null=True, blank=True)
    class_level = models.ForeignKey('curriculum.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)

    signals = models.JSONField(default=list, help_text="List of risk signals contributing to this flag")
    recommended_actions = models.JSONField(default=list)
    is_resolved = models.BooleanField(default=False)

    flagged_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-flagged_at']

    def __str__(self):
        return f"P7 Risk ({self.get_risk_type_display()}): {self.get_severity_display()}"


class ParentP7SupportAction(models.Model):
    """Tracks parent support actions for P7 learners."""
    ACTION_TYPES = [
        ('alert_acknowledged', 'Alert Acknowledged'),
        ('revision_followup', 'Revision Follow-up Confirmed'),
        ('resource_reviewed', 'Resource Reviewed'),
        ('teacher_contact_requested', 'Teacher Contact Requested'),
        ('revision_plan_viewed', 'Revision Plan Viewed'),
        ('intervention_guidance_followed', 'Intervention Guidance Followed'),
        ('home_practice_completed', 'Home Practice Completed'),
    ]
    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='p7_support_actions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='p7_parent_support_received')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE)

    action_type = models.CharField(max_length=40, choices=ACTION_TYPES)
    details = models.TextField(blank=True)
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)

    performed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-performed_at']

    def __str__(self):
        return f"Parent Action: {self.get_action_type_display()} for {self.student.full_name}"


class P7InstitutionSummary(models.Model):
    """Aggregated P7 readiness summary for an institution."""
    institution = models.OneToOneField('institutions.Institution', on_delete=models.CASCADE, related_name='p7_summary')

    total_p7_learners = models.IntegerField(default=0)
    highly_ready_count = models.IntegerField(default=0)
    on_track_count = models.IntegerField(default=0)
    needs_support_count = models.IntegerField(default=0)
    high_risk_count = models.IntegerField(default=0)
    critical_risk_count = models.IntegerField(default=0)

    average_readiness_score = models.FloatField(default=0)
    weakest_subject = models.CharField(max_length=200, blank=True)
    strongest_subject = models.CharField(max_length=200, blank=True)

    mock_exam_adoption_pct = models.FloatField(default=0)
    parent_engagement_pct = models.FloatField(default=0)
    intervention_completion_pct = models.FloatField(default=0)
    revision_engagement_pct = models.FloatField(default=0)

    readiness_trend = models.JSONField(default=list, help_text="Monthly readiness trend data")

    last_computed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"P7 Summary: {self.institution.name} (Avg: {self.average_readiness_score:.0f}%)"
