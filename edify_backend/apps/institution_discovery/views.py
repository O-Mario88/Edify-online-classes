"""Phase 1 institution discovery endpoints.

Read-only for Phase 1:
  GET  /api/v1/institution-discovery/recommendations/  — top 10 for the user
  GET  /api/v1/institution-discovery/institutions/     — paginated list
  GET  /api/v1/institution-discovery/institutions/<id>/ — detail

Phase 2 will add pings + applications + admission inbox.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from institutions.models import Institution

from .models import InstitutionRecommendationScore
from .serializers import InstitutionCardSerializer, InstitutionDetailSerializer
from .services import build_match_reasoning, recalculate_institution_score


class InstitutionDiscoveryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only browsing of institutions that have opted into discovery.

    Filter rule: only institutions whose discovery_profile.is_listed is True.
    This keeps institutions that signed up but haven't curated their
    profile out of the public hub.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = InstitutionCardSerializer

    def get_queryset(self):
        return (Institution.objects
                .filter(discovery_profile__is_listed=True, is_active=True)
                .select_related('discovery_profile', 'recommendation_score')
                .order_by('-recommendation_score__maple_activeness_score', 'name'))

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InstitutionDetailSerializer
        return InstitutionCardSerializer

    @action(detail=False, methods=['get'], url_path='recommendations')
    def recommendations(self, request):
        """Top 10 institutions the platform would recommend right now.

        v1: ranks purely by Maple Activeness × (1 + growth boost).
        Personalization (class level, weak subjects) lands in Phase 4.
        """
        qs = self.get_queryset()[:10]
        for inst in qs:
            score = getattr(inst, 'recommendation_score', None)
            inst._match_reason = build_match_reasoning(inst, score)
        return Response(
            InstitutionCardSerializer(qs, many=True, context={'request': request}).data
        )


class InstitutionScoreRefreshViewSet(viewsets.ViewSet):
    """Admin-only recompute trigger. Surfaces Phase 4 of the spec early so
    institution admins can preview their score without waiting for the
    nightly job."""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='recalculate')
    def recalculate(self, request):
        institution_id = request.data.get('institution_id')
        if not institution_id:
            return Response({'detail': 'institution_id required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            inst = Institution.objects.get(id=institution_id)
        except Institution.DoesNotExist:
            return Response({'detail': 'Institution not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Only platform admin or a member of that institution may trigger.
        user = request.user
        is_admin = getattr(user, 'role', '') == 'platform_admin'
        is_member = user.institution_memberships.filter(institution=inst, status='active').exists()
        if not (is_admin or is_member):
            return Response({'detail': 'Not permitted.'}, status=status.HTTP_403_FORBIDDEN)
        score = recalculate_institution_score(inst)
        return Response({
            'institution_id': inst.id,
            'maple_activeness_score': score.maple_activeness_score,
            'growth_index': score.growth_index,
            'explanation': score.explanation,
        })


# ── School Match (Phase 9.1) ────────────────────────────────────────


class StudentOpportunityPreferenceView(APIView):
    """GET/POST /api/v1/school-match/preferences/

    Per-learner opt-in preferences for the in-person school marketplace.

    Authorisation matrix:
      * student themselves can READ their own row
      * a linked parent can READ + WRITE — parent_approved is the master
        gate for visibility, so writes flowing from a non-parent are
        intentionally rejected
      * staff can READ for support purposes; never WRITE here.

    Default state for a brand-new account is "private" with
    parent_approved=False, which means no institution can ever discover
    the learner until the parent explicitly opts in.
    """
    permission_classes = [IsAuthenticated]

    PARENT_WRITABLE_FIELDS = {
        'parent_approved',
        'visibility_status',
        'open_to_institution_contact',
        'open_to_scholarships',
        'open_to_boarding',
        'open_to_day',
        'open_to_school_visit_invites',
        'open_to_preview_class_invites',
        'national_search_only',
        'preferred_countries',
        'preferred_regions',
        'preferred_curriculum',
        'preferred_entry_level',
        'preferred_entry_term',
        'preferred_study_mode',
        'share_level',
    }

    def _resolve_student_and_parent(self, request):
        """Return (student_user, acting_parent_or_none, is_parent_write).

        - If a parent supplies ?student_id, look up the linked child.
        - Otherwise the caller's own row is used.
        Returns student=None when a parent supplies a child_id that
        isn't actually linked to them — caller emits 404.
        """
        from parent_portal.models import ParentStudentLink
        user = request.user
        student_id = request.query_params.get('student_id') or request.data.get('student_id')
        role = (getattr(user, 'role', '') or '').lower()
        is_parent = role == 'parent' or role.endswith('parent')

        if is_parent and student_id:
            link = (
                ParentStudentLink.objects
                .filter(parent_profile__user=user, student_profile__user_id=student_id)
                .select_related('student_profile__user')
                .first()
            )
            if not link:
                return None, user, True
            return link.student_profile.user, user, True

        return user, (user if is_parent else None), is_parent

    def _serialize(self, pref):
        return {
            'student_id': pref.student_id,
            'parent_id': pref.parent_id,
            'parent_approved': pref.parent_approved,
            'visibility_status': pref.visibility_status,
            'open_to_institution_contact': pref.open_to_institution_contact,
            'open_to_scholarships': pref.open_to_scholarships,
            'open_to_boarding': pref.open_to_boarding,
            'open_to_day': pref.open_to_day,
            'open_to_school_visit_invites': pref.open_to_school_visit_invites,
            'open_to_preview_class_invites': pref.open_to_preview_class_invites,
            'national_search_only': pref.national_search_only,
            'preferred_countries': pref.preferred_countries or [],
            'preferred_regions': pref.preferred_regions or [],
            'preferred_curriculum': pref.preferred_curriculum,
            'preferred_entry_level': pref.preferred_entry_level,
            'preferred_entry_term': pref.preferred_entry_term,
            'preferred_study_mode': pref.preferred_study_mode,
            'share_level': pref.share_level,
            'is_discoverable': pref.is_discoverable(),
            'updated_at': pref.updated_at.isoformat() if pref.updated_at else None,
        }

    def get(self, request, *args, **kwargs):
        from .models import StudentOpportunityPreference
        student, _, _ = self._resolve_student_and_parent(request)
        if student is None:
            return Response({'detail': 'Linked child not found.'}, status=status.HTTP_404_NOT_FOUND)
        pref, _ = StudentOpportunityPreference.objects.get_or_create(student=student)
        return Response(self._serialize(pref))

    def post(self, request, *args, **kwargs):
        from .models import StudentOpportunityPreference
        student, parent, is_parent_write = self._resolve_student_and_parent(request)
        if student is None:
            return Response({'detail': 'Linked child not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not is_parent_write:
            return Response(
                {'detail': 'Only the linked parent can change opportunity preferences.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        pref, _ = StudentOpportunityPreference.objects.get_or_create(student=student)
        # Always stamp the acting parent on writes so we have an audit
        # trail and can revoke approval if they leave the platform.
        pref.parent = parent

        for field, value in request.data.items():
            if field in self.PARENT_WRITABLE_FIELDS:
                setattr(pref, field, value)
        pref.save()
        return Response(self._serialize(pref))


def _resolve_target(request):
    """Shared helper for the per-student readiness/explanation views.
    Returns (target_user, error_response_or_None). When a parent
    supplies ?student_id, we resolve through the parent_portal link;
    otherwise the caller's own row is used."""
    from parent_portal.models import ParentStudentLink
    user = request.user
    target = user
    student_id = request.data.get('student_id') if request.method == 'POST' else None
    student_id = student_id or request.query_params.get('student_id')
    if not student_id:
        return target, None

    role = (getattr(user, 'role', '') or '').lower()
    is_parent = role == 'parent' or role.endswith('parent')
    if not is_parent:
        return None, Response(
            {'detail': 'Only the linked parent can act on another student.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    link = (ParentStudentLink.objects
            .filter(parent_profile__user=user, student_profile__user_id=student_id)
            .select_related('student_profile__user').first())
    if not link:
        return None, Response({'detail': 'Linked child not found.'}, status=status.HTTP_404_NOT_FOUND)
    return link.student_profile.user, None


class RecalculateStudentReadinessView(APIView):
    """POST /api/v1/school-match/recalculate-student-readiness/

    On-demand trigger to recompute readiness for the caller (or a
    linked child when ?student_id is supplied by a parent). The
    nightly management command does the bulk work; this endpoint is
    for the parent-side "Refresh my child's score" action and for QA.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        from .services_match import recalculate_student_readiness
        target, err = _resolve_target(request)
        if err is not None:
            return err
        result = recalculate_student_readiness(target)
        return Response(result)


class ScoreExplanationView(APIView):
    """GET /api/v1/school-match/score-explanation/

    Human-readable breakdown of the latest readiness snapshot:
    overall score, per-domain signals, the two lane gates, and a list
    of plain-English reasons. Powers the "why am I (or not) being
    matched?" parent-facing card.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from .services_match import explain_score
        target, err = _resolve_target(request)
        if err is not None:
            return err
        return Response(explain_score(target))


# ── Institution-side school match (Phase 9.3) ────────────────────────


def _require_institution_view_access(request):
    """Resolve institution + check both gates: trust/eligibility AND
    plan tier. Trust gate emits the "complete profile" 403; tier gate
    emits an "upgrade to Pro" 403 with the current tier in the body
    so the mobile can route to the upgrade screen."""
    from .services_match import (
        resolve_institution_for_user,
        get_or_compute_eligibility,
        tier_locks_feature,
    )
    institution = resolve_institution_for_user(request.user)
    if not institution:
        return None, None, Response(
            {'detail': 'Only institution staff can access this surface.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    elig = get_or_compute_eligibility(institution)
    if not elig.can_view_student_matches:
        return institution, elig, Response(
            {
                'detail': 'Your institution does not yet meet School Match requirements.',
                'gate': {
                    'verified': elig.verified,
                    'admission_open': elig.admission_open,
                    'activeness_score': elig.activeness_score,
                    'minimum_activity_met': elig.minimum_activity_met,
                },
            },
            status=status.HTTP_403_FORBIDDEN,
        )
    tier_locked, tier = tier_locks_feature(institution, 'view_recommended_students')
    if tier_locked:
        return institution, elig, Response(
            {
                'detail': 'Viewing recommended learners requires School Match Pro.',
                'tier_required': 'pro',
                'current_tier': tier,
            },
            status=status.HTTP_403_FORBIDDEN,
        )
    return institution, elig, None


class InstitutionRecommendedStudentsView(APIView):
    """GET /api/v1/institution-match/recommended-students/

    Returns anonymised cards for learners whose parents have opted in
    *and* who clear one of the two eligibility lanes. Filters arrive
    via query params: ?lane=high_performer|high_growth, ?country=UG,
    ?region=Kampala, ?curriculum=Cambridge, ?class_level=P6, ?limit=N.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from .services_match import recommended_students_for_institution
        institution, elig, err = _require_institution_view_access(request)
        if err is not None:
            return err

        cards = recommended_students_for_institution(
            institution,
            lane=request.query_params.get('lane') or None,
            country=request.query_params.get('country') or None,
            region=request.query_params.get('region') or None,
            curriculum=request.query_params.get('curriculum') or None,
            class_level=request.query_params.get('class_level') or None,
            scholarship_only=request.query_params.get('scholarship_only') == 'true',
            limit=int(request.query_params.get('limit') or 50),
        )
        return Response({
            'institution_id': institution.id,
            'can_send_invitations': elig.can_send_invitations,
            'count': len(cards),
            'students': cards,
        })


class InstitutionStudentSummaryView(APIView):
    """GET /api/v1/institution-match/student-summary/<id>/

    Anonymised detail view for a single learner. Same gate as the
    recommendations list. Returns visible=False if the learner has
    rolled back their opt-in or dropped below the eligibility floor
    since the institution last polled.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id: int, *args, **kwargs):
        from django.contrib.auth import get_user_model
        from .services_match import anonymized_student_summary
        institution, _elig, err = _require_institution_view_access(request)
        if err is not None:
            return err

        UserModel = get_user_model()
        try:
            student = UserModel.objects.get(id=student_id)
        except UserModel.DoesNotExist:
            return Response({'detail': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(anonymized_student_summary(institution, student))


class InstitutionMatchPipelineView(APIView):
    """GET /api/v1/institution-match/pipeline/

    Counts for the institution dashboard: invitations sent, accepted,
    Passport requests, applications received. Also returns the
    eligibility row so the dashboard can render a "complete your
    profile to unlock School Match" banner.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from .services_match import resolve_institution_for_user, get_or_compute_eligibility
        from .models import (
            InstitutionStudentInvitation,
            PassportAccessRequest,
        )

        institution = resolve_institution_for_user(request.user)
        if not institution:
            return Response(
                {'detail': 'Only institution staff can access this surface.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        elig = get_or_compute_eligibility(institution)

        invites = InstitutionStudentInvitation.objects.filter(institution=institution)
        passport_reqs = PassportAccessRequest.objects.filter(institution=institution)

        applications = 0
        try:
            from admission_passport.models import AdmissionApplication
            applications = AdmissionApplication.objects.filter(institution=institution).count()
        except Exception:
            applications = 0

        return Response({
            'institution_id': institution.id,
            'eligibility': {
                'verified': elig.verified,
                'admission_open': elig.admission_open,
                'activeness_score': elig.activeness_score,
                'minimum_activity_met': elig.minimum_activity_met,
                'can_view_student_matches': elig.can_view_student_matches,
                'can_send_invitations': elig.can_send_invitations,
            },
            'pipeline': {
                'invitations_sent': invites.count(),
                'invitations_accepted': invites.filter(status='accepted').count(),
                'invitations_declined': invites.filter(status='declined').count(),
                'invitations_awaiting': invites.filter(status='sent').count(),
                'passport_requests_pending': passport_reqs.filter(status='pending').count(),
                'passport_requests_approved': passport_reqs.filter(status='approved').count(),
                'applications_received': applications,
            },
        })


# ── Invitations + Passport access (Phase 9.4) ──────────────────────


class InstitutionInvitationsView(APIView):
    """GET / POST /api/v1/institution-match/invitations/

    GET — list invitations sent by the caller's institution.
    POST — create a new invitation. Body:
       { "student_id": <int>, "invitation_type": "apply|interview|...",
         "message": "...", "why_interested": ["..."],
         "requested_share_level": "academic_summary" }
    """
    permission_classes = [IsAuthenticated]

    def _institution(self, request):
        from .services_match import resolve_institution_for_user
        return resolve_institution_for_user(request.user)

    def get(self, request, *args, **kwargs):
        from .models import InstitutionStudentInvitation
        from .services_invitations import serialize_invitation_for_institution
        inst = self._institution(request)
        if not inst:
            return Response({'detail': 'Only institution staff.'}, status=status.HTTP_403_FORBIDDEN)

        qs = (InstitutionStudentInvitation.objects
              .filter(institution=inst)
              .select_related('student')
              .order_by('-created_at')[:200])
        return Response({
            'count': qs.count() if hasattr(qs, 'count') else len(qs),
            'invitations': [serialize_invitation_for_institution(i) for i in qs],
        })

    def post(self, request, *args, **kwargs):
        from django.contrib.auth import get_user_model
        from .services_invitations import create_invitation
        inst = self._institution(request)
        if not inst:
            return Response({'detail': 'Only institution staff.'}, status=status.HTTP_403_FORBIDDEN)

        student_id = request.data.get('student_id')
        invitation_type = request.data.get('invitation_type')
        if not student_id or not invitation_type:
            return Response(
                {'detail': 'student_id and invitation_type are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        UserModel = get_user_model()
        try:
            student = UserModel.objects.get(id=student_id)
        except UserModel.DoesNotExist:
            return Response({'detail': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

        result = create_invitation(
            institution=inst,
            sender=request.user,
            student_user=student,
            invitation_type=invitation_type,
            message=request.data.get('message') or '',
            why_interested=request.data.get('why_interested') or [],
            requested_share_level=request.data.get('requested_share_level') or 'academic_summary',
        )
        if not result.get('ok'):
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)


class InstitutionPassportAccessRequestView(APIView):
    """POST /api/v1/institution-match/passport-access-request/

    Institution requests parent approval to view specific Passport
    sections of a learner. Body:
      { "student_id": <int>, "requested_sections": ["..."], "reason": "..." }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        from django.contrib.auth import get_user_model
        from .services_match import resolve_institution_for_user
        from .services_invitations import create_passport_access_request

        inst = resolve_institution_for_user(request.user)
        if not inst:
            return Response({'detail': 'Only institution staff.'}, status=status.HTTP_403_FORBIDDEN)

        student_id = request.data.get('student_id')
        sections = request.data.get('requested_sections') or []
        if not student_id or not isinstance(sections, list):
            return Response(
                {'detail': 'student_id and requested_sections (list) are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        UserModel = get_user_model()
        try:
            student = UserModel.objects.get(id=student_id)
        except UserModel.DoesNotExist:
            return Response({'detail': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

        result = create_passport_access_request(
            institution=inst,
            student_user=student,
            requested_sections=sections,
            reason=request.data.get('reason') or '',
        )
        if not result.get('ok'):
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)


# ── Parent-side invitation actions ───────────────────────────────────


class ParentInvitationsListView(APIView):
    """GET /api/v1/school-match/invitations/

    Lists invitations the caller (a parent) has received. Includes
    institution contact details on accepted invitations only.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from .models import InstitutionStudentInvitation
        from .services_invitations import serialize_invitation_for_parent

        qs = (InstitutionStudentInvitation.objects
              .filter(parent=request.user)
              .select_related('institution')
              .order_by('-created_at')[:200])
        return Response({
            'count': len(qs),
            'invitations': [serialize_invitation_for_parent(i) for i in qs],
        })


class ParentInvitationDetailView(APIView):
    """GET /api/v1/school-match/invitations/<id>/ — single invitation
    plus a side-effect of marking 'sent' → 'viewed'."""
    permission_classes = [IsAuthenticated]

    def get(self, request, invitation_id: int, *args, **kwargs):
        from .models import InstitutionStudentInvitation
        from .services_invitations import (
            mark_invitation_viewed,
            serialize_invitation_for_parent,
        )

        invitation = (InstitutionStudentInvitation.objects
                      .filter(id=invitation_id, parent=request.user)
                      .select_related('institution').first())
        if not invitation:
            return Response({'detail': 'Invitation not found.'}, status=status.HTTP_404_NOT_FOUND)
        mark_invitation_viewed(parent=request.user, invitation_id=invitation_id)
        invitation.refresh_from_db()
        return Response(serialize_invitation_for_parent(invitation))


class ParentInvitationActionView(APIView):
    """POST /api/v1/school-match/invitations/<id>/<action>/
    where <action> is 'accept' or 'decline'.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, invitation_id: int, action: str, *args, **kwargs):
        from .services_invitations import accept_invitation, decline_invitation
        if action == 'accept':
            result = accept_invitation(parent=request.user, invitation_id=invitation_id)
        elif action == 'decline':
            result = decline_invitation(
                parent=request.user, invitation_id=invitation_id,
                reason=request.data.get('reason') or '',
            )
        else:
            return Response({'detail': 'Unknown action.'}, status=status.HTTP_400_BAD_REQUEST)
        if not result.get('ok'):
            http_status = status.HTTP_404_NOT_FOUND if 'not found' in (result.get('detail') or '').lower() else status.HTTP_400_BAD_REQUEST
            return Response(result, status=http_status)
        return Response(result)


class ParentPassportAccessListView(APIView):
    """GET /api/v1/school-match/passport-access/ — list all passport-
    access requests routed to the caller (a parent)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from .models import PassportAccessRequest
        from .services_invitations import serialize_passport_request_for_parent
        qs = (PassportAccessRequest.objects
              .filter(parent=request.user)
              .select_related('institution')
              .order_by('-created_at')[:100])
        return Response({
            'count': len(qs),
            'requests': [serialize_passport_request_for_parent(r) for r in qs],
        })


class ParentPassportAccessActionView(APIView):
    """POST /api/v1/school-match/passport-access/<id>/<action>/
    where <action> is 'approve' or 'decline'.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id: int, action: str, *args, **kwargs):
        from .services_invitations import respond_passport_request
        decision = 'approved' if action == 'approve' else ('declined' if action == 'decline' else None)
        if not decision:
            return Response({'detail': 'Unknown action.'}, status=status.HTTP_400_BAD_REQUEST)
        result = respond_passport_request(
            parent=request.user, request_id=request_id, decision=decision,
        )
        if not result.get('ok'):
            http_status = status.HTTP_404_NOT_FOUND if 'not found' in (result.get('detail') or '').lower() else status.HTTP_400_BAD_REQUEST
            return Response(result, status=http_status)
        return Response(result)


# ── Scholarships (Phase 9.5) ────────────────────────────────────────


def _serialize_scholarship(s) -> dict:
    return {
        'id': s.id,
        'institution_id': s.institution_id,
        'institution_name': getattr(s.institution, 'name', '') or '',
        'title': s.title,
        'description': s.description,
        'kind': s.kind,
        'amount_band': s.amount_band,
        'target_class_levels': s.target_class_levels or [],
        'target_subjects': s.target_subjects or [],
        'deadline': s.deadline.isoformat() if s.deadline else None,
        'active': s.active,
        'seats_available': s.seats_available,
        'created_at': s.created_at.isoformat(),
        'updated_at': s.updated_at.isoformat(),
    }


class ScholarshipListCreateView(APIView):
    """GET / POST /api/v1/institution-match/scholarships/

    GET — list active scholarships for the caller's institution.
    POST — create a new scholarship. Body:
       { "title": "...", "description": "...", "kind": "academic",
         "amount_band": "partial_50", "target_class_levels": ["P6"],
         "target_subjects": ["Maths"], "deadline": "2026-08-31",
         "seats_available": 10 }
    """
    permission_classes = [IsAuthenticated]

    def _institution(self, request):
        from .services_match import resolve_institution_for_user
        return resolve_institution_for_user(request.user)

    def get(self, request, *args, **kwargs):
        from .models import ScholarshipOpportunity
        institution = self._institution(request)
        if not institution:
            return Response({'detail': 'Only institution staff.'}, status=status.HTTP_403_FORBIDDEN)
        qs = ScholarshipOpportunity.objects.filter(institution=institution)[:200]
        return Response({
            'count': len(qs),
            'scholarships': [_serialize_scholarship(s) for s in qs],
        })

    def post(self, request, *args, **kwargs):
        from .models import ScholarshipOpportunity
        from .services_match import get_or_compute_eligibility, tier_locks_feature

        institution = self._institution(request)
        if not institution:
            return Response({'detail': 'Only institution staff.'}, status=status.HTTP_403_FORBIDDEN)

        elig = get_or_compute_eligibility(institution)
        if not elig.can_send_invitations:
            return Response(
                {'detail': 'Your institution must clear School Match eligibility before posting scholarships.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        tier_locked, tier = tier_locks_feature(institution, 'manage_scholarships')
        if tier_locked:
            return Response(
                {
                    'detail': 'Publishing scholarships requires School Match Premium.',
                    'tier_required': 'premium',
                    'current_tier': tier,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        title = (request.data.get('title') or '').strip()
        if not title:
            return Response({'detail': 'title is required.'}, status=status.HTTP_400_BAD_REQUEST)

        valid_kinds = {k for k, _ in ScholarshipOpportunity.KIND_CHOICES}
        valid_amounts = {k for k, _ in ScholarshipOpportunity.AMOUNT_BAND_CHOICES}
        kind = request.data.get('kind') or 'academic'
        amount_band = request.data.get('amount_band') or 'partial_50'
        if kind not in valid_kinds: kind = 'academic'
        if amount_band not in valid_amounts: amount_band = 'partial_50'

        deadline = request.data.get('deadline') or None
        try:
            seats = int(request.data.get('seats_available') or 1)
            if seats < 1: seats = 1
        except (TypeError, ValueError):
            seats = 1

        scholarship = ScholarshipOpportunity.objects.create(
            institution=institution,
            title=title[:200],
            description=(request.data.get('description') or '')[:5000],
            kind=kind,
            amount_band=amount_band,
            target_class_levels=request.data.get('target_class_levels') or [],
            target_subjects=request.data.get('target_subjects') or [],
            deadline=deadline,
            active=True,
            seats_available=seats,
            created_by=request.user,
        )
        return Response(_serialize_scholarship(scholarship), status=status.HTTP_201_CREATED)


class ScholarshipDetailView(APIView):
    """GET / PATCH / DELETE /api/v1/institution-match/scholarships/<id>/"""
    permission_classes = [IsAuthenticated]

    def _resolve(self, request, pk):
        from .models import ScholarshipOpportunity
        from .services_match import resolve_institution_for_user
        institution = resolve_institution_for_user(request.user)
        if not institution:
            return None, None, Response({'detail': 'Only institution staff.'}, status=status.HTTP_403_FORBIDDEN)
        scholarship = ScholarshipOpportunity.objects.filter(id=pk, institution=institution).first()
        if not scholarship:
            return None, None, Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return scholarship, institution, None

    def get(self, request, pk: int, *args, **kwargs):
        scholarship, _i, err = self._resolve(request, pk)
        if err is not None: return err
        return Response(_serialize_scholarship(scholarship))

    def patch(self, request, pk: int, *args, **kwargs):
        scholarship, _i, err = self._resolve(request, pk)
        if err is not None: return err

        from .models import ScholarshipOpportunity
        editable = {'title', 'description', 'kind', 'amount_band', 'target_class_levels',
                    'target_subjects', 'deadline', 'active', 'seats_available'}
        for field, value in request.data.items():
            if field in editable:
                setattr(scholarship, field, value)
        scholarship.save()
        return Response(_serialize_scholarship(scholarship))

    def delete(self, request, pk: int, *args, **kwargs):
        scholarship, _i, err = self._resolve(request, pk)
        if err is not None: return err
        # Soft-delete: mark inactive instead of dropping the row, so any
        # historical references stay intact for audit.
        scholarship.active = False
        scholarship.save(update_fields=['active'])
        return Response({'ok': True})


class InstitutionTierView(APIView):
    """GET /api/v1/institution-match/tier/

    Returns the institution's current School Match tier, the per-tier
    feature matrix (so the mobile knows exactly what's locked) and the
    invitation quota state. Mobile reads this once on the match home
    and renders the upgrade card / monthly counter accordingly.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from .services_match import (
            resolve_institution_for_user,
            get_school_match_tier,
            get_invitation_quota_info,
            TIER_FEATURES,
        )
        institution = resolve_institution_for_user(request.user)
        if not institution:
            return Response({'detail': 'Only institution staff.'}, status=status.HTTP_403_FORBIDDEN)
        tier = get_school_match_tier(institution)
        quota = get_invitation_quota_info(institution)
        return Response({
            'institution_id': institution.id,
            'tier': tier,
            'features': TIER_FEATURES.get(tier, TIER_FEATURES['free']),
            'invitation_quota': quota,
        })
