"""
Content Management System — API Views.

Provides role-based upload centers and content delivery endpoints for:
- Teachers (own content management)
- Institution admins (school-wide content)
- Platform admins (global content + moderation)
- Students/Parents (read-only consumption)
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone

from .content_models import (
    ContentItem, ContentVersion, ContentTag, ContentItemTag,
    ContentVisibilityRule, ContentAuditLog, ContentEngagement,
    ContentAssignment, ContentRecommendation, ContentAccessSession,
)
from .content_serializers import (
    ContentItemListSerializer, ContentItemDetailSerializer,
    ContentItemUploadSerializer, ContentItemPublishSerializer,
    ContentVersionSerializer, ContentAuditLogSerializer,
    ContentEngagementSerializer, ContentEngagementUpdateSerializer,
    ContentTagSerializer,
    ContentAssignmentSerializer, ContentAssignmentCreateSerializer,
    ContentRecommendationSerializer, ContentAccessSessionSerializer,
)
from institutions.models import InstitutionMembership
from .tasks import process_vimeo_upload


def get_user_institution_ids(user):
    """Get institution IDs the user belongs to."""
    return list(
        InstitutionMembership.objects.filter(
            user=user, status='active'
        ).values_list('institution_id', flat=True)
    )


def get_user_institution_school_levels(user):
    """Get school levels for the user's institutions."""
    from institutions.models import Institution
    inst_ids = get_user_institution_ids(user)
    return list(
        Institution.objects.filter(id__in=inst_ids).values_list('school_level', flat=True)
    )


