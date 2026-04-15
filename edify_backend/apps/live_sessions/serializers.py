from rest_framework import serializers
from .models import LiveSession, SessionReminder, MissedSessionRecovery, RecoveryAssignment

class LiveSessionSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='lesson.title', read_only=True, default="Live Lesson")
    description = serializers.CharField(source='lesson.description', read_only=True)
    hostName = serializers.SerializerMethodField()
    subject = serializers.CharField(source='lesson.subject.name', read_only=True, default="General Science")
    scheduledStart = serializers.DateTimeField(source='scheduled_start', read_only=True)
    durationMinutes = serializers.IntegerField(source='duration_minutes', read_only=True)
    enrolledCount = serializers.IntegerField(source='enrolled_count', read_only=True)

    class Meta:
        model = LiveSession
        fields = '__all__'

    def get_hostName(self, obj):
        try:
            return obj.lesson.teacher.full_name
        except AttributeError:
            return "Expert Host"

class SessionReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionReminder
        fields = '__all__'


class RecoveryAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecoveryAssignment
        fields = ['id', 'title', 'file_type', 'file_url']


class MissedSessionRecoverySerializer(serializers.ModelSerializer):
    assignments = RecoveryAssignmentSerializer(many=True, read_only=True)
    subject = serializers.SerializerMethodField()
    topic = serializers.SerializerMethodField()
    host_name = serializers.SerializerMethodField()
    session_date = serializers.SerializerMethodField()
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = MissedSessionRecovery
        fields = [
            'id', 'session', 'student', 'student_name',
            'subject', 'topic', 'host_name', 'session_date',
            'summary', 'recording_url', 'recovery_status',
            'submitted_at', 'created_at', 'assignments',
        ]
        read_only_fields = ['id', 'student_name', 'subject', 'topic', 'host_name', 'session_date', 'created_at']

    def get_subject(self, obj):
        try:
            return obj.session.lesson.subject.name
        except AttributeError:
            return 'General'

    def get_topic(self, obj):
        try:
            return obj.session.lesson.title
        except AttributeError:
            return 'Session Review'

    def get_host_name(self, obj):
        try:
            return obj.session.lesson.teacher.full_name
        except AttributeError:
            return 'Instructor'

    def get_session_date(self, obj):
        if obj.session.scheduled_start:
            return obj.session.scheduled_start.isoformat()
        return None
