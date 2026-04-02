from rest_framework import serializers
from .models import FeeItem, FeeTemplate, Invoice, Payment, BursaryScheme, ExpenseCategory, ExpenseRecord

class FeeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeItem
        fields = '__all__'

class FeeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeTemplate
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    class Meta:
        model = Invoice
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class BursarySchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BursaryScheme
        fields = '__all__'

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'

class ExpenseRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseRecord
        fields = '__all__'
