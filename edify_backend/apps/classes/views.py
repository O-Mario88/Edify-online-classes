from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Class, ClassEnrollment
from .serializers import ClassSerializer, ClassEnrollmentSerializer
from institutions.models import InstitutionMembership
from edify_core.permissions import SCHOOL_ADMIN_ROLES, ACADEMIC_LEADER_ROLES, TEACHER_ROLES

class ClassViewSet(viewsets.ModelViewSet):
    """
    Renders Classes strictly bounded by the request context.
    - Admins see all classes inside their Institution.
    - Teachers see classes they are tagged to teach.
    - Students see classes they are explicitly explicitly enrolled in.
    """
    serializer_class = ClassSerializer
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
            return Class.objects.filter(institution_id__in=admin_institutions)
            
        # 2. Are they a Teacher?
        teacher_institutions = InstitutionMembership.objects.filter(
            user=user,
            role__in=TEACHER_ROLES,
            status='active'
        ).values_list('institution_id', flat=True)
        
        if teacher_institutions.exists():
            # A teacher only gets back classes they are natively assigned to.
            return Class.objects.filter(teacher=user, institution_id__in=teacher_institutions)
            
        # 3. Are they a Student? 
        # A student only gets back classes they explicitly mapped to in ClassEnrollment.
        student_enrolled_class_ids = ClassEnrollment.objects.filter(
            student=user,
            status='active'
        ).values_list('enrolled_class_id', flat=True)
        
        return Class.objects.filter(id__in=student_enrolled_class_ids)

class ClassEnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = ClassEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ClassEnrollment.objects.filter(student=self.request.user)
