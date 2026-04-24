"""Pathway suggestion scoring — rules-based, intentionally simple.

Rank pathways by how well their recommended_subjects overlap with the
learner's strongest subjects (from analytics.SubjectPerformanceSnapshot).
If no snapshots exist yet we return the top generic pathways so the
UI doesn't surface an empty card.
"""
from __future__ import annotations
from typing import Iterable

from django.db.models import Avg

from .models import CareerPathway, PathwaySuggestion


def _strong_subject_names(student) -> list[str]:
    try:
        from analytics.models import SubjectPerformanceSnapshot
        snaps = (SubjectPerformanceSnapshot.objects
                 .filter(student=student)
                 .select_related('subject')
                 .order_by('-average_score')[:3])
        return [s.subject.name for s in snaps if s.subject]
    except Exception:
        return []


def recompute_for_student(student) -> list[PathwaySuggestion]:
    """Recompute top-3 pathway suggestions for this student. Idempotent
    per pathway — we update_or_create so re-running doesn't duplicate."""
    strengths = _strong_subject_names(student)
    strengths_lower = {s.lower() for s in strengths}

    pathways = list(CareerPathway.objects.filter(is_published=True))
    scored: list[tuple[CareerPathway, float, str]] = []
    for p in pathways:
        subs = [str(x).lower() for x in (p.recommended_subjects or [])]
        overlap = sum(1 for s in subs if s in strengths_lower)
        # Overlap count → confidence 0–100. Baseline 20 so newcomers see something.
        conf = 20 + min(80, overlap * 25)
        matched = [s for s in subs if s in strengths_lower] or subs[:2]
        reasoning_bits = [f"Strong match on {', '.join(matched)}." ] if matched else []
        if overlap == 0 and subs:
            reasoning_bits.append(f"Keep growing in {', '.join(subs[:2])} to strengthen this pathway.")
        scored.append((p, conf, ' '.join(reasoning_bits) or 'A solid starting pathway to explore.'))

    scored.sort(key=lambda t: t[1], reverse=True)
    top = scored[:3]
    out = []
    for pathway, conf, reason in top:
        obj, _ = PathwaySuggestion.objects.update_or_create(
            student=student, pathway=pathway,
            defaults={'confidence': conf, 'reasoning': reason},
        )
        out.append(obj)
    return out
