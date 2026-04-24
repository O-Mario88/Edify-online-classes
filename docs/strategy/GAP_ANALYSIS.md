# Gap Analysis — Maple Online School vs. Premium Product Strategy

**Date:** 2026-04-24
**Owner:** Product engineering
**Scope:** Audit current codebase against the four-product-line strategy (Maple Learner, Maple Teacher Pro, Maple School OS, Maple Intelligence) and identify gaps blocking clear positioning, trust, and conversion.

---

## 1. Executive summary

Maple already has most of the moving parts of a premium education platform: real dashboards for every role, a working grading loop, a study planner, a peer-tutoring hub, institution onboarding, a teacher storefront, and an AI copilot endpoint. The problem isn't breadth — it's **packaging**. The platform reads like a feature inventory (27+ routes, 20+ dashboard cards per role) rather than four clear promises, and the conversion-critical flows (diagnostic test, learning level report, school readiness score, parent progress preview) do not exist as branded entry points.

**One flagship flow is completely missing**: the Student diagnostic → Learning level report → AI study plan → Parent progress preview → payment CTA loop. That is the single largest conversion gap.

Secondary gaps: generic empty states; inconsistent product-line naming (the four lines are not called out anywhere except "Maple Intelligence" in the admin hub); landing page leads with classes, not audience-segmented outcomes; several developer-flavored surfaces leak into user dashboards.

---

## 2. What already exists (strong)

| Area | Where it lives | State |
|---|---|---|
| Student content loop (browse → view → track engagement) | `resources/content_views.py`, `StudentDashboard`, `StudentAssignmentsPanel` | **Verified** |
| Assessment authoring + submission + grading | `apps/assessments/`, `apps/grading/`, `TeacherGradingPanel`, `StudentAssignmentsPanel` | **Verified** |
| Teacher quick note | `TeacherQuickNote` + `lessons.views` | **Verified** |
| Auth: register, login, email verification, token blacklist | `accounts/views.py`, `apiClient.logoutUser` | **Verified** |
| Per-role dashboards with real APIs | `StudentDashboard`, `ParentDashboard`, `TeacherDashboard`, `AdminDashboard`, `InstitutionManagementPage` | Built, API-backed |
| Study planner (`SmartStudyPlanner` component) | `src/components/students/SmartStudyPlanner.tsx` + `intelligence/study-plans` | Built, wired in 4 dashboards |
| Teacher storefront (`TeacherStorefront`) | `src/pages/TeacherStorefront.tsx` + `marketplace/listings` | Built, demo data + real endpoints |
| Institution onboarding wizard | `InstitutionWizard` + `institutions/onboard-basic/` | Built |
| Independent teacher onboarding wizard | `IndependentTeacherWizard` + `marketplace/onboard-teacher/` | Built |
| School health score | `SchoolHealthScore` component + `intelligence/health/` | Built, real API |
| Next Best Actions | `NextBestActionQueue` + `intelligence/actions/` | Built, API-backed |
| Weekly parent AI summary | `ParentDashboard` calls `/ai/copilot/ask/` | Built, live |
| Exam War Room (P7 readiness UI shell) | `ExamWarRoomMode` component | Built, **mock data** |
| Peer tutoring marketplace | `PeerTutoringHub`, `tutoring/*` endpoints | Built |
| Marketplace + Pesapal checkout | `marketplace/*` + `pesapal-checkout/`, `pesapal-ipn/` | Built |
| Gamification (points, badges, challenges, houses) | `intelligence/{points,badges,challenges,houses}` | Built |
| Admin intelligence hub (story cards, funnels) | `MapleIntelligenceHub` | Built, mock data |

**Total:** ~80% of the *plumbing* for a premium product exists. The issue is presentation and conversion entry points.

---

## 3. Weak / unverified areas

| Area | Issue |
|---|---|
| P7 Readiness Dashboard | Fully built UI, **100% hardcoded mock data**, no API integration |
| `MapleIntelligenceHub` story cards & funnel KPIs | Hardcoded demo numbers — not wired to `intelligence/story-cards` |
| Learning Path page | Still a `FeatureNotReady` placeholder — even though `intelligence/study-plans` & `study-tasks` endpoints exist |
| Exercise + Projects pages | Placeholders. OK as stubs but not monetizable today |
| Admin dashboard | Leaks developer surfaces (Sync Data, Error Logs, Demo Environment Controller, Integration Observability) into the same surface as the business view |
| Institution fallback | Falls back to *hardcoded mock* data when API fails — this is anti-trust |
| Empty states across the app | Generic ("No data", "No upcoming sessions") with no next-step guidance |
| Public profiles | Student profile page shows literal "Profile Coming Soon" |

---

## 4. Missing (blocks conversion / payment)

Ordered by conversion impact.

