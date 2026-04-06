# Edify Finance - Fee Management Models
# Models for fee categorization, templates, and student assignments

from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class FeeCategory(models.Model):
    """
    All types of charges the school can bill students.
    Examples: Tuition, Exam fee, Lab fee, Transport, Boarding, etc.
    """
    
    CATEGORY_TYPE_CHOICES = (
        ('tuition', 'Tuition/School Fees'),
        ('exam', 'Exam-related'),
        ('non_tuition', 'Non-Tuition Charges'),
        ('optional', 'Optional Services'),
        ('one_time', 'One-Time Charges'),
        ('inventory', 'Inventory/Stock Items'),
        ('transport', 'Transport'),
        ('boarding', 'Boarding'),
        ('activity', 'Activity/Co-curricular'),
        ('other', 'Other'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Unique code for this fee category'
    )
    
    name = models.CharField(
        max_length=255,
        help_text='Display name'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Detailed description'
    )
    
    category_type = models.CharField(
        max_length=50,
        choices=CATEGORY_TYPE_CHOICES,
        default='other',
        help_text='Type of fee'
    )
    
    # GL account linkage
    gl_account = models.ForeignKey(
        'finance.Account',
        on_delete=models.PROTECT,
        related_name='fee_categories',
        help_text='GL account for this income category'
    )
    
    # Flags
    is_mandatory = models.BooleanField(
        default=True,
        help_text='Is this fee mandatory for all students?'
    )
    
    is_recurring = models.BooleanField(
        default=True,
        help_text='Does this fee recur (vs one-time)?'
    )
    
    is_waivable = models.BooleanField(
        default=False,
        help_text='Can this fee be waived?'
    )
    
    is_discountable = models.BooleanField(
        default=True,
        help_text='Can this fee be discounted?'
    )
    
    # Default amount (optional)
    default_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Default amount (if fixed-price item)'
    )
    
    # Status
    active = models.BooleanField(
        default=True,
        db_index=True,
        help_text='Is this category active?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'finance_feecategory'
        verbose_name = 'Fee Category'
        verbose_name_plural = 'Fee Categories'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['active']),
            models.Index(fields=['category_type']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class FeeTemplate(models.Model):
    """
    Define fee structure for a class in a specific term/year.
    Allows flexibility by class, stream, section, day/boarding status.
    """
    
    STUDENT_CATEGORY_CHOICES = (
        ('new', 'New Students'),
        ('continuing', 'Continuing Students'),
        ('all', 'All Students'),
    )
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('archived', 'Archived'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    template_code = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text='Unique code for this template'
    )
    
    name = models.CharField(
        max_length=255,
        help_text='Display name (e.g., "Senior 4 2024 T1")'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Template description'
    )
    
    # Scope of this template
    academic_year = models.ForeignKey(
        'curriculum.AcademicYear',
        on_delete=models.PROTECT,
        help_text='Academic year this template applies to'
    )
    
    term = models.ForeignKey(
        'curriculum.Term',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text='Specific term (NULL = applies to all terms)'
    )
    
    fee_class = models.ForeignKey(
        'classes.Class',
        on_delete=models.PROTECT,
        related_name='fee_templates',
        help_text='Class this template is for'
    )
    
    stream = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Stream (Science, Arts, etc.) - NULL = all'
    )
    
    section = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Section (Primary, Secondary) - NULL = all'
    )
    
    day_or_boarding = models.CharField(
        max_length=20,
        default='day',
        help_text='day, boarding, or mixed'
    )
    
    student_category = models.CharField(
        max_length=20,
        choices=STUDENT_CATEGORY_CHOICES,
        default='all',
        help_text='Applies to new, continuing, or all students'
    )
    
    # Amount tracking
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Total of all line items'
    )
    
    # Status and approval
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True,
        help_text='Template status'
    )
    
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_fee_templates',
        help_text='User who approved this template'
    )
    
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When this template was approved'
    )
    
    effective_from = models.DateField(
        help_text='Template effective from this date'
    )
    
    effective_to = models.DateField(
        null=True,
        blank=True,
        help_text='Template expires on this date (NULL = ongoing)'
    )
    
    # Versioning
    version = models.IntegerField(
        default=1,
        help_text='Version number'
    )
    
    is_latest_version = models.BooleanField(
        default=True,
        help_text='Is this the latest version?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_fee_templates',
        help_text='User who created this template'
    )
    
    class Meta:
        db_table = 'finance_feetemplate'
        verbose_name = 'Fee Template'
        verbose_name_plural = 'Fee Templates'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['template_code']),
            models.Index(fields=['academic_year']),
            models.Index(fields=['fee_class']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.template_code} - {self.name} (v{self.version})"
    
    def calculate_total_amount(self):
        """Recalculate total from line items."""
        total = self.line_items.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
        self.total_amount = total
        return total


