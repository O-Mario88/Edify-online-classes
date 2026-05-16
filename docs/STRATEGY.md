# STRATEGY.md — Locked decisions

> This is the constitution of the rebuild. Every PR, design choice, and feature debate refers back here.
> If a decision below conflicts with what you're about to do, change the decision *first* (with a PR that updates this doc), then build.
> **Locked:** 2026-05-16. **Reviewed:** quarterly, or when a decision gate fires.

---

## The single sentence

We are building **the trust machine for African schools**: the daily-use product that replaces the paper attendance register and the end-of-term report card, and makes parents feel known by their child's school.

We are *not* building a school operating system today. We will earn the right to be one in 18–24 months by being indispensable at one thing first.

---

## The 10 locked decisions

### 1. The wedge workflow
**Decision:** Teacher attendance + marks → Parent WhatsApp notification.
**Why:** Daily / weekly frequency replaces paper habits. Parent demand makes schools unable to churn. Cheapest workflow to be visibly better than the status quo.
**Trade-off accepted:** Slower TAM narrative ("we're not the OS yet"). We will be misjudged by people who skim our website.

### 2. Initial market
**Decision:** One city in Uganda (Kampala or Mukono). Private day schools, 100–800 students. English-medium.
**Why:** Tightest feedback loop. Founder can drive there. MTN MoMo dominant. No localization burden in v1.
**Trade-off accepted:** Voluntarily ignoring 95% of TAM until the wedge is proven.

### 3. Pricing
**Decision:** Per-student / month, billed termly to the school. Target band UGX 3,000–5,000 per student per month (~$0.80–1.30).
**Why:** Aligns to how schools think about cost; termly billing matches their cash flow.
**Trade-off accepted:** Need ≥300 students per school for the school to be profitable to serve. Smaller schools deferred or grouped.

### 4. Stack: keep or rewrite?
**Decision:** Keep React + Django + Postgres. **Hard-reset the product on top of the existing bones**, do not greenfield the codebase.
**Why:** Rewriting working auth/JWT/logs/tests would burn 8–12 weeks for zero user value.
**Trade-off accepted:** We carry some legacy file structure during the prune.

### 5. Mobile strategy
**Decision:** PWA-first. Native app deferred 12 months.
**Why:** One codebase, installable, works offline, runs on the low-end Android schools actually have.
**Trade-off accepted:** No app-store presence; slightly worse install UX than native.

### 6. Tenancy model
**Decision:** Shared DB with `tenant_id` (= `institution_id`) on every tenanted row, enforced by middleware + a `TenantedModel` base class with a custom manager.
**Why:** Schema-per-tenant is overkill at <500 schools and slow to migrate to once data exists; the middleware approach makes leaks structurally hard.
**Trade-off accepted:** A bug in the tenant filter is a data-leak risk. Mitigated by base-class enforcement + a mandatory cross-tenant denial test on every new viewset (CI rejects without it).

### 7. Payments
**Decision:** v1 — Pesapal (cards + bank) + MTN MoMo + Airtel Money via direct integration. Flutterwave as backup. All money is `Decimal(12,2)`, never float.
**Why:** Mobile money is 60–80% of school payments in Uganda. Pesapal-only leaves money on the table.
**Trade-off accepted:** Two integrations to maintain; reconciliation is harder than single-provider.

### 8. AI services
**Decision:** Postponed. `ai_services` app archived (removed from `INSTALLED_APPS`, code kept in repo).
**Why:** LLM cost + latency + hallucination is the wrong risk before product-market fit. Differentiator later, distraction now.
**Trade-off accepted:** Lose the "AI tutor" marketing line in v1.

### 9. Marketplace
**Decision:** Postponed. `marketplace` app archived.
**Why:** Two-sided market on top of unproven core = compounded risk.
**Trade-off accepted:** Lose the "teachers earn" narrative in v1.

### 10. Languages
**Decision:** English-only for v1. Luganda + Swahili in v2 (after PMF).
**Why:** Schools operate in English; v1 audience speaks it; localization cost is not worth pre-PMF.
**Trade-off accepted:** Some parents will not engage with English-only WhatsApp. Acceptable v1 cost.

---

## The three commitments (non-negotiable)

These are the operating rules. Breaking any of them in a PR is grounds to send the PR back regardless of how good the feature is.

1. **One wedge, ruthlessly.** No feature ships in v1 unless it directly supports the teacher-attendance / teacher-marks / parent-notification / admin-followup loop. Out-of-scope ideas go to `ROADMAP.md` (not built).
2. **One source of truth.** Every feature in `STATUS.md` exists in exactly one of three states: **spec'd**, **built**, **verified-with-real-school**. No feature claims `live` to anyone without the third state filled in.
3. **No new feature without an instrumented question.** Every screen ships with at least one PostHog event. Every feature has a leading-indicator metric defined *before* merge. CI rejects views and pages that don't fire at least one event.

---

## Personas in scope for v1

| Persona | Job-to-be-done | Surface | Frequency |
|---|---|---|---|
| Teacher (class teacher) | "Take attendance and record marks in under 60 seconds, even when WiFi is bad" | Mobile-first PWA | Daily / weekly |
| Parent (guardian) | "Know my child went to school today and how they're doing this term, without calling the office" | WhatsApp + signed-link web view | Daily push, weekly pull |
| School admin (head / deputy) | "See the school at a glance and follow up on what's wrong" | Desktop dashboard | Daily |

**Postponed personas:** independent teachers, students-as-direct-users, marketplace buyers/sellers, AI tutor users, district/government roles.

---

## Decision gates (when we revisit)

| Trigger | Re-decide |
|---|---|
| End of Phase 3 pilot (month 6) | Wedge correctness. If teacher week-over-week retention <70%, we stop and re-pick. |
| 10 paying schools | Second loop (likely report cards or fee invoicing). Picked from pilot signal, not from a roadmap doc. |
| 25 paying schools | Mobile native app (decision #5 revisited). |
| 50 paying schools | Geographic expansion (decision #2 revisited). |
| Any data leak or payment incident | Tenancy model + payment architecture (decisions #6 and #7) reviewed in writing. |

---

## What is explicitly NOT in v1

Listed here so we can refer to it when someone (including ourselves) asks "should we add X?":

- AI tutor / chat / quiz generator
- Marketplace (teachers selling content)
- Peer tutoring
- Live video sessions
- Discussion forum
- Independent teacher onboarding (separate from school)
- Student-facing dashboards beyond the parent-link view
- Public profiles / teacher storefronts
- Multi-language UI
- Native iOS / Android apps
- Government / district admin roles
- Curriculum content library (we host structure, schools bring content)
- Timetable management
- Library / book lending
- Transport / boarding fees
- Bursary management

**If a school in the pilot asks for one of these:** write it down. Don't build it. The roadmap is built from accumulated asks, not from one school's wishlist.

---

## How to use this document

- **Before a feature kickoff:** read the wedge workflow and the "not in v1" list. If your feature isn't in the wedge, stop.
- **Before any architectural decision:** check stack / tenancy / payments above. Don't re-litigate.
- **Before a pricing or market conversation:** decisions 2 and 3 stand until a decision gate fires.
- **When someone says "but we should also support…":** point them here.
