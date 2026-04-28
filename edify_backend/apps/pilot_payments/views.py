from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import UpgradeRequest, PremiumAccess
from .serializers import UpgradeRequestSerializer, PremiumAccessSerializer, ReviewSerializer
from .access import compute_access_status
from notifications.utils import notify


class AccessStatusView(APIView):
    """GET /api/v1/access/status/ — single source of truth for the
    paywall decision. The mobile + webapp `useAccess()` hooks query
    this on app boot and on every protected-route navigation, then
    render the paywall screen when has_active_access is False.

    Authenticated. Returns the computed access status payload —
    has_active_access, expires_at, days_remaining, scope (personal /
    institution / staff), and the lock_reason so the client can
    surface the right copy ("Subscribe to unlock", "Your access
    expired", "Awaiting admin approval").
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(compute_access_status(request.user))


class UpgradeRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UpgradeRequestSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')
        if role == 'platform_admin':
            return UpgradeRequest.objects.all()
        return UpgradeRequest.objects.filter(requester=user)

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @action(detail=False, methods=['get'], url_path='my')
    def my_requests(self, request):
        qs = UpgradeRequest.objects.filter(requester=request.user)
        return Response(UpgradeRequestSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='admin-inbox')
    def admin_inbox(self, request):
        if getattr(request.user, 'role', '') != 'platform_admin':
            return Response({'detail': 'Platform admin role required.'}, status=status.HTTP_403_FORBIDDEN)
        qs = UpgradeRequest.objects.filter(status='pending')
        return Response(UpgradeRequestSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='review')
    def review(self, request, pk=None):
        if getattr(request.user, 'role', '') != 'platform_admin':
            return Response({'detail': 'Platform admin role required.'}, status=status.HTTP_403_FORBIDDEN)
        req = self.get_object()
        if req.status != 'pending':
            return Response({'detail': f'Cannot review from status "{req.status}".'}, status=status.HTTP_400_BAD_REQUEST)
        s = ReviewSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        req.status = d['decision']
        req.admin_note = d.get('admin_note', '')
        req.reviewed_by = request.user
        req.reviewed_at = timezone.now()
        req.save()
        if d['decision'] == 'approved':
            months = d.get('grant_months', 3)
            PremiumAccess.objects.create(
                user=req.requester, plan=req.plan,
                expires_at=timezone.now() + timedelta(days=30 * months),
                source_request=req,
            )
            notify(
                user=req.requester,
                title=f'{req.plan.replace("_", " ").title()} plan approved',
                message=f'Your premium access is active for {months} months. Enjoy.',
                kind='upgrade_approved',
                link='/pricing',
            )
        else:
            notify(
                user=req.requester,
                title='Upgrade request reviewed',
                message=req.admin_note or 'Your upgrade request was not approved this time. Reach out to billing@maple.edify if you have questions.',
                kind='upgrade_rejected',
                link='/support',
            )
        return Response(UpgradeRequestSerializer(req).data)


class PremiumAccessViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only: what plans is the caller currently entitled to?"""
    permission_classes = [IsAuthenticated]
    serializer_class = PremiumAccessSerializer

    def get_queryset(self):
        return PremiumAccess.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-access')
    def my_access(self, request):
        active = [a for a in self.get_queryset() if a.is_active_now()]
        return Response({
            'active_plans': [a.plan for a in active],
            'grants': PremiumAccessSerializer(active, many=True).data,
        })
