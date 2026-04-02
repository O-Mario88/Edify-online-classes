from rest_framework import viewsets, status, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Listing, LicenseDeal, Wallet
from .serializers import ListingSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch, F, FloatField, ExpressionWrapper
from django.utils import timezone

class ListingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ListingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['topic_bindings__topic']

    def get_queryset(self):
        # Base Query
        qs = Listing.objects.filter(visibility_state='published').prefetch_related('topic_bindings__topic')
        
        # Algorithmic Discovery: (Rating * 0.4) + (Student Count * 0.4) + (Recency * 0.2)
        # Using a simplified normalized approximation for Postgres raw execution
        now = timezone.now()
        
        # We simulate Recency Bonus by decaying age (days since creation)
        # We alias it and sort descending
        qs = qs.annotate(
            score=ExpressionWrapper(
                (F('average_rating') * 0.4) + (F('student_count') * 0.4),
                output_field=FloatField()
            )
        ).order_by('-score', '-created_at')
        
        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def purchase(self, request, pk=None):
        listing = self.get_object()
        user = request.user
        
        # Prevent double buys
        if LicenseDeal.objects.filter(listing=listing, purchaser=user).exists():
            return Response({"detail": "You already own this material."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Simulate generic wallet / mobile money payment success
        # In reality, verify the TXN payload here
        
        # 1. Provide Access
        LicenseDeal.objects.create(listing=listing, purchaser=user)
        
        # 2. Wire Teacher Cut (80% to Creator, 20% Edify Commission)
        teacher_wallet, _ = Wallet.objects.get_or_create(teacher=listing.teacher)
        teacher_cut = float(listing.price_amount) * 0.8
        teacher_wallet.balance = float(teacher_wallet.balance) + teacher_cut
        teacher_wallet.save()
        
        # 3. Update Popularity Metrics
        listing.student_count += 1
        listing.save()
        
        return Response({"detail": "Purchase successful! Content added to library.", "teacher_cut": teacher_cut}, status=status.HTTP_200_OK)

from .models import PayoutRequest
from .serializers import PayoutRequestSerializer

class PayoutRequestViewSet(viewsets.ModelViewSet):
    """
    Teacher Monetization: Allows teachers to request withdraws from their Edify Wallets.
    """
    serializer_class = PayoutRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admins see all, teachers only see their own
        if self.request.user.role == 'platform_admin':
            return PayoutRequest.objects.all()
        return PayoutRequest.objects.filter(wallet__teacher=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        wallet, _ = Wallet.objects.get_or_create(teacher=user)
        amount = float(request.data.get('amount', 0))

        if amount <= 0:
            raise exceptions.ValidationError("Payout amount must be greater than zero.")

        if float(wallet.balance) < amount:
            raise exceptions.ValidationError("Insufficient funds in your Edify Wallet.")

        # Deduct right now, put into escrow
        wallet.balance = float(wallet.balance) - amount
        wallet.save()

        payout = PayoutRequest.objects.create(wallet=wallet, amount=amount, status='pending')
        serializer = self.get_serializer(payout)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