class ContentItemViewSet(viewsets.ModelViewSet):
    """
    Main content CRUD endpoint.

    GET /api/v1/content/items/                    — list content (filtered)
    POST /api/v1/content/items/                   — upload new content
    GET /api/v1/content/items/{id}/               — content detail
    PUT/PATCH /api/v1/content/items/{id}/         — update content
    DELETE /api/v1/content/items/{id}/            — archive (soft)
    POST /api/v1/content/items/{id}/publish/      — publish/archive/reject
    GET /api/v1/content/items/{id}/versions/      — version history
    GET /api/v1/content/items/{id}/audit_log/     — audit trail
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'content_type', 'publication_status', 'visibility_scope',
        'school_level', 'owner_type', 'subject', 'class_level',
        'topic', 'lesson', 'owner_institution', 'country',
        'is_featured', 'language',
    ]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'published_at', 'title', 'file_size']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ContentItemListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return ContentItemUploadSerializer
        return ContentItemDetailSerializer

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')
        inst_ids = get_user_institution_ids(user)

        # Platform admin sees everything
        if role == 'admin':
            return ContentItem.objects.all()

        # Institution admin sees institution + global content
        if role == 'institution':
            return ContentItem.objects.filter(
                Q(owner_institution_id__in=inst_ids) |
                Q(visibility_scope='global', publication_status='published') |
                Q(uploaded_by=user)
            ).distinct()

        # Teacher sees own content + institution content + published global
        if role == 'teacher':
            return ContentItem.objects.filter(
                Q(uploaded_by=user) |
                Q(owner_institution_id__in=inst_ids, publication_status='published') |
                Q(visibility_scope='global', publication_status='published')
            ).distinct()

        # Student/Parent sees only published content scoped to them
        return ContentItem.objects.filter(
            publication_status='published'
        ).filter(
            Q(visibility_scope='global') |
            Q(visibility_scope='country') |
            Q(owner_institution_id__in=inst_ids) |
            Q(visibility_scope__in=['class', 'assigned_students'])
        ).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        inst_ids = get_user_institution_ids(user)

        # Validate institution scope
        owner_inst = serializer.validated_data.get('owner_institution')
        if owner_inst and owner_inst.id not in inst_ids and user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot upload for an institution you don't belong to.")

        # Determine owner_type from user role
        role = getattr(user, 'role', 'teacher')
        owner_type = 'teacher'
        if role == 'admin':
            owner_type = serializer.validated_data.get('owner_type', 'platform_admin')
        elif role == 'institution':
            owner_type = 'institution'

        item = serializer.save()
        item.owner_type = owner_type
        item.save(update_fields=['owner_type'])

        # Trigger Vimeo upload for video files
        if item.file and item.is_video:
            file_ext = str(item.file.name).lower().split('.')[-1]
            if file_ext in ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v']:
                item.vimeo_upload_status = 'pending'
                item.save(update_fields=['vimeo_upload_status'])
                try:
                    process_vimeo_upload.delay(item.id)
                except Exception:
                    pass  # Celery may not be running in dev

    def perform_destroy(self, instance):
        """Soft delete: archive instead of hard delete."""
        instance.publication_status = 'archived'
        instance.archived_at = timezone.now()
        instance.save(update_fields=['publication_status', 'archived_at'])
        ContentAuditLog.objects.create(
            content_item=instance,
            action='archived',
            performed_by=self.request.user,
        )

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish, archive, reject, hide, or restore a content item."""
        item = self.get_object()
        serializer = ContentItemPublishSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_name = serializer.validated_data['action']
        reason = serializer.validated_data.get('reason', '')
        old_status = item.publication_status

        if action_name == 'publish':
            item.publication_status = 'published'
            item.published_at = timezone.now()
            item.moderation_status = 'approved'
        elif action_name == 'archive':
            item.publication_status = 'archived'
            item.archived_at = timezone.now()
        elif action_name == 'reject':
            item.publication_status = 'rejected'
            item.moderation_status = 'rejected'
            item.rejection_reason = reason
        elif action_name == 'hide':
            item.publication_status = 'hidden'
        elif action_name == 'restore':
            item.publication_status = 'draft'
            item.archived_at = None

        item.save()

        ContentAuditLog.objects.create(
            content_item=item,
            action=action_name if action_name != 'restore' else 'restored',
            performed_by=request.user,
            old_value={'publication_status': old_status},
            new_value={'publication_status': item.publication_status},
            notes=reason,
        )

        return Response(ContentItemDetailSerializer(item, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get version history for a content item."""
        item = self.get_object()
        versions = item.versions.all()
        return Response(ContentVersionSerializer(versions, many=True).data)

    @action(detail=True, methods=['get'])
    def audit_log(self, request, pk=None):
        """Get audit trail for a content item."""
        item = self.get_object()
        logs = item.audit_logs.all()
        return Response(ContentAuditLogSerializer(logs, many=True).data)


# ─── Teacher Upload Center ──────────────────────────────────────
class TeacherContentViewSet(viewsets.ModelViewSet):
    """
    Teacher-specific content management.
    Teachers see only their own uploaded content.
    Supports filtering by publication status (drafts, published, archived).
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'content_type', 'publication_status', 'subject', 'class_level',
        'topic', 'lesson',
    ]
    search_fields = ['title', 'description']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ContentItemListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return ContentItemUploadSerializer
        return ContentItemDetailSerializer

    def get_queryset(self):
        return ContentItem.objects.filter(uploaded_by=self.request.user)

    def perform_create(self, serializer):
        item = serializer.save()
        item.owner_type = 'teacher'
        item.save(update_fields=['owner_type'])

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get teacher's content stats."""
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'drafts': qs.filter(publication_status='draft').count(),
            'published': qs.filter(publication_status='published').count(),
            'archived': qs.filter(publication_status='archived').count(),
            'total_views': qs.aggregate(
                views=Sum('engagements__view_count')
            )['views'] or 0,
            'total_engagement_minutes': round(
                (qs.aggregate(
                    secs=Sum('engagements__active_time_seconds')
                )['secs'] or 0) / 60, 1
            ),
        })


