# Maple Roadmap v2 — Independent Online School

**Positioning:** Maple is primarily an **intelligent independent online school**. Institution discovery is a secondary optional pathway for learners who later want in-person schooling. Every feature must support at least one of: learning progress, teacher support, parent trust, exam readiness, or school growth.

**Last updated:** 2026-04-24
**Supersedes:** `GAP_ANALYSIS.md` and `IMPLEMENTATION_PLAN.md` (kept for historical context; this doc is the current source of truth).

---

## 1. What's already shipped

| PR | Theme | Shipped |
|---|---|---|
| #14 | Premium product polish | Landing 4-audience section; dashboards renamed; 8 empty states upgraded; nav labels; Exam Readiness Tracker rename |
| #15 | **Flagship diagnostic flow** | `apps/diagnostics/` — signup → auto-sampled diagnostic → in-app HTML Learning Level Report with 7-day study plan preview (3 unlocked, 4 locked behind Learner Plus) |
| #16 | Institution Discovery phase 1 | `apps/institution_discovery/` — recommended schools cards on Student + Parent dashboards, full profile page with 8-component Maple Activeness Score + explanation |
| #17 | Mastery phase 1 — **Tracks** | `apps/mastery/` — MasteryTrack/Module/Item/Enrollment; browse, enroll, progress, mark-item-complete; polymorphic FK to existing ContentItem / Assessment / LiveSession |
| #18 | Mastery phase 2 — **Practice Labs** | `apps/practice_labs/` — Learn → Try → Hint → Submit → Feedback → Retry → Badge; server-side auto-grading for MCQ + short_answer |
| #19 | Mastery phase 3 — **Projects + Mentor Reviews** | `apps/mastery_projects/` + `apps/mentor_reviews/` — rubric-driven project reviews with artifacts; ad-hoc essay/exam/study-plan review requests |
| #20 | Mastery phase 4 — **Passport + Credentials** | `apps/passport/` — LearningPassport with public-share token; stackable Credentials with anonymous `/verify/<code>/` endpoint; issuing auto-writes a passport entry |
| #21 | Mastery phase 5 — **Exam Simulator** | `apps/exam_simulator/` — timed mocks reusing `assessments.Question`; per-track readiness bands; every wrong answer auto-persists to MistakeNotebookEntry with retry workflow |
| #22 | Mastery phase 6 — **Admission Passport** | `apps/admission_passport/` — full admission application state machine; submit auto-snapshots the passport share token; institution admin inbox with inline passport link |

**Cumulative new Django tests:** 47 (all green). TypeScript clean across the stack. 13/13 Vitest on every PR.

---

## 2. What's STILL not shipped

