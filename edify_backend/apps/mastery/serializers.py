from rest_framework import serializers
from .models import MasteryTrack, MasteryTrackModule, MasteryTrackItem, MasteryEnrollment


class MasteryTrackItemSerializer(serializers.ModelSerializer):
    display_title = serializers.CharField(read_only=True)

    class Meta:
        model = MasteryTrackItem
        fields = (
            'id', 'item_type', 'content_item', 'assessment', 'live_session', 'practice_lab',
            'placeholder_title', 'placeholder_description',
            'order', 'required_for_completion', 'display_title',
        )


class MasteryTrackModuleSerializer(serializers.ModelSerializer):
    items = MasteryTrackItemSerializer(many=True, read_only=True)

    class Meta:
        model = MasteryTrackModule
        fields = ('id', 'title', 'description', 'order', 'items')


class MasteryTrackCardSerializer(serializers.ModelSerializer):
    """Compact card view for lists."""
    total_items = serializers.IntegerField(read_only=True)
    total_required_items = serializers.IntegerField(read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True, default=None)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True, default=None)

    class Meta:
        model = MasteryTrack
        fields = (
            'id', 'title', 'slug', 'tagline', 'description',
            'target_role', 'subject_name', 'class_level_name',
            'level', 'exam_track',
            'estimated_duration_weeks', 'estimated_hours_per_week',
            'is_premium', 'is_featured', 'cover_image', 'outcome_statement',
            'total_items', 'total_required_items',
        )


class MasteryTrackDetailSerializer(MasteryTrackCardSerializer):
    """Full payload with modules + items."""
    modules = MasteryTrackModuleSerializer(many=True, read_only=True)

    class Meta(MasteryTrackCardSerializer.Meta):
        fields = MasteryTrackCardSerializer.Meta.fields + ('modules',)


class MasteryEnrollmentSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.FloatField(read_only=True)
    track = MasteryTrackCardSerializer(read_only=True)

    class Meta:
        model = MasteryEnrollment
        fields = (
            'id', 'track', 'status', 'progress_percentage',
            'completed_item_ids', 'started_at', 'last_activity_at', 'completed_at',
        )


class MarkItemCompleteSerializer(serializers.Serializer):
    item_id = serializers.UUIDField()
