# KNOWN_ISSUES.md

Issues discovered during Phase 1 exploration that are **not blocking** the student slice but need to be addressed later. Each entry: what, where, why it matters, and severity.

When you fix one, delete the entry.

---

## Frontend type hygiene

### 1. `any` type annotations across src/

**Where:** scattered — heaviest in [AuthContext.tsx](../src/contexts/AuthContext.tsx) and [StudentOnboardingForm.tsx](../src/components/institutions/StudentOnboardingForm.tsx) (10 each), several pages at 4–6.
**Symptom:** `grep -rE ":\s*any\b|<any>|\bas any\b" --include="*.ts" --include="*.tsx" src/` → many hits. Typecheck is 0-error, but these spots defeat the compiler's help and mask contract drift.
**Impact:** future refactors won't fail loudly when API shapes change — same failure mode we fixed in TopicDetailPage/StudentDashboard earlier but still latent elsewhere.
**Severity:** low — cosmetic today, compounding.
**Fix sketch:** type them in concentric rings: API response types (`src/lib/*.ts`) first, then hooks, then page-level. One PR per module; don't try to do them all at once.

## Phase 4.3 — grading loop UI still to ship

### 2. Teacher "assign" + student "submit" + teacher "grade" UIs

**Where:** frontend only. Backend contract and tests already shipped in the Phase 4.3 PR.
**Symptom:** the full grading loop is proven at the HTTP layer (`grading.tests.GradingLoopTests` — 5 tests green) and the endpoints enforce the right permission model, but there's no UI that drives it. The existing `AssignmentTargetingStudio` page is a mock.
**Impact:** teachers and students can't use the flow without writing API calls by hand.
**Severity:** medium — next session's work.
**Fix sketch:**

- Teacher form on `TeacherLessonStudio` or a new page: title + instructions + `is_published` toggle → `POST /api/v1/assessments/assessment/`.
- Student page that lists `/api/v1/assessments/assessment/`, shows one, and POSTs a text answer to `/api/v1/assessments/submission/`.
- Teacher-grade form reachable from the student's submission list; POSTs to `/api/v1/grading/records/` with `{submission, score, teacher_feedback}`.
- Playwright e2e spec replaying the full loop over HTTP.
