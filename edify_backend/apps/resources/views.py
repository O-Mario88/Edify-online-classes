from rest_framework import viewsets, exceptions
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Resource, SharedResourceLink
from .serializers import ResourceSerializer, SharedResourceLinkSerializer
from institutions.models import InstitutionMembership
from django.db.models import Q
from .tasks import process_vimeo_upload

class TenantFilterMixin:
    def get_user_institutions(self):
        return InstitutionMembership.objects.filter(
            user=self.request.user, status='active'
        ).values_list('institution_id', flat=True)

class ResourceViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'subject', 'visibility']
    search_fields = ['title', 'description', 'author']
    ordering_fields = ['created_at', 'rating', 'price']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        inst_ids = self.get_user_institutions()
        
        return Resource.objects.filter(
            Q(visibility__in=['platform_shared', 'marketplace_public']) |
            Q(visibility='institution_only', owner_institution_id__in=inst_ids) |
            Q(visibility='private', uploaded_by=user)
        ).distinct()

    def perform_create(self, serializer):
        # Default to private internal if creating inside an institution boundary
        # Let the frontend explicitly request 'institution_only' if they want.
        owner_institution = serializer.validated_data.get('owner_institution')
        if owner_institution and owner_institution.id not in self.get_user_institutions():
            raise exceptions.PermissionDenied("You cannot upload resources on behalf of an institution you do not belong to.")
            
        instance = serializer.save(
            uploaded_by=self.request.user,
            visibility=serializer.validated_data.get('visibility', 'private')
        )
        
        # Trigger Vimeo proxy upload if it's a video file
        if instance.file_path and str(instance.file_path.name).lower().endswith(('.mp4', '.mov', '.avi', '.mkv')):
            instance.vimeo_upload_status = 'pending'
            instance.save(update_fields=['vimeo_upload_status'])
            process_vimeo_upload.delay(instance.id)

class SharedResourceLinkViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = SharedResourceLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        inst_ids = self.get_user_institutions()
        return SharedResourceLink.objects.filter(
            Q(target_class__institution_id__in=inst_ids) |
            Q(target_class__visibility='public')
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


