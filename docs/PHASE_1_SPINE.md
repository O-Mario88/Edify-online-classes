# Phase 1 spine — tenant isolation rollout

> Phase 0 archived out-of-scope apps and cleaned the design system.
> Phase 1 makes multi-tenant isolation **structurally impossible to forget**.
>
> This doc is the migration plan. The framework code already lives in
> `edify_backend/edify_core/tenancy/`. We're now rolling it out across the
> in-scope models, one or two at a time, until every per-school row is
> isolated by construction.

## Why tenant_id + middleware (not schema-per-tenant)

| Dimension | Shared DB + `tenant_id` *(chosen)* | Schema-per-tenant |
|---|---|---|
| Migration cost from current state | Low | Very high — need to relocate every row |
| Operational cost | One DB, one migration | N schemas, fan-out migrations |
| Worst-case data leak | A bug in `get_queryset()` | A bug in schema selection middleware |
| Mitigation | Base-class manager raises if unscoped + mandatory cross-tenant test | Same — both rely on a single chokepoint |
| Scales to N schools | ~thousands easily on Postgres | Hundreds before per-schema migration cost dominates |
| Migration if we change our mind | Hard but doable (per-row sharding) | Easy back to shared (per-schema dump) |

At <500 schools (our 12-month target), `tenant_id` is the right call. STRATEGY.md decision 6 stands.

## The framework (already in this PR)

```
edify_core/tenancy/
├── context.py      # thread-local: current_tenant(), tenant_context(...)
├── managers.py     # TenantManager — auto-filters, raises if unscoped
├── models.py       # TenantedModel — abstract base, FK to Institution
├── middleware.py   # TenantMiddleware — resolves tenant from JWT user / header
├── permissions.py  # IsTenantMember + role variants
├── testing.py      # CrossTenantDenialTestMixin — mandatory test
└── tests.py        # framework self-tests
```

**Public API:**

```python
from edify_core.tenancy import (
    TenantedModel,                  # base class
    current_tenant, tenant_context, # context primitives
    TenantNotSetError,              # raised on un-scoped query
    TenantMiddleware,               # add to MIDDLEWARE in settings
    IsTenantMember,                 # default permission for tenanted views
    CrossTenantDenialTestMixin,     # mandatory test for new viewsets
)
```

## The rollout sequence

Convert one app per PR. Each conversion is small (one model → one migration → one viewset → one isolation test) and lands behind tests. The order is chosen so the *wedge workflow* gets isolated first.

| Order | App / model | Why this order |
|---|---|---|
| 1 | `attendance.DailyRegister` | First wedge surface — daily teacher use, parent notifications keyed to it |
| 2 | `attendance.LessonAttendance` | Same module; pair with #1 |
| 3 | `classes.Class` + `classes.ClassEnrollment` | Wedge depends on class membership |
| 4 | `grading.SubjectGrade`, `GradeRecord`, `ReportCard` | Second wedge surface — marks entry |
| 5 | `parent_portal.WeeklySummary`, `RiskAlert` | Notification surface |
| 6 | `lessons.Lesson*`, `LessonNote`, `LessonAttendance` (legacy) | Content surface |
| 7 | `resources.ContentItem` + relatives | Big — split into sub-PRs by sub-model |
| 8 | `assessments.*`, `exams.*` | Tail |

`accounts.User`, `institutions.Institution`, `institutions.InstitutionMembership`, and `curriculum.*` are **deliberately not tenanted** — they're the cross-tenant identity / configuration spine.

## Per-app conversion recipe

For each app on the list, follow these steps. Estimated effort per app: 1–3 hours including review.

### 1. Make the model inherit `TenantedModel`

```python
# Before
class DailyRegister(models.Model):
    student = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    record_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

# After
from edify_core.tenancy import TenantedModel

class DailyRegister(TenantedModel):
    student = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    record_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
```

That's the whole code change. `TenantedModel` injects the `tenant` FK, swaps in the auto-filtering manager, and keeps the `all_tenants` escape hatch.

### 2. Generate the schema migration

```sh
./venv/bin/python manage.py makemigrations attendance
```

This produces a migration that **adds** `tenant_id` as nullable. We backfill it before flipping to non-null.

### 3. Write the data migration

In the same migration file (or a new one immediately after), backfill `tenant_id`. For `DailyRegister`, the tenant is reachable via `student.institution_memberships.first().institution`:

```python
def backfill_tenant(apps, schema_editor):
    DailyRegister = apps.get_model('attendance', 'DailyRegister')
    InstitutionMembership = apps.get_model('institutions', 'InstitutionMembership')

    # Bulk-load student -> institution mapping (one query, not N).
    student_tenant = {
        m.user_id: m.institution_id
        for m in InstitutionMembership.objects.filter(status='active')
    }
    rows = []
    for r in DailyRegister.objects.all().iterator():
        tenant_id = student_tenant.get(r.student_id)
        if tenant_id is None:
            # Decide policy: delete orphan rows, or attach to a sentinel tenant.
            # Default for pilot data: log + delete.
            r.delete()
            continue
        r.tenant_id = tenant_id
        rows.append(r)
        if len(rows) >= 1000:
            DailyRegister.objects.bulk_update(rows, ['tenant_id'])
            rows.clear()
    if rows:
        DailyRegister.objects.bulk_update(rows, ['tenant_id'])
```

### 4. Flip the column to non-null

A second migration drops `null=True` and adds the DB index:

