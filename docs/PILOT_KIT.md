# Pilot Kit — Maple Online School

**You, reading this on return**: this is what's ready, what's not, what's staged, and exactly what to do in what order.

**Last updated:** 2026-04-24

---

## Status snapshot

| Surface | State |
|---|---|
| 14 feature PRs merged into `integration/all-features` | ✅ |
| Full Django test suite on merged state | ✅ 77/77 new + existing |
| Seed content for every new feature | ✅ `seed_pilot_content` |
| Demo mode wired into key empty states | ✅ |
| Manual upgrade-request + admin approval flow | ✅ `apps/pilot_payments/` |
| Playwright e2e for 5 critical pilot flows | ✅ `tests/e2e/pilot-flows.spec.ts` |
| Deploy instructions (Fly.io + Postmark + Sentry) | ✅ `docs/DEPLOY.md` |
| Sentry init (env-gated, no-op if DSN unset) | ✅ `settings.py` |
| Actually deployed | ⚠️ needs your Fly.io + Postmark + Sentry accounts |
| Live Pesapal payments | ⏭️ deferred post-pilot; manual approval covers it |
| WhatsApp/SMS delivery | ⏭️ deferred; email-only for pilot-1 |
| PDF reports | ⏭️ deferred; HTML-only for pilot-1 |

---

## What you need to do when you return

### Path A — ship the pilot (60–90 min)

