"""Tenant-aware Django manager.

`Model.objects` on a TenantedModel auto-filters by the active tenant. If
no tenant is set, it raises rather than returning a too-broad queryset.
`Model.all_tenants` is the audited escape hatch for admin, scripts, and
explicitly cross-tenant queries.
"""
from __future__ import annotations

from django.db import models

from .context import current_tenant, TenantNotSetError


class TenantManager(models.Manager):
    """Auto-filters querysets to the active tenant.

    Refuses to return anything when no tenant is set — this is intentional:
    a script or background job that forgot `tenant_context(...)` should
    fail loudly, not silently return the wrong rows or zero rows.
    """

    # Allow Django to use this manager during related-object lookups. Without
    # this flag, Django falls back to `_base_manager` for joins, which is fine,
    # but setting it explicitly documents intent.
    use_in_migrations = True

    def get_queryset(self):
        tenant = current_tenant()
        if tenant is None:
            raise TenantNotSetError(
                f"Refusing to query {self.model.__name__} without an active "
                f"tenant context. If this is intentional (admin / cross-tenant), "
                f"use {self.model.__name__}.all_tenants instead of .objects."
            )
        return super().get_queryset().filter(tenant=tenant)
