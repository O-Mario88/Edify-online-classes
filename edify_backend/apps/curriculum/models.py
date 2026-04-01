from django.db import models

class Country(models.Model):
    code = models.CharField(max_length=10, unique=True) # UG, KE, RW
    name = models.CharField(max_length=100)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class CurriculumTrack(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='tracks')
    name = models.CharField(max_length=100) # O-Level, A-Level, 8-4-4, CBC

    def __str__(self):
        return f"{self.country.code} - {self.name}"

class EducationLevel(models.Model):
    track = models.ForeignKey(CurriculumTrack, on_delete=models.CASCADE, related_name='education_levels')
    name = models.CharField(max_length=100) # Lower Secondary, Upper Secondary

    def __str__(self):
        return f"{self.track.name} - {self.name}"

class ClassLevel(models.Model):
    level = models.ForeignKey(EducationLevel, on_delete=models.CASCADE, related_name='class_levels')
    name = models.CharField(max_length=50) # S1, S2, Form 1, Grade 8

    def __str__(self):
        return f"{self.level.name} - {self.name}"

class Subject(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name

class SubjectCombination(models.Model):
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='subject_combinations')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='combinations')
    is_core = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.subject.name} for {self.class_level.name}"

class Topic(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=255)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.subject.name} - {self.name}"

class SubjectSelectionRule(models.Model):
    track = models.ForeignKey(CurriculumTrack, on_delete=models.CASCADE, related_name='selection_rules')
    rule_payload = models.JSONField(help_text="Country specific selection rules mapping core/elective constraints")

    def __str__(self):
        return f"Rules for {self.track.name}"
