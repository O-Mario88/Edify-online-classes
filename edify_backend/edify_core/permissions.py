from rest_framework import permissions
from institutions.models import InstitutionMembership
from django.core.exceptions import PermissionDenied
from .rbac import PLATFORM_ROLE_MATRIX, INSTITUTIONAL_ROLE_MATRIX, has_platform_permission

# Reusable Role Definition Matrices
SCHOOL_ADMIN_ROLES = ['headteacher', 'deputy', 'ict_admin']
ACADEMIC_LEADER_ROLES = ['headteacher', 'deputy', 'dos', 'exam_officer']
TEACHER_ROLES = ['class_teacher', 'subject_teacher', 'librarian', 'counselor']

class IsSchoolAdmin(permissions.BasePermission):
    """
    Grants access only to Top-Level Institutional Administrators 
    (Headteacher, Deputy, ICT Admin).
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        return InstitutionMembership.objects.filter(
            user=request.user,
            role__in=SCHOOL_ADMIN_ROLES,
            status='active'
        ).exists()

class IsAcademicDirector(permissions.BasePermission):
    """
    Grants access to Academic Control Officers (Report Cards, Term Dates).
    (DOS, Exam Officer, Headteacher, Deputy).
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        return InstitutionMembership.objects.filter(
            user=request.user,
            role__in=ACADEMIC_LEADER_ROLES,
            status='active'
        ).exists()

class IsSchoolStaff(permissions.BasePermission):
    """
    General catch-all for any internal employee.
    (Admins + Academic Leaders + Teachers + Registrars).
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        ALL_STAFF = SCHOOL_ADMIN_ROLES + ACADEMIC_LEADER_ROLES + TEACHER_ROLES + ['registrar']
        
        return InstitutionMembership.objects.filter(
            user=request.user,
            role__in=ALL_STAFF,
            status='active'
        ).exists()

def HasPlatformPermission(required_permission):
    """
    Returns a permission class checking if the user has a specific global capability.
    """
    class _HasPlatformPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            return has_platform_permission(request.user, required_permission)
    return _HasPlatformPermission

def HasInstitutionPermission(required_permission):
    """
    Returns a permission class checking if the user has a capability within their institution.
    Looks at kwargs['institution_id'] or view's context to verify. 
    (For object-level permissions within an institution context).
    """
    class _HasInstitutionPermission(permissions.BasePermission):
        def has_permission(self, request, view):
            if not request.user.is_authenticated:
                return False
            
            # Platform admins override
            if has_platform_permission(request.user, required_permission):
                return True
                
            institution_id = view.kwargs.get('institution_id') or request.data.get('institution_id')
            if not institution_id:
                # Fallback to true if checking against general endpoint and let has_object_permission handle it
                return True
                
            membership = InstitutionMembership.objects.filter(
                user=request.user, 
                institution_id=institution_id, 
                status='active'
            ).first()
            if not membership:
                return False
                
            user_perms = INSTITUTIONAL_ROLE_MATRIX.get(membership.role, [])
            return required_permission in user_perms
            
        def has_object_permission(self, request, view, obj):
            # Same logic but we extract institution_id from the object if possible
            if has_platform_permission(request.user, required_permission):
                return True
                
            institution_id = getattr(obj, 'institution_id', None)
            if not institution_id and hasattr(obj, 'institution'):
                institution_id = obj.institution.id
                
            if not institution_id:
                return False
                
            membership = InstitutionMembership.objects.filter(
                user=request.user, 
                institution_id=institution_id, 
                status='active'
            ).first()
            
            if not membership:
                return False
                
            user_perms = INSTITUTIONAL_ROLE_MATRIX.get(membership.role, [])
            return required_permission in user_perms

    return _HasInstitutionPermission

class IsActivatedInstitution(permissions.BasePermission):
    """
    Since billing has been removed, this is a pass-through that simply ensures the institution id provided exists.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Optional: bypass for platform admins
        if request.user.role == 'admin':
            return True
            
        institution_id = view.kwargs.get('institution_id') or request.data.get('institution_id')
        if not institution_id:
            return True
            
        from institutions.models import Institution
        try:
            Institution.objects.get(id=institution_id)
            return True
        except Institution.DoesNotExist:
            return False


