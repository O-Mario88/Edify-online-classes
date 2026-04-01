from rest_framework import serializers
from .models import DailyRegister, LessonAttendance

class DailyRegisterSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    recorder_name = serializers.CharField(source='recorded_by.full_name', read_only=True)
    term_name = serializers.CharField(source='term.name', read_only=True)

    class Meta:
        model = DailyRegister
        fields = [
            'id', 'institution', 'term', 'term_name', 'student', 'student_name', 
            'record_date', 'status', 'recorded_by', 'recorder_name', 'notes', 'created_at'
        ]

class LessonAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    marker_name = serializers.CharField(source='marked_by.full_name', read_only=True)

    class Meta:
        model = LessonAttendance
        fields = [
            'id', 'lesson', 'lesson_title', 'student', 'student_name', 
            'status', 'marked_by', 'marker_name', 'flagged_for_review', 'timestamp'
        ]