# ─── Institution Content Center ────────────────────────────────
class InstitutionContentViewSet(viewsets.ModelViewSet):
    """
    Institution admin content management.
    Scoped to the admin's institution(s).
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'content_type', 'publication_status', 'visibility_scope',
        'subject', 'class_level', 'topic', 'owner_type',
    ]
    search_fields = ['title', 'description']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ContentItemListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return ContentItemUploadSerializer
        return ContentItemDetailSerializer

    def get_queryset(self):
        user = self.request.user
        inst_ids = get_user_institution_ids(user)
        return ContentItem.objects.filter(
            Q(owner_institution_id__in=inst_ids) |
            Q(uploaded_by=user)
        ).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        inst_ids = get_user_institution_ids(user)
        item = serializer.save()
        item.owner_type = 'institution'
        if inst_ids and not item.owner_institution_id:
            item.owner_institution_id = inst_ids[0]
        item.save(update_fields=['owner_type', 'owner_institution_id'])

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'by_teacher': qs.filter(owner_type='teacher').count(),
            'by_institution': qs.filter(owner_type='institution').count(),
            'published': qs.filter(publication_status='published').count(),
            'drafts': qs.filter(publication_status='draft').count(),
            'pending_review': qs.filter(publication_status='under_review').count(),
        })

    @action(detail=False, methods=['get'])
    def teacher_submissions(self, request):
        """List teacher-uploaded content for review."""
        inst_ids = get_user_institution_ids(request.user)
        qs = ContentItem.objects.filter(
            owner_type='teacher',
            owner_institution_id__in=inst_ids,
        ).order_by('-created_at')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = ContentItemListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = ContentItemListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


# ─── Platform Admin Content Center ─────────────────────────────
class AdminContentViewSet(viewsets.ModelViewSet):
    """
    Platform admin global content management and moderation.
    Full access to all content across the platform.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'content_type', 'publication_status', 'visibility_scope',
        'school_level', 'owner_type', 'owner_institution',
        'subject', 'class_level', 'topic', 'country',
        'is_featured', 'moderation_status',
    ]
    search_fields = ['title', 'description']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ContentItemListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return ContentItemUploadSerializer
        return ContentItemDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') != 'admin':
            return ContentItem.objects.none()
        return ContentItem.objects.all()

    def perform_create(self, serializer):
        item = serializer.save()
        item.owner_type = 'platform_admin'
        item.save(update_fields=['owner_type'])

    @action(detail=False, methods=['get'])
    def moderation_queue(self, request):
        """Content pending moderation."""
        qs = ContentItem.objects.filter(
            publication_status='under_review'
        ).order_by('created_at')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = ContentItemListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = ContentItemListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = ContentItem.objects.all()
        return Response({
            'total': qs.count(),
            'published': qs.filter(publication_status='published').count(),
            'drafts': qs.filter(publication_status='draft').count(),
            'pending_review': qs.filter(publication_status='under_review').count(),
            'rejected': qs.filter(publication_status='rejected').count(),
            'by_teacher': qs.filter(owner_type='teacher').count(),
            'by_institution': qs.filter(owner_type='institution').count(),
            'by_platform': qs.filter(owner_type='platform_admin').count(),
            'featured': qs.filter(is_featured=True).count(),
            'total_file_size_mb': round(
                (qs.aggregate(s=Sum('file_size'))['s'] or 0) / (1024 * 1024), 1
            ),
        })


# ─── Content Delivery (Consumer-facing) ────────────────────────
class ContentDeliveryView(generics.ListAPIView):
    """
    Public-facing content delivery endpoint for consuming pages.
    Students, parents, and anonymous (if allowed) access published content.

    GET /api/v1/content/library/
    Filters: school_level, subject, class_level, topic, lesson, content_type, country
    Search: title, description
    """
    serializer_class = ContentItemListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'content_type', 'school_level', 'subject', 'class_level',
        'topic', 'lesson', 'country', 'is_featured', 'language',
    ]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'published_at', 'title']
    ordering = ['-published_at']

    def get_queryset(self):
        user = self.request.user
        inst_ids = get_user_institution_ids(user)
        school_levels = get_user_institution_school_levels(user)

        return ContentItem.objects.filter(
            publication_status='published'
        ).filter(
            Q(visibility_scope='global') |
            Q(visibility_scope='country') |
            Q(visibility_scope='institution', owner_institution_id__in=inst_ids) |
            Q(visibility_scope='class', visibility_rules__target_class__institution_id__in=inst_ids) |
            Q(uploaded_by=user)
        ).distinct()


