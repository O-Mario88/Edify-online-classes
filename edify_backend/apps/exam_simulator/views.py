from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.curriculum.stage_filter import filter_queryset_by_stage
from .models import ExamSimulation, ExamSimulationAttempt, MistakeNotebookEntry
from .serializers import (
    ExamCardSerializer, DeliveredQuestionSerializer,
    AttemptSerializer, SubmitSerializer, MistakeEntrySerializer,
)


def _readiness_band(pct: float) -> str:
    if pct >= 80:
        return 'strong'
    if pct >= 60:
        return 'moderate'
    return 'low'


class ExamSimulationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'
    serializer_class = ExamCardSerializer

    def get_queryset(self):
        qs = ExamSimulation.objects.filter(is_published=True).select_related('subject', 'class_level')
        return filter_queryset_by_stage(qs, self.request.user)

    def retrieve(self, request, slug=None):
        exam = get_object_or_404(self.get_queryset(), slug=slug)
        body = ExamCardSerializer(exam).data
        body['instructions'] = exam.instructions
        return Response(body)

    @action(detail=True, methods=['post'], url_path='start')
    def start(self, request, slug=None):
        exam = get_object_or_404(self.get_queryset(), slug=slug)
        questions = list(exam.questions.all().order_by('order'))
        max_points = sum(float(q.marks) for q in questions)
        attempt = ExamSimulationAttempt.objects.create(
            exam=exam, student=request.user,
            status='started', max_points=int(max_points),
        )
        delivered = [
            {
                'id': q.id, 'type': q.type, 'content': q.content,
                'options': q.options or [], 'marks': q.marks, 'order': q.order,
            }
            for q in questions
        ]
        return Response({
            'attempt': AttemptSerializer(attempt).data,
            'questions': delivered,
            'duration_minutes': exam.duration_minutes,
        }, status=status.HTTP_201_CREATED)


class ExamAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AttemptSerializer

    def get_queryset(self):
        return (ExamSimulationAttempt.objects
                .filter(student=self.request.user).select_related('exam'))

    @action(detail=False, methods=['get'], url_path='my')
    def my_attempts(self, request):
        return Response(AttemptSerializer(self.get_queryset(), many=True).data)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status == 'graded':
            return Response({'detail': 'Already graded.'}, status=status.HTTP_400_BAD_REQUEST)

        s = SubmitSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        answers = s.validated_data['answers']
        attempt.answers = answers

        score = 0
        max_points = 0
        mistakes = []
        for q in attempt.exam.questions.all().select_related('assessment__topic__subject'):
            max_points += float(q.marks)
            submitted = (answers.get(str(q.id)) or '').strip().lower()
            expected = (q.correct_answer or '').strip().lower()
            if submitted and submitted == expected:
                score += float(q.marks)
            else:
                # Log a mistake notebook entry (skip if no expected — essay).
                if expected:
                    mistakes.append(MistakeNotebookEntry(
                        student=attempt.student,
                        subject=q.assessment.topic.subject if q.assessment.topic else None,
                        topic=q.assessment.topic,
                        question=q,
                        learner_answer=answers.get(str(q.id), '') or '',
                        correct_answer=q.correct_answer,
                        explanation='',
                        source_attempt=attempt,
                        retry_status='open',
                    ))

        MistakeNotebookEntry.objects.bulk_create(mistakes)

        attempt.score_points = int(score)
        attempt.max_points = int(max_points)
        pct = (score / max_points * 100) if max_points else 0
        attempt.score_pct = Decimal(round(pct, 2))
        attempt.readiness_band = _readiness_band(pct)
        attempt.status = 'graded'
        attempt.submitted_at = timezone.now()
        attempt.save()
        return Response(AttemptSerializer(attempt).data)


class MistakeNotebookViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MistakeEntrySerializer

    def get_queryset(self):
        qs = MistakeNotebookEntry.objects.filter(student=self.request.user).select_related('subject', 'topic', 'question')
        subject = self.request.query_params.get('subject')
        if subject:
            qs = qs.filter(subject_id=subject)
        return qs

    @action(detail=True, methods=['post'], url_path='retry')
    def retry(self, request, pk=None):
        entry = self.get_object()
        submitted = (request.data.get('answer') or '').strip().lower()
        expected = (entry.correct_answer or '').strip().lower()
        entry.retry_status = 'retried_correct' if submitted == expected else 'retried_incorrect'
        entry.learner_answer = request.data.get('answer', '')
        entry.save(update_fields=['retry_status', 'learner_answer'])
        return Response({
            'retry_status': entry.retry_status,
            'is_correct': entry.retry_status == 'retried_correct',
        })


class ReadinessReportView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Roll up the learner's readiness across exam tracks."""
        from django.db.models import Avg
        from collections import defaultdict

        attempts = (ExamSimulationAttempt.objects
                    .filter(student=request.user, status='graded')
                    .select_related('exam__subject'))
        by_track: dict[str, list[float]] = defaultdict(list)
        for a in attempts:
            by_track[a.exam.exam_track].append(float(a.score_pct))

        report = []
        for track, scores in by_track.items():
            avg = sum(scores) / len(scores) if scores else 0
            report.append({
                'exam_track': track,
                'attempts': len(scores),
                'avg_pct': round(avg, 1),
                'readiness_band': _readiness_band(avg),
            })
        mistakes_open = MistakeNotebookEntry.objects.filter(student=request.user, retry_status='open').count()
        return Response({
            'tracks': report,
            'open_mistakes': mistakes_open,
            'trust_note': 'Readiness estimates are based on the exam simulations you have completed on Maple. The more you take, the sharper the estimate.',
        })
