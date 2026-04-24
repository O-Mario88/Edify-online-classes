# Implementation Plan — Premium Product Polish + Flagship Flow

> Companion to `GAP_ANALYSIS.md`. Ordered by user impact × risk. Every wave ships as its own PR with the verified test matrix green at the end.

---

## Ground rules

1. **Do not break verified flows.** Touching any file listed in `GAP_ANALYSIS.md §7` requires explicit justification and the existing tests must still pass.
2. **Auto mode still defers destructive/large changes.** Copy and empty-state tightening ships without asking. New routes, payment copy, and pricing pages are sized and proposed before coding.
3. **Hide, don't lie.** If a feature isn't wired yet, `FeatureNotReady` + a clear CTA to the working alternative. Never fall back to mock data in the main user view.
4. **Outcome-driven copy only.** "Know what to study next" beats "AI-powered engine". No unsupported guarantees ("guaranteed exam success" etc).

---

## Wave 1 — Packaging & naming (low risk, high leverage) **← starts now**

Goal: make the product lines visible and fix the biggest copy offenders, without changing any verified flow.

| # | Change | Files | Effort |
|---|---|---|---|
| 1.1 | Landing page: segment into 4 audience sections with outcome copy + role-targeted CTAs | `src/pages/HomePage.tsx` | 1 h |
| 1.2 | Dashboard headlines & card section titles — rename to premium product names (Weekly Child Progress Brief, Exam Readiness Tracker, Teacher Earnings Studio, School Growth & Quality Dashboard, etc.) | `src/pages/{Student,Parent,Teacher,Admin}Dashboard.tsx`, `InstitutionManagementPage.tsx` | 1 h |
| 1.3 | Empty states upgrade — outcome-driven copy for 12 most-hit empty states | same files + `SmartStudyPlanner`, `TeacherStorefront`, `MarketplacePage`, `LiveSessionsPage`, `PeerTutoringHub`, `StudentAssignmentsPanel` (copy only, no logic) | 45 min |
| 1.4 | Navigation polish — a few labels ("Learning Path" → "My Study Plan", "AI Assistant" → "AI Teacher Assistant", etc.) | `src/components/navigation/TopNavbar.tsx`, `Layout.tsx` footer | 20 min |
| 1.5 | P7 Readiness — relabel "Exam War Room" → "Exam Readiness Tracker" and add a prominent "Estimate based on available evidence" disclaimer | `InstitutionManagementPage.tsx`, `ExamWarRoomMode.tsx`, `P7ReadinessDashboard.tsx` | 20 min |

**Guard-rail tests that must stay green after Wave 1:**
- Full Django suite
- Vitest frontend suite (13 tests)
- Playwright smoke (6 tests)

Ships as PR: **premium-product-polish**.

---

## Wave 2 — Demo previews & trust layer (medium risk)

Goal: give prospects real-feeling previews before they pay, and add visible trust markers.

| # | Change | Files |
|---|---|---|
| 2.1 | Public `/demo/parent` route — canned Weekly Child Progress Brief with clear "This is a sample" banner | new `src/pages/demo/ParentReportDemo.tsx` + route in `App.tsx` |
| 2.2 | Public `/demo/student` route — canned Learning Level Report shape | new `src/pages/demo/StudentReportDemo.tsx` |
| 2.3 | Trust footer on dashboards — "Progress insights are generated from lesson completion, assessment results, attendance, and teacher feedback. Last updated: {timestamp}" | shared small component used by each dashboard |
| 2.4 | Verified Teaching Delivery badge definition + component | `src/components/trust/VerifiedDeliveryBadge.tsx` |
| 2.5 | Move developer surfaces off `AdminDashboard` into `/dashboard/admin/dev` | `AdminDashboard.tsx` + new `AdminDevPage.tsx` |
| 2.6 | Replace institution dashboard *mock fallback* with real empty state | `InstitutionManagementPage.tsx` |

Ships as PR: **demo-previews-and-trust**.

---

## Wave 3 — Flagship conversion flow (the one thing that matters most)

Goal: build the flagship **Diagnostic → Learning Level Report → AI Study Plan → Parent Progress Preview → Payment CTA** journey. This is the strongest lever for sign-ups.

| # | Change | Files |
|---|---|---|
| 3.1 | Public `GET /api/v1/diagnostic/config/` returning 8–10 curated diagnostic questions per class-level | new `apps/diagnostics/` app or reuse `assessments/` |
| 3.2 | Public `POST /api/v1/diagnostic/submit/` returning a scored report payload (strong subjects, weak subjects, recommended plan skeleton) — anonymous allowed, result token returned | new endpoint |
| 3.3 | `/diagnostic` frontend flow — 5 screens: intro → class-level → questions → submit → report | new `src/pages/diagnostic/*.tsx` |
| 3.4 | Learning Level Report UI — premium card layout with strong/weak subjects, recommended AI study plan preview, and two CTAs: "Unlock full study plan" (→ `/register?from=diagnostic`) and "Send this to a parent" (→ email the report) | `src/pages/diagnostic/LearningLevelReport.tsx` |
| 3.5 | AI Study Plan preview — first 7 days of the plan visible publicly; remainder locked behind upgrade | reuse `SmartStudyPlanner` in read-only mode with `previewMode` prop |
| 3.6 | Parent progress preview banner — "Your parent can receive a weekly brief like this →" | links to `/demo/parent` from Wave 2 |
| 3.7 | Payment CTA blocks throughout the flow — "Unlock Learner Plus" / "Unlock Parent Premium" with clear what-you-get copy | reuse or extend `PaymentPage.tsx` |

