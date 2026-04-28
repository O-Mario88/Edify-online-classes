# Golden paths — verification protocol

> The 12 user journeys that gate launch readiness. A path counts as
> **verified** only when a human (or Playwright/Detox/Maestro) drives
> it end-to-end against a freshly-seeded DB and the result is captured.

## Legend

- ⏳ pending — not yet attempted
- 🟡 in progress — script exists, not consistently green
- ✅ verified — last run green; date + verifier recorded
- ❌ broken — last run failed; ticket open

## Pre-flight

Every run must start from a known state:

```sh
cd edify_backend
./venv/bin/python manage.py flush --noinput
./venv/bin/python manage.py migrate
./venv/bin/python manage.py loaddata fixtures/golden_paths_seed.json
```

(The `golden_paths_seed.json` fixture is created once during Phase 13.B
and contains: 1 institution, 2 teachers, 1 parent + 1 child, 4 students,
3 classes, 2 lessons with assessments, 1 active live session, 1
recommended-student match, 1 pending UpgradeRequest, 1 ScholarshipOpportunity.)

## The 12 paths

| # | Path | Surface | Status | Last verified | Notes |
|---|---|---|---|---|---|
| 1 | Webapp signup → student dashboard | webapp | ⏳ | — | StudentSliceTests covers API; UI driver missing |
| 2 | Webapp signup → teacher dashboard | webapp | ⏳ | — | |
| 3 | Webapp signup → parent dashboard | webapp | ⏳ | — | |
| 4 | Webapp signup → institution dashboard | webapp | ⏳ | — | |
| 5 | Mobile signup → role-routed home | mobile | ⏳ | — | All 4 roles covered by one parameterised script |
| 6 | Student learning loop | both | ⏳ | — | lesson → assessment → grade → mistake notebook |
| 7 | Teacher publishing loop | both | ⏳ | — | create lesson → assign → grade → student sees grade |
| 8 | Parent weekly brief loop | both | ⏳ | — | login → child progress → weekly brief share |
| 9 | School Match loop | both | ⏳ | — | institution browses recommended → invites → parent accepts → contact reveal |
| 10 | Pilot payments loop | both | ⏳ | — | request upgrade → admin approves → premium unlocks |
| 11 | Study Buddy loop | mobile | ⏳ | — | ask → hint → escalation → "Ask a teacher" handoff |
| 12 | Force-update / maintenance gate | both | ⏳ | — | server flips flag → app gates correctly |

## Path 1-4: webapp signup → role dashboard

**Test fixture:** Playwright
**Path:** `tests/e2e/auth-signup-{role}.spec.ts`
**Acceptance:**
1. Navigate to `/register`
2. Fill form (email, password, full name, role)
3. Submit → land on `/dashboard/{role}`
4. Dashboard renders user's full name in header
5. At least one data widget renders (kpi, list, or card) — confirms backend wire

## Path 5: mobile signup → home

**Test fixture:** Maestro (preferred — works on iOS + Android, YAML-driven)
**Path:** `mobile/maestro/auth-signup.yaml`
**Acceptance:**
1. App launches at welcome screen
2. Tap "Sign up"
3. Fill role → email → password → name
4. Land on role's home (e.g. student tabbar visible)
5. Onboarding tour appears (Phase 10.A.5)
6. Tap "Skip" → tour dismisses, home renders

## Path 6: student learning loop

**Test fixture:** Playwright (web) + Maestro (mobile, optional)
**Path:** `tests/e2e/student-learning-loop.spec.ts`
**Acceptance:**
1. Login as seeded student
2. Open lesson → reading mode renders
3. Tap "Take assessment" → answer 3 questions
4. Submit → score displayed
5. Navigate to mistake notebook → wrong answers listed
6. Mark one as "Reviewed" → state persists on reload

## Path 7: teacher publishing loop

**Test fixture:** Playwright
**Path:** `tests/e2e/teacher-publish-loop.spec.ts`
**Acceptance:**
1. Login as seeded teacher
2. Create new lesson via lesson studio
3. Attach an assessment (1 multiple-choice + 1 essay question)
4. Assign to a class
5. Switch to seeded student account → assessment appears
6. Student submits → teacher sees pending review
7. Teacher grades essay with rubric → student sees grade

## Path 8: parent weekly brief loop

**Test fixture:** Playwright (web) + manual review (mobile share sheet)
**Path:** `tests/e2e/parent-weekly-brief.spec.ts`
**Acceptance:**
1. Login as seeded parent
2. Parent dashboard renders selected child's weekly brief paragraph
3. KPI strip shows attendance, strongest subject, trend
4. Tap "Share via WhatsApp" → share sheet opens (mobile-only manual check)

## Path 9: School Match loop

**Test fixture:** Playwright (web) + manual mobile cross-check
**Path:** `tests/e2e/school-match-loop.spec.ts`
**Acceptance:**
1. Login as seeded institution_admin
2. Open recommended students → list renders with anonymised cards
3. Pick one with score ≥ 70 → tap "Invite to apply"
4. Fill invitation form → submit
5. Logout, login as that student's parent (mobile)
6. Open invitations tab → invitation visible with school name + reasons
7. Tap "Accept" → contact details revealed to institution
8. Logout, login as institution → student card now shows parent contact

## Path 10: pilot payments loop

**Test fixture:** Playwright + Django shell
**Path:** `tests/e2e/upgrade-request-loop.spec.ts`
**Acceptance:**
1. Login as seeded student
2. Open payment screen → tap "Request Learner Plus"
3. Fill phone + payment method (mtn_momo) + note → submit
4. Confirmation card shows "Awaiting approval"
5. Switch to Django admin (or shell) → approve the UpgradeRequest
6. Reload student app → premium features unlock (e.g. Practice Lab gated card disappears)
7. PremiumAccess row exists in DB with `is_active=True`

## Path 11: Study Buddy loop

**Test fixture:** Maestro (with mock Anthropic key for CI)
**Path:** `mobile/maestro/study-buddy.yaml`
**Acceptance:**
1. Login as seeded student
2. Tap "AI Buddy" tile
3. Type "Help me with photosynthesis" → send
4. Reply renders within 5s, contains hint phrasing (no direct answer)
5. Type "Just tell me the answer" → reply contains escalation cue
6. Header pill links to `/(student)/ask-teacher` → tap navigates correctly

## Path 12: force-update / maintenance gate

**Test fixture:** Manual (low frequency change)
**Path:** `tests/manual/force-update.md`
**Acceptance:**
1. Set `app_config.gate = "force_update"` in DB
2. Reload mobile app → AppGateScreen appears with update CTA
3. Tap update → opens App Store / Play Store entry (manual confirm)
4. Set `app_config.gate = "open"` → app boots normally
5. Set `app_config.gate = "maintenance"` → maintenance copy shows with support email

## Discipline

- Every PR that touches a path must re-run that path before merge.
- The path table is updated in the same PR that flips a status.
- A red path blocks the next release.
- New flows ship with a new path entry; if a flow is too small for a row, it's part of an existing one.
