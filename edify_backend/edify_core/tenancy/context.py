"""Thread-local tenant context.

The active tenant lives on a `threading.local()` so each request can set
its own scope without leaking into adjacent requests. Celery workers and
management commands explicitly call `tenant_context(...)` when they need
to query tenanted data.
"""
from __future__ import annotations

import threading
from contextlib import contextmanager
from typing import Iterator, Optional


class TenantNotSetError(RuntimeError):
    """Raised when a TenantedModel query runs without an active tenant.

    Almost always means a middleware bug, a forgotten `tenant_context(...)`
    wrapper in a Celery task, or a use of `Model.objects` from a script that
    should be using `Model.all_tenants` (the audited escape hatch).
    """


_state = threading.local()


def current_tenant() -> Optional[object]:
    """Return the tenant for the current thread, or None if unset.

    Returns an `Institution` instance (or anything the middleware sets), so
    callers can do `current_tenant().pk`. Callers that need an `Institution`
    specifically should check `isinstance(...)` themselves.
    """
    return getattr(_state, 'tenant', None)


def set_tenant(tenant: Optional[object]) -> None:
    """Set the tenant for the current thread. Prefer `tenant_context(...)`."""
    _state.tenant = tenant


def clear_tenant() -> None:
    """Clear the thread-local tenant. Middleware calls this on response."""
    _state.tenant = None


@contextmanager
def tenant_context(tenant: Optional[object]) -> Iterator[None]:
    """Set the tenant for the duration of a block, restoring the prior value.

    Use in Celery tasks, management commands, signal handlers, or anywhere
    that runs outside a middleware-wrapped request.

    Example:

        with tenant_context(school):
            DailyRegister.objects.create(...)
    """
    previous = current_tenant()
    set_tenant(tenant)
    try:
        yield
    finally:
        set_tenant(previous)
