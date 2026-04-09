from django.db import models


class AcademicYear(models.Model):
    """
    Represents a school academic year (e.g. 2024, 2024/2025).
    Used by the Finance ERP for scoping fee templates, invoices,
    and student financial profiles.
    """
    year_label = models.CharField(
        max_length=20,
        unique=True,
        help_text='e.g. "2024" or "2024/2025"'
    )
    start_date = models.DateField(
        null=True, blank=True,
        help_text='First day of the academic year'
    )
    end_date = models.DateField(
        null=True, blank=True,
        help_text='Last day of the academic year'
    )
    is_current = models.BooleanField(
        default=False,
        help_text='Mark the currently active academic year'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year_label']
        verbose_name = 'Academic Year'
        verbose_name_plural = 'Academic Years'

    def __str__(self):
        return self.year_label

    def save(self, *args, **kwargs):
        """Ensure only one year is marked current at a time."""
        if self.is_current:
            AcademicYear.objects.exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)


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
    name = models.CharField(max_length=100) # Lower Secondary, Upper Secondary, Primary
    is_primary = models.BooleanField(default=False, help_text="Flags this level as a primary education tier")

    def __str__(self):
        return f"{self.track.name} - {self.name}"

class ClassLevel(models.Model):
    level = models.ForeignKey(EducationLevel, on_delete=models.CASCADE, related_name='class_levels')
    name = models.CharField(max_length=50) # S1, S2, Form 1, Grade 8, Primary 4
    internal_canonical_grade = models.IntegerField(default=0, help_text="Standardized grade mapping anchor (e.g. 4 for P4/Grade 4, 8 for S1/Grade 8)")

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

class CurriculumVersion(models.Model):
    track = models.ForeignKey(CurriculumTrack, on_delete=models.CASCADE, related_name='versions')
    version_label = models.CharField(max_length=50, help_text="e.g. NCDC 2021 Update")
    is_active = models.BooleanField(default=True)
    release_date = models.DateField()

    def __str__(self):
        return self.version_label

class TopicCompetency(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='competencies')
    curriculum_version = models.ForeignKey(CurriculumVersion, on_delete=models.CASCADE, related_name='competencies')
    description = models.TextField(help_text="National competency or learning objective expected at this topic.")
    code = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. BIO.S1.01")
    
    def __str__(self):
        return f"{self.code}: {self.description[:30]}..."

class ResourceQualityReview(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Officially Approved'),
        ('rejected', 'Rejected'),
    ]
    # In reality, this would link to `marketplace.Listing` or `resources.Resource`. 
    # For loose coupling without circular imports, we store object IDs or generic references,
    # but for Edify we will link directly to a generic target string payload for MVP.
    target_resource_ref = models.CharField(max_length=255, help_text="UUID or reference to the specific teaching asset.")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    compliance_score = models.IntegerField(default=0, help_text="Scale 0-100 NCDC alignment score.")
    reviewer_notes = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review [{self.status}] for {self.target_resource_ref}"

class Term(models.Model):
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='terms')
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.class_level.name} - {self.name}"

class Subtopic(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='subtopics')
    name = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.topic.name} -> {self.name}"

class TemplateLesson(models.Model):
    subtopic = models.ForeignKey(Subtopic, on_delete=models.CASCADE, related_name='template_lessons')
    remote_id = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=255)
    lesson_type = models.CharField(max_length=50) # 'video', 'notes', 'exercise', 'project'
    duration = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return self.title
