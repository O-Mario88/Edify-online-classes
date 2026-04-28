"""Platform-access policy — paywall removed.

`compute_access_status()` is preserved as the single source of truth so
existing callers (the `/access/status/` endpoint, the
`IsActiveSubscription` permission shim, mobile + webapp clients) stay
wired, but every authenticated user is now reported as having open,
unconstrained access.
"""
from typing import Optional, TypedDict


class AccessStatus(TypedDict):
    has_active_access: bool
    active_plans: list[str]
    expires_at: Optional[str]
    days_remaining: Optional[int]
    scope: Optional[str]              # 'personal' | 'institution' | 'staff' | None
    institution: Optional[dict]       # {'id', 'name', 'plan_active'} | None
    lock_reason: Optional[str]        # 'no_subscription' | 'expired' | 'pending_approval' | None
    pending_request: Optional[dict]   # {'id', 'plan', 'created_at'} | None


def compute_access_status(user) -> AccessStatus:
    """Paywall removed — every authenticated caller is unconditionally
    treated as having active, open access. Anonymous callers still
    return the locked shape so unauth'd preview surfaces don't lie."""
    if not user or not user.is_authenticated:
        return {
            'has_active_access': False,
            'active_plans': [],
            'expires_at': None,
            'days_remaining': None,
            'scope': None,
            'institution': None,
            'lock_reason': 'no_subscription',
            'pending_request': None,
        }

    return {
        'has_active_access': True,
        'active_plans': ['open_access'],
        'expires_at': None,
        'days_remaining': None,
        'scope': 'personal',
        'institution': None,
        'lock_reason': None,
        'pending_request': None,
    }


def has_active_access(user) -> bool:
    """Convenience for permission classes."""
    return compute_access_status(user)['has_active_access']
