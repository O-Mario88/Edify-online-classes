from django.db import models
from django.conf import settings

class AssessmentWindow(models.Model):
    class_reference = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='assessment_windows')
    title = models.CharField(max_length=255)
    open_time = models.DateTimeField()
    close_time = models.DateTimeField()

    def __str__(self):
        return f"{self.title} for {self.class_context.name}"

class Assessment(models.Model):
    ASSESSMENT_TYPES = [
        ('quiz', 'Quiz'),
        ('exam', 'Exam'),
        ('assignment', 'Assignment'),
    ]
    ASSESSMENT_SOURCES = [
        ('platform_quiz', 'Platform Quiz'),
        ('manual_school_test', 'Manual School Test'),
        ('manual_exam', 'Manual Exam'),
        ('practical', 'Practical'),
        ('project', 'Project'),
        ('oral', 'Oral'),
        ('imported_csv', 'Imported CSV'),
    ]
    
    # Optional window since external physical tests don't have online windows
    window = models.ForeignKey(AssessmentWindow, on_delete=models.SET_NULL, null=True, blank=True, related_name='assessments')
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True, related_name='assessments')
    
    type = models.CharField(max_length=50, choices=ASSESSMENT_TYPES)
    source = models.CharField(max_length=50, choices=ASSESSMENT_SOURCES, default='platform_quiz')
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100.0, help_text="Used for weighting external exams")
    
    # Track the term this assessment officially belongs to
    term = models.ForeignKey('scheduling.AcademicTerm', on_delete=models.SET_NULL, null=True, blank=True, related_name='assessments')
    
    # Optional targeting for remedial/enrichment logic
    target_group = models.ForeignKey('AssignmentTargetGroup', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_assessments')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type.title()} ({self.get_source_display()})"

class Question(models.Model):
    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('essay', 'Essay'),
        ('short_answer', 'Short Answer'),
    ]
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    type = models.CharField(max_length=50, choices=QUESTION_TYPES)
    content = models.TextField()
    marks = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    options = models.JSONField(default=list, blank=True, help_text="List of choices for MCQ")
    correct_answer = models.TextField(blank=True, help_text="Correct answer string or index for auto-grading")
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Question {self.order} for {self.assessment}"

class Submission(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)

    answers_data = models.JSONField(default=dict, blank=True, help_text="Store student submitted answers keyed by question ID")
    total_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.student.full_name} - {self.assessment} ({self.status})"

class AssignmentTargetGroup(models.Model):
    """
    Groups students for specific remedial or enrichment interventions.
    """
    title = models.CharField(max_length=255, help_text="e.g. 'Remedial Biology Group A'")
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE)
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='targeted_groups')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_target_groups')
    
    def __str__(self):
        return self.title

class AssignmentRecommendation(models.Model):
    """
    Automated drafts sent to teachers based on the Risk Engine.
    """
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignment_recommendations')
    recommended_topic = models.ForeignKey('curriculum.Topic', on_delete=models.CASCADE)
    suggested_target_group = models.ForeignKey(AssignmentTargetGroup, on_delete=models.SET_NULL, null=True)
    
    reasoning = models.TextField(help_text="e.g. '12 students failed the previous assessment on this topic.'")
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Recommendation for {self.teacher.email} on {self.recommended_topic.title}"
