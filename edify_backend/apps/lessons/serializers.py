from rest_framework import serializers
from .models import Lesson, LessonNote, LessonRecording, LessonAttendance

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class LessonNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonNote
        fields = '__all__'

class LessonRecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonRecording
        fields = '__all__'

class LessonAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonAttendance
        fields = '__all__'

