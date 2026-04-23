# syntax=docker/dockerfile:1.7

# Backend image: Django + gunicorn, used by both the web and celery services.
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# System deps. libpq for psycopg2, curl for healthchecks, build-essential
# only while building wheels; we strip it afterwards to keep the image slim.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install build deps, install Python packages, then remove build deps.
COPY requirements.txt .
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends build-essential libpq-dev; \
    pip install --upgrade pip; \
    pip install -r requirements.txt; \
    apt-get purge -y --auto-remove build-essential libpq-dev; \
    rm -rf /var/lib/apt/lists/*

# Copy source after deps so dep changes don't invalidate the source layer.
COPY . .

# Collect static. Needs DJANGO_SECRET_KEY set; compose passes a real value.
# During image build we use a placeholder so the command doesn't refuse.
RUN DJANGO_SECRET_KEY=build-time-placeholder DJANGO_DEBUG=true \
    python manage.py collectstatic --noinput

# Non-root user for the process.
RUN useradd --create-home --shell /bin/bash maple && chown -R maple:maple /app
USER maple

EXPOSE 8000

# Default command is the web server. The celery service overrides this.
CMD ["gunicorn", "edify_core.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--timeout", "60"]
