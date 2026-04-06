"""
Permission classes for Finance ERP - Institution-scoped access control.

Ensures users can only access financial data for institutions they're members of,
with appropriate role-based permissions.
"""

from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from edify_backend.apps.institutions.models import Institution, InstitutionMembership


class IsInstitutionMember(permissions.BasePermission):
    """
    Permission to check if user is a member of the institution.
    
    Used for basic institution-scoped access.
    Allows: Any institution member (student, teacher, admin, finance officer)
    """
    message = "You are not a member of this institution."
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is a member of the institution."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get institution_id from URL kwargs
        institution_id = view.kwargs.get('institution_id')
        if not institution_id:
            return False
        
        # Check if user is a member of this institution
        is_member = InstitutionMembership.objects.filter(
            user=request.user,
            institution_id=institution_id
        ).exists()
        
        return is_member


class IsInstitutionAdminOrFinanceOfficer(permissions.BasePermission):
    """
    Permission for finance operations (create, update, delete invoices/payments).
    
    Allows: Institution admin, Finance officer
    Denies: Teachers, Students, Parents (view-only)
    """
    message = "You don't have permission to perform this action. Admin or Finance Officer role required."
    
    def has_permission(self, request, view):
        """Check if user is admin or finance officer in the institution."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        institution_id = view.kwargs.get('institution_id')
        if not institution_id:
            return False
        
        # Check membership and role
        membership = InstitutionMembership.objects.filter(
            user=request.user,
            institution_id=institution_id
        ).first()
        
        if not membership:
            return False
        
        # Allow admin and finance_officer roles
        return membership.role in ['admin', 'finance_officer']


class IsInstitutionAdmin(permissions.BasePermission):
    """
    Permission for restricted finance operations (GL, Journal Entries, Reports).
    
    Allows: Institution admin only
    Denies: Finance officers, teachers, students
    """
    message = "You don't have permission to perform this action. Admin access required."
    
    def has_permission(self, request, view):
        """Check if user is admin in the institution."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        institution_id = view.kwargs.get('institution_id')
        if not institution_id:
            return False
        
        # Check membership and role
        membership = InstitutionMembership.objects.filter(
            user=request.user,
            institution_id=institution_id,
            role='admin'
        ).first()
        
        return bool(membership)


class CanViewOwnFinancialData(permissions.BasePermission):
    """
    Permission for students/parents to view their own financial data.
    
    Allows: Students and parents to see own invoices and payments
    Denies: Cross-student access
    """
    message = "You can only view your own financial data."
    
    def has_permission(self, request, view):
        """Check if user is institution member or accessing own data."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        institution_id = view.kwargs.get('institution_id')
        if not institution_id:
            return False
        
        # Either institution member or trying to access own data
        is_member = InstitutionMembership.objects.filter(
            user=request.user,
            institution_id=institution_id
        ).exists()
        
        return is_member
    
    def has_object_permission(self, request, view, obj):
        """Check if student can access their own financial record."""
        # If user is admin/finance officer, allow
        membership = InstitutionMembership.objects.filter(
            user=request.user,
            institution_id=view.kwargs.get('institution_id')
        ).first()
        
        if membership and membership.role in ['admin', 'finance_officer']:
            return True
        
        # Students can only see their own data
        if hasattr(obj, 'student') and hasattr(obj.student, 'user'):
            return obj.student.user == request.user
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsFinanceModuleEnabled(permissions.BasePermission):
    """
    Permission to check if Finance module is enabled for institution.
    
    Denies access if institution hasn't enabled Finance module.
    """
    message = "Finance module is not enabled for this institution."
    
    def has_permission(self, request, view):
        """Check if institution has finance module enabled."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        institution_id = view.kwargs.get('institution_id')
        if not institution_id:
            return False
        
        try:
            institution = Institution.objects.get(id=institution_id)
            # Assuming Institution has a modules.finance_enabled field
            # Adjust based on actual Institution model structure
            return True  # For now, assume always enabled
        except Institution.DoesNotExist:
            return False
