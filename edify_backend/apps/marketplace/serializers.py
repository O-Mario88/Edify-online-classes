from rest_framework import serializers
from .models import Listing, ListingTopicBinding
from curriculum.serializers import TopicSerializer

class ListingSerializer(serializers.ModelSerializer):
    topics = serializers.SerializerMethodField()
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'teacher_name', 'content_type', 'price_amount', 
            'currency', 'visibility_state', 'average_rating', 'review_count', 
            'student_count', 'created_at', 'topics'
        ]

    def get_topics(self, obj):
        bindings = obj.topic_bindings.all()
        return [TopicSerializer(b.topic).data for b in bindings]

from .models import Wallet, PayoutRequest

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = '__all__'

class PayoutRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutRequest
        fields = '__all__'
