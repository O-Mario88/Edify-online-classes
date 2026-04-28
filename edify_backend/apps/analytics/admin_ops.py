"""Platform-admin operations endpoints.

Three views back the admin dashboard's data-ops controls:
  - AdminSyncDataView: triggers the recompute jobs that keep
    DailyInstitutionMetric, SubjectPerformanceSnapshot, and the
    School Match readiness profiles fresh.
  - AdminLogsListView: returns recent SystemLog rows for display.
  - AdminLogsClearView: wipes SystemLog rows older than 30 days
    (or whatever cutoff is requested), preserving recent history.

All three require platform_admin role; non-admins get 403.
"""
import logging

from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SystemLog


logger = logging.getLogger('edify.admin_ops')


def _is_platform_admin(user) -> bool:
    role = (getattr(user, 'role', '') or '').lower()
    return user and user.is_authenticated and (
        user.is_staff or role in ('platform_admin', 'admin')
    )


class AdminSyncDataView(APIView):
    """POST /api/v1/admin/sync-data/

    Triggers the daily-aggregator recompute jobs that the admin
    dashboard depends on. Runs synchronously for the small data
    volumes we have today; once a Celery worker is wired this should
    enqueue the same management commands instead.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _is_platform_admin(request.user):
            return Response(
                {'detail': 'Platform admin role required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        results = {}

        # Recompute School Match readiness (idempotent — see
        # institution_discovery.management.commands.recalculate_readiness)
        try:
            from institution_discovery.services_match import recalculate_eligible_students
            count = recalculate_eligible_students()
            results['readiness_recomputed'] = count
        except Exception as e:
            results['readiness_error'] = str(e)
            logger.exception('readiness recompute failed')

        SystemLog.objects.create(
            level='info' if 'readiness_error' not in results else 'warning',
            message=f"Manual data sync triggered by admin {request.user.email}",
            source='admin_ops.sync',
            metadata=results,
        )

        return Response({
            'status': 'ok',
            'completed_at': timezone.now().isoformat(),
            'results': results,
        })


class AdminLogsListView(APIView):
    """GET /api/v1/admin/logs/?level=&limit=&since=

    Returns recent SystemLog rows. Optional query params:
      - level: filter to a single level (info/warning/error/critical)
      - limit: max rows (default 50, hard cap 200)
      - since: ISO timestamp; entries newer than this only
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_platform_admin(request.user):
            return Response(
                {'detail': 'Platform admin role required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        qs = SystemLog.objects.all()

        level = request.query_params.get('level')
        if level:
            qs = qs.filter(level=level)

        since = request.query_params.get('since')
        if since:
            try:
                from django.utils.dateparse import parse_datetime
                cutoff = parse_datetime(since)
                if cutoff:
                    qs = qs.filter(created_at__gt=cutoff)
            except Exception:
                pass

        limit = min(int(request.query_params.get('limit', 50)), 200)
        rows = qs.order_by('-created_at')[:limit]

        return Response({
            'count': qs.count(),
            'limit': limit,
            'logs': [
                {
                    'id': r.id,
                    'level': r.level,
                    'message': r.message,
                    'source': r.source,
                    'metadata': r.metadata,
                    'created_at': r.created_at.isoformat(),
                }
                for r in rows
            ],
        })


class AdminLogsClearView(APIView):
    """POST /api/v1/admin/logs/clear/

    Deletes SystemLog rows older than `older_than_days` (default 30).
    The cleanup itself is logged so admins can see when the table was
    last pruned and by whom.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _is_platform_admin(request.user):
            return Response(
                {'detail': 'Platform admin role required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        days = int(request.data.get('older_than_days', 30))
        cutoff = timezone.now() - timedelta(days=days)
        deleted, _ = SystemLog.objects.filter(created_at__lt=cutoff).delete()

        SystemLog.objects.create(
            level='info',
            message=f'Admin {request.user.email} cleared {deleted} logs older than {days} days.',
            source='admin_ops.clear',
            metadata={'older_than_days': days, 'deleted_count': deleted},
        )

        return Response({
            'status': 'ok',
            'deleted_count': deleted,
            'cutoff_iso': cutoff.isoformat(),
        })
