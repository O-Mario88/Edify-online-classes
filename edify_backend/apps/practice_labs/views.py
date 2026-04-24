"""Practice Labs endpoints.

GET  /api/v1/practice-labs/                              browse (published only)
GET  /api/v1/practice-labs/<slug>/                       detail with steps
POST /api/v1/practice-labs/<slug>/start/                 start a new attempt
POST /api/v1/practice-labs/attempts/<id>/submit-step/    submit one step's answer
POST /api/v1/practice-labs/attempts/<id>/submit/         finalize + grade + badge
GET  /api/v1/practice-labs/attempts/my/                  learner's attempts
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.curriculum.stage_filter import filter_queryset_by_stage
from .models import PracticeLab, PracticeLabStep, PracticeLabAttempt, PracticeLabStepResponse
from .serializers import (
    PracticeLabCardSerializer, PracticeLabDetailSerializer,
    PracticeLabAttemptSerializer, StepSubmissionSerializer,
)


class PracticeLabViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        qs = PracticeLab.objects.filter(is_published=True).select_related(
            'subject', 'class_level', 'topic',
        ).prefetch_related('steps')
        return filter_queryset_by_stage(qs, self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PracticeLabDetailSerializer
        return PracticeLabCardSerializer

    @action(detail=True, methods=['post'], url_path='start')
    def start(self, request, slug=None):
        lab = get_object_or_404(self.get_queryset(), slug=slug)
        max_points = sum(s.points for s in lab.steps.all())
        attempt = PracticeLabAttempt.objects.create(
            lab=lab, student=request.user, status='started',
            max_points=max_points,
        )
        return Response(PracticeLabAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class PracticeLabAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PracticeLabAttemptSerializer

    def get_queryset(self):
        return (PracticeLabAttempt.objects
                .filter(student=self.request.user)
                .select_related('lab')
                .prefetch_related('responses'))

    @action(detail=False, methods=['get'], url_path='my')
    def my_attempts(self, request):
        return Response(PracticeLabAttemptSerializer(self.get_queryset(), many=True).data)

    @action(detail=True, methods=['post'], url_path='submit-step')
    def submit_step(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status in ('completed',):
            return Response({'detail': 'Attempt already completed.'}, status=status.HTTP_400_BAD_REQUEST)
        s = StepSubmissionSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        step_id = s.validated_data['step_id']
        try:
            step = attempt.lab.steps.get(id=step_id)
        except PracticeLabStep.DoesNotExist:
            return Response({'detail': 'Step does not belong to this lab.'}, status=status.HTTP_400_BAD_REQUEST)

        response_text = s.validated_data.get('response_text', '')
        selected_option = s.validated_data.get('selected_option', '')
        is_correct = None
        feedback = ''

        if step.step_type in ('mcq', 'short_answer') and step.expected_answer:
            provided = (selected_option or response_text or '').strip().lower()
            expected = step.expected_answer.strip().lower()
            is_correct = provided == expected
            feedback = 'Correct!' if is_correct else f"Not quite. Hint: {step.hint or 'Review the step and try again.'}"
        elif step.step_type in ('reflection', 'instruction'):
            # Non-graded — completion is the win.
            is_correct = True
            feedback = 'Noted. Keep going.'

        resp_obj, _ = PracticeLabStepResponse.objects.update_or_create(
            attempt=attempt, step=step,
            defaults={
                'response_text': response_text,
                'selected_option': selected_option,
                'is_correct': is_correct,
                'feedback': feedback,
            },
        )
        return Response({
            'step_id': str(step.id),
            'is_correct': is_correct,
            'feedback': feedback,
        })

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status == 'completed':
            return Response({'detail': 'Already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        responses = attempt.responses.select_related('step')
        points = 0
        for r in responses:
            if r.is_correct:
                points += r.step.points
        attempt.score_points = points
        attempt.max_points = sum(s.points for s in attempt.lab.steps.all()) or 0
        pct = (points / attempt.max_points * 100) if attempt.max_points else 0
        attempt.score_pct = round(pct, 2)
        passed = pct >= attempt.lab.pass_threshold_pct
        attempt.badge_earned = passed
        attempt.status = 'completed' if passed else 'needs_retry'
        attempt.submitted_at = timezone.now()
        if passed:
            attempt.completed_at = timezone.now()
            attempt.feedback = f'Great work! You earned the "{attempt.lab.badge_label or attempt.lab.title}" badge.'
        else:
            attempt.feedback = f'You scored {pct:.0f}% — the pass threshold is {attempt.lab.pass_threshold_pct}%. Retry the weak steps and submit again.'
        attempt.save()
        return Response(PracticeLabAttemptSerializer(attempt).data)
