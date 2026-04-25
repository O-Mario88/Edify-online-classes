from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import AssessmentWindow, Assessment, Question, Submission
from .serializers import (
    AssessmentWindowSerializer, AssessmentSerializer,
    AssessmentAdminSerializer, QuestionSerializer, SubmissionSerializer
)
from notifications.utils import notify

from django.db.models import Q
from institutions.models import InstitutionMembership

class TenantFilterMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_superuser:
            return qs
        user_institutions = InstitutionMembership.objects.filter(
            user=self.request.user, status='active'
        ).values_list('institution_id', flat=True)
        if not user_institutions:
            return qs.none()
        
        # Determine the related field path to institution_id based on the model
        model_name = self.queryset.model.__name__
        if model_name == 'AssessmentWindow':
            return qs.filter(class_reference__institution_id__in=user_institutions)
        elif model_name == 'Assessment':
            return qs.filter(
                Q(window__class_reference__institution_id__in=user_institutions) |
                Q(target_group__institution_id__in=user_institutions)
            )
        elif model_name == 'Question':
            return qs.filter(
                Q(assessment__window__class_reference__institution_id__in=user_institutions) |
                Q(assessment__target_group__institution_id__in=user_institutions)
            )
        elif model_name == 'Submission':
            return qs.filter(
                Q(assessment__window__class_reference__institution_id__in=user_institutions) |
                Q(assessment__target_group__institution_id__in=user_institutions)
            )
        return qs

class AssessmentWindowViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = AssessmentWindow.objects.select_related('class_reference').all()
    serializer_class = AssessmentWindowSerializer
    permission_classes = [IsAuthenticated]

class AssessmentViewSet(viewsets.ModelViewSet):
    # Bypasses TenantFilterMixin — Assessments are scoped via the creator's
    # institution memberships, which covers creations with no window/target_group.
    queryset = Assessment.objects.select_related('window', 'topic', 'term', 'target_group').prefetch_related('questions')
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = self.queryset
        if user.is_superuser:
            return base

        user_inst_ids = list(
            InstitutionMembership.objects.filter(user=user, status='active')
            .values_list('institution_id', flat=True)
        )
        # Assessment is in-scope if its author shares at least one active
        # institution membership with the viewer. This lets teachers see
        # each other's work inside the same school and students see
        # anything their teachers publish.
        qs = base.filter(
            Q(created_by=user)
            | Q(created_by__institution_memberships__institution_id__in=user_inst_ids,
               created_by__institution_memberships__status='active')
        ).distinct()

        if getattr(user, 'role', '') == 'student':
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.request.user.role in ['teacher', 'school_admin', 'platform_admin']:
            return AssessmentAdminSerializer
        return AssessmentSerializer

    def perform_create(self, serializer):
        # Only teachers/admins can create assessments.
        if getattr(self.request.user, 'role', '') not in ('teacher', 'admin', 'institution'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only teachers or admins can create assessments.")
        serializer.save(created_by=self.request.user)

class QuestionViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = Question.objects.select_related('assessment').all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

class SubmissionViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = Submission.objects.select_related('assessment', 'student').all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        assessment_id = data.get('assessment')
        
        try:
            assessment = Assessment.objects.prefetch_related('questions').get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({"error": "Assessment not found"}, status=status.HTTP_404_NOT_FOUND)

        student_answers = data.get('answers_data', {})
        total_score = 0
        all_objective = True

        for question in assessment.questions.all():
            if question.type == 'mcq':
                # Exact match grading
                ans = student_answers.get(str(question.id))
                if ans and ans == question.correct_answer:
                    total_score += float(question.marks)
            else:
                all_objective = False

        submission_status = 'graded' if all_objective else 'submitted'

        submission = Submission.objects.create(
            assessment=assessment,
            student=request.user,
            status=submission_status,
            answers_data=student_answers,
            total_score=total_score,
            submitted_at=timezone.now()
        )

        # Auto-graded: tell the student their score landed.
        if submission_status == 'graded':
            max_score = assessment.max_score or sum(float(q.marks) for q in assessment.questions.all())
            notify(
                user=request.user,
                title=f'{assessment.title}: graded',
                message=f'You scored {total_score} / {max_score}. Open the assessment to review your answers.',
                kind='assessment_graded',
                link='/library',
            )

        serializer = self.get_serializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
