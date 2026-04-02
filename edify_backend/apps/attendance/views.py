from rest_framework import viewsets, permissions
from .models import DailyRegister, LessonAttendance
from .serializers import DailyRegisterSerializer, LessonAttendanceSerializer
from institutions.models import InstitutionMembership
from classes.models import ClassEnrollment
from edify_core.permissions import SCHOOL_ADMIN_ROLES, ACADEMIC_LEADER_ROLES, TEACHER_ROLES

class DailyRegisterViewSet(viewsets.ModelViewSet):
    """
    Exposes the Homeroom-style Truancy Register natively scoped.
    - Admins see the whole school board.
    - Teachers see rosters scoped to the schools they teach.
    - Students see only their own attendance marks.
    """
    serializer_class = DailyRegisterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Gather all Institutions where the user is an Active Admin or Teacher
        staff_institutions = InstitutionMembership.objects.filter(
            user=user, 
            role__in=SCHOOL_ADMIN_ROLES + ACADEMIC_LEADER_ROLES + TEACHER_ROLES,
            status='active'
        ).values_list('institution_id', flat=True)
        
        if staff_institutions.exists():
            return DailyRegister.objects.filter(institution_id__in=staff_institutions).order_by('-record_date')
            
        # 2. Are they a Student? 
        return DailyRegister.objects.filter(student=user).order_by('-record_date')

class LessonAttendanceViewSet(viewsets.ModelViewSet):
    """
    Exposes the Period-Truancy checker. Allows detection of lesson skipping.
    """
    serializer_class = LessonAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Staff Members (Admins & Teachers)
        staff_institutions = InstitutionMembership.objects.filter(
            user=user, 
            role__in=SCHOOL_ADMIN_ROLES + ACADEMIC_LEADER_ROLES + TEACHER_ROLES,
            status='active'
        ).values_list('institution_id', flat=True)
        
        if staff_institutions.exists():
            # A lesson is tied to a Class, which is tied to an Institution.
            return LessonAttendance.objects.filter(lesson__parent_class__institution_id__in=staff_institutions).order_by('-timestamp')
            
        # 2. Students
        return LessonAttendance.objects.filter(student=user).order_by('-timestamp')
