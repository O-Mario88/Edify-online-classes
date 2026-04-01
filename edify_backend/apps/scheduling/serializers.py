from rest_framework import serializers
from .models import AcademicTerm, Room, TimetableSlot

class AcademicTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicTerm
        fields = ['id', 'institution', 'name', 'start_date', 'end_date', 'is_active']

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'institution', 'name', 'capacity', 'is_active']

class TimetableSlotSerializer(serializers.ModelSerializer):
    class_title = serializers.CharField(source='assigned_class.title', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TimetableSlot
        fields = [
            'id', 'institution', 'term', 'assigned_class', 'class_title',
            'room', 'room_name', 'teacher', 'teacher_name',
            'day_of_week', 'day_name', 'start_time', 'end_time', 'is_active'
        ]