1. **Merge PR #28 (`integration/all-features`) into `main`.** This is the single deploy-ready artifact.
2. **Sign up for 3 services** (~20 min):
   - [Fly.io](https://fly.io) — add a card. Free tier covers pilot load.
   - [Postmark](https://postmarkapp.com) — create a transactional server. Copy the server token.
   - [Sentry](https://sentry.io) — create a Django project. Copy the DSN.
3. **Follow `docs/DEPLOY.md`** — every command you need is copy-paste ready. The "first deploy" section ends with a 10-step smoke test.
4. **Pilot user onboarding** — see "Pilot user personas" below.

### Path B — test it locally first (15 min)

```bash
# 1. Pull the integration branch
git fetch origin
git checkout integration/all-features

# 2. Backend (new terminal)
cd edify_backend
source ../.venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_pilot
python manage.py seed_pilot_content
python manage.py runserver

# 3. Frontend (another terminal, from repo root)
npm install
npm run dev
# → open http://localhost:5173

# 4. Log in with seeded accounts (password: PilotPass!)
# student.a@pilot.maple  / teacher.a@pilot.maple  / parent.a@pilot.maple
```

Click through:
- Student dashboard — Today's Learning Plan card at top, Mastery Tracks section, Standby Teacher card
- `/mastery` — 3 published tracks
- `/mastery/reading-mastery-p7` — full track detail + enroll button
- `/practice-labs/fractions-step-by-step` — complete the lab
- `/exam-simulator` — 2 mocks available
- `/cohorts` — 1 cohort
- `/pathways` — 6 career pathways with match confidence
- `/passport` — your Learning Passport
- `/pricing` — 6 tiers; click Learner Plus as an authenticated user → upgrade modal
- `/standby-teachers` — post a question as student; log in as teacher, accept + resolve
- `/settings` — toggle "Show a preview on empty cards" and check that empty cards fill with realistic examples

---

## Pilot user personas (seeded accounts)

All default password: **PilotPass!**

| Role | Email | Who they are |
|---|---|---|
| Student A | student.a@pilot.maple | Active learner — has a study plan, enrolled in Mastery Track |
| Student B | student.b@pilot.maple | Quiet learner — shows empty states well; toggle demo mode to see the preview experience |
| Teacher A | teacher.a@pilot.maple | Has published content, reviews projects, hosts standby |
| Teacher B | teacher.b@pilot.maple | Newer teacher — shows onboarding states |
| Parent A | parent.a@pilot.maple | Linked to student.a — sees Weekly Brief, Teacher Support Summary |

**For a real pilot user**, just have them register normally at `/register`. The seeded accounts are for your QA/demo sessions.

---

## Pilot scope — what you ARE testing

1. **Student conversion loop**: Signup → diagnostic → Learning Level Report → dashboard → enroll in a track → complete a practice lab → submit a project → parent sees it in Weekly Brief.
2. **Premium upgrade path**: Pricing → Learner Plus modal → request → admin approves → student sees premium features unlock.
3. **Real-teacher promise**: Student posts a standby question → teacher responds → learner trusts that there's a real human.
4. **Parent trust**: Parent logs in → sees Weekly Child Progress Brief + Teacher Support Summary with real (or preview) activity.
5. **School discovery** (optional pathway): Student explores `/schools`, compares 3 institutions, sees evidence-based scoring.

## Pilot scope — what you are NOT testing

- SMS/WhatsApp delivery (email only)
- Pesapal live payment (manual admin approval)
- PDF report downloads (in-app HTML only — intentional, "all content read, not downloaded")
- Offline/low-data caching (flag exists but no service worker yet)
- Audio lessons (flag exists but no assets)
- Live video room (Google Meet link-out for now)

Tell your pilot users upfront. "We're testing learning, teacher support, and parent visibility. Payment and notification delivery are still under review."

---

## What to watch for during the pilot

In roughly priority order:

1. **Does the diagnostic flow actually generate questions?** If the Question bank for the learner's class-level is sparse, the report is empty. The frontend has an `empty_bank` fallback that routes them back to the dashboard, but you'll want to seed more Question rows if you see this.
2. **Does progress actually tick up?** Learners should see their Mastery Track progress bar move when they complete items.
3. **Do standby teachers actually respond?** If no teacher has `TeacherAvailability` and no teacher logs into the queue, learner requests pile up. Seed at least 2–3 real teachers before opening the pilot.
4. **Do upgrade requests get approved promptly?** The admin inbox needs a human. Commit to <24h response time for pilot users.
5. **Does the registration email actually arrive?** Postmark config is fragile the first time. Send yourself a test registration before inviting pilot users.

---

## Quick reference — every new URL

| User | URL | What it does |
|---|---|---|
| Student | `/diagnostic` | Flagship diagnostic flow |
| Student | `/mastery` | Browse Mastery Tracks |
| Student | `/mastery/<slug>` | Track detail + enroll + progress |
| Student | `/practice-labs/<slug>` | Play a Practice Lab |
| Student | `/exam-simulator` | Mock exams + Mistake Notebook |
| Student | `/passport` | Learning Passport |
| Student | `/cohorts` | Enroll in a teacher-led cohort |
| Student | `/pathways` | Future Pathways — subject-to-career |
| Student / parent | `/schools` | Discovery hub |
| Student / parent | `/schools/<slug>` | Institution profile with scoring |
| Student / parent | `/schools/compare?slugs=a,b,c` | Side-by-side comparison |
| Student / parent | `/standby-teachers` | Post/track questions |
| Student | `/settings` | Low-data + demo-mode + delivery prefs |
| Student / parent | `/pricing` | 6 tier pricing |
| Teacher | `/dashboard/mentor-studio/reviews` | Project review queue |
| Teacher | `/standby-teachers` | Incoming questions queue |
| Institution admin | `/dashboard/institution/admissions` | Admission inbox with inline passports |
| Platform admin | `/admin/` | Django admin (approve upgrades here) |

---

## Admin day-to-day during the pilot

Once a day (5 min):

1. Visit `https://maple-pilot.fly.dev/admin/pilot_payments/upgraderequest/?status__exact=pending`
2. For each pending request, verify MoMo/Airtel payment came through (outside the system)
3. Click into the request → Action: "Review approve" (or run the API call directly):
   ```bash
   curl -X POST https://maple-pilot.fly.dev/api/v1/pilot-payments/upgrade-requests/<id>/review/ \
     -H "Authorization: Bearer <admin-token>" \
     -d '{"decision":"approved","grant_months":3}'
   ```

That's the whole loop.

---

## If something's on fire

- **Django crash on boot**: `flyctl logs` — usually a missing env var or a migration that didn't apply. Check `flyctl ssh console -C "python manage.py migrate --check"`.
- **Users can't register**: Postmark may be rejecting sends. Check the Postmark dashboard → Activity tab for bounces. `DJANGO_FROM_EMAIL` must match a verified sender.
- **Everything is slow**: `flyctl scale count 1` → `flyctl scale count 2`. Free tier has 3 shared vCPU seconds/second across machines.
- **Sentry isn't showing errors**: Verify `SENTRY_DSN` is set and `DJANGO_DEBUG=false` (Sentry init is gated behind `not DEBUG`).

---

## When you're ready to kill the pilot

1. Export pilot data: `flyctl ssh console -C "python manage.py dumpdata --indent 2 > pilot_dump.json"`
2. Copy off: `flyctl ssh sftp shell` then `get pilot_dump.json`
3. Tear down: `flyctl apps destroy maple-pilot`
4. Keep the Postgres backup for 7 days via Fly, then destroy.

---

Everything is ready for your smoke-test pass. Good luck.
