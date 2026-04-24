"""Learning Passport + Micro-Credentials (Phase 4 of Mastery Studio).

A LearningPassport is the student's portfolio of proof of progress:
completed tracks, practice lab results, reviewed projects, teacher
feedback, badges, certificates, exam readiness reports, peer
contributions. Entries are created automatically by the other apps
(via signal handlers or explicit writes from the review flow) and
occasionally manually for imported evidence.

Credentials are the stackable badges + certificates themselves —
definitions live in Credential, issued instances in IssuedCredential.
Each IssuedCredential carries a short verification_code that anyone
can check at /api/v1/passport/credentials/verify/<code>/ without auth.

Public sharing: the passport owner can flip visibility to 'shareable'
and we mint a public_share_token. /passport/public/<token>/ renders
a redacted view suitable for admissions.
"""
import secrets
import uuid
from django.db import models
from django.conf import settings


def _make_share_token() -> str:
    return secrets.token_urlsafe(18)


def _make_verification_code() -> str:
    # Short, human-readable, uppercase, no ambiguous chars.
    alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return '-'.join(
        ''.join(secrets.choice(alphabet) for _ in range(4))
        for _ in range(3)
    )


class LearningPassport(models.Model):
    VISIBILITY_CHOICES = [
        ('private', 'Private'),
        ('parent_only', 'Parent Only'),
        ('shareable', 'Shareable'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='learning_passport',
    )
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private')
    public_share_token = models.CharField(max_length=40, blank=True, unique=True, null=True)

    headline = models.CharField(max_length=200, blank=True, help_text='e.g. "S3 · Maths & Physics track"')
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def enable_public_share(self) -> str:
        if not self.public_share_token:
            self.public_share_token = _make_share_token()
        self.visibility = 'shareable'
        self.save(update_fields=['public_share_token', 'visibility', 'updated_at'])
        return self.public_share_token

    def disable_public_share(self):
        self.visibility = 'private'
        self.public_share_token = None
        self.save(update_fields=['visibility', 'public_share_token', 'updated_at'])


class PassportEntry(models.Model):
    ENTRY_TYPE_CHOICES = [
        ('certificate', 'Certificate'),
        ('badge', 'Badge'),
        ('project', 'Project'),
        ('assessment', 'Assessment'),
        ('teacher_feedback', 'Teacher Feedback'),
        ('exam_report', 'Exam Report'),
        ('peer_contribution', 'Peer Contribution'),
        ('track_completion', 'Track Completion'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    passport = models.ForeignKey(LearningPassport, on_delete=models.CASCADE, related_name='entries')
    entry_type = models.CharField(max_length=30, choices=ENTRY_TYPE_CHOICES)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    evidence_url = models.URLField(blank=True, help_text='In-platform deep link to the evidence.')

    # Loose FK-shaped pointer to the source object. We avoid a real FK
    # because the evidence can come from 5+ apps and GenericForeignKey
    # drags in ContentTypes. Caller sets these when writing the entry.
    related_object_type = models.CharField(max_length=60, blank=True)
    related_object_id = models.CharField(max_length=64, blank=True)

    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-issued_at']


class Credential(models.Model):
    CREDENTIAL_TYPE_CHOICES = [
        ('badge', 'Badge'),
        ('certificate', 'Certificate'),
    ]
    ISSUER_TYPE_CHOICES = [
        ('maple', 'Maple Platform'),
        ('institution', 'Institution'),
        ('teacher', 'Teacher'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)
    credential_type = models.CharField(max_length=20, choices=CREDENTIAL_TYPE_CHOICES, default='badge')

    subject = models.ForeignKey('curriculum.Subject', on_delete=models.SET_NULL, null=True, blank=True)
    level = models.CharField(max_length=40, blank=True, help_text='e.g. P7, S3, Beginner…')
    criteria = models.TextField(blank=True, help_text='Human-readable criteria — what earned this.')

    issuer_type = models.CharField(max_length=20, choices=ISSUER_TYPE_CHOICES, default='maple')
    is_verifiable = models.BooleanField(default=True)
    is_published = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class IssuedCredential(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    credential = models.ForeignKey(Credential, on_delete=models.PROTECT, related_name='issued_instances')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='issued_credentials')
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='issued_credentials_given',
    )

    related_track_id = models.UUIDField(null=True, blank=True)
    related_project_id = models.UUIDField(null=True, blank=True)
    related_assessment_id = models.CharField(max_length=64, blank=True)

    verification_code = models.CharField(max_length=40, unique=True, default=_make_verification_code)
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-issued_at']
        indexes = [
            models.Index(fields=['student', 'issued_at']),
            models.Index(fields=['verification_code']),
        ]

    def is_valid(self) -> bool:
        if not self.expires_at:
            return True
        from django.utils import timezone
        return timezone.now() < self.expires_at
