from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from django.contrib.auth import get_user_model
from .activation import consume_activation, send_activation_email
from .serializers import UserRegistrationSerializer

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'registration'
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # Fire an activation email even when REQUIRE_EMAIL_VERIFICATION is off
        # in dev -- the console backend surfaces the link in server logs, which
        # is the fastest way to exercise the flow end-to-end locally. In prod
        # this goes to the real SMTP backend configured via env.
        try:
            send_activation_email(user)
        except Exception:
            # Don't block registration on mail-layer failure; admin can
            # re-trigger via management command or the user can use forgot-password.
            import logging
            logging.getLogger('edify.accounts').exception(
                'activation_email_send_failed email=%s', user.email,
            )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import ParentProfile, StudentProfile
from parent_portal.models import ParentStudentLink

class StudentOnboardingAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'registration'

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        student_data = request.data.get('student', {})
        parent_data = request.data.get('parent', {})
        payment_data = request.data.get('payment', {})

        if not student_data or not parent_data or not payment_data:
            return Response({'error': 'Missing student, parent, or payment details.'}, status=status.HTTP_400_BAD_REQUEST)

        parent_phone = parent_data.get('phone')
        if not parent_phone:
            return Response({'error': 'Parent phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Lookup or Create Parent
        parent_email = parent_data.get('email')
        if not parent_email:
            parent_email = f"parent_{parent_phone.replace(' ', '').replace('+', '')}@edify.portal"

        parent_user = User.objects.filter(phone=parent_phone, role='parent').first()
        if not parent_user:
            parent_user = User.objects.filter(email=parent_email).first()

        if not parent_user:
            parent_user = User.objects.create_user(
                email=parent_email,
                full_name=parent_data.get('full_name', 'Guardian'),
                country_code=student_data.get('country_code', 'uganda'),
                role='parent',
                phone=parent_phone
            )
            # Parent user does not have a set password initially
            parent_user.set_unusable_password()
            parent_user.save()
            ParentProfile.objects.create(user=parent_user)

        parent_profile = parent_user.parent_profile

        # 2. Create Student
        # Handle case where student email might exist if re-running
        student_email = student_data.get('email')
        if User.objects.filter(email=student_email).exists():
            return Response({'error': 'Student email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        student_user = User.objects.create_user(
            email=student_email,
            full_name=student_data.get('full_name'),
            country_code=student_data.get('country_code'),
            password=student_data.get('password'),
            role='student',
            stage=student_data.get('stage', 'secondary'),
        )
        student_profile = StudentProfile.objects.create(user=student_user)
        # Parent inherits the student's stage so their dashboard doesn't
        # mix primary/secondary content either.
        if student_user.stage != parent_user.stage:
            parent_user.stage = student_user.stage
            parent_user.save(update_fields=['stage'])

        # 3. Create Parent-Student Link
        ParentStudentLink.objects.create(
            parent_profile=parent_profile,
            student_profile=student_profile,
            relationship_type=parent_data.get('relationship', 'other').lower(),
            consent_status='approved' # Implicitly approved since onboarding together
        )

        return Response({
            'message': 'Student and Parent created successfully. Account is active.'
        }, status=status.HTTP_201_CREATED)


from .serializers import PublicProfileSerializer
from intelligence.models import UserBadge
from django.shortcuts import get_object_or_404

class PublicProfileView(APIView):
    """
    Public endpoint to view a user's profile, badges, and certificates.
    Requires no authentication.
    """
    permission_classes = [AllowAny]

    def get(self, request, username, *args, **kwargs):
        # We will lookup by a system_username or prefix of email for demo purposes
        user = None
        # Try to find by student profile system_username first
        student_profile = StudentProfile.objects.filter(system_username=username).first()
        if student_profile:
            user = student_profile.user
        else:
            # Fallback to finding by email prefix
            user = User.objects.filter(email__startswith=username).first()

        if not user:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Gather badges
        user_badges = UserBadge.objects.filter(user=user).select_related('badge')
        badges_data = []
        for ub in user_badges:
            badges_data.append({
                'id': f"b-{ub.badge.id}",
                'name': ub.badge.name,
                'description': ub.badge.description,
                'rarity': ub.badge.rarity,
                'unlockedAt': ub.earned_at.isoformat() if ub.earned_at else None
            })

        # Mock certificates for now (we can add a Certificate model later)
        certificates_data = []
        if user_badges.count() > 3:
            certificates_data.append({
                'id': f"cert-{user.id}-1",
                'title': "Platform Foundation Graduate",
                'issuedTo': user.full_name,
                'issuedDate': user.date_joined.isoformat(),
                'issuerLogo': "/icons/maple.png",
                'verificationHash': f"0x{user.id}A8B9C"
            })

        profile_data = {
            'name': user.full_name,
            'username': username,
            'bio': "Dedicated learner on the Edify platform." if user.role == 'student' else "Educational professional.",
            'location': "Uganda" if user.country_code.lower() == 'ug' else "Unknown",
            'avatar': f"https://ui-avatars.com/api/?name={user.full_name.replace(' ', '+')}&size=160&background=f8f9fa",
            'joinedDate': user.date_joined.isoformat(),
            'badges': badges_data,
            'certificates': certificates_data
        }

        serializer = PublicProfileSerializer(data=profile_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

class AccountActivationView(APIView):
    """POST /api/v1/auth/activate/ with {uid, token} -> flips email_verified."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'registration'

    def post(self, request, *args, **kwargs):
        uid = request.data.get('uid')
        token = request.data.get('token')
        if not uid or not token:
            return Response({'error': 'uid and token are required.'}, status=status.HTTP_400_BAD_REQUEST)
        user = consume_activation(uid, token)
        if not user:
            return Response({'error': 'Invalid or expired activation link.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Email verified. You can now sign in.', 'email': user.email}, status=status.HTTP_200_OK)


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings as dj_settings
from rest_framework.exceptions import AuthenticationFailed


class VerifiedEmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT login serializer that enforces email verification when REQUIRE_EMAIL_VERIFICATION is on."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Embed stage + role in the JWT so the frontend can gate nav
        # without an extra /me roundtrip.
        token['stage'] = user.stage
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if getattr(dj_settings, 'REQUIRE_EMAIL_VERIFICATION', False) and not self.user.email_verified:
            raise AuthenticationFailed(
                detail={'code': 'email_not_verified', 'detail': 'Please verify your email before signing in.'},
            )
        # Surface stage in the login response body too (frontend reads this
        # directly into AuthContext).
        data['stage'] = self.user.stage
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['full_name'] = self.user.full_name
        return data


class VerifiedEmailTokenObtainPairView(TokenObtainPairView):
    """Drop-in replacement for the default JWT login view."""
    serializer_class = VerifiedEmailTokenObtainPairSerializer


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if user:
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"http://localhost:5173/reset-password?uid={uid}&token={token}"
            
            # Dispatch email asynchronously via Celery
            from .tasks import send_password_reset_email_task
            send_password_reset_email_task.delay(email, reset_url)

        return Response({'message': 'If an account with that email exists, we have sent a password reset link.'}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """POST /api/v1/auth/reset-password/

    Accepts {uid, token, new_password} and, on a valid (uid, token)
    pair from the ForgotPasswordView email, sets the new password.
    Same uid+token mechanism used by Django's built-in
    PasswordResetTokenGenerator — tokens are single-use and expire
    per Django's PASSWORD_RESET_TIMEOUT setting.

    Returns 400 with `code` so the mobile/web client can localize.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request, *args, **kwargs):
        from django.utils.http import urlsafe_base64_decode
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not (uid and token and new_password):
            return Response(
                {'detail': 'uid, token, and new_password are required.', 'code': 'missing_fields'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {'detail': 'Password must be at least 8 characters.', 'code': 'weak_password'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'detail': 'Invalid or expired reset link.', 'code': 'invalid_link'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response(
                {'detail': 'Invalid or expired reset link.', 'code': 'invalid_link'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=['password'])
        return Response(
            {'message': 'Password updated. Sign in with your new password.'},
            status=status.HTTP_200_OK,
        )


from rest_framework.permissions import IsAuthenticated
from .models import PilotFeedback
from .serializers import PilotFeedbackSerializer


class PilotFeedbackCreateView(APIView):
    """POST /api/v1/feedback/ — capture bug reports + comments from pilot users.

    Authenticated-only (so we always know who it came from and can follow
    up).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PilotFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        PilotFeedback.objects.create(
            user=request.user,
            user_role=getattr(request.user, 'role', '') or '',
            severity=serializer.validated_data['severity'],
            message=serializer.validated_data['message'],
            page_url=serializer.validated_data.get('page_url', '')[:500],
            user_agent=(request.META.get('HTTP_USER_AGENT') or '')[:500],
        )
        return Response({'message': 'Thanks — logged.'}, status=status.HTTP_201_CREATED)


class PilotFeedbackInboxView(APIView):
    """GET /api/v1/feedback/inbox/ — platform-admin-only inbox of pilot feedback.

    Returns the most recent N items (default 50) with the submitter's email
    and role. Used by the AdminDashboard's feedback panel so the team can
    triage bugs and comments without dropping into the Django admin.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if getattr(request.user, 'role', '') not in ('admin', 'platform_admin'):
            return Response({'detail': 'Platform admin role required.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            limit = max(1, min(int(request.query_params.get('limit', 50)), 200))
        except (TypeError, ValueError):
            limit = 50
        severity = request.query_params.get('severity') or ''
        qs = PilotFeedback.objects.all()
        if severity:
            qs = qs.filter(severity=severity)
        items = qs[:limit]
        payload = [{
            'id': f.id,
            'severity': f.severity,
            'message': f.message,
            'page_url': f.page_url,
            'user_email': f.user.email if f.user else None,
            'user_role': f.user_role,
            'created_at': f.created_at.isoformat(),
        } for f in items]
        return Response({
            'count': qs.count(),
            'items': payload,
        })
