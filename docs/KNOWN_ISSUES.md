# KNOWN_ISSUES.md

Issues discovered during Phase 1 exploration that are **not blocking** the student slice but need to be addressed later. Each entry: what, where, why it matters, and severity.

When you fix one, delete the entry.

---

## Auth / security

### 1. Registration / onboarding still need email verification

**Where:** [edify_backend/apps/accounts/views.py](../edify_backend/apps/accounts/views.py)
**Symptom:** `UserRegistrationView` and `StudentOnboardingAPIView` carry a `ScopedRateThrottle` at 20/hour per IP, so abuse is bounded — but accounts are still created without email confirmation.
**Impact:** someone can sign up with any email address (including one that isn't theirs) and gain a usable account.
**Severity:** medium — needs an activation loop before going public.
**Fix sketch:** issue an activation token on register, gate login/onboarding on a confirmed email. Reuse Django's `default_token_generator` + an `AccountActivationView`.
