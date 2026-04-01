from rest_framework import serializers
from .models import Class, ClassEnrollment

class ClassSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    
    class Meta:
        model = Class
        fields = [
            'id', 'institution', 'subject', 'subject_name', 'class_level', 'class_level_name',
            'teacher', 'teacher_name', 'title', 'visibility', 'is_published', 'created_at'
        ]

class ClassEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    class_title = serializers.CharField(source='enrolled_class.title', read_only=True)

    class Meta:
        model = ClassEnrollment
        fields = [
            'id', 'enrolled_class', 'class_title', 'student', 'student_name',
            'status', 'enrolled_at'
        ]
