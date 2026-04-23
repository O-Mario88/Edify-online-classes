# PILOT.md — How to run the first 5-user pilot

> **Purpose:** this is the operational playbook for putting Maple Online School in front of real humans for the first time. It exists so you don't improvise when you're tired and forget to write something down.
>
> **Exit gate:** one teacher + one student + one parent each complete their main loop without asking you for help. That's when the pilot has "worked."

---

## What's already ready in the code

- Student journey (register → log in → browse library → consume content → mark complete) — **verified end-to-end**.
- Teacher journey (publish note, publish assignment, grade submission) — **verified end-to-end**.
- Grading loop (teacher assigns → student submits → teacher grades → student sees grade) — **verified end-to-end**.
- Email-verification flow exists but is **opt-in** via `REQUIRE_EMAIL_VERIFICATION` env var. Keep it **off** for the first pilot — every activation step is a friction point that costs users.
- Registration endpoints are throttled at 20/hour per IP — won't affect a pilot.
- Docker stack runs the whole thing (backend + frontend + Postgres + Redis + Celery).

## What still needs a human decision before the pilot starts

- **Where is it deployed?** Pilot can't work on your laptop. Pick a host: Fly.io, Railway, Render, DigitalOcean. All four are ~$10–20/month for this workload.
- **What's the domain?** Any `something.com` you already own, or a host-provided subdomain. Real domain looks more professional but costs ~$10/year.
- **Who are the 5 people?** Family counts. Ideal composition:
  - 2 teachers (any subject — ideally one technical, one not)
  - 2 students (one who's taking school seriously, one who's skeptical of tech)
  - 1 parent (the real forcing function — if they can't tell how their kid is doing, the platform failed)
- **Who gets told about bugs?** You. Reserve a WhatsApp group or a Google Doc — see "Feedback capture" below.

## Pilot seeder

Run once on the deployed instance before inviting anyone:

```sh
docker compose exec backend python manage.py seed_pilot
```

That command creates:

- 1 institution: "Maple Pilot School"
- 2 teachers: `teacher.a@pilot.maple` / `teacher.b@pilot.maple`
- 2 students: `student.a@pilot.maple` / `student.b@pilot.maple`
- 1 parent: `parent.a@pilot.maple` (linked to `student.a`)
- 1 class ("S3 East"), 3 lessons, 1 published sample assignment
- Default password `PilotPass!` for every account

Credentials are printed to stdout at the end of the seed. **Write them down somewhere the 5 users can see them** — a one-page welcome PDF beats re-reading email.

## Day-1 script for each role

Keep this in front of you when you walk each user through the tool the first time. If they hit *any* step that needs explanation, note it — that's a product bug.

### Teacher A & B (5 minutes each)

1. Sign in with their pilot credentials.
2. Open `/dashboard/teacher/class/1` (Lesson Studio).
3. Click **Publish a note** → title + body → Publish. Expect a toast saying "students can see it now."
4. Click **Publish an assignment** → title + prompt → Publish. Expect another toast.
5. Wait for a student submission to arrive (Assignments & grading panel below).
6. Expand the assignment → enter a score + a short feedback → Save.

### Student A & B (5 minutes each)

1. Sign in with their pilot credentials.
2. Land on the Student Dashboard.
3. Scroll to **My assignments** → see the teacher's assignment → read the prompt.
4. Type a short answer → Submit.
5. Come back after the teacher has graded → expect to see the grade and feedback inline.
6. Scroll to **Continue learning** → click one item → confirm it loads.

### Parent (5 minutes)

1. Sign in with `parent.a@pilot.maple`.
2. Land on Parent Dashboard.
3. Verify the linked child appears and their attendance + progress numbers render.
4. Open the weekly summary if present.

> If the parent has to ask **any** question about "where is my child's progress?", that's the #1 failure to fix.

## Cadence

- **Pre-kickoff:** share a 60-second screen-record showing how to sign in. Not a manual. A video.
- **Week 1:**
  - Day 1: the 5 users each do their day-1 script above, solo.
  - Day 3: 10-minute check-in per role. "What confused you?"
  - Day 7: first retro. Write 3 things that broke + 1 thing that felt right.
- **Week 2:**
  - Users use the platform naturally — no scripts.
  - You watch the feedback log and fix the top 3 papercuts.
- **Week 3:**
  - Exit-gate check. For each of the 3 archetypes, can they complete their main loop without asking you?
  - If yes: the pilot is done. Write a one-page retro. Decide whether to onboard school #2.
  - If no: the product has more distance to cover before a real rollout. **Do not invite more users until the gate passes.**

## Feedback capture

Three channels, low friction for the users:

1. **In-app "Report an issue" button** (shipped in this PR — bottom of every dashboard). Captures a free-text description + the current URL + the user's role. Posts to `/api/v1/feedback/`. You can read them all at `/admin/accounts/pilotfeedback/` as a superuser, or query `PilotFeedback.objects.all()` in a shell.
2. **A shared Google Doc** (you create). Three columns: Who, What broke, Severity. You update it; they don't have to know it exists.
3. **WhatsApp group** called "Maple pilot — bugs". Everyone in it. Rules: one bug per message, screenshot if possible.

The in-app button is the canonical channel. The other two are safety nets.

## Exit retro — one page

When pilot ends, write these four bullets and no more:

- **What landed:** the features users actually used unprompted.
- **What failed:** the steps users couldn't do without you.
- **One change that would move the needle:** single biggest fix.
- **Go / no-go for pilot #2:** yes or no.

Archive in `docs/pilots/pilot-1-retro.md`. Delete it when pilot #2's retro lands.

## Invitation template (copy, customise, send)

> Hi [name],
>
> I've built a school platform called Maple Online School and I'd like you to be one of the first 5 people to try it for two weeks.
>
> It's free. There's nothing to install. Here's your login:
>
> &nbsp;&nbsp;&nbsp;&nbsp;**[URL]**
> &nbsp;&nbsp;&nbsp;&nbsp;Email: `[their_pilot_email]`
> &nbsp;&nbsp;&nbsp;&nbsp;Password: `PilotPass!`
>
> You're signed in as a **[role]**. On your first visit, please try:
> 1. \[first thing from the role script\]
> 2. \[second thing\]
> 3. \[third thing\]
>
> If anything is broken, please click **Report an issue** at the bottom of the page and type what happened. That takes 15 seconds and tells me exactly what to fix.
>
> I'll check in next [day] to hear what worked and what didn't.
>
> Thanks — this makes the tool better for real schools.
> [your name]

## Things NOT to do during pilot #1

- **Don't add new features.** Only fix what real users hit. New features during a pilot are how you create more bugs.
- **Don't onboard more than 5.** Pilots with 10 people become herding cats.
- **Don't extend past 3 weeks.** If the exit gate hasn't passed by week 3, no amount of extra time will help — it's a product change that's needed.
- **Don't skip the one-page retro.** That's the only artefact that makes pilot #1 worth running.
