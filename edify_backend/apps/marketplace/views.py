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

        return Response({
            'message': 'Independent Educator onboarding Phase 1-4 Complete',
            'teacher_id': teacher.id
        }, status=status.HTTP_201_CREATED)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import PesapalTransaction
from .services.pesapal_service import PesapalService
import uuid

class PesapalCheckoutInitView(APIView):
    def post(self, request, *args, **kwargs):
        # We will dynamically determine callback URLs assuming standard browser host
        origin = request.META.get('HTTP_ORIGIN', 'http://localhost:5173')
        
        amount = request.data.get('amount')
        description = request.data.get('description', 'Edify Platform Payment')
        
        if not amount:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        merchant_reference = str(uuid.uuid4())
        callback_url = f"{origin}/dashboard/student?status=payment_callback" 
        
        # In a generic setup, the IPN url might need ngrok if running locally
        ipn_url = f"https://api.maple-edify.app/api/v1/marketplace/pesapal-ipn/" # Using a robust namespace route
        
        try:
            # 1. Get Token & Register IPN  
            token = PesapalService.get_bearer_token()
            ipn_id = PesapalService.register_ipn_url(token, ipn_url)
            
            # 2. Get User context safely
            email = request.user.email if request.user.is_authenticated else "guest@school.app"
            first_name = getattr(request.user, 'full_name', 'Guest').split(' ')[0]
            last_name = getattr(request.user, 'full_name', 'User').split(' ')[-1]
            phone = getattr(request.user, 'phone', '0777000000')

            # 3. Submit Order
            payment_response = PesapalService.submit_order(
                amount=amount,
                description=description,
                reference=merchant_reference,
                email=email,
                first_name=first_name,
                last_name=last_name,
                phone_number=phone,
                callback_url=callback_url,
                ipn_id=ipn_id
            )
            
            # 4. Save Internal Tracking Reference if authenticated
            if request.user.is_authenticated:
                PesapalTransaction.objects.create(
                    user=request.user,
                    merchant_reference=merchant_reference,
                    order_tracking_id=payment_response.get('order_tracking_id'),
                    amount=amount,
                    description=description,
                    notification_id=ipn_id
                )
                
            return Response({'redirect_url': payment_response.get('redirect_url')}, status=status.HTTP_200_OK)
            
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Pesapal Initialization failed: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PesapalIPNWebhookView(APIView):
    """Listens for Instant Payment Notifications triggered asynchronously from Pesapal"""
    permission_classes = [] # Public Route
    
    def post(self, request, *args, **kwargs):
        # Pesapal normally sends OrderTrackingId and OrderNotificationType in the IPN query
        order_tracking_id = request.data.get('OrderTrackingId') or request.query_params.get('OrderTrackingId')
        notification_type = request.data.get('OrderNotificationType') or request.query_params.get('OrderNotificationType')
        merchant_reference = request.data.get('OrderMerchantReference') or request.query_params.get('OrderMerchantReference')
        
        if not order_tracking_id:
            return Response({'error': 'OrderTrackingId missing'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Recheck status with Pesapal explicitly
            transaction_status_data = PesapalService.get_transaction_status(order_tracking_id)
            
            if transaction_status_data:
                payment_status_code = transaction_status_data.get('payment_status_description', '').upper()
                
                # Fetch our transaction mapping
                transaction = PesapalTransaction.objects.filter(order_tracking_id=order_tracking_id).first()
                if transaction:
                    transaction.state = payment_status_code
                    transaction.raw_response = transaction_status_data
                    transaction.save()
                    
                    # Activate student account statuses when "COMPLETED"
                    if payment_status_code == "COMPLETED" and transaction.user:
                        if hasattr(transaction.user, 'student_profile'):
                            transaction.user.student_profile.status = 'active'
                            transaction.user.student_profile.save()
                            
            # Always return a 200 response to acknowledge IPN so Pesapal stops retrying
            return Response({'status': '200', 'message': 'IPN Processed'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

