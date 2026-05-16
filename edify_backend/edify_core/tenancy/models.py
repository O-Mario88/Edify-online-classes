"""TenantedModel — the abstract base that every per-school table inherits.

Subclassing this gives you:
  - a required `tenant` FK to `institutions.Institution` (indexed, PROTECT)
  - `Model.objects`        auto-filtered to the current tenant (raises if unset)
  - `Model.all_tenants`    unfiltered (audited escape hatch)

Usage:

    from edify_core.tenancy import TenantedModel

    class DailyRegister(TenantedModel):
        student = models.ForeignKey(...)
        record_date = models.DateField()
        status = models.CharField(...)

The migration that introduces the `tenant` column should be paired with a
data migration that backfills it from an already-existing relationship
(e.g. via `student.institution`). See docs/PHASE_1_SPINE.md for the
step-by-step recipe.
"""
from __future__ import annotations

from django.db import models

from .managers import TenantManager


class TenantedModel(models.Model):
    tenant = models.ForeignKey(
        'institutions.Institution',
        on_delete=models.PROTECT,
        db_index=True,
        related_name='+',
        help_text=(
            'The school (Institution) this row belongs to. Set automatically '
            'on save if a tenant context is active; required at the DB level '
            'so a row without tenant is structurally impossible.'
        ),
    )

    # Default manager — auto-filters by current tenant.
    objects = TenantManager()
    # Escape hatch — every use should be code-reviewed.
    all_tenants = models.Manager()

    class Meta:
        abstract = True
        base_manager_name = 'objects'

    def save(self, *args, **kwargs):
        """If no `tenant` is set, populate from the active context.

        Lets call sites write `DailyRegister.objects.create(student=...)`
        without remembering to set `tenant=` every time. If neither the
        instance nor the context provides one, save fails (the FK is non-null).
        """
        if self.tenant_id is None:
            # Import locally to avoid module-load cycles with apps that
            # import TenantedModel before institutions is ready.
            from .context import current_tenant

            tenant = current_tenant()
            if tenant is not None:
                self.tenant = tenant
        super().save(*args, **kwargs)
