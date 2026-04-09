from django.db import models
from django.conf import settings

class StudentRiskAlert(models.Model):
    SEVERITY_CHOICES = [
        ('red', 'Red - Critical Risk'),
        ('amber', 'Amber - High Risk'),
        ('yellow', 'Yellow - Warning'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('addressed', 'Intervention Ongoing'),
        ('resolved', 'Resolved'),
    ]
    
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='academic_intervention_alerts')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='institution_alerts')
    
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='yellow')
    flagged_reason = models.TextField(help_text="Automated engine reason e.g., 'Missed 4 daily registers and failed 2 Math assessments'")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.get_severity_display()}: {self.student.email} - {self.status}"


class InterventionPlan(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    alert = models.OneToOneField(StudentRiskAlert, on_delete=models.CASCADE, related_name='intervention_plan')
    assigned_teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='managed_interventions')
    
    target_outcome = models.TextField(help_text="e.g., 'Improve Math score above 50% by Mid-term'")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Plan for {self.alert.student.email} by {self.assigned_teacher.email if self.assigned_teacher else 'Unassigned'}"


class InterventionAction(models.Model):
    ACTION_TYPES = [
        ('remedial_assignment', 'Assigned Remedial Task'),
        ('parent_message', 'Messaged Parent'),
        ('peer_tutoring', 'Assigned Peer Tutor'),
        ('revision_session', 'Scheduled Revision Session'),
        ('refer_class_teacher', 'Referred to Class Teacher'),
        ('teacher_note', 'Internal Teacher Note'),
    ]
    
    plan = models.ForeignKey(InterventionPlan, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    notes = models.TextField(blank=True, null=True)
    
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    performed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_action_type_display()} for Plan #{self.plan.id}"

# ---------------------------------------------------------
# MAPLE INTELLIGENCE: INTERVENTION EFFECTIVENESS
# ---------------------------------------------------------

class InterventionEffectivenessTracker(models.Model):
    """
    Module 15: Measures true ROI of an intervention.
    """
    intervention_plan = models.OneToOneField(InterventionPlan, on_delete=models.CASCADE, related_name='effectiveness_tracker')
    
    baseline_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    post_intervention_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    student_engagement_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, help_text="Did the student actually open the plan resources?")
    parent_followup_logged = models.BooleanField(default=False)
    
    outcome_roi_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    def __str__(self):
        return f"Effectiveness for Plan: {self.intervention_plan.id}"
