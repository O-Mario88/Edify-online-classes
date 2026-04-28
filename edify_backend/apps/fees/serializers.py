from rest_framework import serializers
from .models import FeeAssessment, FeePayment


class FeePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeePayment
        fields = [
            'id', 'assessment', 'amount', 'method', 'reference',
            'paid_on', 'notes', 'created_at', 'recorded_by',
        ]
        read_only_fields = ['id', 'created_at', 'recorded_by']


class FeeAssessmentSerializer(serializers.ModelSerializer):
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    payments = FeePaymentSerializer(many=True, read_only=True)

    class Meta:
        model = FeeAssessment
        fields = [
            'id', 'institution', 'institution_name', 'student', 'student_email', 'student_name',
            'term_label', 'item', 'amount', 'currency', 'due_date',
            'status', 'notes', 'total_paid', 'balance', 'payments',
            'created_at', 'created_by', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'total_paid', 'balance', 'payments', 'created_at', 'created_by', 'updated_at']
