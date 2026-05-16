"""DRF permission classes for tenant-scoped viewsets.

`IsTenantMember` is the v1 default for any viewset operating on tenanted
models. It rejects authenticated users who don't have a resolved tenant
(typically: multi-school users who didn't send `X-Tenant-Id`).

Role-narrowing permissions (`IsTenantAdmin`, `IsTenantTeacher`, ...) compose
on top of it. They're concrete subclasses rather than a metaclass dance so
they grep cleanly.
"""
from __future__ import annotations

from rest_framework.permissions import BasePermission

from .context import current_tenant


class IsTenantMember(BasePermission):
    """User must be authenticated *and* a tenant must be resolved.

    Does NOT check role — pair with one of the role-narrowing classes below
    when a viewset is admin-only or teacher-only.
    """

    message = (
        'Tenant context required. Send X-Tenant-Id if your account belongs '
        'to more than one school.'
    )

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return current_tenant() is not None


class _RoleScoped(IsTenantMember):
    """Internal — narrow IsTenantMember to a specific membership role."""

    role: str = ''  # override in subclasses

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        # Local import — see middleware.py.
        from institutions.models import InstitutionMembership

        return InstitutionMembership.objects.filter(
            user=request.user,
            institution=current_tenant(),
            role=self.role,
            status='active',
        ).exists()


class IsTenantAdmin(_RoleScoped):
    """Head teacher / deputy / DOS — full school-admin access."""
    role = 'headteacher'  # extend with multi-role match if needed
    message = 'School-admin role required for this action.'


class IsTenantTeacher(_RoleScoped):
    role = 'class_teacher'
    message = 'Teacher role required for this action.'
