# KNOWN_ISSUES.md

Issues discovered during Phase 1 exploration that are **not blocking** the student slice but need to be addressed later. Each entry: what, where, why it matters, and severity.

When you fix one, delete the entry.

---

## Frontend typecheck

### 1. 79 TypeScript errors at typecheck time

**Where:** various pages — `StudentDashboard`, `TeacherDashboard`, `TopicDetailPage`, `TeacherLessonStudio` are the biggest offenders.
**Symptom:** `npx tsc --noEmit -p tsconfig.app.json` reports 79 errors. Vite dev doesn't enforce these so the app still runs, but a strict build pipeline would fail.
**Root cause:** API responses typed as `unknown` or have shape drift relative to what the page expects (missing `class_id`/`subject_id`/`topic_id` on `ContinueLearningItem`; `kpis`/`contentPerformance` accessed on `unknown`).
**Impact:** No runtime error today, but future refactors will drift the shapes further without anyone noticing.
**Severity:** low — cosmetic today, compounding over time.
**Fix sketch:** establish proper response types in `src/lib/*.ts` and narrow `unknown` where the API is typed. Grind through one file per PR.

## Auth / security

### 2. Django `SECRET_KEY` is the dev default

**Where:** [edify_backend/edify_core/settings.py:28](../edify_backend/edify_core/settings.py#L28) — `django-insecure-...`
**Symptom:** fine in dev. Will be flagged by `python manage.py check --deploy` and is unsafe in any deployed environment.
**Severity:** high **before any deploy**, zero for local development.
**Fix sketch:** `SECRET_KEY = os.environ['DJANGO_SECRET_KEY']` with a dev fallback inside `if DEBUG`, document the env var in a new `.env.example`.

### 3. `UserRegistrationView` and `StudentOnboardingAPIView` use `AllowAny`

**Where:** [edify_backend/apps/accounts/views.py:9](../edify_backend/apps/accounts/views.py#L9) and [edify_backend/apps/accounts/views.py:22](../edify_backend/apps/accounts/views.py#L22).
**Symptom:** anyone on the internet can hit these endpoints, repeatedly. No rate limiting, no CAPTCHA, no email-verification loop.
**Impact:** spam registrations; potentially DoS the `StudentProfile.objects.create(...)` write path.
**Severity:** medium — needs a throttle class before going public.
**Fix sketch:** add `throttle_classes = [AnonRateThrottle]` with `DEFAULT_THROTTLE_RATES = {'anon': '10/hour'}` in settings; add email-verification step before profile activation.

## Data hygiene

### 4. DB contains users from a now-deleted seed script

**Symptom:** `db.sqlite3` has 586 users with emails like `studentN@edify.africa` from the legacy `seed_heavy.py` that was removed in commit `6659bd3`. If the DB is wiped, only `seed_demo_env` / `seed_full_platform` remain, which use different emails (`*.demo@edify.ug`, etc.).
**Impact:** docs / test expectations that hardcode the old emails will silently break. No such docs survived the Phase 0 cleanup, but worth noting.
**Severity:** informational. No action required unless the DB is wiped.
