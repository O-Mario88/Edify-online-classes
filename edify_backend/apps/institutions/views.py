from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Institution, InstitutionMembership
from .serializers import InstitutionSerializer, InstitutionMembershipSerializer, BulkInviteSerializer
from edify_core.permissions import SCHOOL_ADMIN_ROLES

class InstitutionViewSet(viewsets.ModelViewSet):
    """
    Returns only the Institutions the user is a member of.
    """
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get IDs of institutions where this user has an active membership
        institution_ids = InstitutionMembership.objects.filter(
            user=user, 
            status='active'
        ).values_list('institution_id', flat=True)
        return Institution.objects.filter(id__in=institution_ids)

    def perform_create(self, serializer):
        institution = serializer.save()
        InstitutionMembership.objects.create(
            user=self.request.user,
            institution=institution,
            role='headteacher',
            status='active'
        )

    @action(detail=True, methods=['post'])
    def bulk_invite(self, request, pk=None):
        institution = self.get_object()
        
        is_admin = InstitutionMembership.objects.filter(
            user=request.user,
            institution=institution,
            role__in=SCHOOL_ADMIN_ROLES,
            status='active'
        ).exists()
        
        if not is_admin:
            return Response({'detail': 'You do not have permission.'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = BulkInviteSerializer(data=request.data)
        if serializer.is_valid():
            emails = serializer.validated_data['emails']
            role = serializer.validated_data['role']
            
            User = get_user_model()
            created_count = 0
            
            for email in emails:
                email_clean = email.lower().strip()
                user, created_user = User.objects.get_or_create(
                    email=email_clean,
                    defaults={
                        'full_name': email_clean.split('@')[0],
                        'country_code': institution.country_code
                    }
                )
                
                membership, created_mem = InstitutionMembership.objects.get_or_create(
                    user=user,
                    institution=institution,
                    role=role,
                    defaults={'status': 'pending'}
                )
                if created_mem:
                    created_count += 1
                    
            return Response({'detail': f'Successfully invited {created_count} users as {role}.'}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InstitutionMembershipViewSet(viewsets.ModelViewSet):
    """
    Returns the memberships scoped to the user's specific institutions.
    Administrators can see all memberships within their institution.
    """
    serializer_class = InstitutionMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Which Institutions is this user an Admin for?
        admin_institutions = InstitutionMembership.objects.filter(
            user=user, 
            role__in=SCHOOL_ADMIN_ROLES,
            status='active'
        ).values_list('institution_id', flat=True)
        
        if admin_institutions.exists():
            # Admins can see everyone inside their managed institutions
            return InstitutionMembership.objects.filter(institution_id__in=admin_institutions)
        
        # 2. Non-admins can only ever see their own specific membership record
        return InstitutionMembership.objects.filter(user=user, status='active')

class BillingStatusView(viewsets.ViewSet):
    """
    Exposes the SaaS subscription/billing status for institution admins.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def status(self, request):
        active_admin_memberships = InstitutionMembership.objects.filter(
            user=request.user, 
            role__in=SCHOOL_ADMIN_ROLES,
            status='active'
        )
        
        if not active_admin_memberships.exists():
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
            
        institution = active_admin_memberships.first().institution
        
        return Response({
            "institution": institution.name,
            "plan_tier": institution.subscription_plan,
            "active_students": institution.active_student_count,
            "is_suspended": False,
        })

    @action(detail=False, methods=['post'])
    def pay(self, request):
        plan = request.data.get('plan')
        
        active_admin_memberships = InstitutionMembership.objects.filter(
            user=request.user, 
            role__in=SCHOOL_ADMIN_ROLES,
            status='active'
        )
        
        if not active_admin_memberships.exists() or not plan:
            return Response({"detail": "Invalid Request."}, status=status.HTTP_400_BAD_REQUEST)
            
        institution = active_admin_memberships.first().institution
        institution.subscription_plan = plan
        institution.save()
        
        return Response({"detail": "Subscription updated successfully."}, status=status.HTTP_200_OK)

import random
import uuid
from django.utils import timezone

class LearnerRegistrationViewSet(viewsets.ModelViewSet):
    """
    Handles the full student onboarding flow with payment-gated activation.
    
    Flow: 
    1. start_registration — Student + parent details, auto-link parent account
    2. select_subscription — Attach subscription plan
    3. initiate_payment — Start MTN/Airtel/Pesapal payment
    4. check_payment_status — Poll current payment state
    5. simulate_payment_success — Sandbox: simulate a successful payment (for dev/testing)
    6. activate_account — Finalize student account after successful payment
    """
    permission_classes = [permissions.IsAuthenticated]
    
    from .models import LearnerRegistration
    queryset = LearnerRegistration.objects.all()

    def get_queryset(self):
        user = self.request.user
        admin_institutions = InstitutionMembership.objects.filter(
            user=user, role__in=SCHOOL_ADMIN_ROLES, status='active'
        ).values_list('institution_id', flat=True)
        from .models import LearnerRegistration
        return LearnerRegistration.objects.filter(institution_id__in=admin_institutions)

    @action(detail=False, methods=['get'])
    def subscription_plans(self, request):
        """Return all available subscription plans."""
        from .models import SubscriptionPlan
        from .serializers import SubscriptionPlanSerializer
        plans = SubscriptionPlan.objects.filter(is_active=True)
        serializer = SubscriptionPlanSerializer(plans, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def activation_summary(self, request):
        """Returns aggregate counts for the institution dashboard."""
        admin_institutions = InstitutionMembership.objects.filter(
            user=request.user, role__in=SCHOOL_ADMIN_ROLES, status='active'
        ).values_list('institution_id', flat=True)
        
        from .models import LearnerRegistration
        registrations = LearnerRegistration.objects.filter(institution_id__in=admin_institutions)
        
        return Response({
            'total': registrations.count(),
            'draft': registrations.filter(status='draft').count(),
            'parent_linked': registrations.filter(status='parent_linked').count(),
            'payment_pending': registrations.filter(status__in=['payment_pending', 'payment_in_progress']).count(),
            'payment_failed': registrations.filter(status='payment_failed').count(),
            'activated': registrations.filter(status='activated').count(),
        })

    @action(detail=False, methods=['post'])
    def start_registration(self, request):
        """
        Step 1+2: Save student + parent details, auto-create/link parent account.
        State: draft → parent_linked
        """
        institution_id = request.data.get('institution_id')
        
        from .models import LearnerRegistration
        
        # Create the registration record
        reg = LearnerRegistration.objects.create(
            institution_id=institution_id,
            full_name=request.data.get('full_name'),
            learner_id_number=request.data.get('learner_id_number'),
            gender=request.data.get('gender'),
            stream_section=request.data.get('stream_section'),
            parent_name=request.data.get('parent_name'),
            parent_phone=request.data.get('parent_phone'),
            parent_phone_secondary=request.data.get('parent_phone_secondary'),
            parent_relationship=request.data.get('parent_relationship'),
            parent_email=request.data.get('parent_email'),
            parent_address=request.data.get('parent_address'),
            parent_consent=request.data.get('parent_consent', False),
            status='draft'
        )
        
        # Auto-create or link parent account
        parent_phone = request.data.get('parent_phone', '').strip()
        parent_name = request.data.get('parent_name', '').strip()
        parent_email = request.data.get('parent_email', '').strip()
        
        User = get_user_model()
        parent_user = None
        is_new_parent = False
        
        if parent_phone:
            # Try to find existing parent by phone
            parent_user = User.objects.filter(phone=parent_phone, role='parent').first()
            
            if not parent_user:
                # Create a new parent account
                parent_email_final = parent_email or f"parent_{parent_phone.replace('+', '').replace(' ', '')}@maple.school"
                
                # Ensure email uniqueness
                if User.objects.filter(email=parent_email_final).exists():
                    parent_email_final = f"parent_{parent_phone.replace('+', '').replace(' ', '')}_{random.randint(100,999)}@maple.school"
                
                parent_user = User.objects.create(
                    email=parent_email_final,
                    full_name=parent_name or f"Parent of {reg.full_name}",
                    phone=parent_phone,
                    country_code=reg.institution.country_code if reg.institution else 'uganda',
                    role='parent'
                )
                parent_user.set_password(parent_phone[-4:])  # Default PIN = last 4 digits of phone
                parent_user.save()
                is_new_parent = True
            
            # Link parent to registration
            reg.parent_user = parent_user
            reg.status = 'parent_linked'
            reg.save()
            
            # Create ParentStudentLink if parent_portal app has it
            try:
                from parent_portal.models import ParentStudentLink
                # We'll create the full link after the student account is created in activate_account
            except ImportError:
                pass
        else:
            reg.status = 'parent_linked'
            reg.save()
        
        return Response({
            'registration_id': str(reg.id),
            'status': reg.status,
            'parent_linked': parent_user is not None,
            'is_new_parent': is_new_parent,
            'parent_name': parent_user.full_name if parent_user else None,
        })

    @action(detail=True, methods=['post'])
    def select_subscription(self, request, pk=None):
        """
        Step 4: Attach a subscription plan to the registration.
        State: parent_linked → subscription_selected
        """
        reg = self.get_object()
        plan_id = request.data.get('plan_id')
        
        from .models import SubscriptionPlan
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'detail': 'Invalid subscription plan.'}, status=status.HTTP_400_BAD_REQUEST)
        
        reg.subscription_plan = plan
        reg.status = 'subscription_selected'
        reg.save()
        
        return Response({
            'registration_id': str(reg.id),
            'status': reg.status,
            'plan_name': plan.name,
            'amount': str(plan.price_ugx),
        })

    @action(detail=True, methods=['post'])
    def initiate_payment(self, request, pk=None):
        """
        Step 5+6: Initiate payment via selected method.
        State: subscription_selected → payment_in_progress
        
        Methods:
        - mtn_momo / airtel_money: Push STK prompt to payer phone
        - visa_pesapal: Redirect to Pesapal hosted checkout
        """
        reg = self.get_object()
        payment_method = request.data.get('payment_method')
        payer_phone = request.data.get('payer_phone', reg.parent_phone)
        
        if not reg.subscription_plan:
            return Response({'detail': 'No subscription plan selected.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not payment_method:
            return Response({'detail': 'Payment method is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save payment method
        reg.payment_method = payment_method
        reg.payer_phone = payer_phone
        reg.save()
        
        amount = reg.subscription_plan.price_ugx
        description = f"Student activation for {reg.full_name} — {reg.subscription_plan.name}"
        internal_ref = str(uuid.uuid4())
        
        # Create payment transaction record
        from .models import StudentPaymentTransaction
        txn = StudentPaymentTransaction.objects.create(
            registration=reg,
            institution=reg.institution,
            subscription_plan=reg.subscription_plan,
            student_name=reg.full_name,
            parent_name=reg.parent_name or '',
            amount=amount,
            payment_method=payment_method,
            payer_phone=payer_phone or '',
            internal_reference=internal_ref,
            status='initiated',
        )
        
        if payment_method in ('mtn_momo', 'airtel_money'):
            # Mobile Money collection
            from marketplace.services.momo_collection import MobileMoneyCollectionService
            
            result = MobileMoneyCollectionService.request_payment(
                phone_number=payer_phone,
                amount=float(amount),
                reference=internal_ref,
                provider=payment_method,
                description=description,
            )
            
            txn.provider_reference = result.get('provider_reference', '')
            txn.status = 'awaiting_authorization' if result['success'] else 'failed'
            txn.provider_response = result
            txn.save()
            
            reg.status = 'payment_in_progress' if result['success'] else 'payment_failed'
            reg.save()
            
            return Response({
                'registration_id': str(reg.id),
                'transaction_id': str(txn.id),
                'status': txn.status,
                'message': result.get('message', ''),
                'payment_method': payment_method,
            })
            
        elif payment_method == 'visa_pesapal':
            # Pesapal hosted checkout redirect
            from marketplace.services.pesapal_service import PesapalService
            
            origin = request.META.get('HTTP_ORIGIN', 'http://localhost:5173')
            callback_url = f"{origin}/dashboard/institution?payment_callback=true&reg_id={reg.id}"
            ipn_url = 'https://api.maple-edify.app/api/v1/institutions/payment-callback/'
            
            try:
                token = PesapalService.get_bearer_token()
                ipn_id = PesapalService.register_ipn_url(token, ipn_url)
                
                email = reg.parent_email or reg.parent_user.email if reg.parent_user else 'student@maple.school'
                first_name = (reg.parent_name or 'Parent').split(' ')[0]
                last_name = (reg.parent_name or 'User').split(' ')[-1]
                
                payment_response = PesapalService.submit_order(
                    amount=float(amount),
                    description=description,
                    reference=internal_ref,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    phone_number=payer_phone or '',
                    callback_url=callback_url,
                    ipn_id=ipn_id,
                )
                
                txn.provider_reference = payment_response.get('order_tracking_id', '')
                txn.status = 'awaiting_authorization'
                txn.provider_response = payment_response
                txn.save()
                
                reg.status = 'payment_in_progress'
                reg.save()
                
                return Response({
                    'registration_id': str(reg.id),
                    'transaction_id': str(txn.id),
                    'status': 'redirect',
                    'redirect_url': payment_response.get('redirect_url'),
                    'payment_method': 'visa_pesapal',
                })
                
            except Exception as e:
                txn.status = 'failed'
                txn.provider_response = {'error': str(e)}
                txn.save()
                
                reg.status = 'payment_failed'
                reg.save()
                
                return Response({
                    'detail': f'Payment initiation failed: {str(e)}',
                    'registration_id': str(reg.id),
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'detail': 'Invalid payment method.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def check_payment_status(self, request, pk=None):
        """Poll the payment status for a registration."""
        reg = self.get_object()
        
        from .models import StudentPaymentTransaction
        latest_txn = reg.payment_attempts.order_by('-created_at').first()
        
        if not latest_txn:
            return Response({'status': 'no_transaction', 'message': 'No payment attempt found.'})
        
        # If MoMo, poll provider
        if latest_txn.payment_method in ('mtn_momo', 'airtel_money') and latest_txn.status == 'awaiting_authorization':
            from marketplace.services.momo_collection import MobileMoneyCollectionService
            
            if latest_txn.payment_method == 'mtn_momo' and latest_txn.provider_reference:
                provider_status = MobileMoneyCollectionService.check_mtn_payment_status(latest_txn.provider_reference)
                mtn_status = provider_status.get('status', 'PENDING')
                
                if mtn_status == 'SUCCESSFUL':
                    latest_txn.status = 'successful'
                    latest_txn.completed_at = timezone.now()
                    latest_txn.save()
                    reg.status = 'payment_success'
                    reg.save()
                elif mtn_status in ('FAILED', 'REJECTED'):
                    latest_txn.status = 'failed'
                    latest_txn.save()
                    reg.status = 'payment_failed'
                    reg.save()
        
        return Response({
            'registration_id': str(reg.id),
            'transaction_id': str(latest_txn.id),
            'payment_status': latest_txn.status,
            'onboarding_status': reg.status,
        })

    @action(detail=True, methods=['post'])
    def simulate_payment_success(self, request, pk=None):
        """
        SANDBOX ONLY: Simulate a successful payment for testing.
        """
        reg = self.get_object()
        
        from .models import StudentPaymentTransaction
        latest_txn = reg.payment_attempts.order_by('-created_at').first()
        
        if latest_txn:
            latest_txn.status = 'successful'
            latest_txn.completed_at = timezone.now()
            latest_txn.provider_response = {'simulated': True, 'message': 'Sandbox payment success'}
            latest_txn.save()
        
        reg.status = 'payment_success'
        reg.save()
        
        return Response({
            'registration_id': str(reg.id),
            'status': 'payment_success',
            'message': 'Payment simulated as successful. Ready for account activation.',
        })

    @action(detail=True, methods=['post'])
    def activate_account(self, request, pk=None):
        """
        Final step: Create the student user account after successful payment.
        State: payment_success → activated
        """
        from django.utils import timezone as tz
        reg = self.get_object()
        pin = request.data.get('pin', '')
        
        if reg.status != 'payment_success':
            return Response({'detail': 'Payment must be confirmed before activation.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(pin) != 4 or not pin.isdigit():
            return Response({'detail': 'PIN must be exactly 4 digits.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate student ID and username
        student_id = f"MPL-UG-{tz.now().year}-{random.randint(1000, 9999)}"
        username_base = reg.full_name.lower().replace(' ', '')
        username = f"{username_base}{random.randint(100, 999)}"
        
        User = get_user_model()
        
        # Create student user account
        student_user = User.objects.create(
            email=f"{username}@student.maple.school",
            full_name=reg.full_name,
            country_code=reg.institution.country_code if reg.institution else 'uganda',
            role='student'
        )
        student_user.set_password(pin)
        student_user.save()
        
        # Create StudentProfile for Dual Auth
        try:
            from accounts.models import StudentProfile
            StudentProfile.objects.create(
                user=student_user,
                system_username=username,
                student_id_number=student_id,
                default_institution=reg.institution,
                onboarding_status='completed'
            )
        except Exception:
            pass
        
        # Create institution membership
        InstitutionMembership.objects.create(
            user=student_user,
            institution=reg.institution,
            role='student',
            status='active'
        )
        
        # Link parent to student
        if reg.parent_user:
            try:
                from parent_portal.models import ParentStudentLink
                ParentStudentLink.objects.get_or_create(
                    parent=reg.parent_user,
                    student=student_user,
                    defaults={'relationship': reg.parent_relationship or 'guardian'}
                )
            except (ImportError, Exception):
                pass
        
        # Create activation record
        from .models import StudentActivation
        StudentActivation.objects.create(
            student=student_user,
            registration=reg,
            subscription_plan=reg.subscription_plan,
            status='active',
            activated_at=tz.now(),
            expires_at=tz.now() + timezone.timedelta(days=reg.subscription_plan.duration_days) if reg.subscription_plan else None,
        )
        
        # Finalize registration
        reg.student_user = student_user
        reg.status = 'activated'
        reg.completed_at = tz.now()
        reg.save()
        
        return Response({
            'student_id': student_id,
            'username': username,
            'status': 'activated',
            'full_name': reg.full_name,
        })

    # Legacy endpoint for backward compatibility
    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        reg = self.get_object()
        reg.status = 'payment_success'
        reg.save()
        return Response({'status': reg.status})

    @action(detail=True, methods=['post'])
    def finalize_account(self, request, pk=None):
        """Legacy: Redirect to activate_account."""
        return self.activate_account(request, pk=pk)


class AdminPinResetView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        student_id = request.data.get('student_id')
        new_pin = request.data.get('new_pin')
        
        User = get_user_model()
        student = User.objects.get(id=student_id)
        
        student.set_password(new_pin)
        student.save()
        
        from .models import TemporaryPinReset
        TemporaryPinReset.objects.create(
            student=student,
            requested_by=request.user,
            method='admin',
            is_used=True
        )
        return Response({'status': 'PIN Reset Successful'})

from rest_framework.permissions import AllowAny
from django.db import transaction

class InstitutionOnboardingAPIView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        account_data = request.data.get('account', {})
        brand_data = request.data.get('brand', {})
        academic_data = request.data.get('academic', {})

        if not account_data or not account_data.get('name') or not account_data.get('email'):
            return Response({'error': 'Missing required account info.'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        
        # Determine unique email constraint
        if User.objects.filter(email=account_data.get('email', '').strip().lower()).exists():
            return Response({'error': 'Admin email already exists. Please log in or use a different email.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Create Core Institution & Branding
        from .models import Institution
        # Determine school level - must be 'primary' or 'secondary'
        school_level = account_data.get('type', 'secondary').lower()
        if school_level not in ('primary', 'secondary'):
            school_level = 'secondary'

        # Determine grade offerings based on school level
        grade_offerings = []
        if school_level == 'primary':
            grade_offerings = [4, 5, 6, 7]  # Uganda P4-P7
        elif school_level == 'secondary':
            grade_offerings = [8, 9, 10, 11, 12, 13]  # Uganda S1-S6

        new_inst = Institution.objects.create(
            name=account_data.get('name', 'New Institution'),
            primary_color=brand_data.get('primaryColor', '#000000'),
            secondary_color=brand_data.get('secondaryColor', '#ffffff'),
            country_code=account_data.get('country', 'uganda'),
            school_level=school_level,
            grade_offerings=grade_offerings,
            subscription_plan='setup' # Important state for Onboarding logic
        )

        # 2. Create Admin User
        from django.utils.text import slugify
        admin_email = account_data.get('email').strip().lower()
        admin_user = User.objects.create_user(
            email=admin_email,
            full_name=account_data.get('adminName', 'School Administrator'),
            country_code=account_data.get('country', 'uganda'),
            role='institution_admin',
            phone=account_data.get('phone', '')
        )
        admin_user.set_password(account_data.get('password', 'secure_password'))
        admin_user.save()

        # 3. Bind Roles
        InstitutionMembership.objects.create(
            user=admin_user,
            institution=new_inst,
            role='headteacher',
            status='active'
        )

        return Response({
            'message': 'Institution Phase 1-3 Successful.',
            'institution_id': new_inst.id
        }, status=status.HTTP_201_CREATED)