Ships as PR: **flagship-diagnostic-flow**.

**Tests:**
- Backend: `apps/diagnostics/tests.py` — anonymous can fetch config + submit + receive report (200 + token), authenticated user can bind report to their account on sign-up.
- Playwright: `tests/e2e/diagnostic.spec.ts` — take diagnostic, see report, click "Unlock full plan" → lands on pricing.
- Vitest: component tests for `LearningLevelReport` and `DiagnosticQuestion`.

---

## Wave 4 — Payment-worthy features (visibility & packaging)

Goal: make pricing and premium features legible. Do not rebuild features — surface them.

| # | Change | Files |
|---|---|---|
| 4.1 | Pricing page — 6 tiers (Free / Learner Plus / Parent Premium / Teacher Pro / School OS / School OS Plus) with what-you-get bullets and audience-appropriate CTAs | new `src/pages/PricingPage.tsx` + route |
| 4.2 | Payment page copy rewrite per package — "Unlock Parent Premium to receive weekly progress briefs, attendance alerts, teacher feedback, and exam readiness insights for your child." | `PaymentPage.tsx` |
| 4.3 | Upgrade prompts on locked features — `PremiumGate` component refinement | `src/components/ui/PremiumGate.tsx` |
| 4.4 | Teacher Earnings Studio — rename & layout polish on existing `TeacherEarningsPage` | `TeacherEarningsPage.tsx` |

Ships as PR: **pricing-and-payment-polish**.

---

## Wave 5 — Reports as premium assets

Goal: downloadable PDFs for the parent & school artefacts.

| # | Change | Files |
|---|---|---|
| 5.1 | Backend PDF generation — `weasyprint` or `reportlab`; 5 templates: Weekly Child Progress Brief, Digital Report Card, Exam Readiness Report, Teacher Delivery Report, Learning Passport Certificate | new `apps/reports/` |
| 5.2 | Endpoint per report: `GET /api/v1/reports/weekly-brief/<child_id>/?week=...` returns signed URL to a generated PDF | `apps/reports/views.py` |
| 5.3 | "Download report" buttons where the report currently renders inline | `ParentDashboard`, `InstitutionManagementPage` |

Ships as PR: **pdf-reports**. Not before Waves 1–3.

---

## Wave 6 — Verification (catch up tests)

Goal: make the 7 revenue loops have a test each.

| # | Loop | Test |
|---|---|---|
| 6.1 | Parent dashboard → weekly brief | Playwright: authenticate as parent, confirm brief renders from real API |
| 6.2 | Student diagnostic → study plan | Playwright: anonymous → diagnostic → report → "Unlock" CTA |
| 6.3 | Teacher upload → student purchase → teacher earnings | Django integration test through Pesapal sandbox mock |
| 6.4 | School portal → attendance → report card → parent view | Django test chaining the four endpoints |
| 6.5 | Live session → attendance → recovery | Playwright happy path |
| 6.6 | Exam readiness → mock test → revision plan | Backend test; UI already exists |
| 6.7 | Institution dashboard → school health score | Already verified (keep passing) |

Ships as PR: **revenue-loop-verification**.

---

## Out of scope for this round

These are useful but do not block conversion:
- WhatsApp outbound delivery (currently the hub exists but there's no proof-of-delivery pipeline)
- Full course-creation UI for teachers (quick-assignment covers the verified flow)
- Advanced rubric grading
- Live-class video bridge (external service, not a feature to build)
- Public student profiles (stays "coming soon" deliberately — privacy)

---

## Quality bar per PR

Before merging any wave:
- All verified-flow tests pass
- No new `console.error` in the Playwright audit-crawl
- No developer terms in user-facing copy
- No unsupported promises in copy
- Mobile layout spot-check on one page per wave
- `docs/strategy/IMPLEMENTATION_PLAN.md` updated with "DONE" markers

---

## Status tracker

| Wave | PR | Status |
|---|---|---|
| 1 — Packaging & naming | `premium-product-polish` | In progress |
| 2 — Demo previews & trust | — | Proposed |
| 3 — Flagship diagnostic flow | — | Proposed |
| 4 — Pricing & payment polish | — | Proposed |
| 5 — PDF reports | — | Proposed |
| 6 — Revenue loop verification | — | Proposed |
