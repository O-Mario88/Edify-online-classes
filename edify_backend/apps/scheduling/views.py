from rest_framework import viewsets, permissions
from .models import AcademicTerm, Room, TimetableSlot
from .serializers import AcademicTermSerializer, RoomSerializer, TimetableSlotSerializer
from institutions.models import InstitutionMembership
from classes.models import ClassEnrollment
from edify_core.permissions import SCHOOL_ADMIN_ROLES, ACADEMIC_LEADER_ROLES, TEACHER_ROLES

class TimetableSlotViewSet(viewsets.ModelViewSet):
    """
    Renders out the specific Grid schedule dynamically mapped to a user's active context.
    - Admins see the whole school board.
    - Teachers see only their assigned classes.
    - Students see only the slots associated with their active enrollments.
    """
    serializer_class = TimetableSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Gather all Institutions where the user is an Active Admin
        admin_institutions = InstitutionMembership.objects.filter(
            user=user, 
            role__in=SCHOOL_ADMIN_ROLES + ACADEMIC_LEADER_ROLES,
            status='active'
        ).values_list('institution_id', flat=True)
        
        if admin_institutions.exists():
            return TimetableSlot.objects.filter(institution_id__in=admin_institutions).order_by('day_of_week', 'start_time')
            
        # 2. Are they a Teacher?
        teacher_institutions = InstitutionMembership.objects.filter(
            user=user,
            role__in=TEACHER_ROLES,
            status='active'
        ).values_list('institution_id', flat=True)
        
        if teacher_institutions.exists():
            # A teacher only gets back slots they are natively assigned to.
            return TimetableSlot.objects.filter(teacher=user, institution_id__in=teacher_institutions).order_by('day_of_week', 'start_time')
            
        # 3. Are they a Student? 
        student_enrolled_class_ids = ClassEnrollment.objects.filter(
            student=user,
            status='active'
        ).values_list('enrolled_class_id', flat=True)
        
        return TimetableSlot.objects.filter(assigned_class_id__in=student_enrolled_class_ids).order_by('day_of_week', 'start_time')
