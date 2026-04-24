"""Diagnostic endpoints for the flagship conversion flow.

Flow:
  1. POST /api/v1/diagnostic/start/ → auto-samples questions, returns
     session + questions.
  2. POST /api/v1/diagnostic/<id>/submit/ → grades, computes rollups,
     generates the Learning Level Report.
  3. GET /api/v1/diagnostic/<id>/ → session + report.

All endpoints require authentication — the user must have signed up
before taking the diagnostic, per product spec.
"""
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from assessments.models import Question
from curriculum.models import ClassLevel

from .models import DiagnosticSession
from .serializers import (
    DiagnosticSessionSerializer,
    DiagnosticQuestionSerializer,
    DiagnosticStartSerializer,
    DiagnosticSubmitSerializer,
)
from .services import (
    sample_questions_for_class_level,
    grade_answer,
    compute_rollups,
)


class DiagnosticSessionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DiagnosticSession.objects.filter(student=self.request.user)

    def retrieve(self, request, pk=None):
        try:
            session = self.get_queryset().get(pk=pk)
        except DiagnosticSession.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(DiagnosticSessionSerializer(session).data)

    @action(detail=False, methods=['post'], url_path='start')
    def start(self, request):
        serializer = DiagnosticStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        class_level_id = serializer.validated_data.get('class_level_id')

        class_level = None
        if class_level_id:
            class_level = ClassLevel.objects.filter(id=class_level_id).first()
            # Strict stage guard — a primary user cannot diagnose on secondary
            # material and vice versa.
            if class_level and request.user.stage in ('primary', 'secondary'):
                is_primary = class_level.level.is_primary
                expected = 'primary' if is_primary else 'secondary'
                if expected != request.user.stage:
                    return Response(
                        {'detail': f'This class level belongs to the {expected} platform. '
                                   f'Your account is registered for the {request.user.stage} platform.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        questions = sample_questions_for_class_level(class_level)
        session = DiagnosticSession.objects.create(
            student=request.user,
            class_level=class_level,
            state='in_progress',
            sampled_question_ids=[q.id for q in questions],
        )
        return Response({
            'session': DiagnosticSessionSerializer(session).data,
            'questions': DiagnosticQuestionSerializer(questions, many=True).data,
            'empty_bank': len(questions) == 0,
        })

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        try:
            session = self.get_queryset().get(pk=pk)
        except DiagnosticSession.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if session.state == 'submitted':
            return Response(
                {'detail': 'This diagnostic has already been submitted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DiagnosticSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answers = serializer.validated_data['answers']

        questions = list(Question.objects.filter(id__in=session.sampled_question_ids)
                         .select_related('assessment__topic__subject'))

        grades = {}
        for q in questions:
            submitted = answers.get(str(q.id)) or answers.get(q.id)
            is_correct, score = grade_answer(q, submitted or '')
            grades[str(q.id)] = {'correct': is_correct, 'score': score}

        session.answers = {str(k): v for k, v in answers.items()}
        session.grades = grades
        compute_rollups(session, questions)
        session.state = 'submitted'
        session.submitted_at = timezone.now()
        session.save()

        return Response(DiagnosticSessionSerializer(session).data)
