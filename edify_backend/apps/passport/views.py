from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import LearningPassport, PassportEntry, Credential, IssuedCredential
from .serializers import (
    PassportSerializer, PublicPassportSerializer,
    PassportEntrySerializer, CredentialSerializer, IssuedCredentialSerializer,
)


class LearningPassportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='my')
    def my_passport(self, request):
        passport, _ = LearningPassport.objects.get_or_create(student=request.user)
        return Response(PassportSerializer(passport).data)

    @action(detail=False, methods=['patch'], url_path='update')
    def update_passport(self, request):
        passport, _ = LearningPassport.objects.get_or_create(student=request.user)
        headline = request.data.get('headline')
        bio = request.data.get('bio')
        visibility = request.data.get('visibility')
        if headline is not None:
            passport.headline = headline
        if bio is not None:
            passport.bio = bio
        if visibility in ('private', 'parent_only', 'shareable'):
            if visibility == 'shareable':
                passport.enable_public_share()
            else:
                passport.visibility = visibility
                if visibility == 'private':
                    passport.public_share_token = None
        passport.save()
        return Response(PassportSerializer(passport).data)

    @action(detail=False, methods=['post'], url_path='share')
    def share(self, request):
        passport, _ = LearningPassport.objects.get_or_create(student=request.user)
        token = passport.enable_public_share()
        return Response({'public_share_token': token})

    @action(detail=False, methods=['post'], url_path='stop-sharing')
    def stop_sharing(self, request):
        passport, _ = LearningPassport.objects.get_or_create(student=request.user)
        passport.disable_public_share()
        return Response({'status': 'stopped'})

    @action(detail=False, methods=['post'], url_path='entries')
    def add_entry(self, request):
        passport, _ = LearningPassport.objects.get_or_create(student=request.user)
        s = PassportEntrySerializer(data=request.data)
        s.is_valid(raise_exception=True)
        entry = PassportEntry.objects.create(passport=passport, **s.validated_data)
        return Response(PassportEntrySerializer(entry).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_passport(request, token):
    """Anonymous read of a shared passport. Returns 404 if token unknown."""
    try:
        passport = LearningPassport.objects.select_related('student').get(
            public_share_token=token, visibility='shareable',
        )
    except LearningPassport.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(PublicPassportSerializer(passport).data)


class CredentialViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CredentialSerializer
    queryset = Credential.objects.filter(is_published=True)

    @action(detail=False, methods=['get'], url_path='my')
    def my_credentials(self, request):
        qs = IssuedCredential.objects.filter(student=request.user).select_related('credential')
        return Response(IssuedCredentialSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def issue_credential(request):
    """Teachers / admins issue a credential to a student.

    Expected body:
      - credential_slug
      - student_id
      - related_track_id / related_project_id (optional)
    """
    if getattr(request.user, 'role', '') not in (
        'teacher', 'independent_teacher', 'institution_teacher',
        'institution_admin', 'platform_admin',
    ):
        return Response({'detail': 'Reviewer role required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        cred = Credential.objects.get(slug=request.data.get('credential_slug'), is_published=True)
    except Credential.DoesNotExist:
        return Response({'detail': 'Credential not found.'}, status=status.HTTP_404_NOT_FOUND)

    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        student = User.objects.get(id=request.data.get('student_id'))
    except User.DoesNotExist:
        return Response({'detail': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

    issued = IssuedCredential.objects.create(
        credential=cred,
        student=student,
        issued_by=request.user,
        related_track_id=request.data.get('related_track_id'),
        related_project_id=request.data.get('related_project_id'),
        related_assessment_id=request.data.get('related_assessment_id', ''),
    )

    # Auto-write a passport entry.
    passport, _ = LearningPassport.objects.get_or_create(student=student)
    PassportEntry.objects.create(
        passport=passport,
        entry_type='badge' if cred.credential_type == 'badge' else 'certificate',
        title=cred.title,
        description=cred.description,
        evidence_url=f'/passport/credentials/verify/{issued.verification_code}',
        related_object_type='issued_credential',
        related_object_id=str(issued.id),
    )

    return Response(IssuedCredentialSerializer(issued).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_credential(request, code):
    """Public credential verification — no auth required."""
    try:
        issued = IssuedCredential.objects.select_related('credential', 'student').get(
            verification_code=code,
        )
    except IssuedCredential.DoesNotExist:
        return Response({'verified': False, 'detail': 'Unknown code.'}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        'verified': issued.is_valid(),
        'credential_title': issued.credential.title,
        'credential_type': issued.credential.credential_type,
        'student_name': getattr(issued.student, 'full_name', ''),
        'issued_at': issued.issued_at,
        'expires_at': issued.expires_at,
        'issuer_type': issued.credential.issuer_type,
    })
