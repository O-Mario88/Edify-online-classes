from rest_framework import serializers
from .models import Country, CurriculumTrack, EducationLevel, ClassLevel, Subject, Topic

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'

class ClassLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassLevel
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    
    class Meta:
        model = Topic
        fields = ['id', 'name', 'order', 'class_level_name']

class SubjectSerializer(serializers.ModelSerializer):
    topics = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'category', 'topics']
        
    def get_topics(self, obj):
        # Flatten topics for the specific subject, annotated with class level string
        topics = obj.topics.all().select_related('class_level')
        return TopicSerializer(topics, many=True).data
        
        
    def get_category(self, obj):
        return 'Compulsory' # Mock property since db holds it in SubjectCombination

from .models import TopicCompetency, ResourceQualityReview

class TopicCompetencySerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicCompetency
        fields = '__all__'

class ResourceQualityReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceQualityReview
        fields = '__all__'