class FeeTemplateLineItem(models.Model):
    """
    Individual line items on a fee template.
    Each line represents a specific charge.
    """
    
    CHARGE_FREQUENCY_CHOICES = (
        ('per_term', 'Per Term'),
        ('per_month', 'Per Month'),
        ('per_year', 'Per Year'),
        ('one_time', 'One-Time'),
        ('on_request', 'On Request'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    fee_template = models.ForeignKey(
        FeeTemplate,
        on_delete=models.CASCADE,
        related_name='line_items',
        help_text='Parent fee template'
    )
    
    fee_category = models.ForeignKey(
        FeeCategory,
        on_delete=models.PROTECT,
        help_text='Fee category for this line'
    )
    
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Amount for this line item'
    )
    
    # Flags
    is_mandatory = models.BooleanField(
        default=True,
        help_text='Is this charge mandatory?'
    )
    
    is_optional = models.BooleanField(
        default=False,
        help_text='Is this an optional charge?'
    )
    
    is_one_time = models.BooleanField(
        default=False,
        help_text='Is this a one-time charge (e.g., admission fee)?'
    )
    
    charge_frequency = models.CharField(
        max_length=20,
        choices=CHARGE_FREQUENCY_CHOICES,
        default='per_term',
        help_text='How often this charge is applied'
    )
    
    # Proration for late admissions
    enable_proration = models.BooleanField(
        default=False,
        help_text='Enable proration for late admissions'
    )
    
    proration_factor = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        null=True,
        blank=True,
        help_text='Proration factor (e.g., 0.5 for 50%)'
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        help_text='Internal notes about this line'
    )
    
    display_order = models.IntegerField(
        default=0,
        help_text='Display order in invoice'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='User who created this'
    )
    
    class Meta:
        db_table = 'finance_feetemplatelineitem'
        verbose_name = 'Fee Template Line Item'
        verbose_name_plural = 'Fee Template Line Items'
        ordering = ['display_order', 'id']
        indexes = [
            models.Index(fields=['fee_template']),
            models.Index(fields=['fee_category']),
        ]
    
    def __str__(self):
        return f"{self.fee_template.name} - {self.fee_category.name}"


class StudentFeeAssignment(models.Model):
    """
    Links a student to a fee template.
    Tracks which fees apply to which student for which term.
    """
    
    ASSIGNMENT_REASON_CHOICES = (
        ('new_admission', 'New Admission'),
        ('promotion', 'Promotion to Next Class'),
        ('transfer', 'Transfer From Another School'),
        ('readmission', 'Readmission'),
        ('custom', 'Custom Assignment'),
        ('template_change', 'Template Change'),
    )
    
    id = models.BigAutoField(primary_key=True)
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='fee_assignments',
        help_text='Student'
    )
    
    student_financial_profile = models.ForeignKey(
        'finance.StudentFinancialProfile',
        on_delete=models.CASCADE,
        related_name='fee_assignments',
        help_text='Student financial profile'
    )
    
    fee_template = models.ForeignKey(
        FeeTemplate,
        on_delete=models.PROTECT,
        related_name='student_assignments',
        help_text='Assigned fee template'
    )
    
    academic_year = models.ForeignKey(
        'curriculum.AcademicYear',
        on_delete=models.PROTECT,
        help_text='Academic year'
    )
    
    term = models.ForeignKey(
        'curriculum.Term',
        on_delete=models.PROTECT,
        help_text='Term'
    )
    
    assigned_date = models.DateField(
        help_text='Date assignment was made'
    )
    
    assignment_reason = models.CharField(
        max_length=50,
        choices=ASSIGNMENT_REASON_CHOICES,
        default='custom',
        help_text='Reason for assignment'
    )
    
    # For exceptions to template
    override_template = models.BooleanField(
        default=False,
        help_text='Override template with custom amount?'
    )
    
    custom_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Custom amount if overriding template'
    )
    
    override_reason = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Reason for override'
    )
    
    override_approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_fee_overrides',
        help_text='User who approved override'
    )
    
    # Status
    active = models.BooleanField(
        default=True,
        help_text='Is this assignment active?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='User who created assignment'
    )
    
    class Meta:
        db_table = 'finance_studentfeeassignment'
        verbose_name = 'Student Fee Assignment'
        verbose_name_plural = 'Student Fee Assignments'
        ordering = ['-assigned_date']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['fee_template']),
            models.Index(fields=['academic_year']),
        ]
        unique_together = [['student', 'fee_template', 'academic_year', 'term']]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.fee_template.name}"
