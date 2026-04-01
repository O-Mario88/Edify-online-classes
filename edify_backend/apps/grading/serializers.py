from rest_framework import serializers
from .models import GradeRecord, SubjectGrade, ReportCard

class GradeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeRecord
        fields = ['id', 'submission', 'score', 'teacher_feedback', 'graded_at']

class SubjectGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    class_title = serializers.CharField(source='assigned_class.title', read_only=True)
    term_name = serializers.CharField(source='term.name', read_only=True)
    finalizer_name = serializers.CharField(source='finalized_by.full_name', read_only=True)

    class Meta:
        model = SubjectGrade
        fields = [
            'id', 'student', 'student_name', 'assigned_class', 'class_title', 'term', 'term_name',
            'score', 'grade_letter', 'teacher_remarks', 'finalized_by', 'finalizer_name', 'finalized_at'
        ]

class ReportCardSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    term_name = serializers.CharField(source='term.name', read_only=True)

    class Meta:
        model = ReportCard
        fields = [
            'id', 'institution', 'student', 'student_name', 'term', 'term_name',
            'overall_score', 'overall_grade_letter', 'class_teacher_remarks', 
            'headteacher_remarks', 'is_published', 'published_at', 'generated_at'
        ]
