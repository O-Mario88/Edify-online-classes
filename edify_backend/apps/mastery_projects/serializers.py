from rest_framework import serializers
from .models import MasteryProject, ProjectSubmission, ProjectSubmissionArtifact, ProjectReview


class ArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSubmissionArtifact
        fields = ('id', 'artifact_type', 'text_content', 'file', 'external_url', 'caption', 'created_at')


class ProjectReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectReview
        fields = (
            'id', 'reviewer', 'reviewer_name', 'rubric_scores', 'score', 'feedback',
            'strengths', 'improvements', 'next_steps', 'status', 'reviewed_at',
        )
        read_only_fields = ('reviewer', 'reviewer_name', 'reviewed_at')

    def get_reviewer_name(self, obj):
        if obj.reviewer:
            return getattr(obj.reviewer, 'full_name', obj.reviewer.email)
        return 'Maple Reviewer'


class ProjectCardSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True, default=None)
    total_points = serializers.IntegerField(read_only=True)

    class Meta:
        model = MasteryProject
        fields = (
            'id', 'slug', 'title', 'description', 'subject_name', 'class_level_name',
            'estimated_days', 'is_group_project', 'is_premium', 'total_points',
        )


class ProjectDetailSerializer(ProjectCardSerializer):
    class Meta(ProjectCardSerializer.Meta):
        fields = ProjectCardSerializer.Meta.fields + ('instructions', 'rubric')


class SubmissionSerializer(serializers.ModelSerializer):
    artifacts = ArtifactSerializer(many=True, read_only=True)
    reviews = ProjectReviewSerializer(many=True, read_only=True)
    project = ProjectCardSerializer(read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectSubmission
        fields = (
            'id', 'project', 'student', 'student_name', 'title', 'description',
            'status', 'submitted_at', 'reviewed_at', 'revision_count',
            'artifacts', 'reviews', 'created_at',
        )
        read_only_fields = ('student', 'student_name', 'submitted_at', 'reviewed_at',
                            'revision_count', 'artifacts', 'reviews', 'created_at')

    def get_student_name(self, obj):
        return getattr(obj.student, 'full_name', obj.student.email)


class ReviewSubmitSerializer(serializers.Serializer):
    rubric_scores = serializers.DictField(child=serializers.IntegerField(), required=False)
    feedback = serializers.CharField(required=False, allow_blank=True)
    strengths = serializers.CharField(required=False, allow_blank=True)
    improvements = serializers.CharField(required=False, allow_blank=True)
    next_steps = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=['passed', 'needs_revision'])