Flagged against your v2 spec (post-PR #22):

| # | Feature | Status | Priority |
|---|---|---|---|
| A | **Standby Teacher Network** (new `apps/standby_teachers/`) — TeacherAvailability, SupportRequest, SupportSession | Missing | **High (next)** |
| B | **Pricing / Packages page** (`/pricing` route) — 6 tiers with outcome copy | Missing | **High (next)** |
| C | **Today's Learning Plan priority** on Student Dashboard — lift above KPI strip | Partial (SmartStudyPlanner exists but isn't the first thing seen) | **High** |
| D | **Parent Proof of Progress** polish — Weekly Child Progress Brief surfaced at the top, Teacher Support Summary card, Learning Passport embed | Partial (weekly summary exists; needs re-ranking + new Teacher Support card) | **High** |
| E | **Learning Cohorts** (new app) — teacher-led PLE/UCE cohorts with start date, weekly plan, certificate | Missing | Medium |
| F | **Maple Teacher Studio** rename + reordered sections (My Courses / My Live Classes / My Practice Labs / My Mastery Projects / Review Queue / Student Questions / Office Hours / Earnings / Storefront / Quality Score) | Partial (TeacherDashboard renamed to "Teacher Studio" in PR #14 but not reordered) | Medium |
| G | **Live Class Calendar** priority on student dashboard — "Upcoming Live Classes from Independent Teachers" section with filters | Partial (LiveSessionsPage exists; card on dashboard missing) | Medium |
| H | **Demo mode** — canned sample data for Parent Weekly Brief, Teacher dashboard, Exam Readiness, Passport, Project feedback | Missing | Medium |
| I | **Future Pathways** — subject-to-career mapping + pathway badges | Partial (`CareerGuidanceWidget` exists; needs expansion) | Low |
| J | **Low-data / offline mode** — audio lessons, offline quizzes, WhatsApp reminders | Missing | Low (infra-heavy) |
| K | **Public School Comparison** page (up to 3 side-by-side) | Missing (part of Institution Discovery phase 5) | Low |
| L | **Institution Recommendation personalization** — match score based on learner's weak subjects + class level (currently global ranking only) | Missing | Low |
| M | **Teacher Quality Score** surfaced on teacher profiles + student-facing teacher cards | Partial (exists internally; not surfaced) | Low |

---

## 3. Implementation plan — remaining waves

### Wave N (this PR — "independent school foundations")
- **A · Standby Teacher Network** backend + minimal student-facing "Ask a teacher" card
- **B · Pricing page** with the 6-tier structure from phase 19 of your spec

Ships together because both are conversion-adjacent: Pricing explains what unlocks Standby Teacher support; Standby answers "do I get real teachers?"

### Wave N+1 — "Independent-learning dashboard"
- **C · Today's Learning Plan** as the first thing on the student dashboard, above the KPI strip
- **G · Upcoming Live Classes from Independent Teachers** card

### Wave N+2 — "Parent Proof of Progress"
- **D · Parent Dashboard rework** — Weekly Child Progress Brief first; Teacher Support Summary card showing "1 project reviewed by Teacher Amos · 2 questions answered by standby teachers · 1 live revision class attended"

### Wave N+3 — "Cohorts + demo mode"
- **E · Learning Cohorts** (new `apps/cohorts/`)
- **H · Demo mode** — sample data surfaces on empty-state cards

### Wave N+4 — "Teacher Studio polish"
- **F · Teacher dashboard reorder** (My Courses / My Live Classes / My Practice Labs / My Mastery Projects / Review Queue / Student Questions / Office Hours / Earnings / Storefront / Quality Score)
- **M · Teacher Quality Score** on public profile + student-facing cards

### Wave N+5 — "Independent school pathways"
- **I · Future Pathways** expansion
- **K · School Comparison** page
- **L · Institution Discovery personalization**

### Wave N+6 — Infrastructure
- **J · Low-data / offline mode**

---

## 4. Verification plan

### Must-stay-green (verified flows guardrail)
- Auth: register / login / email verification / token blacklist
- Student content loop (`StudentDashboard`, `StudentResourceEngagementPanel`, `contentApi.dashboard.student`)
- Student submission (`StudentAssignmentsPanel`)
- Teacher grading (`TeacherGradingPanel`)
- Teacher quick note (`TeacherQuickNote`, `TeacherQuickAssignment`)
- Assessment authoring (`apps/assessments/`)

### New Playwright tests to add (post-deploy)
1. **Full Mastery loop e2e**: enroll in track → complete practice lab → submit project → teacher approves → passport updates → parent weekly brief reflects it
2. **Flagship diagnostic**: signup with `?intent=diagnostic` → answer questions → see HTML report with Learner Plus CTA
3. **Standby teacher ask**: student posts a support request → teacher accepts → teacher responds → student sees reply
4. **Admission passport**: student submits an application with `share_passport=True` → institution admin opens inbox → can view passport via share token link
5. **Exam simulator**: student takes a mock → wrong answer lands in Mistake Notebook → retry succeeds → notebook entry marked `retried_correct`

### Backend test coverage per PR (ongoing)
Every new app ships with at least:
- Anonymous-blocked
- Happy-path
- Permission-scoping (tenant isolation)
- State-transition correctness

---

## 5. Files to touch (Wave N, this PR)

### Backend (new)
- `edify_backend/apps/standby_teachers/` — models, serializers, views, urls, admin, tests, migrations
- `edify_backend/edify_core/settings.py` — add `standby_teachers.apps.StandbyTeachersConfig`
- `edify_backend/edify_core/urls.py` — add `api/v1/standby-teachers/` include

### Frontend (new)
- `src/pages/PricingPage.tsx` — 6-tier pricing structure from phase 19
- `src/components/standby/AskStandbyTeacherCard.tsx` — student dashboard card
- `src/pages/standby/StandbyRequestsPage.tsx` — student list + teacher queue
- `src/App.tsx` — register `/pricing` + `/standby-teachers` routes

### Frontend (edit)
- `src/pages/HomePage.tsx` — wire the "View Pricing" CTA to `/pricing`

---

## 6. Guardrails (applies to every PR)

1. **Do not break verified flows.** Listed in §4 above.
2. **No technical language in user-facing UI.** JWT, Docker, CI, rate limiting, tokens stay in developer docs.
3. **Mobile-first layouts.** Cards stack; buttons ≥44px; no hidden key actions.
4. **Outcome-driven copy.** No "transforming education", no guaranteed outcomes.
5. **Trust markers visible.** Verified badges, evidence footers, "last updated" labels.
6. **AI as assist, not replacement.** "AI-assisted recommendation", "Ask Maple Study Buddy", "Teacher-reviewed insight".
7. **Institution discovery stays secondary** on student + parent dashboards. Independent learning first.
