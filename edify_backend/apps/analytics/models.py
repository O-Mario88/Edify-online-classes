from django.db import models
from django.conf import settings

class SubjectPerformanceAggregate(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='performance_aggregates')
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE)
    average_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    last_computed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.full_name} in {self.subject.name}: {self.average_score}"
