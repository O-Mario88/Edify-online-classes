"""Multi-tenancy primitives for Maple.

Public API:

    from edify_core.tenancy import (
        TenantedModel,             # base class for tenant-scoped models
        current_tenant,            # read the thread-local active tenant
        tenant_context,            # contextmanager: set tenant for a block
        TenantNotSetError,         # raised when querying without context
        TenantMiddleware,          # Django middleware that resolves tenant
        IsTenantMember,            # DRF permission: must belong to current tenant
        CrossTenantDenialTestMixin,# mandatory test helper for new viewsets
    )

Design intent: a row leak across tenants must be *structurally* impossible,
not merely caught by a code reviewer. Forgetting to filter `.objects.all()`
on a tenanted model raises at query time, so the bug shows up in dev/CI
instead of in production. The mandatory cross-tenant test on every viewset
catches the cases that bypass the manager (raw SQL, .all_tenants, etc.).

See docs/PHASE_1_SPINE.md for the migration plan.
"""
from .context import (
    current_tenant,
    set_tenant,
    clear_tenant,
    tenant_context,
    TenantNotSetError,
)
from .managers import TenantManager
from .middleware import TenantMiddleware
from .models import TenantedModel
from .permissions import IsTenantMember
from .testing import CrossTenantDenialTestMixin

__all__ = [
    'TenantedModel',
    'TenantManager',
    'TenantMiddleware',
    'IsTenantMember',
    'CrossTenantDenialTestMixin',
    'current_tenant',
    'set_tenant',
    'clear_tenant',
    'tenant_context',
    'TenantNotSetError',
]
