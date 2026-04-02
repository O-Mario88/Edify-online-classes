from rest_framework import serializers
from .models import AnalyticsEvent, DailyPlatformMetric, DailyInstitutionMetric, SubjectPerformanceSnapshot, SystemHealthSnapshot

class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = '__all__'

class DailyPlatformMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyPlatformMetric
        fields = '__all__'

class DailyInstitutionMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyInstitutionMetric
        fields = '__all__'

class SubjectPerformanceSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectPerformanceSnapshot
        fields = '__all__'

class SystemHealthSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemHealthSnapshot
        fields = '__all__'

