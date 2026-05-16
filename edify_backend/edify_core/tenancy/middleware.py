"""TenantMiddleware — resolves the active tenant for each request.

Resolution order:
  1. Request header `X-Tenant-Id` (explicit caller choice — required when a
     user belongs to more than one school).
  2. The user's single active `InstitutionMembership`. If exactly one, use it.
  3. Otherwise: leave tenant unset. The viewset must either filter explicitly
     (using `Model.all_tenants` with care) or 403.

Anonymous requests leave tenant unset; the auth permission classes already
gate the rest.

Place this middleware AFTER `AuthenticationMiddleware` so `request.user` is
populated by the time we resolve.
"""
from __future__ import annotations

from typing import Callable, Optional

from .context import set_tenant, clear_tenant


def _resolve_from_header(request) -> Optional[int]:
    raw = request.META.get('HTTP_X_TENANT_ID')
    if not raw:
        return None
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None


def _resolve_from_memberships(user) -> Optional[object]:
    """Return the user's tenant if it's unambiguous.

    Active memberships only. If the user has memberships in more than one
    school, return None and let the caller demand an explicit header.
    """
    if not user or not user.is_authenticated:
        return None

    # Local import — institutions app may not be fully loaded at middleware
    # import time.
    from institutions.models import InstitutionMembership

    active = list(
        InstitutionMembership.objects.filter(
            user=user, status='active'
        ).select_related('institution')[:2]
    )
    if len(active) == 1:
        return active[0].institution
    return None


class TenantMiddleware:
    """Set the tenant context for every request, clear it on the way out.

    Idempotent — safe to nest behind other middleware. Survives middleware
    re-entry under WSGI because the thread-local is always cleared in
    `finally`.
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        tenant = self._resolve(request)
        set_tenant(tenant)
        try:
            return self.get_response(request)
        finally:
            clear_tenant()

    def _resolve(self, request):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None

        # Explicit header wins — required for multi-membership users.
        header_id = _resolve_from_header(request)
        if header_id is not None:
            # Local import (see above).
            from institutions.models import InstitutionMembership

            membership = InstitutionMembership.objects.filter(
                user=user, institution_id=header_id, status='active'
            ).select_related('institution').first()
            if membership is not None:
                return membership.institution
            return None

        return _resolve_from_memberships(user)
