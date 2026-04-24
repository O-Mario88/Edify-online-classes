from rest_framework import serializers
from .models import LearningPassport, PassportEntry, Credential, IssuedCredential


class PassportEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = PassportEntry
        fields = (
            'id', 'entry_type', 'title', 'description',
            'evidence_url', 'related_object_type', 'related_object_id', 'issued_at',
        )


class CredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credential
        fields = (
            'id', 'slug', 'title', 'description', 'credential_type',
            'level', 'criteria', 'issuer_type', 'is_verifiable',
        )


class IssuedCredentialSerializer(serializers.ModelSerializer):
    credential = CredentialSerializer(read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = IssuedCredential
        fields = (
            'id', 'credential', 'student_name', 'verification_code',
            'issued_at', 'expires_at',
        )

    def get_student_name(self, obj):
        return getattr(obj.student, 'full_name', obj.student.email)


class PassportSerializer(serializers.ModelSerializer):
    entries = PassportEntrySerializer(many=True, read_only=True)
    credentials = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = LearningPassport
        fields = (
            'id', 'student', 'student_name', 'visibility', 'public_share_token',
            'headline', 'bio', 'entries', 'credentials', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'student', 'student_name', 'public_share_token', 'created_at', 'updated_at')

    def get_credentials(self, obj):
        qs = obj.student.issued_credentials.select_related('credential').order_by('-issued_at')
        return IssuedCredentialSerializer(qs, many=True).data

    def get_student_name(self, obj):
        return getattr(obj.student, 'full_name', obj.student.email)


class PublicPassportSerializer(PassportSerializer):
    """Shareable view — redacts email and any parent-only info."""
    class Meta(PassportSerializer.Meta):
        fields = ('id', 'student_name', 'headline', 'bio', 'entries', 'credentials')
