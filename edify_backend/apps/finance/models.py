from django.db import models
from django.conf import settings
import uuid

class FeeItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='fee_items')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    frequency = models.CharField(max_length=50, choices=[('one_time', 'One-Time'), ('per_term', 'Per Term'), ('annual', 'Annual')], default='per_term')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.amount}"

class FeeTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='fee_templates')
    name = models.CharField(max_length=255)
    applicable_classes = models.ManyToManyField('classes.Class', blank=True)
    fee_items = models.ManyToManyField(FeeItem)
    is_boarding = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='invoices')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=100, unique=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    due_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('partial', 'Partial'), ('paid', 'Paid'), ('cancelled', 'Cancelled')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def balance_due(self):
        return self.total_amount - self.amount_paid

class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='payments')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=100, choices=[('cash', 'Cash'), ('mobile_money', 'Mobile Money'), ('bank_transfer', 'Bank Transfer'), ('cheque', 'Cheque')])
    reference = models.CharField(max_length=255, blank=True, null=True)
    payment_date = models.DateField()
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    created_at = models.DateTimeField(auto_now_add=True)

class BursaryScheme(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='bursaries')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    value_type = models.CharField(max_length=50, choices=[('percentage', 'Percentage'), ('fixed', 'Fixed Amount')])
    value = models.DecimalField(max_digits=12, decimal_places=2)
    active = models.BooleanField(default=True)

class ExpenseCategory(models.Model):
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='expense_categories')
    name = models.CharField(max_length=255)
    
class ExpenseRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payee = models.CharField(max_length=255)
    description = models.TextField()
    date_incurred = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
