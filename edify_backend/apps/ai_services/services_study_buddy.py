"""Maple Study Buddy — Anthropic Claude wrapper.

Encapsulates everything the chat view needs so the view stays a
thin HTTP shell:
  - role-aware system prompt construction
  - country / curriculum awareness pulled from the user record
  - Anthropic API call with safe defaults (small model, low temp)
  - simple keyword-based escalation hints (when to nudge to a teacher)
  - graceful degradation when the API key isn't set or the upstream
    fails — we never 500 in this layer; the user sees a friendly
    "AI is unavailable, ask a real teacher" message instead.
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Iterable

from django.conf import settings


MODEL_ID = 'claude-haiku-4-5-20251001'
MAX_TOKENS = 700
MAX_HISTORY = 12  # messages to send back as context


# Keywords that ask the assistant to push the learner toward a real
# teacher. Kept conservative — the model also volunteers escalation
# in its own prompts; this is a safety net for clearly-out-of-scope
# requests.
ESCALATION_KEYWORDS = [
    r'\b(distress|hurt|harm|kill|suicide|abuse)\b',
    r'\b(why are you|are you human|are you ai)\b',
    r"\bdon'?t (know|understand) (this|that|it)\b",
    r"\b(give me|just tell me) the answer\b",
]


@dataclass
class StudyBuddyResult:
    content: str
    escalation_hint: bool
    input_tokens: int
    output_tokens: int
    model: str
    used_fallback: bool


# ── Persona prompts ──────────────────────────────────────────────────

_STUDENT_PROMPT = """\
You are **Maple Study Buddy**, a patient, encouraging AI study companion built into the Maple
Online School app for African students (Uganda and Kenya at launch).

Style and rules:
- Give **hints, not answers**. Walk students through problems step by step. Use scaffolding
  questions to nudge them forward.
- Keep replies short and mobile-friendly. Plain prose; no markdown beyond bullet hyphens.
- Be encouraging without being saccharine. Use simple, warm English.
- When the student asks for the final answer outright, gently insist on working it out together,
  then offer to check their attempt.
- When a topic is genuinely confusing, sensitive, or beyond a study question (mental health,
  abuse, anything outside the syllabus), **always recommend asking a real teacher** through the
  Maple "Ask a Teacher" feature, and end with the literal sentence: "Tap Ask a Teacher to talk
  to a real Maple teacher."
- Be honest when you're unsure. Never invent facts about exams, grading, or Maple policies.
- Default to the student's curriculum context when given. Mention country-specific exam tracks
  (PLE / UCE / UACE for UG; KCPE / KCSE for KE) only when they're actually relevant.
- Refuse politely to help with cheating on a real exam. Offer to help them prepare instead.
"""

_PARENT_PROMPT = """\
You are **Maple Parent Guide**, an AI companion for parents using the Maple Online School app.
You explain reports, suggest small at-home actions, and answer questions about your child's
progress in plain language.

Rules:
- Be reassuring but honest. Never inflate scores or invent results.
- Translate jargon ("readiness band", "mastery delta") into plain English.
- When the parent asks about a specific decision (move schools, change subjects), recommend
  talking to a teacher and end with: "Tap Ask a Teacher to talk to a real Maple teacher."
- Be culturally aware: Uganda (NCDC, PLE/UCE) and Kenya (KICD/CBC, KCSE) at launch.
- Keep replies short; parents read on the go.
"""

_TEACHER_PROMPT = """\
You are **Maple Teacher Assistant**, an AI helper for teachers using the Maple Online School
app. You help draft feedback, propose practice questions, summarise student work, and outline
live-class prep.

