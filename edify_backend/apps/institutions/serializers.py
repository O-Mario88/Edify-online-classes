from rest_framework import serializers
from .models import Institution, InstitutionMembership, SubscriptionPlan, LearnerRegistration, StudentPaymentTransaction, StudentActivation

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'slug', 'logo', 'primary_color', 'secondary_color',
            'country_code', 'curriculum_track', 'school_level', 'grade_offerings',
            'subscription_plan', 'is_active', 'created_at'
        ]

class InstitutionMembershipSerializer(serializers.ModelSerializer):
    institution_detail = InstitutionSerializer(source='institution', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    # Exposes the user's last authenticated timestamp so the institution
    # admin can see which staff are genuinely active on Maple. Null when
    # the user has never logged in.
    user_last_login = serializers.DateTimeField(source='user.last_login', read_only=True)
    user_obj = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = InstitutionMembership
        fields = [
            'id', 'institution', 'institution_detail', 'user', 'user_obj',
            'user_email', 'user_name', 'user_last_login',
            'role', 'status', 'joined_at'
        ]
        read_only_fields = ['joined_at', 'status']

    def get_user_obj(self, obj):
        # Embed the nested user shape the InstitutionHealthView roster
        # table already expects (id, full_name, email).
        u = obj.user
        if not u:
            return None
        return {'id': u.id, 'full_name': u.full_name, 'email': u.email, 'role': u.role}

class BulkInviteSerializer(serializers.Serializer):
    emails = serializers.ListField(
        child=serializers.EmailField(),
        allow_empty=False
    )
    role = serializers.ChoiceField(choices=InstitutionMembership.ROLE_CHOICES)


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'slug', 'description', 'price_ugx', 'price_usd',
            'duration_days', 'access_scope', 'is_active', 'created_at'
        ]


class LearnerRegistrationSerializer(serializers.ModelSerializer):
    parent_user_name = serializers.CharField(source='parent_user.full_name', read_only=True, default=None)
    subscription_plan_name = serializers.CharField(source='subscription_plan.name', read_only=True, default=None)
    
    class Meta:
        model = LearnerRegistration
        fields = [
            'id', 'institution', 'full_name', 'class_level', 'stream_section',
            'learner_id_number', 'gender',
            'parent_name', 'parent_phone', 'parent_phone_secondary',
            'parent_relationship', 'parent_email', 'parent_address', 'parent_consent',
            'parent_user', 'parent_user_name',
            'subscription_plan', 'subscription_plan_name',
            'payment_method', 'payer_phone',
            'status', 'student_user',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at', 'student_user']


class StudentPaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentPaymentTransaction
        fields = [
            'id', 'registration', 'institution', 'subscription_plan',
            'student_name', 'parent_name',
            'amount', 'currency', 'payment_method', 'payer_phone',
            'provider_reference', 'internal_reference',
            'status', 'provider_response',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'internal_reference', 'created_at', 'updated_at', 'completed_at']


class StudentActivationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    plan_name = serializers.CharField(source='subscription_plan.name', read_only=True, default=None)
    
    class Meta:
        model = StudentActivation
        fields = [
            'id', 'student', 'student_name', 'registration',
            'subscription_plan', 'plan_name',
            'status', 'activated_at', 'expires_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
