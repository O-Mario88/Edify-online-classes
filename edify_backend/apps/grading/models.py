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
