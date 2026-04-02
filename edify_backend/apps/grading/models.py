from django.db import models

class MarkingRubric(models.Model):
    assessment = models.OneToOneField('assessments.Assessment', on_delete=models.CASCADE, related_name='rubric')
    criteria_blob = models.JSONField(help_text="Detailed grading logic and criteria weights")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rubric for {self.assessment}"

class GradeRecord(models.Model):
    submission = models.OneToOneField('assessments.Submission', on_delete=models.CASCADE, related_name='grade')
    score = models.DecimalField(max_digits=5, decimal_places=2)
    teacher_feedback = models.TextField(blank=True, null=True)
    graded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Grade for {self.submission}: {self.score}"

class ReportTemplate(models.Model):
    name = models.CharField(max_length=255, default="NCDC Lower Secondary CBC Template")
    structure_blob = models.JSONField(help_text="Defines display metrics like 20/80 split visuals", default=dict)

    def __str__(self):
        return self.name

class SubjectGrade(models.Model):
    # Aggregates scores for a student in a specific class for a specific term
    student = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='subject_grades')
    assigned_class = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='subject_grades')
    term = models.ForeignKey('scheduling.AcademicTerm', on_delete=models.CASCADE, related_name='subject_grades')
    
    # NCDC Spec: Formative (20%) and Summative (80%)
    formative_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    summative_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    total_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    grade_letter = models.CharField(max_length=5, blank=True, null=True)
    descriptor = models.TextField(blank=True, null=True, help_text="e.g. 'Basic', 'Moderate', 'Outstanding'")
    teacher_remarks = models.TextField(blank=True, null=True)
    
    finalized_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='finalized_grades')
    finalized_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'assigned_class', 'term')

    def __str__(self):
        return f"{self.student.email} - {self.assigned_class.title}: {self.total_score}"

class ReportCard(models.Model):
    # The official Document aggregating all SubjectGrades for a Term
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='report_cards')
    template = models.ForeignKey(ReportTemplate, on_delete=models.SET_NULL, null=True)
    student = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='report_cards')
    term = models.ForeignKey('scheduling.AcademicTerm', on_delete=models.CASCADE, related_name='report_cards')
    
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    overall_grade_letter = models.CharField(max_length=5, blank=True, null=True)
    promotion_status = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. Promoted, Repeating")
    
    class_teacher_remarks = models.TextField(blank=True, null=True)
    headteacher_remarks = models.TextField(blank=True, null=True)
    
    pdf_file = models.FileField(upload_to='report_cards/', blank=True, null=True)
    
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'term')

    def __str__(self):
        return f"Report Card: {self.student.email} ({self.term.name})"
