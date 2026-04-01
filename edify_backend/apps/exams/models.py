from django.db import models
from django.conf import settings

class ExamCenter(models.Model):
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='exam_centers')
    board_name = models.CharField(max_length=50) # e.g. UNEB, KNEC, REB
    center_number = models.CharField(max_length=50)
    
    def __str__(self):
        return f"{self.board_name} Center: {self.center_number}"

class CandidateRegistration(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exam_registrations')
    exam_center = models.ForeignKey(ExamCenter, on_delete=models.CASCADE, related_name='candidates')
    registration_year = models.CharField(max_length=10)
    
    def __str__(self):
        return f"{self.student.full_name} - {self.registration_year} ({self.exam_center.board_name})"

class SubjectSelection(models.Model):
    registration = models.ForeignKey(CandidateRegistration, on_delete=models.CASCADE, related_name='subjects')
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.subject.name} for {self.registration}"

class BoardSubmissionBatch(models.Model):
    exam_center = models.ForeignKey(ExamCenter, on_delete=models.CASCADE, related_name='submission_batches')
    batch_payload = models.JSONField(help_text="Finalized JSON dump of all candidates matching board spec")
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Batch for {self.exam_center.center_number} at {self.submitted_at}"
