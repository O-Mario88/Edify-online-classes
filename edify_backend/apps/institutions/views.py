from rest_framework import viewsets, permissions, status
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
