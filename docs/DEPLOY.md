# Deploying Maple for the first pilot

**Goal:** a live URL you can hand to 5–10 real pilot users, with error tracking, real email, and daily DB backups.

This doc assumes you're comfortable with terminal commands. Every step tells you what to paste and what to check.

---

## 0. Decisions already made (so you don't have to)

| Decision | Value | Why |
|---|---|---|
| Hosting | **Fly.io** | Best Django support + Postgres add-on + generous free tier |
| Database | Fly Postgres (`fly postgres create`) | Managed backups + point-in-time recovery |
| Static files | Whitenoise (already configured) | Zero extra infra |
| Error tracking | **Sentry (free tier)** | Gated by `SENTRY_DSN` env var — does nothing if unset |
| Email | **Postmark transactional** | Simplest for activation emails |
| SMS/WhatsApp | **Deferred for pilot-1** | `LearnerSettings` captures opt-in but delivery is email-only until a provider is picked |
| Payments | **Manual admin approval** (see `apps/pilot_payments/`) | Pesapal live replaces this post-pilot |

---

## 1. First deploy (one-time, ~30 minutes)

### 1.1 Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
flyctl auth signup   # or: flyctl auth login
```

### 1.2 Launch the app (non-interactive — answer no to deploy)

```bash
cd edify_backend
flyctl launch --no-deploy --name maple-pilot --region jnb
```

Fly creates `fly.toml` — keep it. When asked about Postgres say **yes**; about Redis say no (not needed for pilot).

### 1.3 Set secrets

Run each line, replacing the placeholder:

```bash
flyctl secrets set \
  DJANGO_SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')" \
  DJANGO_DEBUG=false \
  DJANGO_ALLOWED_HOSTS="maple-pilot.fly.dev" \
  DJANGO_CORS_ORIGINS="https://maple-pilot.fly.dev,https://pilot.yourdomain.com" \
  FRONTEND_BASE_URL="https://maple-pilot.fly.dev" \
  REQUIRE_EMAIL_VERIFICATION=true \
  DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend \
  DJANGO_EMAIL_HOST="smtp.postmarkapp.com" \
  DJANGO_EMAIL_PORT=587 \
  DJANGO_EMAIL_USER="YOUR_POSTMARK_SERVER_TOKEN" \
  DJANGO_EMAIL_PASSWORD="YOUR_POSTMARK_SERVER_TOKEN" \
  DJANGO_EMAIL_USE_TLS=true \
  DJANGO_FROM_EMAIL="no-reply@yourdomain.com" \
  SENTRY_DSN="https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/PROJECT_ID"
```

`DATABASE_URL` is set automatically by `fly postgres attach`.

### 1.4 Deploy

```bash
flyctl deploy
```

Wait ~2 minutes. When you see `app is ready`, check:

```bash
flyctl status                    # app running on 1 machine
flyctl logs                      # no errors
curl https://maple-pilot.fly.dev/api/health/
# → {"status":"ok","db":"ok","cache":"ok"}
```

### 1.5 Migrate + seed

```bash
flyctl ssh console -C "python manage.py migrate"
flyctl ssh console -C "python manage.py seed_pilot"
flyctl ssh console -C "python manage.py seed_pilot_content"
flyctl ssh console -C "python manage.py createsuperuser"
```

Visit `https://maple-pilot.fly.dev/admin/` — admin should load and you should see seeded content.

### 1.6 Configure Postgres backups

Fly Postgres takes daily backups automatically. Verify:

```bash
flyctl postgres backups list --app maple-pilot-db
```

For a manual snapshot before a risky migration:

```bash
flyctl postgres backups create --app maple-pilot-db
```

---

## 2. Subsequent deploys

After merging to `main`:

```bash
cd edify_backend && flyctl deploy
flyctl ssh console -C "python manage.py migrate"
```

If migrations fail, roll back:

```bash
flyctl releases list
flyctl releases rollback <version>
```

---

## 3. Frontend (Vite → static hosting)

The Vite bundle can either:
- **(a)** Be served by the same Fly app via Whitenoise (simplest — already wired)
- **(b)** Be hosted on Vercel/Netlify pointing `VITE_API_BASE_URL` at the Fly Django URL

For pilot-1 use **(a)** — one deploy, one URL. In the Fly app, add a `npm run build` step before `collectstatic`. Or deploy frontend-only to Vercel with:

```bash
vercel --prod
# Set env var: VITE_API_BASE_URL=https://maple-pilot.fly.dev
```

---

## 4. Required external accounts checklist

- [ ] **Fly.io** — for hosting. Sign up + add a payment card.
- [ ] **Postmark** — for activation emails. Create a "Transactional" server, get the server token.
- [ ] **Sentry** — for error tracking. Create a Django project, grab the DSN.
- [ ] **Domain DNS** (optional) — CNAME `pilot.yourdomain.com` → `maple-pilot.fly.dev`, then `flyctl certs create pilot.yourdomain.com`.

**Total setup cost at pilot scale**: $0–$5/month (all free tiers cover the pilot load).

---

## 5. Pre-launch smoke test (5 min)

Before you hand the URL to pilot users:

1. Register a new account. Check Postmark for the activation email.
2. Activate. Log in. Land on `/dashboard/student`.
3. Check the "Today's Learning Plan" card renders.
4. Browse to `/mastery` — should show 3 seeded tracks.
5. Enroll in one. Mark an item complete. Progress should tick up.
6. Visit `/pricing` — click "Unlock Learner Plus" → fill the modal → submit. Log into admin, confirm the request appears in `pilot_payments/UpgradeRequest`.
7. Visit `/pathways` — should show 6 career pathways.
8. Visit `/schools/compare` — add 2 schools from `/schools`, compare renders.
9. Post a standby-teacher question. Log in as a teacher, accept + resolve. Back as the student, confirm the reply appears.
10. Trigger an error (e.g. hit a non-existent route) and confirm it shows up in Sentry.

If 1–10 all pass, the URL is ready for a pilot user.

---

## 6. What's NOT configured for pilot-1

Honest list of deferred work:

- **WhatsApp/SMS notifications**: settings capture opt-in, but no provider pipeline. Weekly briefs come by email only. Post-pilot: Twilio / Africa's Talking.
- **Pesapal live checkout**: `pilot_payments` app covers the pilot with manual approval. Post-pilot wiring: Pesapal IPN webhook → auto-approve.
- **PDF reports**: Weekly Brief / Report Card / Exam Readiness render as HTML only. Post-pilot: weasyprint backend.
- **Service worker / offline mode**: `learner_settings.low_data_mode` flag flips image resolution and autoplay, but no service worker caches lessons for offline.
- **Audio lesson variants**: `prefer_audio_lessons` flag exists; no audio assets yet.
- **Live class video bridge**: Maple links out to Google Meet for now. No native WebRTC.

Each of these is scoped as a separate post-pilot PR.