class ClassContentView(generics.ListAPIView):
    """
    Content for a specific class/subject/topic context.
    Used by classroom pages, topic pages, lesson pages.

    GET /api/v1/content/classroom/?class_level=X&subject=Y&topic=Z
    """
    serializer_class = ContentItemListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = [
        'content_type', 'class_level', 'subject', 'topic', 'lesson',
    ]
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        inst_ids = get_user_institution_ids(user)

        return ContentItem.objects.filter(
            publication_status='published'
        ).filter(
            Q(visibility_scope='global') |
            Q(owner_institution_id__in=inst_ids) |
            Q(uploaded_by=user)
        ).distinct()


# ─── Engagement Tracking ───────────────────────────────────────
class ContentEngagementViewSet(viewsets.ModelViewSet):
    """Track and update student engagement with content."""
    serializer_class = ContentEngagementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')
        if role == 'admin':
            return ContentEngagement.objects.all()
        if role in ('teacher', 'institution'):
            inst_ids = get_user_institution_ids(user)
            return ContentEngagement.objects.filter(institution_id__in=inst_ids)
        return ContentEngagement.objects.filter(student=user)

    @action(detail=False, methods=['post'])
    def track(self, request):
        """
        Update engagement metrics for a content item.
        Creates record if none exists. Increments view count on first call.
        Also creates/updates an access session.
        """
        serializer = ContentEngagementUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        inst_ids = get_user_institution_ids(request.user)
        now = timezone.now()

        engagement, created = ContentEngagement.objects.get_or_create(
            student=request.user,
            content_item_id=data['content_item_id'],
            defaults={
                'institution_id': inst_ids[0] if inst_ids else None,
                'first_accessed': now,
                'last_accessed': now,
                'view_count': 1,
                'status': 'started',
            }
        )

        if not created:
            engagement.view_count += 1
            engagement.last_accessed = now
            if not engagement.first_accessed:
                engagement.first_accessed = now

        if data.get('active_time_seconds'):
            engagement.active_time_seconds += data['active_time_seconds']
        if data.get('completion_percentage'):
            engagement.completion_percentage = max(
                float(engagement.completion_percentage),
                float(data['completion_percentage'])
            )
        if data.get('last_position'):
            engagement.last_position = data['last_position']
        if data.get('is_completed'):
            engagement.is_completed = True

        engagement.update_status()
        engagement.save()

        # Upsert the current session (keyed by session_id if provided, else latest)
        session_id = request.data.get('session_id')
        if session_id:
            try:
                session = ContentAccessSession.objects.get(id=session_id, student=request.user)
                session.active_seconds += data.get('active_time_seconds', 0)
                session.progress_at_end = engagement.completion_percentage
                session.position_at_end = engagement.last_position
                session.save(update_fields=['active_seconds', 'progress_at_end', 'position_at_end'])
            except ContentAccessSession.DoesNotExist:
                pass
        return Response(ContentEngagementSerializer(engagement).data)

    @action(detail=False, methods=['post'])
    def start_session(self, request):
        """Create a new access session when the student opens content."""
        content_item_id = request.data.get('content_item_id')
        if not content_item_id:
            return Response({'error': 'content_item_id required'}, status=status.HTTP_400_BAD_REQUEST)

        inst_ids = get_user_institution_ids(request.user)
        now = timezone.now()

        # Ensure engagement record exists
        engagement, _ = ContentEngagement.objects.get_or_create(
            student=request.user,
            content_item_id=content_item_id,
            defaults={
                'institution_id': inst_ids[0] if inst_ids else None,
                'first_accessed': now,
                'last_accessed': now,
                'status': 'started',
            }
        )

        # Detect interaction type from content item
        try:
            ci = ContentItem.objects.get(id=content_item_id)
            itype = 'video' if ci.is_video else 'document'
        except ContentItem.DoesNotExist:
            itype = 'document'

        session = ContentAccessSession.objects.create(
            student=request.user,
            content_item_id=content_item_id,
            engagement=engagement,
            interaction_type=itype,
            progress_at_start=engagement.completion_percentage,
        )
        return Response({
            'session_id': str(session.id),
            'engagement_id': str(engagement.id),
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def end_session(self, request):
        """Finalize an access session with final metrics."""
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'session_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = ContentAccessSession.objects.get(id=session_id, student=request.user)
        except ContentAccessSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

        session.session_ended_at = timezone.now()
        session.active_seconds = request.data.get('active_seconds', session.active_seconds)
        session.progress_at_end = request.data.get('progress_at_end', session.progress_at_end)
        session.position_at_end = request.data.get('position_at_end', session.position_at_end)
        session.save()

        return Response({'status': 'ok'})

    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get the requesting student's content progress with assignment context."""
        engagements = ContentEngagement.objects.filter(
            student=request.user
        ).select_related('content_item').order_by('-last_accessed')

        data = []
        for eng in engagements:
            item = eng.content_item
            # Check if this content was assigned
            assignment = ContentAssignment.objects.filter(
                student=request.user, content_item=item, is_active=True
            ).first()
            data.append({
                'content_item_id': str(item.id),
                'title': item.title,
                'content_type': item.content_type,
                'status': eng.status,
                'completion_percentage': float(eng.completion_percentage),
                'remaining_percentage': eng.remaining_percentage,
                'active_time_seconds': eng.active_time_seconds,
                'last_position': eng.last_position,
                'first_accessed': eng.first_accessed,
                'last_accessed': eng.last_accessed,
                'is_completed': eng.is_completed,
                'assigned_by_type': assignment.assigned_by_type if assignment else None,
                'due_date': assignment.due_date if assignment else None,
                'subject_name': item.subject.name if item.subject else None,
                'topic_name': item.topic.name if item.topic else None,
            })
        return Response(data)


# ─── Tags ──────────────────────────────────────────────────────
class ContentTagViewSet(viewsets.ModelViewSet):
    """Manage content tags."""
    serializer_class = ContentTagSerializer
    permission_classes = [IsAuthenticated]
    queryset = ContentTag.objects.all()
    filter_backends = [SearchFilter]
    search_fields = ['name']


# ─── Content Assignment ────────────────────────────────────────
class ContentAssignmentViewSet(viewsets.ModelViewSet):
    """
    CRUD for content assignments.
    Teachers create assignments; students see their assigned content.
    """
    serializer_class = ContentAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = [
        'student', 'assigned_by_type', 'assignment_type', 'is_active',
        'subject', 'topic', 'target_class', 'priority',
    ]
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')

        if role in ('admin', 'platform_admin'):
            return ContentAssignment.objects.all().select_related(
                'content_item', 'student', 'assigned_by', 'subject', 'topic'
            )

        if role in ('teacher', 'institution_teacher', 'independent_teacher'):
            return ContentAssignment.objects.filter(
                Q(assigned_by=user) | Q(student=user)
            ).select_related(
                'content_item', 'student', 'assigned_by', 'subject', 'topic'
            ).distinct()

        if role == 'parent':
            from parent_portal.models import ParentStudentLink
            child_ids = list(
                ParentStudentLink.objects.filter(
                    parent_profile__user=user
                ).values_list('student_profile__user_id', flat=True)
            )
            return ContentAssignment.objects.filter(
                student_id__in=child_ids, is_active=True
            ).select_related(
                'content_item', 'student', 'assigned_by', 'subject', 'topic'
            )

        # Default: student sees own assignments
        return ContentAssignment.objects.filter(
            student=user, is_active=True
        ).select_related(
            'content_item', 'student', 'assigned_by', 'subject', 'topic'
        )

    @action(detail=False, methods=['post'])
    def bulk_assign(self, request):
        """Assign one content item to multiple students at once."""
        serializer = ContentAssignmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        created = []
        for sid in d['student_ids']:
            obj, was_created = ContentAssignment.objects.update_or_create(
                content_item_id=d['content_item_id'],
                student_id=sid,
                assigned_by_type='teacher',
                defaults={
                    'assigned_by': request.user,
                    'assignment_type': d['assignment_type'],
                    'priority': d['priority'],
                    'note': d['note'],
                    'target_class_id': d.get('target_class_id'),
                    'subject_id': d.get('subject_id'),
                    'topic_id': d.get('topic_id'),
                    'lesson_id': d.get('lesson_id'),
                    'due_date': d.get('due_date'),
                    'is_active': True,
                }
            )
            created.append(obj)

        return Response(
            ContentAssignmentSerializer(created, many=True, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def my_assignments(self, request):
        """Get the requesting student's assigned content with inline progress."""
        qs = ContentAssignment.objects.filter(
            student=request.user, is_active=True
        ).select_related(
            'content_item', 'assigned_by', 'subject', 'topic'
        ).order_by('-created_at')
        return Response(
            ContentAssignmentSerializer(qs, many=True, context={'request': request}).data
        )

    @action(detail=False, methods=['get'])
    def teacher_tracking(self, request):
        """
        Teacher view: all assignments made by this teacher, with per-student progress.
        """
        qs = ContentAssignment.objects.filter(
            assigned_by=request.user, is_active=True
        ).select_related(
            'content_item', 'student', 'subject', 'topic'
        ).order_by('-created_at')
        return Response(
            ContentAssignmentSerializer(qs, many=True, context={'request': request}).data
        )

    @action(detail=False, methods=['get'])
    def class_summary(self, request):
        """
        Aggregate assignment completion by content item for a class.
        Query params: target_class (required)
        """
        class_id = request.query_params.get('target_class')
        if not class_id:
            return Response({'error': 'target_class query param required'}, status=400)

        # Get all active assignments for this class
        assignments = ContentAssignment.objects.filter(
            target_class_id=class_id, is_active=True
        ).select_related('content_item', 'student')

        # Group by content item
        summary = {}
        for a in assignments:
            cid = str(a.content_item_id)
            if cid not in summary:
                summary[cid] = {
                    'content_item_id': cid,
                    'title': a.content_item.title,
                    'content_type': a.content_item.content_type,
                    'total_assigned': 0,
                    'not_started': 0,
                    'started': 0,
                    'in_progress': 0,
                    'completed': 0,
                    'avg_completion': 0,
                    'avg_time_seconds': 0,
                    'missing_students': [],
                }
            s = summary[cid]
            s['total_assigned'] += 1

            try:
                eng = ContentEngagement.objects.get(
                    student=a.student, content_item=a.content_item
                )
                s[eng.status] += 1
                s['avg_completion'] += float(eng.completion_percentage)
                s['avg_time_seconds'] += eng.active_time_seconds
            except ContentEngagement.DoesNotExist:
                s['not_started'] += 1
                student_name = getattr(a.student, 'full_name', a.student.email)
                s['missing_students'].append(student_name)

        # Compute averages
        for s in summary.values():
            total = s['total_assigned']
            if total > 0:
                s['avg_completion'] = round(s['avg_completion'] / total, 1)
                s['avg_time_seconds'] = round(s['avg_time_seconds'] / total)

        return Response(list(summary.values()))


# ─── Content Recommendations ──────────────────────────────────
class ContentRecommendationViewSet(viewsets.ModelViewSet):
    """
    AI and teacher content recommendations.
    Students see their own; teachers see recommendations they've made.
    """
    serializer_class = ContentRecommendationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'source', 'status', 'subject', 'topic']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '')

        if role in ('admin', 'platform_admin'):
            return ContentRecommendation.objects.all().select_related(
                'content_item', 'student', 'subject', 'topic'
            )

        if role == 'parent':
            from parent_portal.models import ParentStudentLink
            child_ids = list(
                ParentStudentLink.objects.filter(
                    parent_profile__user=user
                ).values_list('student_profile__user_id', flat=True)
            )
            return ContentRecommendation.objects.filter(
                student_id__in=child_ids, status='active'
            ).select_related('content_item', 'student', 'subject', 'topic')

        return ContentRecommendation.objects.filter(
            student=user, status='active'
        ).select_related('content_item', 'student', 'subject', 'topic')

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        rec = self.get_object()
        rec.status = 'dismissed'
        rec.dismissed_at = timezone.now()
        rec.save(update_fields=['status', 'dismissed_at'])
        return Response({'status': 'dismissed'})

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        rec = self.get_object()
        rec.status = 'accepted'
        rec.save(update_fields=['status'])
        return Response({'status': 'accepted'})

    @action(detail=False, methods=['get'])
    def my_recommendations(self, request):
        """Student's active recommendations with engagement data."""
        qs = ContentRecommendation.objects.filter(
            student=request.user, status='active'
        ).select_related('content_item', 'subject', 'topic').order_by('-created_at')
        return Response(
            ContentRecommendationSerializer(qs, many=True, context={'request': request}).data
        )


# ─── Dashboard Content Summary ────────────────────────────────
class StudentContentDashboardView(APIView):
    """
    Returns unified assigned + recommended content for student dashboard.
    Single endpoint that combines assignments and AI recommendations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Assignments
        assignments = ContentAssignment.objects.filter(
            student=user, is_active=True
        ).select_related('content_item', 'assigned_by', 'subject', 'topic').order_by('-created_at')[:20]

        assignment_data = ContentAssignmentSerializer(
            assignments, many=True, context={'request': request}
        ).data

        # Recommendations
        recommendations = ContentRecommendation.objects.filter(
            student=user, status='active'
        ).select_related('content_item', 'subject', 'topic').order_by('-created_at')[:10]

        recommendation_data = ContentRecommendationSerializer(
            recommendations, many=True, context={'request': request}
        ).data

        # Continue learning (in-progress content)
        in_progress = ContentEngagement.objects.filter(
            student=user, status__in=['started', 'in_progress']
        ).select_related('content_item').order_by('-last_accessed')[:6]

        continue_data = []
        for eng in in_progress:
            item = eng.content_item
            continue_data.append({
                'content_item_id': str(item.id),
                'title': item.title,
                'content_type': item.content_type,
                'subject_name': item.subject.name if item.subject else None,
                'topic_name': item.topic.name if item.topic else None,
                'status': eng.status,
                'completion_percentage': float(eng.completion_percentage),
                'remaining_percentage': eng.remaining_percentage,
                'active_time_seconds': eng.active_time_seconds,
                'last_position': eng.last_position,
                'last_accessed': eng.last_accessed,
            })

        # Summary stats
        all_engagements = ContentEngagement.objects.filter(student=user)
        total_time = all_engagements.aggregate(t=Sum('active_time_seconds'))['t'] or 0
        completed_count = all_engagements.filter(status='completed').count()
        in_progress_count = all_engagements.filter(status__in=['started', 'in_progress']).count()

        return Response({
            'assignments': assignment_data,
            'recommendations': recommendation_data,
            'continue_learning': continue_data,
            'summary': {
                'total_time_seconds': total_time,
                'completed_count': completed_count,
                'in_progress_count': in_progress_count,
                'assigned_count': assignments.count(),
            }
        })


class TeacherContentDashboardView(APIView):
    """
    Returns content assignment tracking data for teacher dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # All assignments made by this teacher
        assignments = ContentAssignment.objects.filter(
            assigned_by=user, is_active=True
        ).select_related('content_item', 'student', 'subject', 'topic')

        # Group by content item for summary view
        content_map = {}
        for a in assignments:
            cid = str(a.content_item_id)
            if cid not in content_map:
                content_map[cid] = {
                    'content_item_id': cid,
                    'title': a.content_item.title,
                    'content_type': a.content_item.content_type,
                    'subject_name': a.subject.name if a.subject else None,
                    'assigned_count': 0,
                    'not_started': 0,
                    'started': 0,
                    'in_progress': 0,
                    'completed': 0,
                    'avg_completion': 0,
                    'avg_time_seconds': 0,
                    'missing_students': [],
                    'learners': [],
                }
            entry = content_map[cid]
            entry['assigned_count'] += 1

            try:
                eng = ContentEngagement.objects.get(
                    student=a.student, content_item=a.content_item
                )
                entry[eng.status] += 1
                entry['avg_completion'] += float(eng.completion_percentage)
                entry['avg_time_seconds'] += eng.active_time_seconds
                entry['learners'].append({
                    'student_id': a.student_id,
                    'student_name': getattr(a.student, 'full_name', a.student.email),
                    'status': eng.status,
                    'completion_percentage': float(eng.completion_percentage),
                    'active_time_seconds': eng.active_time_seconds,
                    'last_accessed': eng.last_accessed,
                })
            except ContentEngagement.DoesNotExist:
                entry['not_started'] += 1
                sname = getattr(a.student, 'full_name', a.student.email)
                entry['missing_students'].append(sname)
                entry['learners'].append({
                    'student_id': a.student_id,
                    'student_name': sname,
                    'status': 'not_started',
                    'completion_percentage': 0,
                    'active_time_seconds': 0,
                    'last_accessed': None,
                })

        for entry in content_map.values():
            total = entry['assigned_count']
            if total > 0:
                entry['avg_completion'] = round(entry['avg_completion'] / total, 1)
                entry['avg_time_seconds'] = round(entry['avg_time_seconds'] / total)

        return Response({
            'resources': list(content_map.values()),
            'total_assignments': assignments.count(),
        })


class ParentContentDashboardView(APIView):
    """
    Returns child's assigned content and progress for parent dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from parent_portal.models import ParentStudentLink
        child_id = request.query_params.get('child_id')

        links = ParentStudentLink.objects.filter(
            parent_profile__user=request.user
        ).select_related('student_profile__user')
        if child_id:
            links = links.filter(student_profile__user_id=child_id)

        children_data = []
        for link in links:
            child = link.student_profile.user

            assignments = ContentAssignment.objects.filter(
                student=child, is_active=True
            ).select_related('content_item', 'assigned_by', 'subject', 'topic').order_by('-created_at')[:20]

            items = []
            for a in assignments:
                try:
                    eng = ContentEngagement.objects.get(
                        student=child, content_item=a.content_item
                    )
                    eng_data = {
                        'status': eng.status,
                        'completion_percentage': float(eng.completion_percentage),
                        'remaining_percentage': eng.remaining_percentage,
                        'active_time_seconds': eng.active_time_seconds,
                        'is_completed': eng.is_completed,
                        'first_accessed': eng.first_accessed,
                        'last_accessed': eng.last_accessed,
                    }
                except ContentEngagement.DoesNotExist:
                    eng_data = {
                        'status': 'not_started',
                        'completion_percentage': 0,
                        'remaining_percentage': 100,
                        'active_time_seconds': 0,
                        'is_completed': False,
                        'first_accessed': None,
                        'last_accessed': None,
                    }

                items.append({
                    'assignment_id': str(a.id),
                    'content_title': a.content_item.title,
                    'content_type': a.content_item.content_type,
                    'assigned_by_type': a.assigned_by_type,
                    'assigned_by_name': getattr(a.assigned_by, 'full_name', '') if a.assigned_by else 'System',
                    'assignment_type': a.assignment_type,
                    'subject_name': a.subject.name if a.subject else None,
                    'topic_name': a.topic.name if a.topic else None,
                    'due_date': a.due_date,
                    'engagement': eng_data,
                })

            children_data.append({
                'child_id': child.id,
                'child_name': getattr(child, 'full_name', child.email),
                'assigned_content': items,
                'total_assigned': len(items),
                'not_started_count': sum(1 for i in items if i['engagement']['status'] == 'not_started'),
                'completed_count': sum(1 for i in items if i['engagement']['status'] == 'completed'),
            })

        return Response({'children': children_data})
