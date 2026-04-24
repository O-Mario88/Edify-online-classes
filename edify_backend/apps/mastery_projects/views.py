"""Mastery Project endpoints."""
from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from institutions.models import InstitutionMembership

from .models import MasteryProject, ProjectSubmission, ProjectSubmissionArtifact, ProjectReview
from .serializers import (
    ProjectCardSerializer, ProjectDetailSerializer,
    SubmissionSerializer, ArtifactSerializer, ReviewSubmitSerializer,
)


def _is_reviewer(user) -> bool:
    role = getattr(user, 'role', '')
    return role in ('teacher', 'independent_teacher', 'institution_teacher',
                    'institution_admin', 'platform_admin')


class MasteryProjectViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return MasteryProject.objects.filter(is_published=True).select_related(
            'subject', 'class_level', 'topic',
        )

    def get_serializer_class(self):
        return ProjectDetailSerializer if self.action == 'retrieve' else ProjectCardSerializer

    @action(detail=True, methods=['post'], url_path='start-submission')
    def start_submission(self, request, slug=None):
        project = get_object_or_404(self.get_queryset(), slug=slug)
        sub, _ = ProjectSubmission.objects.get_or_create(
            project=project, student=request.user,
            status__in=('draft', 'revision_requested'),
            defaults={'status': 'draft'},
        )
        return Response(SubmissionSerializer(sub).data, status=status.HTTP_201_CREATED)


class ProjectSubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmissionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if _is_reviewer(user) and getattr(user, 'role', '') == 'platform_admin':
            return ProjectSubmission.objects.all().select_related('project', 'student').prefetch_related('artifacts', 'reviews')
        if _is_reviewer(user):
            # Teachers/admins see submissions for learners in their institutions.
            inst_ids = InstitutionMembership.objects.filter(
                user=user, status='active',
            ).values_list('institution_id', flat=True)
            return ProjectSubmission.objects.filter(
                student__institution_memberships__institution_id__in=inst_ids,
            ).distinct().select_related('project', 'student').prefetch_related('artifacts', 'reviews')
        return ProjectSubmission.objects.filter(student=user).select_related('project').prefetch_related('artifacts', 'reviews')

    @action(detail=False, methods=['get'], url_path='my')
    def my_submissions(self, request):
        qs = ProjectSubmission.objects.filter(student=request.user).select_related('project').prefetch_related('artifacts', 'reviews')
        return Response(SubmissionSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='review-queue')
    def review_queue(self, request):
        if not _is_reviewer(request.user):
            return Response({'detail': 'Reviewer role required.'}, status=status.HTTP_403_FORBIDDEN)
        qs = self.get_queryset().filter(status__in=('submitted', 'under_review'))
        return Response(SubmissionSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        submission = self.get_object()
        if submission.student_id != request.user.id:
            return Response({'detail': 'Only the author can submit.'}, status=status.HTTP_403_FORBIDDEN)
        if submission.status == 'approved':
            return Response({'detail': 'Already approved.'}, status=status.HTTP_400_BAD_REQUEST)
        submission.status = 'submitted'
        submission.submitted_at = timezone.now()
        if submission.status == 'revision_requested':
            submission.revision_count += 1
        submission.save()
        return Response(SubmissionSerializer(submission).data)

    @action(detail=True, methods=['post'], url_path='artifacts')
    def add_artifact(self, request, pk=None):
        submission = self.get_object()
        if submission.student_id != request.user.id:
            return Response({'detail': 'Only the author can upload artifacts.'}, status=status.HTTP_403_FORBIDDEN)
        s = ArtifactSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        artifact = ProjectSubmissionArtifact.objects.create(submission=submission, **s.validated_data)
        return Response(ArtifactSerializer(artifact).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='review')
    def review(self, request, pk=None):
        submission = self.get_object()
        if not _is_reviewer(request.user):
            return Response({'detail': 'Reviewer role required.'}, status=status.HTTP_403_FORBIDDEN)
        s = ReviewSubmitSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        total = sum(int(v) for v in (d.get('rubric_scores') or {}).values())
        review = ProjectReview.objects.create(
            submission=submission, reviewer=request.user,
            rubric_scores=d.get('rubric_scores') or {},
            score=Decimal(total),
            feedback=d.get('feedback', ''), strengths=d.get('strengths', ''),
            improvements=d.get('improvements', ''), next_steps=d.get('next_steps', ''),
            status=d['status'],
        )
        submission.reviewed_at = timezone.now()
        submission.status = 'approved' if d['status'] == 'passed' else 'revision_requested'
        submission.save()
        submission.refresh_from_db()
        return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='request-revision')
    def request_revision(self, request, pk=None):
        submission = self.get_object()
        if not _is_reviewer(request.user):
            return Response({'detail': 'Reviewer role required.'}, status=status.HTTP_403_FORBIDDEN)
        submission.status = 'revision_requested'
        submission.reviewed_at = timezone.now()
        submission.save()
        return Response(SubmissionSerializer(submission).data)
