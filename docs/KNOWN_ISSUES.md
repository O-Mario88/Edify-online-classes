# KNOWN_ISSUES.md

Issues discovered during Phase 1 exploration that are **not blocking** the student slice but need to be addressed later. Each entry: what, where, why it matters, and severity.

When you fix one, delete the entry.

---

## Frontend typecheck

### 1. TypeScript errors at typecheck time

**Where:** various pages — `StudentDashboard`, `TeacherDashboard`, `TopicDetailPage` are the biggest offenders.
**Symptom:** `./node_modules/.bin/tsc --noEmit -p tsconfig.app.json` reports errors. Vite dev doesn't enforce these so the app still runs, but a strict build pipeline would fail.
**Root cause:** API responses typed as `unknown` or have shape drift relative to what the page expects (missing `class_id`/`subject_id`/`topic_id` on `ContinueLearningItem`; `kpis`/`contentPerformance` accessed on `unknown`).
**Impact:** No runtime error today, but future refactors will drift the shapes further without anyone noticing.
**Severity:** low — cosmetic today, compounding over time.
**Fix sketch:** establish proper response types in `src/lib/*.ts` and narrow `unknown` where the API is typed. Grind through one file per PR.

### 2. Registration / onboarding still need email verification

**Where:** [edify_backend/apps/accounts/views.py](../edify_backend/apps/accounts/views.py)
**Symptom:** `UserRegistrationView` and `StudentOnboardingAPIView` now carry a `ScopedRateThrottle` at 20/hour per IP, so abuse is bounded — but accounts are still created without email confirmation.
**Impact:** someone can sign up with any email address (including one that isn't theirs) and gain a usable account.
**Severity:** medium — needs an activation loop before going public.
**Fix sketch:** issue an activation token on register, gate login/onboarding on a confirmed email. Reuse Django's `default_token_generator` + an `AccountActivationView`.
