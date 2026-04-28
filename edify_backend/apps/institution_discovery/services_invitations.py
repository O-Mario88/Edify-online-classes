"""Invitation + Passport-access workflow.

Encapsulates the create / accept / decline logic so the views stay
thin and so the audit story is easy to test. Every state transition
fires a Notification row to the appropriate counterparty (in-app
delivery; push fan-out is the operations layer's job).
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from django.db import transaction
from django.utils import timezone

from .models import (
    InstitutionStudentInvitation,
    PassportAccessRequest,
    StudentOpportunityPreference,
    StudentReadinessProfile,
)
from .services_match import (
    get_or_compute_eligibility,
    get_invitation_quota_info,
    tier_locks_feature,
)


DEFAULT_INVITE_EXPIRY_DAYS = 30


# ── Helpers ─────────────────────────────────────────────────────────


def _resolve_parent(student_user):
    """Return the linked parent user, or None when no link exists."""
    try:
        from parent_portal.models import ParentStudentLink
        link = (ParentStudentLink.objects
                .filter(student_profile__user=student_user)
                .select_related('parent_profile__user')
                .first())
        if link and link.parent_profile and link.parent_profile.user:
            return link.parent_profile.user
    except Exception:
        pass
    return None


def _notify(user, channel: str, payload: dict[str, Any]) -> None:
    """Create an in-app Notification row. Errors are swallowed —
    notifications must never block the workflow they trail."""
    if not user:
        return
    try:
        from notifications.models import Notification
        Notification.objects.create(
            user=user,
            channel=channel,
            payload=payload,
            status='pending',
        )
    except Exception:
        pass


def _institution_signature(institution) -> dict[str, Any]:
    """Compact institution descriptor used in invitation cards."""
    return {
        'id': institution.id,
        'name': getattr(institution, 'name', '') or '',
        'location': getattr(institution, 'location', '') or '',
    }


def _learner_signature(student_user, profile: StudentReadinessProfile | None) -> dict[str, Any]:
    """What goes back to the institution in the invitation echo. Stays
    anonymised — same projection the recommended-students list uses."""
    return {
        'student_id': student_user.id,
        'class_level': getattr(profile, 'class_level', '') if profile else '',
        'region': getattr(profile, 'region', '') if profile else '',
        'lane': getattr(profile, 'lane', '') if profile else '',
        'overall_readiness_score': round(getattr(profile, 'overall_readiness_score', 0) or 0, 1),
    }


# ── Invitations (institution → parent) ──────────────────────────────


@transaction.atomic
def create_invitation(*, institution, sender, student_user, invitation_type: str,
                      message: str = '', why_interested: list[str] | None = None,
                      requested_share_level: str = 'academic_summary') -> dict[str, Any]:
    """Sends an invitation to the parent of `student_user`.

    Validates:
      - institution is eligible to send
      - learner is currently discoverable (parent opt-in still on)
      - learner has a linked parent we can route to
    """
    elig = get_or_compute_eligibility(institution)
    if not elig.can_send_invitations:
        return {
            'ok': False,
            'detail': 'Your institution does not meet the requirements to send invitations.',
            'gate': {
                'verified': elig.verified,
                'admission_open': elig.admission_open,
                'activeness_score': elig.activeness_score,
            },
        }

    # Tier gate: free institutions can't send at all; pro is capped
    # monthly; premium is uncapped. Both checks are server-side so the
    # mobile UI can never bypass them.
    tier_locked, tier = tier_locks_feature(institution, 'send_invitations')
    if tier_locked:
        return {
            'ok': False,
            'detail': 'Sending invitations requires School Match Pro or Premium.',
            'tier_required': 'pro',
            'current_tier': tier,
        }
    quota = get_invitation_quota_info(institution)
    if not quota['can_send']:
        return {
            'ok': False,
            'detail': 'Monthly invitation limit reached on your current plan.',
            'quota': quota,
            'tier_required': 'premium',
        }

    pref = StudentOpportunityPreference.objects.filter(student=student_user).first()
    if not pref or not pref.is_discoverable():
        return {'ok': False, 'detail': 'Learner is not currently discoverable.'}

    parent = _resolve_parent(student_user)
    if not parent:
        return {
            'ok': False,
            'detail': 'No linked parent on this learner — invitations can only route through a parent.',
        }

    profile = StudentReadinessProfile.objects.filter(student=student_user).first()
    expires = timezone.now() + timedelta(days=DEFAULT_INVITE_EXPIRY_DAYS)

    invitation = InstitutionStudentInvitation.objects.create(
        institution=institution,
        student=student_user,
        parent=parent,
        invitation_type=invitation_type,
        message=message or '',
        why_interested=why_interested or [],
        requested_share_level=requested_share_level,
        status='sent',
        created_by=sender,
        expires_at=expires,
    )

    _notify(parent, 'in_app', {
        'kind': 'school_match_invitation',
        'invitation_id': invitation.id,
        'invitation_type': invitation_type,
        'institution': _institution_signature(institution),
        'why_interested': why_interested or [],
        'message_preview': (message or '')[:160],
        'route': f'/(parent)/invitations/{invitation.id}',
    })

    return {'ok': True, 'invitation': serialize_invitation_for_institution(invitation, profile)}


@transaction.atomic
def accept_invitation(*, parent, invitation_id) -> dict[str, Any]:
    """Parent accepts. Status flips and the institution gains contact
    details on the read endpoint (parent contact only — adult, opted in)."""
    invitation = (InstitutionStudentInvitation.objects
                  .select_related('institution', 'student')
                  .filter(id=invitation_id, parent=parent).first())
    if not invitation:
        return {'ok': False, 'detail': 'Invitation not found.'}
    if invitation.status not in {'sent', 'viewed'}:
        return {'ok': False, 'detail': 'This invitation can no longer be accepted.'}

    invitation.status = 'accepted'
    invitation.responded_at = timezone.now()
    invitation.save(update_fields=['status', 'responded_at'])

    _notify(invitation.created_by, 'in_app', {
        'kind': 'school_match_invitation_accepted',
        'invitation_id': invitation.id,
        'invitation_type': invitation.invitation_type,
        'route': f'/(institution)/invitations/{invitation.id}',
    })

    return {'ok': True, 'invitation': serialize_invitation_for_parent(invitation, include_institution_contact=True)}


@transaction.atomic
def decline_invitation(*, parent, invitation_id, reason: str = '') -> dict[str, Any]:
    invitation = (InstitutionStudentInvitation.objects
                  .filter(id=invitation_id, parent=parent).first())
    if not invitation:
        return {'ok': False, 'detail': 'Invitation not found.'}
    if invitation.status not in {'sent', 'viewed'}:
        return {'ok': False, 'detail': 'This invitation can no longer be declined.'}

    invitation.status = 'declined'
    invitation.responded_at = timezone.now()
    invitation.save(update_fields=['status', 'responded_at'])

    _notify(invitation.created_by, 'in_app', {
        'kind': 'school_match_invitation_declined',
        'invitation_id': invitation.id,
    })

    return {'ok': True, 'invitation': serialize_invitation_for_parent(invitation)}


def mark_invitation_viewed(*, parent, invitation_id) -> bool:
    """Idempotently flip status from 'sent' to 'viewed'. Anything else
    is left as-is so we don't downgrade an accepted invite."""
    invitation = (InstitutionStudentInvitation.objects
                  .filter(id=invitation_id, parent=parent).first())
    if not invitation or invitation.status != 'sent':
        return False
    invitation.status = 'viewed'
    invitation.save(update_fields=['status'])
    return True


