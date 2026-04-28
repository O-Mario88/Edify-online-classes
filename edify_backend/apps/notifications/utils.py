"""Tiny helper for creating in-app notifications from anywhere in the
backend without each app having to know the Notification model shape.

Usage from a viewset action:

    from notifications.utils import notify
    notify(user=req.requester,
           title='Premium plan approved',
           message='Your Learner Plus access is active for 3 months.',
           kind='upgrade_approved',
           link='/pricing')

Cheap by design: writes a single in_app Notification row. We avoid
django.signals + post_save dispatch because most call sites already
own the surrounding transaction and want a synchronous write so the
drawer can pick the row up on its next poll.
"""
from __future__ import annotations

from typing import Optional
from .models import Notification


def notify(
    *,
    user,
    title: str,
    message: str = '',
    kind: str = 'general',
    link: Optional[str] = None,
    channel: str = 'in_app',
    extra: Optional[dict] = None,
) -> Notification:
    """Create an in-app notification row.

    `kind` is a free-form tag the frontend can use later to group or
    icon-ize entries. `link` (when set) goes into payload so the drawer
    can deep-link clicks to the relevant page.
    """
    if not user or not getattr(user, 'is_authenticated', True):
        # Calling code may pass an anonymous user reference (e.g. for a
        # not-yet-verified registrant). Drop silently in that case.
        return None  # type: ignore[return-value]
    payload = {
        'title': title,
        'message': message,
        'kind': kind,
    }
    if link:
        payload['link'] = link
    if extra:
        payload['extra'] = extra
    return Notification.objects.create(
        user=user, channel=channel, payload=payload, status='sent',
    )
