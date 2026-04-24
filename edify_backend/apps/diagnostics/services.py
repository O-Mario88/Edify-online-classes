"""Diagnostic sampling, grading, and report synthesis.

The platform "auto-generates" a diagnostic by sampling from the existing
assessments.Question bank, filtered to the student's class-level. No
LLMs involved — the randomness + topic coverage is enough to estimate
learning level. If the Question bank is sparse for a class level, we
degrade gracefully and still produce a report with whatever is there.
"""
from __future__ import annotations
import random
from decimal import Decimal
from typing import Optional

from django.db.models import Count

from curriculum.models import ClassLevel, Subject, Topic
from assessments.models import Question


DEFAULT_DIAGNOSTIC_LENGTH = 10
MIN_PER_SUBJECT = 2
MAX_PER_SUBJECT = 4


def sample_questions_for_class_level(
    class_level: Optional[ClassLevel],
    target_count: int = DEFAULT_DIAGNOSTIC_LENGTH,
) -> list[Question]:
    """Return up to target_count Questions spread across subjects taught at
    this class level.

    Strategy:
    1. Gather topics at this class level, grouped by subject.
    2. For each subject, sample 2–4 questions (capped by how many exist).
    3. Stop once we hit target_count, preferring breadth over depth.
    """
    if class_level is None:
        # Fall back to any published, MCQ-able questions.
        return list(Question.objects.filter(
            type='mcq', assessment__is_published=True,
        ).order_by('?')[:target_count])

    topics = Topic.objects.filter(class_level=class_level).select_related('subject')
    subject_to_topic_ids: dict[int, list[int]] = {}
    subject_names: dict[int, str] = {}
    for t in topics:
        subject_to_topic_ids.setdefault(t.subject_id, []).append(t.id)
        subject_names.setdefault(t.subject_id, t.subject.name)

    sampled: list[Question] = []
    # Shuffle subjects so diagnostic order varies.
    subject_ids = list(subject_to_topic_ids.keys())
    random.shuffle(subject_ids)

    for subject_id in subject_ids:
        if len(sampled) >= target_count:
            break
        topic_ids = subject_to_topic_ids[subject_id]
        needed = min(
            MAX_PER_SUBJECT,
            max(MIN_PER_SUBJECT, (target_count - len(sampled)) // max(1, len(subject_ids) - subject_ids.index(subject_id))),
        )
        qs = list(Question.objects.filter(
            assessment__topic_id__in=topic_ids,
            type='mcq',
            assessment__is_published=True,
        ).order_by('?')[:needed])
        sampled.extend(qs)

    # Top up from any MCQ question at this level if we came up short.
    if len(sampled) < target_count:
        have_ids = {q.id for q in sampled}
        top_up = list(Question.objects.filter(
            assessment__topic__class_level=class_level,
            type='mcq',
            assessment__is_published=True,
        ).exclude(id__in=have_ids).order_by('?')[:target_count - len(sampled)])
        sampled.extend(top_up)

    return sampled[:target_count]


def grade_answer(question: Question, submitted: str) -> tuple[bool, float]:
    """Grade a single answer. Returns (is_correct, score_out_of_marks)."""
    if not submitted:
        return False, 0.0
    correct_raw = (question.correct_answer or '').strip()
    if not correct_raw:
        # Platform data gap — be generous, give zero but don't crash.
        return False, 0.0
    is_correct = str(submitted).strip().lower() == correct_raw.lower()
    return is_correct, float(question.marks) if is_correct else 0.0


def _level_label(score_pct: float) -> tuple[str, str, str]:
    """Bucket a percentage into a learning-level label + tone + one-line
    coaching message."""
    if score_pct >= 85:
        return 'Advanced', 'positive', "You're ahead of most learners at this stage — focus on stretch topics."
    if score_pct >= 70:
        return 'On Track', 'positive', "You've got a solid base. Keep building depth in your weaker topics."
    if score_pct >= 50:
        return 'Developing', 'neutral', "Strong foundation in some areas. A weekly study plan will lift your weak topics quickly."
    if score_pct >= 30:
        return 'Needs Support', 'warning', "Several core topics need attention. A structured study plan and a tutor can close the gap."
    return 'Critical Gaps', 'warning', "Big swings possible with focused revision. Start with the weakest topics and build up."


def build_study_plan_preview(per_topic_scores: list[dict]) -> list[dict]:
    """Pick the weakest 7 topics (score ascending) and turn them into a 7-day
    preview plan. Each day gets one weak topic + a short action."""
    weak_first = sorted(per_topic_scores, key=lambda t: t.get('pct', 100))[:7]
    preview = []
    day_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    for i, t in enumerate(weak_first):
        preview.append({
            'day': day_labels[i % 7],
            'topic_name': t.get('topic_name', '—'),
            'subject_name': t.get('subject_name', '—'),
            'action': 'Watch the lesson, then take a 5-question practice set.',
            'est_minutes': 25,
            'locked': i >= 3,  # Preview 3 days; lock the remaining 4 behind upgrade.
        })
    return preview


def compute_rollups(session, sampled_questions: list[Question]) -> None:
    """Compute per_subject_scores, per_topic_scores, total/correct,
    and report_data on the session. Mutates session in place; caller saves."""
    subject_bucket: dict[int, dict] = {}
    topic_bucket: dict[int, dict] = {}

    for q in sampled_questions:
        grade = session.grades.get(str(q.id), {})
        is_correct = bool(grade.get('correct'))
        subj = q.assessment.topic.subject if q.assessment.topic else None
        topic = q.assessment.topic
        if subj is not None:
            bucket = subject_bucket.setdefault(subj.id, {
                'subject_id': subj.id,
                'subject_name': subj.name,
                'total': 0,
                'correct': 0,
            })
            bucket['total'] += 1
            if is_correct:
                bucket['correct'] += 1
        if topic is not None:
            t_bucket = topic_bucket.setdefault(topic.id, {
                'topic_id': topic.id,
                'topic_name': topic.name,
                'subject_name': subj.name if subj else '—',
                'total': 0,
                'correct': 0,
            })
            t_bucket['total'] += 1
            if is_correct:
                t_bucket['correct'] += 1

    per_subject = []
    for b in subject_bucket.values():
        pct = round((b['correct'] / b['total']) * 100, 1) if b['total'] else 0
        per_subject.append({**b, 'pct': pct})
    per_subject.sort(key=lambda x: x['pct'], reverse=True)

    per_topic = []
    for b in topic_bucket.values():
        pct = round((b['correct'] / b['total']) * 100, 1) if b['total'] else 0
        per_topic.append({**b, 'pct': pct})

    session.per_subject_scores = per_subject
    session.per_topic_scores = per_topic
    session.total_questions = len(sampled_questions)
    session.correct_count = sum(1 for q in sampled_questions if session.grades.get(str(q.id), {}).get('correct'))
    session.score_pct = Decimal(
        round((session.correct_count / len(sampled_questions)) * 100, 2) if sampled_questions else 0
    )

    level, tone, coaching = _level_label(float(session.score_pct))
    strong_subjects = [s['subject_name'] for s in per_subject[:2] if s['pct'] >= 60]
    weak_topics = sorted(per_topic, key=lambda x: x['pct'])[:5]

    session.report_data = {
        'level_label': level,
        'level_tone': tone,
        'coaching_message': coaching,
        'strong_subjects': strong_subjects,
        'weak_topics': [{'name': t['topic_name'], 'subject': t['subject_name'], 'pct': t['pct']} for t in weak_topics],
        'study_plan_preview': build_study_plan_preview(per_topic),
        'next_action': {
            'label': 'Unlock your full personalised study plan',
            'route': '/dashboard/student',
            'payment_hint': 'learner_plus',
        },
        'trust_note': 'This learning level is an estimate based on the diagnostic you just took. Your study plan will keep refining as you complete lessons, assessments, and live classes.',
    }