# ── Passport access requests (institution → parent) ─────────────────


@transaction.atomic
def create_passport_access_request(*, institution, student_user, requested_sections: list[str],
                                   reason: str = '') -> dict[str, Any]:
    """Institution asks for read access to specific Passport sections."""
    elig = get_or_compute_eligibility(institution)
    if not elig.can_send_invitations:
        return {'ok': False, 'detail': 'Not eligible to request Passport access.'}

    parent = _resolve_parent(student_user)
    pref = StudentOpportunityPreference.objects.filter(student=student_user).first()
    if not pref or not pref.is_discoverable():
        return {'ok': False, 'detail': 'Learner is not currently discoverable.'}

    valid_sections = [s for s in requested_sections if s in PassportAccessRequest.SECTION_CHOICES]
    if not valid_sections:
        return {'ok': False, 'detail': 'No valid sections supplied.'}

    expires = timezone.now() + timedelta(days=DEFAULT_INVITE_EXPIRY_DAYS)
    par = PassportAccessRequest.objects.create(
        institution=institution,
        student=student_user,
        parent=parent,
        requested_sections=valid_sections,
        reason=reason or '',
        status='pending',
        expires_at=expires,
    )

    _notify(parent, 'in_app', {
        'kind': 'passport_access_requested',
        'request_id': par.id,
        'institution': _institution_signature(institution),
        'sections': valid_sections,
        'route': f'/(parent)/passport-requests/{par.id}',
    })
    return {'ok': True, 'request': serialize_passport_request_for_parent(par)}