| # | Missing feature | Blocks | Existing pieces we can build on |
|---|---|---|---|
| 1 | **Free Diagnostic Test** (public, no account needed for first question) | The single biggest sign-up hook. A prospect has nothing to try today without creating an account, and even then there's no guided "take this test" flow. | `assessments/*` exists; we need a curated public diagnostic set + a frontend flow |
| 2 | **Learning Level Report** | Post-diagnostic narrative with strong/weak subjects, recommended plan, upgrade CTA | `intelligence/passport/student/` + diagnostic results |
| 3 | **Parent progress preview** (demo view before payment) | Parents see abstract marketing copy instead of a realistic sample of the Weekly Child Progress Brief | `ParentDashboard` already has the shape — we need a public `/demo/parent` route with canned data |
| 4 | **School Digital Readiness Score** (public questionnaire → score + recommendations) | Institutions have no low-friction way to qualify themselves | `InstitutionWizard` captures some signals; we need a branded scoring endpoint |
| 5 | **Pricing / packages page** | No visible way to understand what's free vs paid vs add-on | `PaymentPage` exists but isn't package-structured |
| 6 | **AI Study Buddy chat surface** | The `/ai/copilot/ask/` endpoint exists and is used for parent summary, but there's no student-facing "Ask Maple Study Buddy" chat UI | Copilot endpoint + `StudentDashboard` |
| 7 | **Learning Passport page** | Spec calls for a proud "passport" view — we have points, badges, streaks in components but no passport page | `intelligence/passport/student/` endpoint exists |
| 8 | **Downloadable PDF reports** (Weekly Brief, Digital Report Card, Exam Readiness, Learning Passport) | Parent-worthy premium asset | Backend models exist; PDF generation is missing |
| 9 | **Teacher storefront publish flow** (make a real sample profile + one sample lesson public) | `TeacherStorefront` exists but assumes you're already monetizing | `IndependentTeacherWizard` + `marketplace/listings` |
| 10 | **Segmented landing page** — 4 audience sections with outcome copy + CTAs | Visitors can't self-identify in 5 seconds | `HomePage.tsx` — single existing file |

---

## 5. Naming gaps

Premium names not yet used in the UI:

| Premium name | Current name | Location |
|---|---|---|
| Maple Learner (product line) | — | Not named |
| Maple Teacher Pro (product line) | "independent_teacher" role only | Not named |
| Maple School OS (product line) | "Maple OS" once in footer | Not a consistent product term |
| Learning Passport | — | Not exposed, passport endpoint exists |
| Parent Confidence Report | — | — |
| Weekly Child Progress Brief | "Weekly Summary" | ParentDashboard |
| Maple Study Buddy | — | Copilot is unnamed |
| Exam Readiness Tracker | "Exam War Room Mode" | Institution dashboard |
| Verified Teaching Delivery | — | — |
| School Growth & Quality Dashboard | "Institution Health Dashboard" | Institution dashboard |
| School Digital Readiness Score | — | — |
| Teacher Earnings Studio | "Earnings Intelligence" / "Payout Status" | TeacherDashboard |
| Digital Report Card | "Report Cards" | Institution |
| Learner Risk Alert | "Red Alerts Panel" / "Risk Alerts" | Teacher & Institution |

---

## 6. Should hide from user-facing UI

| Surface | Current location | Where it belongs |
|---|---|---|
| "Sync Data" button | AdminDashboard | `/admin/dev` sub-route (platform admin only) |
| "Error Logs Panel" | AdminDashboard | `/admin/dev` |
| "Demo Environment Controller" | AdminDashboard | `/admin/dev` |
| "Integration Observability Panel" | AdminDashboard | `/admin/dev` |
| Raw API endpoint labels in dev tooling | Various | Already dev-only; don't change |
| Technical terms in copy (JWT, token, seeders) | — | Already absent from user copy |

---

## 7. Verified-flow files — DO NOT break

Keep behavior and API contract intact on:

- `src/pages/StudentDashboard.tsx` — content loop data flow & assignment list (headings/copy OK to change; data binding must stay)
- `src/components/students/StudentAssignmentsPanel.tsx` — submission flow
- `src/components/teachers/TeacherGradingPanel.tsx` — grading flow
- `src/components/teachers/TeacherQuickNote.tsx` and `TeacherQuickAssignment.tsx` — quick publish
- `src/pages/LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `AccountActivationPage.tsx`
- `src/lib/apiClient.ts` — auth & request helpers
- `edify_backend/apps/{accounts,assessments,grading,resources,lessons}/` — no signature changes without tests

Existing tests that **must keep passing**:
- `apps/accounts/tests.py` (StudentSliceTests, RegistrationThrottleTests, EmailVerificationTests, TokenBlacklistTests, PilotFeedbackTests)
- `apps/grading/tests.py` (GradingLoopTests)
- `tests/e2e/*.spec.ts` (Playwright verified flows)
- `apps/{intelligence,resources,analytics,marketplace}/test_tenant_isolation.py` (shipped in PR #13)

---

## 8. Verification status by revenue loop

| # | Loop | Status | Gap |
|---|---|---|---|
| 1 | Parent dashboard → child progress report → notification | **Partial** | AI summary works; no PDF report; no push/WhatsApp notification actually sent |
| 2 | Student diagnostic → study plan → progress report | **Missing** | No diagnostic flow exists |
| 3 | Teacher content upload → student purchase → teacher earnings | **Partial** | Pesapal checkout + payout API exist; end-to-end not exercised by a test |
| 4 | School portal → attendance → report card → parent view | **Partial** | Attendance & grading exist; "Digital Report Card" as a branded PDF doesn't |
| 5 | Live session → attendance → recording/recovery | **Partial** | `MissedSessionRecoveryPage` exists; end-to-end not tested |
| 6 | Exam readiness → mock test → revision plan | **UI only** | `ExamWarRoomMode` shows mock data; not wired to assessments |
| 7 | Institution dashboard → school health score | **Verified (real API)** | Name it "School Growth & Quality Dashboard" |

**Verification symbol legend:** Verified = end-to-end test covers it. Partial = UI + API present; no e2e test. Missing = feature absent. UI only = UI exists, backend wiring absent.
