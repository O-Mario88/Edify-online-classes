# Docker stack

Single-command local + prod-ish deployment of Maple Online School.

## First run

```sh
# 1. Create your .env from the template
cp .env.docker.example .env

# 2. Generate a DJANGO_SECRET_KEY and paste it into .env
python3 -c "from secrets import token_urlsafe; print(token_urlsafe(50))"

# 3. Build + start everything
docker compose up --build
```

Ports (host → container):
- **8080** → nginx (frontend + `/api` reverse proxy to backend)
- **8000** → gunicorn (backend, useful for direct API probes)

Open `http://localhost:8080`.

## Services

| Service | What | Ports | Healthcheck |
|---|---|---|---|
| `postgres` | DB, volume-persisted (`postgres_data`) | — | `pg_isready` |
| `redis` | Celery broker + Django cache | — | `redis-cli ping` |
| `backend` | Django 4.2 + gunicorn; runs migrations on boot | 8000 | `GET /api/health/` |
| `celery` | Celery worker (activation emails, async tasks) | — | — |
| `frontend` | nginx serving built Vite assets, proxies `/api`, `/admin`, `/static`, `/media` to backend | 8080 | — |

## Common commands

```sh
# Rebuild after dependency or Dockerfile changes
docker compose up --build

# Shell into the backend container
docker compose exec backend bash

# Run Django tests inside the container
docker compose exec backend python manage.py test accounts.tests lessons.tests

# Seed the demo environment (user accounts, classes, etc.)
docker compose exec backend python manage.py seed_demo_env

# Create a superuser
docker compose exec backend python manage.py createsuperuser

# View logs
docker compose logs -f backend
docker compose logs -f celery

# Stop, keep DB
docker compose down

# Stop and wipe Postgres data
docker compose down -v
```

## Production considerations before deploying this as-is

- Set `DJANGO_DEBUG=false` (it already is by default in `.env.docker.example`).
- Generate a real `DJANGO_SECRET_KEY` (not the placeholder).
- Set `DJANGO_ALLOWED_HOSTS` to your real domain(s).
- Set `DJANGO_CORS_ORIGINS` to the frontend origin if it's on a different host.
- Swap `DJANGO_EMAIL_BACKEND` to real SMTP (Postmark / SendGrid / Resend).
- Set `REQUIRE_EMAIL_VERIFICATION=true` once SMTP works.
- Put nginx behind TLS (the host probably handles this — e.g. Fly.io auto-TLS).
- Ensure `postgres_data` volume is backed up; a free `pg_dump` cron is enough for a pilot.
