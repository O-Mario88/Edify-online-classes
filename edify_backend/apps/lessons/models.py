from django.db import models
from django.conf import settings

class Lesson(models.Model):
    ACCESS_MODE_CHOICES = [
        ('draft', 'Draft / Hidden'),
        ('published', 'Published'),
        ('premium', 'Premium Only')
    ]
    parent_class = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='lessons')
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True, related_name='lessons')
    title = models.CharField(max_length=255)
    access_mode = models.CharField(max_length=20, choices=ACCESS_MODE_CHOICES, default='draft')
    scheduled_at = models.DateTimeField()
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.parent_class.title}"

class LessonNote(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='notes')
    content_blocks = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notes for {self.lesson.title}"


class TeacherNote(models.Model):
    """Free-form note a teacher publishes to their students. Different
    from LessonNote — not tied to a specific lesson, used for
    "publish to my class" style quick announcements + tips. Optional
    `class_scope` lets the teacher target one class; null = visible to
    every student that teacher teaches.
    """
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='authored_teacher_notes',
    )
    class_scope = models.ForeignKey(
        'classes.Class', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='teacher_notes',
        help_text='When null the note goes to every student of the teacher.',
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    photo_url = models.URLField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.teacher.email}: {self.title}'

class LessonRecording(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='recordings')
    url = models.URLField(max_length=500)
    duration = models.IntegerField(help_text="Duration in seconds", default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recording for {self.lesson.title}"

class LessonAttendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    duration_minutes = models.IntegerField(default=0, help_text="Number of minutes the student actually attended")
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.full_name} - {self.lesson.title} ({self.status})"

import uuid

class LessonQualificationRecord(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft Structure'),
        ('scheduled', 'Scheduled'),
        ('ready_for_delivery', 'Ready for Delivery'),
        ('delivered', 'Delivered'),
        ('under_payout_review', 'Under Payout Review'),
        ('qualified_for_payout', 'Qualified for Payout'),
        ('rejected_for_payout', 'Rejected for Payout'),
        ('paid_out', 'Paid Out')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='qualification_record')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    rejection_reason = models.TextField(blank=True, null=True)
    calculated_payout = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    payout_batch = models.ForeignKey('marketplace.TeacherPayoutBatch', on_delete=models.SET_NULL, null=True, blank=True, related_name='qualified_lessons')

    def __str__(self):
        return f"Qual {self.lesson.title} -> {self.status}"

class LessonInstance(models.Model):
    timetable_slot = models.ForeignKey('scheduling.TimetableSlot', on_delete=models.CASCADE, related_name='instances')
    date = models.DateField()
    lesson_plan = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True)
    is_cancelled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.timetable_slot} on {self.date}"

class LessonVerificationRecord(models.Model):
    STATE_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('reminder_sent', 'Reminder Sent'),
        ('acknowledged', 'Acknowledged'),
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('unverified', 'Unverified / Missed'),
        ('partially_verified', 'Partially Verified')
    ]
    lesson_instance = models.OneToOneField(LessonInstance, on_delete=models.CASCADE, related_name='verification_record')
    status = models.CharField(max_length=30, choices=STATE_CHOICES, default='scheduled')
    
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Post-lesson compliance task
    linked_assignment = models.ForeignKey('assessments.Assessment', on_delete=models.SET_NULL, null=True, blank=True, help_text="Required to move from started to completed")

    def __str__(self):
        return f"Verify: {self.lesson_instance} -> {self.status}"
