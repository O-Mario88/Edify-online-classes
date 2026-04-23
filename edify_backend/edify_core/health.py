"""Cross-cutting health check endpoint.

Returns:
  HTTP 200 when DB and cache both respond.
  HTTP 503 when any dependency is down.

No auth — monitoring endpoints must be reachable without credentials.
Responses are intentionally shallow; we don't expose stack details.
"""
from django.core.cache import cache
from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


def _check_db():
    try:
        with connection.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
        return "ok"
    except Exception as exc:
        return f"error: {type(exc).__name__}"


def _check_cache():
    try:
        cache.set("_health_probe", "1", timeout=5)
        return "ok" if cache.get("_health_probe") == "1" else "error: mismatch"
    except Exception as exc:
        return f"error: {type(exc).__name__}"


class HealthView(APIView):
    """GET /api/health/ — liveness + dependency probes."""

    permission_classes = [AllowAny]
    authentication_classes = []  # bypass JWT so unauthenticated monitors work
    throttle_classes = []  # health checks must not be rate-limited

    def get(self, request, *args, **kwargs):
        db = _check_db()
        cache_status = _check_cache()
        overall_ok = db == "ok" and cache_status == "ok"
        return Response(
            {"status": "ok" if overall_ok else "degraded", "db": db, "cache": cache_status},
            status=200 if overall_ok else 503,
        )