@transaction.atomic
def respond_passport_request(*, parent, request_id, decision: str) -> dict[str, Any]:
    """Parent approves / declines a Passport-access request."""
    if decision not in {'approved', 'declined'}:
        return {'ok': False, 'detail': 'Invalid decision.'}

    par = PassportAccessRequest.objects.filter(id=request_id, parent=parent).first()
    if not par:
        return {'ok': False, 'detail': 'Request not found.'}
    if par.status != 'pending':
        return {'ok': False, 'detail': 'This request has already been answered.'}

    par.status = decision
    if decision == 'approved':
        par.approved_at = timezone.now()
    par.save()

    return {'ok': True, 'request': serialize_passport_request_for_parent(par)}


# ── Serialisation ───────────────────────────────────────────────────


def serialize_invitation_for_parent(invitation: InstitutionStudentInvitation,
                                    *, include_institution_contact: bool = False) -> dict[str, Any]:
    institution = invitation.institution
    payload = {
        'id': invitation.id,
        'invitation_type': invitation.invitation_type,
        'message': invitation.message,
        'why_interested': invitation.why_interested or [],
        'requested_share_level': invitation.requested_share_level,
        'status': invitation.status,
        'expires_at': invitation.expires_at.isoformat() if invitation.expires_at else None,
        'created_at': invitation.created_at.isoformat(),
        'responded_at': invitation.responded_at.isoformat() if invitation.responded_at else None,
        'institution': {
            'id': institution.id,
            'name': getattr(institution, 'name', '') or '',
            'location': getattr(institution, 'location', '') or '',
        },
    }
    # On accept the parent (and therefore the institution on the
    # mirror endpoint) earns contact-details visibility.
    if include_institution_contact or invitation.status == 'accepted':
        payload['institution'].update({
            'contact_email': getattr(institution, 'contact_email', '') or '',
            'contact_phone': getattr(institution, 'contact_phone', '') or '',
            'website': getattr(institution, 'website', '') or '',
        })
    return payload


def serialize_invitation_for_institution(invitation: InstitutionStudentInvitation,
                                         profile: StudentReadinessProfile | None = None) -> dict[str, Any]:
    """Institution-side projection. Anonymous learner descriptor unless
    the parent has accepted, in which case the parent contact details
    surface (parents are adults, opted in by accepting)."""
    snap = _learner_signature(invitation.student, profile or StudentReadinessProfile.objects.filter(student=invitation.student).first())
    payload = {
        'id': invitation.id,
        'invitation_type': invitation.invitation_type,
        'message': invitation.message,
        'why_interested': invitation.why_interested or [],
        'requested_share_level': invitation.requested_share_level,
        'status': invitation.status,
        'expires_at': invitation.expires_at.isoformat() if invitation.expires_at else None,
        'created_at': invitation.created_at.isoformat(),
        'responded_at': invitation.responded_at.isoformat() if invitation.responded_at else None,
        'learner': snap,
    }
    if invitation.status == 'accepted' and invitation.parent:
        # Parents are adults; surface contact details so the institution
        # can follow up directly. Student details remain anonymised.
        parent = invitation.parent
        payload['parent_contact'] = {
            'parent_id': parent.id,
            'full_name': getattr(parent, 'full_name', '') or parent.email,
            'email': parent.email,
            'phone': getattr(parent, 'phone_number', '') or '',
        }
    return payload


def serialize_passport_request_for_parent(par: PassportAccessRequest) -> dict[str, Any]:
    institution = par.institution
    return {
        'id': par.id,
        'institution': {
            'id': institution.id,
            'name': getattr(institution, 'name', '') or '',
            'location': getattr(institution, 'location', '') or '',
        },
        'requested_sections': par.requested_sections or [],
        'reason': par.reason,
        'status': par.status,
        'created_at': par.created_at.isoformat(),
        'approved_at': par.approved_at.isoformat() if par.approved_at else None,
        'expires_at': par.expires_at.isoformat() if par.expires_at else None,
    }


def serialize_passport_request_for_institution(par: PassportAccessRequest) -> dict[str, Any]:
    return {
        'id': par.id,
        'student_id': par.student_id,
        'requested_sections': par.requested_sections or [],
        'status': par.status,
        'created_at': par.created_at.isoformat(),
        'approved_at': par.approved_at.isoformat() if par.approved_at else None,
        'expires_at': par.expires_at.isoformat() if par.expires_at else None,
    }