```python
operations = [
    migrations.AlterField(
        model_name='dailyregister',
        name='tenant',
        field=models.ForeignKey(
            to='institutions.institution',
            on_delete=django.db.models.deletion.PROTECT,
            db_index=True,
            related_name='+',
        ),
    ),
]
```

### 5. Update the viewset

```python
# Before
class DailyRegisterViewSet(viewsets.ModelViewSet):
    queryset = DailyRegister.objects.all()  # <- the bug. Returns all schools.
    serializer_class = DailyRegisterSerializer
    permission_classes = [IsAuthenticated]

# After
from edify_core.tenancy import IsTenantMember

class DailyRegisterViewSet(viewsets.ModelViewSet):
    queryset = DailyRegister.objects.all()  # Now auto-filtered to current tenant.
    serializer_class = DailyRegisterSerializer
    permission_classes = [IsTenantMember]
```

The `.all()` call still works because `TenantedModel.objects` is the tenant-filtering manager. The viewset doesn't need to call `.filter(institution=...)` anywhere.

### 6. Write the mandatory isolation test

```python
from datetime import date
from django.test import TestCase
from edify_core.tenancy import CrossTenantDenialTestMixin, tenant_context
from attendance.models import DailyRegister


class DailyRegisterIsolationTests(CrossTenantDenialTestMixin, TestCase):
    list_url = '/api/v1/attendance/daily/'

    def make_row(self, tenant):
        # Build whatever fixtures the row needs, scoped to `tenant`.
        student = make_student_for(tenant)  # helper that uses tenant_context
        with tenant_context(tenant):
            return DailyRegister.objects.create(
                student=student,
                record_date=date.today(),
                status='present',
            )
```

CI must run this test for every tenanted app. We'll add a pre-merge check in a follow-up that **fails CI if a new viewset doesn't have a paired isolation test.**

### 7. Land the PR

Each conversion ships as its own PR. Tests pass. Done.

## Wiring the middleware (one-time, in this rollout)

Once the first model is converted, add to `edify_core/settings.py`:

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'edify_core.tenancy.TenantMiddleware',  # <-- after auth, before view
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

Order matters: AuthenticationMiddleware populates `request.user`; TenantMiddleware reads it. CSRF must be earlier so unauthenticated requests can still post without a tenant.

## Edge cases and what to do about them

### Background jobs / Celery tasks

Celery workers don't get the middleware. Wrap any tenanted query in an explicit context:

```python
@shared_task
def send_weekly_digest(school_id):
    from institutions.models import Institution
    school = Institution.objects.get(pk=school_id)
    with tenant_context(school):
        # ...all tenanted queries here run scoped to `school`...
        digest_for_each_parent()
```

### Management commands and one-off scripts

Same pattern — explicit `tenant_context(...)`. If a script needs to operate across schools (e.g. nightly aggregate), use `Model.all_tenants` and document why in a comment.

### Admin views

Django admin runs without `TenantMiddleware` because admin is cross-tenant by definition. Admin model registrations should use `all_tenants` in `get_queryset`:

```python
class DailyRegisterAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        return DailyRegister.all_tenants.all()
```

### Multi-school users (head office staff, support, founders)

A user in two schools must send `X-Tenant-Id: <institution_id>` on every request. The frontend (Phase 2) gains a school-switcher in the top nav that sets a default, persisted in localStorage and sent automatically by `apiClient`.

### What if `tenant` is null somehow?

The DB constraint (`on_delete=PROTECT`, non-null) prevents this in production. In dev, if you see a row without a tenant, you've used `all_tenants.create(...)` and forgot to set the FK. That's a bug — fail loudly in tests.

## The hardening test we add to CI

A small Python script (call it `scripts/audit_tenancy.py`) walks every `viewsets.ModelViewSet` whose `queryset.model` inherits from `TenantedModel` and asserts:

1. The viewset has a `CrossTenantDenialTestMixin`-derived test class in its app's `tests.py`.
2. The viewset's `permission_classes` includes `IsTenantMember` (or a subclass).
3. The viewset doesn't override `get_queryset()` to call `.all_tenants` without a `# audit: cross-tenant intentional because …` comment.

CI fails if any check fails. This is the structural enforcement layer that makes "I forgot to scope this" impossible.

## What we do NOT do in Phase 1

- Don't convert `accounts.User`, `institutions.Institution`, `institutions.InstitutionMembership`, `curriculum.*`. These are intentionally cross-tenant.
- Don't add field-level encryption. Premature — we have tenant separation, not data classification.
- Don't add per-tenant rate limits yet. DRF's default user/anon throttle is enough for pilot. Revisit at 10+ schools.
- Don't introduce a `tenants` Django app. Keep tenancy primitives in `edify_core` so domain apps depend on framework, not on a peer app.

## Done criteria for Phase 1

- [ ] `TenantMiddleware` in `MIDDLEWARE` (this PR or first conversion PR)
- [ ] 8 in-scope tenanted apps converted (per the order table above)
- [ ] Every converted app has a `CrossTenantDenialTestMixin` test that passes
- [ ] `scripts/audit_tenancy.py` runs in CI, reports zero violations
- [ ] Admin views audited — every `get_queryset` either filters by tenant or uses `all_tenants` with a comment
- [ ] One Celery task in the codebase demonstrates the `tenant_context(...)` pattern (the parent weekly digest, when it ships)
- [ ] STATUS.md updated — flip rows from `unverified` to `tenant-verified` as each lands

When the boxes are checked, a junior engineer can write `Model.objects.all()` and the framework will catch the leak before merge. That's the bar.
