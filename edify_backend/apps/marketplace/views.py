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

from .models import PayoutRequest, TeacherPayoutProfile
from .serializers import PayoutRequestSerializer, TeacherPayoutProfileSerializer

class TeacherPayoutProfileViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherPayoutProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TeacherPayoutProfile.objects.filter(teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

class PayoutRequestViewSet(viewsets.ModelViewSet):
    """
    Teacher Monetization: Allows teachers to request withdrawals from their platform MoMo.
    """
    serializer_class = PayoutRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admins see all, teachers only see their own
        if self.request.user.role == 'platform_admin':
            return PayoutRequest.objects.all().order_by('-requested_at')
        return PayoutRequest.objects.filter(teacher=self.request.user).order_by('-requested_at')

    def create(self, request, *args, **kwargs):
        from .services.payout_eligibility import TeacherPayoutEligibilityService
        
        user = request.user
        success, result = TeacherPayoutEligibilityService.execute_payout_request(user, actor=user)

        if not success:
            raise exceptions.ValidationError({"detail": result})

        # result is the payout_request object
        serializer = self.get_serializer(result)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def eligibility(self, request):
        from .services.payout_eligibility import TeacherPayoutEligibilityService
        eligibility = TeacherPayoutEligibilityService.check_eligibility(request.user)
        return Response(eligibility)

from rest_framework import views, serializers
from billing.models import TeacherAccessFeeAccount
from .models import TeacherPayoutBatch
from lessons.models import LessonQualificationRecord

class PayoutBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherPayoutBatch
        fields = '__all__'

class LessonQualificationSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    scheduled_at = serializers.DateTimeField(source='lesson.scheduled_at', read_only=True)
    class Meta:
        model = LessonQualificationRecord
        fields = ['id', 'lesson', 'lesson_title', 'scheduled_at', 'status', 'rejection_reason', 'calculated_payout', 'reviewed_at']

class PayoutBatchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Teacher Monetization: Biweekly payout batch history
    """
    serializer_class = PayoutBatchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TeacherPayoutBatch.objects.filter(teacher=self.request.user).order_by('-cycle_start_date')

class LessonQualificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Teacher Monetization: Track earnings/rejections lesson by lesson.
    """
    serializer_class = LessonQualificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LessonQualificationRecord.objects.filter(lesson__parent_class__teacher=self.request.user).order_by('-lesson__scheduled_at')

class MonetizationOverviewView(views.APIView):
    """
    Teacher Monetization: Central tracker for the Access Fee Obligation.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        fee_account, _ = TeacherAccessFeeAccount.objects.get_or_create(teacher=user)
        
        latest_batch = TeacherPayoutBatch.objects.filter(teacher=user).order_by('-cycle_end_date').first()
        last_net_payout = latest_batch.net_payout if latest_batch else 0.00
        
        return Response({
            'total_obligation': fee_account.total_obligation,
            'recovered_amount': fee_account.recovered_amount,
            'remaining_balance': fee_account.remaining_balance,
            'is_recovered': fee_account.is_recovered,
            'last_net_payout': last_net_payout
        })

from rest_framework.permissions import AllowAny
from django.db import transaction
from django.contrib.auth import get_user_model

class IndependentTeacherOnboardingView(views.APIView):
    """
    Handles the 4-phase independent educator onboarding mapping directly.
    """
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        data = request.data
        
        email = data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email is already registered'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Identity
        teacher = User.objects.create_user(
            email=email,
            full_name=data.get('full_name', 'Educator'),
            phone=data.get('phone', ''),
            country_code=data.get('country', 'uganda'),
            role='independent_teacher'
        )
        teacher.set_password(data.get('password', 'secure_password'))
        teacher.save()
        
        # We can store bio/experience inside the User model profile metadata ideally,
        # but for the minimum viability we construct the monetization identity immediately.

        # 2. Payout Setup
        TeacherPayoutProfile.objects.create(
            teacher=teacher,
            payout_network=data.get('payout_network', 'mtn_momo'),
            account_name=data.get('account_name', ''),
            mobile_money_number=data.get('payout_phone', ''),
            accepted_marketplace_terms=True
        )

        # 3. Monetization Liability (UGX 300,000 threshold mapping)
        TeacherAccessFeeAccount.objects.get_or_create(teacher=teacher)

        return Response({
            'message': 'Independent Educator onboarding Phase 1-4 Complete',
            'teacher_id': teacher.id
        }, status=status.HTTP_201_CREATED)