Rules:
- Always treat the teacher as the expert. You suggest; they decide.
- Output must be edit-ready: clear structure, no markdown beyond hyphens, no emoji.
- Don't invent specifics about a learner's history; ask the teacher for context if needed.
- Keep replies focused and concise. Prefer bullets over paragraphs.
"""


def _persona_prompt(persona: str) -> str:
    if persona == 'parent':
        return _PARENT_PROMPT
    if persona == 'teacher':
        return _TEACHER_PROMPT
    return _STUDENT_PROMPT


def _country_context(user) -> str:
    """Best-effort country / curriculum hint based on the user record."""
    try:
        profile = getattr(user, 'student_profile', None)
        country = (getattr(profile, 'country', '') or '').upper()[:2]
    except Exception:
        country = ''
    if country == 'KE':
        return 'The user is in Kenya — KICD / CBC curriculum, KCPE/KPSEA and KCSE exam tracks.'
    if country == 'UG':
        return 'The user is in Uganda — NCDC curriculum, PLE, UCE, and UACE exam tracks.'
    return 'If asked about country-specific exams, default to Uganda (NCDC, PLE/UCE/UACE).'


def _build_system_prompt(*, persona: str, user) -> str:
    parts = [_persona_prompt(persona).strip(), '', _country_context(user).strip()]
    return '\n\n'.join(parts)


# ── Escalation detection ────────────────────────────────────────────


def _detect_escalation(user_text: str, assistant_text: str) -> bool:
    blob = f'{user_text}\n{assistant_text}'.lower()
    for pat in ESCALATION_KEYWORDS:
        if re.search(pat, blob):
            return True
    if 'ask a teacher' in assistant_text.lower():
        return True
    return False


# ── Fallback (when Anthropic isn't reachable) ────────────────────────


def _fallback_response(user_text: str) -> StudyBuddyResult:
    return StudyBuddyResult(
        content=(
            "I can't reach the AI tutor right now. "
            "While I'm offline, please try again in a minute — and for anything urgent, "
            "Tap Ask a Teacher to talk to a real Maple teacher."
        ),
        escalation_hint=True,
        input_tokens=0,
        output_tokens=0,
        model=MODEL_ID,
        used_fallback=True,
    )


# ── Public entry ─────────────────────────────────────────────────────


def ask_study_buddy(*, user, persona: str, history: Iterable[tuple[str, str]],
                    user_message: str) -> StudyBuddyResult:
    """Send `user_message` to Claude with prior `history` and return
    a StudyBuddyResult. `history` is an iterable of (role, content)
    tuples; only the last MAX_HISTORY are sent.
    """
    api_key = (
        os.environ.get('ANTHROPIC_API_KEY')
        or getattr(settings, 'ANTHROPIC_API_KEY', None)
    )
    if not api_key:
        return _fallback_response(user_message)

    try:
        from anthropic import Anthropic
    except Exception:
        return _fallback_response(user_message)

    system_prompt = _build_system_prompt(persona=persona, user=user)

    # Build chronological message list. Anthropic expects alternating
    # user/assistant turns; merge consecutive same-role turns just in
    # case our history got out of sync.
    msgs: list[dict] = []
    for role, content in list(history)[-MAX_HISTORY:]:
        if role not in {'user', 'assistant'}:
            continue
        if msgs and msgs[-1]['role'] == role:
            msgs[-1]['content'] += '\n\n' + content
        else:
            msgs.append({'role': role, 'content': content})
    msgs.append({'role': 'user', 'content': user_message})

    try:
        client = Anthropic(api_key=api_key)
        resp = client.messages.create(
            model=MODEL_ID,
            max_tokens=MAX_TOKENS,
            temperature=0.4,
            system=system_prompt,
            messages=msgs,
        )
        # Concatenate text blocks; Anthropic returns a list of content
        # parts.
        content = ''.join(
            (block.text if getattr(block, 'type', '') == 'text' else '')
            for block in resp.content
        ).strip()
        if not content:
            return _fallback_response(user_message)

        return StudyBuddyResult(
            content=content,
            escalation_hint=_detect_escalation(user_message, content),
            input_tokens=getattr(resp.usage, 'input_tokens', 0) or 0,
            output_tokens=getattr(resp.usage, 'output_tokens', 0) or 0,
            model=MODEL_ID,
            used_fallback=False,
        )
    except Exception:
        return _fallback_response(user_message)
