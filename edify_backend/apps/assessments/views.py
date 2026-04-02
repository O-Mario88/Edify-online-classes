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

class AssessmentViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = Assessment.objects.select_related('window', 'topic', 'term', 'target_group').prefetch_related('questions')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.role in ['teacher', 'school_admin', 'platform_admin']:
            return AssessmentAdminSerializer
        return AssessmentSerializer

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

        serializer = self.get_serializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
