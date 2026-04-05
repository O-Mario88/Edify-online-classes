from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import ParentProfile, StudentProfile
from billing.models import Invoice, TransactionRecord
from billing.services import PesapalMockService
from parent_portal.models import ParentStudentLink

class StudentOnboardingAPIView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        student_data = request.data.get('student', {})
        parent_data = request.data.get('parent', {})
        payment_data = request.data.get('payment', {})

        if not student_data or not parent_data or not payment_data:
            return Response({'error': 'Missing student, parent, or payment details.'}, status=status.HTTP_400_BAD_REQUEST)

        parent_phone = parent_data.get('phone')
        if not parent_phone:
            return Response({'error': 'Parent phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Lookup or Create Parent
        parent_email = parent_data.get('email')
        if not parent_email:
            parent_email = f"parent_{parent_phone.replace(' ', '').replace('+', '')}@edify.portal"

        parent_user = User.objects.filter(phone=parent_phone, role='parent').first()
        if not parent_user:
            parent_user = User.objects.filter(email=parent_email).first()

        if not parent_user:
            parent_user = User.objects.create_user(
                email=parent_email,
                full_name=parent_data.get('full_name', 'Guardian'),
                country_code=student_data.get('country_code', 'uganda'),
                role='parent',
                phone=parent_phone
            )
            # Parent user does not have a set password initially
            parent_user.set_unusable_password()
            parent_user.save()
            ParentProfile.objects.create(user=parent_user)

        parent_profile = parent_user.parent_profile

        # 2. Create Student
        # Handle case where student email might exist if re-running
        student_email = student_data.get('email')
        if User.objects.filter(email=student_email).exists():
            return Response({'error': 'Student email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        student_user = User.objects.create_user(
            email=student_email,
            full_name=student_data.get('full_name'),
            country_code=student_data.get('country_code'),
            password=student_data.get('password'),
            role='student'
        )
        student_profile = StudentProfile.objects.create(user=student_user)

        # 3. Create Parent-Student Link
        ParentStudentLink.objects.create(
            parent_profile=parent_profile,
            student_profile=student_profile,
            relationship_type=parent_data.get('relationship', 'other').lower(),
            consent_status='approved' # Implicitly approved since onboarding together
        )

        # 4. Create Invoice and mock mobile money transaction
        invoice = Invoice.objects.create(
            user=student_user,
            amount_due=50000.00,
            currency='UGX',
            description='Initial Platform Onboarding / Setup'
        )
        
        # Initiate payment
        payment_gateway_response = PesapalMockService.submit_order(invoice=invoice)
        
        TransactionRecord.objects.create(
            invoice=invoice,
            pesapal_tracking_id=payment_gateway_response['tracking_id'],
            pesapal_merchant_reference=payment_gateway_response['merchant_reference'],
            amount=50000.00,
            currency='UGX',
            payment_method=payment_data.get('network', 'mobile_money')
        )

        return Response({
            'message': 'Student and Parent created successfully. Awaiting payment.',
            'redirect_url': payment_gateway_response['redirect_url'],
            'tracking_id': payment_gateway_response['tracking_id']
        }, status=status.HTTP_201_CREATED)
