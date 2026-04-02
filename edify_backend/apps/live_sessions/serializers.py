from rest_framework import serializers
from .models import LiveSession, SessionReminder

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

