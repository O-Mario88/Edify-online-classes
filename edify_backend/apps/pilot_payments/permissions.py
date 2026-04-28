"""DRF permission class — paywall has been removed.

`IsActiveSubscription` is kept as an importable symbol so existing
ViewSets that list it in `permission_classes` continue to load without
churn, but the class is now a no-op that always grants access.

`SubscriptionRequired` is preserved purely as a type so any handler
catching it stays valid; it is no longer raised anywhere.
"""
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied


class SubscriptionRequired(PermissionDenied):
    """Legacy 403 wrapper — no longer raised by this codebase."""
    status_code = 403

    def __init__(self, lock_reason: str = 'no_subscription'):
        super().__init__({
            'detail': 'Subscription required.',
            'code': 'subscription_required',
            'lock_reason': lock_reason,
        })


class IsActiveSubscription(BasePermission):
    """Always allow. The paywall has been removed platform-wide."""

    def has_permission(self, request, view) -> bool:  # noqa: ARG002
        return True
