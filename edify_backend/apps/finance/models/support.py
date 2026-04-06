# Edify Finance - Support Models
# Helper and configuration models for the finance system

from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class CostCenter(models.Model):
    """
    Cost centers for expense allocation and budgeting.
    Allows tracking of finances by department, project, or activity.
    """
    
    id = models.BigAutoField(primary_key=True)
    
    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Cost center code'
    )
    
    name = models.CharField(
        max_length=255,
        help_text='Cost center name'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Description'
    )
    
    # Hierarchy
    parent_cost_center = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_centers',
        help_text='Parent cost center'
    )
    
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_cost_centers',
        help_text='Cost center manager'
    )
    
    active = models.BooleanField(
        default=True,
        db_index=True,
        help_text='Is active?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'finance_costcenter'
        verbose_name = 'Cost Center'
        verbose_name_plural = 'Cost Centers'
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['active']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class FiscalYear(models.Model):
    """
    Define fiscal years for reporting and budgeting.
    """
    
    id = models.BigAutoField(primary_key=True)
    
    fiscal_year_name = models.CharField(
        max_length=50,
        unique=True,
        help_text='Fiscal year name (e.g., "2024", "2024-2025")'
    )
    
    fiscal_year_start_date = models.DateField(
        help_text='Start date'
    )
    
    fiscal_year_end_date = models.DateField(
        help_text='End date'
    )
    
    is_current_fiscal_year = models.BooleanField(
        default=False,
        help_text='Is this the current fiscal year?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'finance_fiscalyear'
        verbose_name = 'Fiscal Year'
        verbose_name_plural = 'Fiscal Years'
        ordering = ['-fiscal_year_start_date']
        indexes = [
            models.Index(fields=['fiscal_year_name']),
        ]
        unique_together = [['fiscal_year_start_date', 'fiscal_year_end_date']]
    
    def __str__(self):
        return self.fiscal_year_name


class DiscountRule(models.Model):
    """
    Define automatic or manual discount rules.
    Examples: sibling discount, early payment discount, staff child discount.
    """
    
    RULE_TYPE_CHOICES = (
        ('sibling_discount', 'Sibling Discount'),
        ('staff_child', 'Staff Child'),
        ('early_payment', 'Early Payment Discount'),
        ('bulk_purchase', 'Bulk Purchase Discount'),
        ('scholarship', 'Scholarship'),
        ('waiver_medical', 'Medical Waiver'),
        ('custom', 'Custom Rule'),
    )
    
    DISCOUNT_TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('fixed_amount', 'Fixed Amount'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    rule_code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Rule code'
    )
    
    rule_name = models.CharField(
        max_length=255,
        help_text='Rule name'
    )
    
    rule_type = models.CharField(
        max_length=50,
        choices=RULE_TYPE_CHOICES,
        default='custom',
        help_text='Rule type'
    )
    
    # Discount calculation
    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES,
        default='percentage',
        help_text='Discount type'
    )
    
    discount_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Discount value (% or amount)'
    )
    
    # Applicability
    applicable_to_fee_categories = models.JSONField(
        default=list,
        help_text='Fee category IDs this applies to (empty = all)'
    )
    
    # Validation
    requires_proof = models.BooleanField(
        default=False,
        help_text='Does this require proof/documentation?'
    )
    
    requires_approval = models.BooleanField(
        default=False,
        help_text='Does this require approval?'
    )
    
    max_uses_per_student = models.IntegerField(
        blank=True,
        null=True,
        help_text='Max uses per student (NULL = unlimited)'
    )
    
    active = models.BooleanField(
        default=True,
        db_index=True,
        help_text='Is active?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_discount_rules',
        help_text='Created by'
    )
    
    class Meta:
        db_table = 'finance_discountrule'
        verbose_name = 'Discount Rule'
        verbose_name_plural = 'Discount Rules'
        ordering = ['rule_code']
        indexes = [
            models.Index(fields=['rule_code']),
            models.Index(fields=['active']),
        ]
    
    def __str__(self):
        return f"{self.rule_code} - {self.rule_name}"


class TransportRoute(models.Model):
    """
    Define transport routes for the school.
    Placeholder model - will be linked to transport billing module.
    """
    
    id = models.BigAutoField(primary_key=True)
    
    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Route code'
    )
    
    name = models.CharField(
        max_length=255,
        help_text='Route name'
    )
    
    class Meta:
        db_table = 'finance_transportroute'
        verbose_name = 'Transport Route'
        verbose_name_plural = 'Transport Routes'
    
    def __str__(self):
        return self.name


class Scholarship(models.Model):
    """
    Scholarship model for student sponsorships.
    Placeholder - will be fully implemented in Phase 2.
    """
    
    id = models.BigAutoField(primary_key=True)
    
    scholarship_code = models.CharField(
        max_length=100,
        unique=True,
        help_text='Scholarship code'
    )
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        help_text='Student'
    )
    
    class Meta:
        db_table = 'finance_scholarship'
        verbose_name = 'Scholarship'
        verbose_name_plural = 'Scholarships'
    
    def __str__(self):
        return self.scholarship_code


class InventoryItem(models.Model):
    """
    Inventory items that can be issued to students and charged.
    Placeholder - will be fully implemented in Phase 2.
    """
    
    id = models.BigAutoField(primary_key=True)
    
    item_code = models.CharField(
        max_length=50,
        unique=True,
        help_text='Item code'
    )
    
    item_name = models.CharField(
        max_length=255,
        help_text='Item name'
    )
    
    class Meta:
        db_table = 'finance_inventoryitem'
        verbose_name = 'Inventory Item'
        verbose_name_plural = 'Inventory Items'
    
    def __str__(self):
        return self.item_name
