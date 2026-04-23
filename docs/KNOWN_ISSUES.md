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
