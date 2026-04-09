from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Resource
from .serializers import ResourceSerializer
from .upload_serializer import ResourceUploadSerializer
from .tasks import process_vimeo_upload
from institutions.models import InstitutionMembership

class ResourceUploadViewSet(viewsets.ViewSet):
    """
    API endpoint for resource uploads with Vimeo integration.
    Handles file validation, async Vimeo processing, and storage.
    """
    permission_classes = [IsAuthenticated]
    
    def get_user_institutions(self, user):
        """Get list of institutions the user belongs to"""
        return InstitutionMembership.objects.filter(
            user=user, status='active'
        ).values_list('institution_id', flat=True)
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        Upload a resource file.
        
        POST /api/v1/resources/upload/
        
        Content-Type: multipart/form-data
        
        Fields:
            - file_path: File to upload (required)
            - title: Resource title (required)
            - description: Resource description (optional)
            - category: Resource category (optional): 'Video', 'Textbook', 'Notes', etc.
            - visibility: 'private', 'institution_only', 'platform_shared' (optional, default: 'private')
            - subject: Subject ID (optional)
            - class_level: Class Level ID (optional)
            - topic: Topic ID (optional)
        """
        serializer = ResourceUploadSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            resource = serializer.save()
            
            # Set ownership context
            user_inst_ids = self.get_user_institutions(request.user)
            
            # If posting to institution, verify permission
            owner_institution = request.data.get('owner_institution')
            if owner_institution and owner_institution not in user_inst_ids:
                resource.delete()
                return Response(
                    {'success': False, 'error': 'Not authorized for this institution'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            resource.uploaded_by = request.user
            if owner_institution:
                resource.owner_institution_id = owner_institution
            resource.save()
            
            # Trigger async Vimeo upload for video files
            if resource.file_path:
                file_ext = str(resource.file_path.name).lower().split('.')[-1]
                if file_ext in ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v']:
                    resource.vimeo_upload_status = 'pending'
                    resource.save(update_fields=['vimeo_upload_status'])
                    process_vimeo_upload.delay(resource.id)
                    async_processing = True
                else:
                    async_processing = False
            else:
                async_processing = False
            
            response_data = ResourceSerializer(resource).data
            response_data['async_processing'] = async_processing
            
            return Response(
                {
                    'success': True,
                    'message': 'File uploaded successfully' + (
                        ' (Vimeo processing started)' if async_processing else ''
                    ),
                    'resource': response_data
                },
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            return Response(
                {
                    'success': False,
                    'error': f"Upload failed: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def upload_status(self, request):
        """
        Check upload status of a resource.
        
        GET /api/v1/resources/upload_status/?resource_id=123
        """
        resource_id = request.query_params.get('resource_id')
        if not resource_id:
            return Response(
                {'error': 'resource_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            resource = Resource.objects.get(id=resource_id)
            return Response({
                'id': resource.id,
                'title': resource.title,
                'vimeo_status': resource.vimeo_upload_status,
                'vimeo_video_id': resource.vimeo_video_id,
                'external_url': resource.external_url,
                'file_path': str(resource.file_path) if resource.file_path else None
            })
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'},
                status=status.HTTP_404_NOT_FOUND
            )
