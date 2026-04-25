from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ParentStudentLink, WeeklySummary, RiskAlert
from .serializers import ParentStudentLinkSerializer, WeeklySummarySerializer, RiskAlertSerializer

class ParentStudentLinkViewSet(viewsets.ModelViewSet):
    queryset = ParentStudentLink.objects.all()
    serializer_class = ParentStudentLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Scope visibility: a parent only sees their own links; staff see all."""
        user = self.request.user
        qs = ParentStudentLink.objects.select_related(
            'parent_profile__user', 'student_profile__user',
        )
        if getattr(user, 'is_staff', False) or getattr(user, 'role', '') in ('admin', 'platform_admin'):
            return qs
        return qs.filter(parent_profile__user=user)

    @action(detail=False, methods=['get'], url_path='my-children')
    def my_children(self, request):
        """GET /api/v1/parent-student-links/my-children/

        Returns each linked child as a thin payload the frontend can use to
        populate a child selector. Includes child user id, name, email, role,
        and the parent's relationship type.
        """
        links = self.get_queryset().filter(parent_profile__user=request.user)
        children = []
        for link in links:
            sp = link.student_profile
            if not sp or not sp.user:
                continue
            children.append({
                'student_user_id': sp.user.id,
                'student_email': sp.user.email,
                'student_name': sp.user.full_name,
                'student_stage': getattr(sp.user, 'stage', None),
                'relationship': link.relationship_type,
                'consent_status': link.consent_status,
                'link_id': link.id,
            })
        return Response(children)

class WeeklySummaryViewSet(viewsets.ModelViewSet):
    queryset = WeeklySummary.objects.all()
    serializer_class = WeeklySummarySerializer
    permission_classes = [IsAuthenticated]

class RiskAlertViewSet(viewsets.ModelViewSet):
    queryset = RiskAlert.objects.all()
    serializer_class = RiskAlertSerializer
    permission_classes = [IsAuthenticated]

