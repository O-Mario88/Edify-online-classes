from rest_framework import serializers
from .models import MatchRequest, PeerPointsLedger, TutorProfile, TutoringBounty


class MatchRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchRequest
        fields = '__all__'


class PeerPointsLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeerPointsLedger
        fields = '__all__'


class TutorProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_initial = serializers.SerializerMethodField()
    subject_names = serializers.SerializerMethodField()

    class Meta:
        model = TutorProfile
        fields = [
            'id', 'user', 'user_name', 'user_initial', 'bio',
            'rating', 'total_sessions', 'is_active',
            'subject_names', 'created_at',
        ]
        read_only_fields = ['id', 'user_name', 'user_initial', 'subject_names', 'created_at']

    def get_user_initial(self, obj):
        name = obj.user.full_name or ''
        return name[0].upper() if name else '?'

    def get_subject_names(self, obj):
        return list(obj.subjects.values_list('name', flat=True))


class TutoringBountySerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.full_name', read_only=True)
    accepted_by_name = serializers.CharField(source='accepted_by.full_name', read_only=True, default=None)

    class Meta:
        model = TutoringBounty
        fields = [
            'id', 'requester', 'requester_name', 'subject_name', 'topic',
            'urgency', 'points_reward', 'bounty_type',
            'assigned_teacher_name', 'assigned_student_count',
            'accepted_by', 'accepted_by_name', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'requester_name', 'accepted_by_name', 'created_at']
