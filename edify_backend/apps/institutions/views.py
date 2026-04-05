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
    Exposes the SaaS billing status and allows mock payment processing.
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
        
        # Auto-provision a free ledger if it somehow doesn't exist
        from .models import SubscriptionLedger
        ledger, created = SubscriptionLedger.objects.get_or_create(institution=institution)
        
        return Response({
            "institution": institution.name,
            "plan_tier": ledger.plan_tier,
            "monthly_rate": ledger.monthly_rate,
            "outstanding_balance": ledger.outstanding_balance,
            "is_suspended": ledger.is_suspended,
            "next_billing_date": ledger.next_billing_date
        })

    @action(detail=False, methods=['post'])
    def pay(self, request):
        amount = request.data.get('amount')
        
        active_admin_memberships = InstitutionMembership.objects.filter(
            user=request.user, 
            role__in=SCHOOL_ADMIN_ROLES,
            status='active'
        )
        
        if not active_admin_memberships.exists() or not amount:
            return Response({"detail": "Invalid Request."}, status=status.HTTP_400_BAD_REQUEST)
            
        institution = active_admin_memberships.first().institution
        from .models import SubscriptionLedger
        ledger = SubscriptionLedger.objects.get(institution=institution)
        
        ledger.outstanding_balance = max(0, float(ledger.outstanding_balance) - float(amount))
        if ledger.outstanding_balance == 0:
            ledger.is_suspended = False
        ledger.save()
        
        return Response({"detail": "Payment successful. Balance updated."}, status=status.HTTP_200_OK)

import random

class LearnerRegistrationViewSet(viewsets.ModelViewSet):
    """
    Handles the 3-step student onboarding flow natively inside the school OS.
    """
    permission_classes = [permissions.IsAuthenticated]
    # We use a dummy generic queryset here just to satisfy the router for now,
    # though custom actions drive the actual flow.
    from .models import LearnerRegistration
    queryset = LearnerRegistration.objects.all()

    def get_queryset(self):
        user = self.request.user
        admin_institutions = InstitutionMembership.objects.filter(
            user=user, role__in=SCHOOL_ADMIN_ROLES, status='active'
        ).values_list('institution_id', flat=True)
        from .models import LearnerRegistration
        return LearnerRegistration.objects.filter(institution_id__in=admin_institutions)

    @action(detail=False, methods=['post'])
    def start_registration(self, request):
        institution_id = request.data.get('institution_id')
        
        from .models import LearnerRegistration
        reg = LearnerRegistration.objects.create(
            institution_id=institution_id,
            full_name=request.data.get('full_name'),
            learner_id_number=request.data.get('learner_id_number'),
            parent_name=request.data.get('parent_name'),
            parent_phone=request.data.get('parent_phone'),
            parent_relationship=request.data.get('parent_relationship'),
            status='pending_payment'
        )
        
        # Real world: dispatch MTN MoMo prompt to `parent_phone`
        return Response({'registration_id': reg.id, 'status': reg.status})

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        reg = self.get_object()
        reg.status = 'payment_verified'
        reg.save()
        return Response({'status': reg.status})

    @action(detail=True, methods=['post'])
    def finalize_account(self, request, pk=None):
        from django.utils import timezone
        reg = self.get_object()
        pin = request.data.get('pin')
        
        # 1. Generate ID and Username safely
        student_id = f"EDU-UG-{timezone.now().year}-{random.randint(1000, 9999)}"
        username_base = reg.full_name.lower().replace(' ', '')
        username = f"{username_base}{random.randint(100, 999)}"
        
        User = get_user_model()
        user = User.objects.create(
            email=f"{username}@student.edify.mock",
            full_name=reg.full_name,
            country_code=reg.institution.country_code,
            role='student'
        )
        user.set_password(pin)
        user.save()
        
        # Enable Dual Auth System Support
        from accounts.models import StudentProfile
        StudentProfile.objects.create(
            user=user,
            system_username=username,
            student_id_number=student_id,
            default_institution=reg.institution,
            onboarding_status='completed'
        )
        
        InstitutionMembership.objects.create(
            user=user,
            institution=reg.institution,
            role='student',
            status='active'
        )
        
        # Handle the Siblings rule seamlessly
        parent_user, _ = User.objects.get_or_create(
            phone=reg.parent_phone,
            defaults={
                'full_name': reg.parent_name,
                'email': f"parent_{reg.parent_phone}@edify.mock",
                'role': 'parent'
            }
        )
        
        reg.student_user = user
        reg.status = 'active'
        reg.save()
        
        return Response({
            'student_id': student_id,
            'username': username,
            'status': 'active'
        })

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
        # We try to use the brand data immediately as well
        new_inst = Institution.objects.create(
            name=account_data.get('name', 'New Institution'),
            primary_color=brand_data.get('primaryColor', '#000000'),
            secondary_color=brand_data.get('secondaryColor', '#ffffff'),
            country_code=account_data.get('country', 'uganda'),
            subscription_plan='setup' # Important state for Onboarding logic
        )

        # 2. Setup Ledger
        from .models import SubscriptionLedger
        SubscriptionLedger.objects.create(
            institution=new_inst,
            plan_tier='setup',
            outstanding_balance=0.00
        )

        # 3. Create Admin User
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

        # 4. Bind Roles
        InstitutionMembership.objects.create(
            user=admin_user,
            institution=new_inst,
            role='headteacher',
            status='active'
        )
        
        # (Optional) Future Phase 3 Academic setup storage depending on models. 
        # For now, successfully instantiated.

        return Response({
            'message': 'Institution Phase 1-3 Successful.',
            'institution_id': new_inst.id
        }, status=status.HTTP_201_CREATED)
