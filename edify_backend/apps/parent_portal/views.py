from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ParentStudentLink, WeeklySummary, RiskAlert
from .serializers import ParentStudentLinkSerializer, WeeklySummarySerializer, RiskAlertSerializer

class ParentStudentLinkViewSet(viewsets.ModelViewSet):
    queryset = ParentStudentLink.objects.all()
    serializer_class = ParentStudentLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Scope visibility: a parent only sees their own links; staff see all."""
        user = self.request.user
        qs = ParentStudentLink.objects.select_related(
            'parent_profile__user', 'student_profile__user',
        )
        if getattr(user, 'is_staff', False) or getattr(user, 'role', '') in ('admin', 'platform_admin'):
            return qs
        return qs.filter(parent_profile__user=user)

    @action(detail=False, methods=['get'], url_path='my-children')
    def my_children(self, request):
        """GET /api/v1/parent-student-links/my-children/

        Returns each linked child as a thin payload the frontend can use to
        populate a child selector. Includes child user id, name, email, role,
        relationship, and an `unread_count` — the number of child-related
        events the parent hasn't acknowledged yet (e.g. new grades posted,
        new teacher messages, new admission status changes). The chip-bar
        uses this to badge the chip for whichever child has news.
        """
        from datetime import timedelta
        from django.utils import timezone
        from notifications.models import Notification

        links = self.get_queryset().filter(parent_profile__user=request.user)
        # Last time the parent opened the dashboard — use the parent's
        # own last-read notification timestamp as a proxy. Falls back to
        # 7d if nothing's been read yet.
        last_read = (
            Notification.objects
            .filter(user=request.user, read_at__isnull=False)
            .order_by('-read_at')
            .values_list('read_at', flat=True)
            .first()
        ) or (timezone.now() - timedelta(days=7))

        children = []
        for link in links:
            sp = link.student_profile
            if not sp or not sp.user:
                continue
            # Crude per-child unread: count the child's own notifications
            # created since the parent's last read. Covers grading,
            # standby, admission, practice-lab, fee events fired by
            # notify(). Replaces bespoke event tracking with one query.
            unread = Notification.objects.filter(
                user=sp.user, created_at__gt=last_read,
            ).count()
            children.append({
                'student_user_id': sp.user.id,
                'student_email': sp.user.email,
                'student_name': sp.user.full_name,
                'student_stage': getattr(sp.user, 'stage', None),
                'relationship': link.relationship_type,
                'consent_status': link.consent_status,
                'link_id': link.id,
                'unread_count': unread,
            })
        return Response(children)

class WeeklySummaryViewSet(viewsets.ModelViewSet):
    queryset = WeeklySummary.objects.all()
    serializer_class = WeeklySummarySerializer
    permission_classes = [IsAuthenticated]

class RiskAlertViewSet(viewsets.ModelViewSet):
    queryset = RiskAlert.objects.all()
    serializer_class = RiskAlertSerializer
    permission_classes = [IsAuthenticated]

