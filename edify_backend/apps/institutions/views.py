from rest_framework import viewsets, permissions
from .models import Institution, InstitutionMembership
from .serializers import InstitutionSerializer, InstitutionMembershipSerializer
from django.db.models import Q
from edify_core.permissions import SCHOOL_ADMIN_ROLES

class InstitutionViewSet(viewsets.ReadOnlyModelViewSet):
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
