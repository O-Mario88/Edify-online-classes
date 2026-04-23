from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'registration'
    serializer_class = UserRegistrationSerializer

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
            role='student'
        )
        student_profile = StudentProfile.objects.create(user=student_user)

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
