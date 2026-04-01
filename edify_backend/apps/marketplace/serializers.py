from rest_framework import serializers
from .models import Listing, ListingTopicBinding
from curriculum.serializers import TopicSerializer

class ListingSerializer(serializers.ModelSerializer):
    topics = serializers.SerializerMethodField()
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)

    class Meta:
        model = Listing
        fields = ['id', 'title', 'teacher_name', 'price_amount', 'currency', 'visibility_state', 'created_at', 'topics']

    def get_topics(self, obj):
        bindings = obj.topic_bindings.all()
        return [TopicSerializer(b.topic).data for b in bindings]
