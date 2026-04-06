"""
Django management command to populate Finance ERP system with test data.

Creates a complete mock institution with:
- School/Institution with admin, finance officer, teacher, and student users
- Institution memberships with proper role assignments
- Classes and streams
- Fee categories and templates
- Sample invoices and payments for testing

Usage:
    python manage.py populate_finance_test_data [--institution=INSTITUTION_ID] [--clear]
    python manage.py populate_finance_test_data  # Uses default institution 1
    python manage.py populate_finance_test_data --institution=2  # Create for specific institution
    python manage.py populate_finance_test_data --clear  # Clear and recreate
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from datetime import datetime

from edify_backend.apps.finance.models import (
    StudentFinancialProfile, FeeCategory, FeeTemplate, FeeTemplateLineItem,
    Invoice, InvoiceLineItem, Payment, PaymentAllocation, Account,
    BankAccount, FinancialPeriod, JournalEntry, AuditLog, FiscalYear,
    DiscountRule
)
from institutions.models import Institution, InstitutionMembership
from accounts.models import User


class Command(BaseCommand):
    help = 'Populate Finance ERP with institution-scoped test data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--institution',
            type=int,
            default=1,
            help='Institution ID to populate (default: 1)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing test data before creating new data',
        )

    def handle(self, *args, **options):
        institution_id = options.get('institution', 1)
        
        # Get or create the institution
        try:
            institution = Institution.objects.get(id=institution_id)
            self.stdout.write(
                self.style.SUCCESS(f'Using existing institution: {institution.name} (ID: {institution_id})')
            )
        except Institution.DoesNotExist:
            # Create a default institution if it doesn't exist
            institution = Institution.objects.create(
                id=institution_id,
                name=f'Test School {institution_id}',
                institution_type='secondary',
                country='Uganda',
                active=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created new institution: {institution.name} (ID: {institution_id})')
            )

        if options['clear']:
            self.stdout.write(self.style.WARNING(f'Clearing existing test data for institution {institution_id}...'))
            self.clear_test_data(institution_id)

        self.stdout.write(self.style.SUCCESS('Creating institution-scoped test users...'))
        admin_user, finance_officer, teacher_user, student_user1, student_user2 = self.create_users_with_institution(institution)

        self.stdout.write(self.style.SUCCESS('Creating financial periods...'))
        fiscal_year, periods = self.create_financial_periods()

        self.stdout.write(self.style.SUCCESS('Creating fee categories...'))
        fee_categories = self.create_fee_categories()

        self.stdout.write(self.style.SUCCESS('Creating fee templates...'))
        fee_template = self.create_fee_templates(fee_categories, periods)

        self.stdout.write(self.style.SUCCESS('Creating student financial profiles...'))
        student_profiles = self.create_student_profiles(student_user1, student_user2)

        self.stdout.write(self.style.SUCCESS('Creating sample invoices...'))
        invoices = self.create_invoices(student_profiles, fee_template, periods)

        self.stdout.write(self.style.SUCCESS('Creating sample payments...'))
        self.create_payments(student_profiles, invoices)

        self.stdout.write(self.style.SUCCESS('Creating chart of accounts...'))
        self.create_chart_of_accounts()

        self.print_institution_credentials(institution, admin_user, finance_officer, teacher_user, student_user1, student_user2)

    def create_users_with_institution(self, institution):
        """Create test users with institution memberships (institution-scoped)."""
        # Admin user
        admin_user, created = User.objects.get_or_create(
            email=f'admin_{institution.id}@school.test',
            defaults={
                'full_name': 'Alice Admin',
                'country_code': 'UG',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('password123')
            admin_user.save()
        
        # Create institution membership for admin
        InstitutionMembership.objects.get_or_create(
            user=admin_user,
            institution=institution,
            defaults={'role': 'admin'}
        )

        # Finance Officer user
        finance_officer, created = User.objects.get_or_create(
            email=f'finance_{institution.id}@school.test',
            defaults={
                'full_name': 'Frank Finance',
                'country_code': 'UG',
                'role': 'admin',
                'is_staff': True,
            }
        )
        if created:
            finance_officer.set_password('password123')
            finance_officer.save()
        
        # Create institution membership for finance officer
        InstitutionMembership.objects.get_or_create(
            user=finance_officer,
            institution=institution,
            defaults={'role': 'finance_officer'}
        )

        # Teacher user
        teacher_user, created = User.objects.get_or_create(
            email=f'teacher_{institution.id}@school.test',
            defaults={
                'full_name': 'Bob Teacher',
                'country_code': 'UG',
                'role': 'teacher',
                'is_staff': True,
            }
        )
        if created:
            teacher_user.set_password('password123')
            teacher_user.save()

        # Create institution membership for teacher
        InstitutionMembership.objects.get_or_create(
            user=teacher_user,
            institution=institution,
            defaults={'role': 'teacher'}
        )

        # Student users
        student_user1, created = User.objects.get_or_create(
            email=f'student1_{institution.id}@school.test',
            defaults={
                'full_name': 'Charlie Student',
                'country_code': 'UG',
                'role': 'student',
            }
        )
        if created:
            student_user1.set_password('password123')
            student_user1.save()

        # Create institution membership for student 1
        InstitutionMembership.objects.get_or_create(
            user=student_user1,
            institution=institution,
            defaults={'role': 'student'}
        )

        student_user2, created = User.objects.get_or_create(
            email=f'student2_{institution.id}@school.test',
            defaults={
                'full_name': 'Diana Scholar',
                'country_code': 'UG',
                'role': 'student',
            }
        )
        if created:
            student_user2.set_password('password123')
            student_user2.save()

        # Create institution membership for student 2
        InstitutionMembership.objects.get_or_create(
            user=student_user2,
            institution=institution,
            defaults={'role': 'student'}
        )

        return admin_user, finance_officer, teacher_user, student_user1, student_user2

    def create_financial_periods(self):
        """Create fiscal year and financial periods."""
        fiscal_year, created = FiscalYear.objects.get_or_create(
            fiscal_year_name='2024',
            defaults={
                'fiscal_year_start_date': datetime(2024, 1, 1).date(),
                'fiscal_year_end_date': datetime(2024, 12, 31).date(),
                'is_current_fiscal_year': True,
            }
        )

        periods = []
        months = [
            ('January', 1, 31),
            ('February', 2, 29),
            ('March', 3, 31),
            ('April', 4, 30),
        ]

        for month_name, month, day in months:
            period, created = FinancialPeriod.objects.get_or_create(
                period_name=f'{month_name} 2024',
                period_type='month',
                defaults={
                    'start_date': datetime(2024, month, 1).date(),
                    'end_date': datetime(2024, month, day).date(),
                }
            )
            periods.append(period)

        return fiscal_year, periods

    def create_fee_categories(self):
        """Create fee categories."""
        categories_data = [
            ('TUITION', 'Tuition Fee', 'tuition'),
            ('EXAM', 'Exam Fee', 'exam'),
            ('LAB', 'Laboratory Fee', 'non_tuition'),
            ('BOARDING', 'Boarding Fee', 'boarding'),
            ('UNIFORM', 'Uniform Fee', 'one_time'),
            ('BOOKS', 'Books & Stationery', 'one_time'),
        ]

        categories = []
        for code, name, cat_type in categories_data:
            category, created = FeeCategory.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'category_type': cat_type,
                    'is_mandatory': cat_type == 'tuition',
                    'is_recurring': cat_type in ['tuition', 'boarding'],
                    'is_waivable': True,
                    'is_discountable': True,
                    'active': True,
                }
            )
            categories.append(category)

        return categories

    def create_fee_templates(self, fee_categories, periods):
        """Create fee template for testing."""
        # Create a simple fee template
        template, created = FeeTemplate.objects.get_or_create(
            term_id=1,  # Placeholder - adjust based on your Term model
            grade='S4',
            defaults={
                'version': 1,
                'is_latest_version': True,
                'status': 'active',
                'day_or_boarding': 'both',
                'student_category': 'regular',
            }
        )

        # Add line items to template
        line_items = [
            (fee_categories[0], Decimal('500000'), True, 'per_term'),    # Tuition
            (fee_categories[1], Decimal('50000'), False, 'per_term'),     # Exam
            (fee_categories[2], Decimal('30000'), False, 'per_term'),     # Lab
            (fee_categories[4], Decimal('25000'), False, 'one_time'),     # Uniform
            (fee_categories[5], Decimal('40000'), False, 'one_time'),     # Books
        ]

        for fee_cat, amount, mandatory, frequency in line_items:
            FeeTemplateLineItem.objects.get_or_create(
                fee_template=template,
                fee_category=fee_cat,
                defaults={
                    'amount': amount,
                    'mandatory': mandatory,
                    'charge_frequency': frequency,
                    'display_order': fee_cat.id,
                }
            )

        return template

    def create_student_profiles(self, student_user1, student_user2):
        """Create student financial profiles."""
        profiles = []

        for idx, student_user in enumerate([student_user1, student_user2], 1):
            profile, created = StudentFinancialProfile.objects.get_or_create(
                student=student_user,
                defaults={
                    'current_balance': Decimal('0.00'),
                    'arrears_balance': Decimal('0.00'),
                    'advance_payment': Decimal('0.00'),
                    'total_invoiced': Decimal('645000.00' if idx == 1 else '645000.00'),
                    'total_paid': Decimal('200000.00' if idx == 1 else '0.00'),
                    'financial_status': 'in_arrears' if idx == 1 else 'in_arrears',
                    'day_or_boarding': 'day' if idx == 1 else 'boarding',
                    'arrears_days': 30 if idx == 1 else 60,
                }
            )
            profiles.append(profile)

        return profiles

    def create_invoices(self, student_profiles, fee_template, periods):
        """Create sample invoices for students."""
        invoices = []

        for student_idx, profile in enumerate(student_profiles):
            for period_idx, period in enumerate(periods[:2]):  # Create 2 invoices per student
                invoice_number = f"INV-2024-{1000 + student_idx * 10 + period_idx + 1}"

                invoice, created = Invoice.objects.get_or_create(
                    invoice_number=invoice_number,
                    defaults={
                        'student': profile.student,
                        'student_financial_profile': profile,
                        'academic_year_id': 1,  # Adjust based on your AcademicYear
                        'term_id': 1,  # Adjust based on your Term
                        'invoice_type': 'term_opening',
                        'issue_date': period.start_date,
                        'due_date': period.end_date,
                        'gross_amount': Decimal('645000.00'),
                        'discount_amount': Decimal('0.00'),
                        'tax_amount': Decimal('0.00'),
                        'net_amount': Decimal('645000.00'),
                        'amount_paid': Decimal('200000.00') if student_idx == 0 and period_idx == 0 else Decimal('0.00'),
                        'amount_outstanding': Decimal('445000.00') if student_idx == 0 and period_idx == 0 else Decimal('645000.00'),
                        'balance_amount': Decimal('445000.00') if student_idx == 0 and period_idx == 0 else Decimal('645000.00'),
                        'status': 'partially_paid' if student_idx == 0 and period_idx == 0 else 'issued',
                        'is_overdue': True,
                        'days_overdue': 30 + period_idx * 10,
                    }
                )

                # Add line items
                if created:
                    line_items_data = [
                        ('Tuition Fee', Decimal('500000.00')),
                        ('Exam Fee', Decimal('50000.00')),
                        ('Lab Fee', Decimal('30000.00')),
                        ('Uniform', Decimal('25000.00')),
                        ('Books', Decimal('40000.00')),
                    ]

                    for description, amount in line_items_data:
                        InvoiceLineItem.objects.get_or_create(
                            invoice=invoice,
                            description=description,
                            defaults={
                                'quantity': 1,
                                'unit_amount': amount,
                                'total_amount': amount,
                            }
                        )

                invoices.append(invoice)

        return invoices

    def create_payments(self, student_profiles, invoices):
        """Create sample payments."""
        # Create a payment for the first invoice (from student 1)
        if len(invoices) > 0:
            payment, created = Payment.objects.get_or_create(
                payment_number='PAY-2024-001',
                defaults={
                    'student': student_profiles[0].student,
                    'amount': Decimal('200000.00'),
                    'payment_date': timezone.now().date(),
                    'payment_method': 'bank_transfer',
                    'status': 'confirmed',
                    'allocation_status': 'fully_allocated',
                    'bank_account_id': None,  # Will be set if bank accounts exist
                    'mobile_money_ref': None,
                }
            )

            if created:
                # Create allocation
                PaymentAllocation.objects.get_or_create(
                    payment=payment,
                    invoice=invoices[0],
                    defaults={
                        'amount_allocated': Decimal('200000.00'),
                        'allocation_type': 'oldest_first',
                    }
                )

    def create_chart_of_accounts(self):
        """Create basic chart of accounts for GL."""
        accounts_data = [
            # Assets
            ('1010', 'Cash', 'asset', True),
            ('1020', 'Bank Account', 'asset', True),
            ('1200', 'Student Accounts Receivable', 'asset', True),
            # Income
            ('4100', 'Tuition Fee Income', 'income', True),
            ('4200', 'Exam Fee Income', 'income', True),
            ('4300', 'Other Income', 'income', True),
            # Expenses
            ('5100', 'Teacher Salaries', 'expense', True),
            ('5200', 'Utilities', 'expense', True),
        ]

        for code, name, acc_type, allow_posting in accounts_data:
            Account.objects.get_or_create(
                account_code=code,
                defaults={
                    'account_name': name,
                    'account_type': acc_type,
                    'allow_posting': allow_posting,
                    'opening_balance': Decimal('0.00'),
                    'active': True,
                }
            )

    def clear_test_data(self, institution_id):
        """Clear test data created by this command for a specific institution."""
        User.objects.filter(email__in=[
            f'admin_{institution_id}@school.test',
            f'finance_{institution_id}@school.test',
            f'teacher_{institution_id}@school.test',
            f'student1_{institution_id}@school.test',
            f'student2_{institution_id}@school.test'
        ]).delete()

    def print_institution_credentials(self, institution, admin_user, finance_officer, teacher_user, student_user1, student_user2):
        """Print institution-scoped test credentials for developers."""
        self.stdout.write(
            self.style.SUCCESS('\n' + '='*90)
        )
        self.stdout.write(
            self.style.SUCCESS(f'✅ INSTITUTION-SCOPED TEST DATA CREATED FOR: {institution.name}')
        )
        self.stdout.write(
            self.style.SUCCESS('='*90 + '\n')
        )

        self.stdout.write(
            self.style.HTTP_SUCCESS(f'🏢 INSTITUTION: {institution.name} (ID: {institution.id})')
        )
        self.stdout.write(f'   API Base URL: /api/v1/institutions/{institution.id}/finance/\n')

        self.stdout.write(
            self.style.HTTP_INFO('👑 ADMIN LOGIN (Full System Access)')
        )
        self.stdout.write(f'   Email: {admin_user.email}')
        self.stdout.write(f'   Password: password123')
        self.stdout.write(f'   Full Name: {admin_user.full_name}')
        self.stdout.write(f'   Role: Admin (Full access to invoices, payments, GL, journal entries)\n')

        self.stdout.write(
            self.style.HTTP_INFO('💰 FINANCE OFFICER LOGIN (Finance Operations)')
        )
        self.stdout.write(f'   Email: {finance_officer.email}')
        self.stdout.write(f'   Password: password123')
        self.stdout.write(f'   Full Name: {finance_officer.full_name}')
        self.stdout.write(f'   Role: Finance Officer (Can create invoices & payments, NO GL access)\n')

        self.stdout.write(
            self.style.HTTP_INFO('👨‍🏫 TEACHER LOGIN (View Classes & Students)')
        )
        self.stdout.write(f'   Email: {teacher_user.email}')
        self.stdout.write(f'   Password: password123')
        self.stdout.write(f'   Full Name: {teacher_user.full_name}')
        self.stdout.write(f'   Role: Teacher (View-only access to assigned students & their payment status)\n')

        self.stdout.write(
            self.style.HTTP_INFO('👨‍🎓 STUDENT LOGIN #1 (Partial Payment - Arrears)')
        )
        self.stdout.write(f'   Email: {student_user1.email}')
        self.stdout.write(f'   Password: password123')
        self.stdout.write(f'   Full Name: {student_user1.full_name}')
        self.stdout.write(f'   Role: Student (View own invoices & payments)')
        self.stdout.write('   Status: In Arrears (445,000 UGX outstanding)\n')

        self.stdout.write(
            self.style.HTTP_INFO('👩‍🎓 STUDENT LOGIN #2 (No Payment - Full Arrears)')
        )
        self.stdout.write(f'   Email: {student_user2.email}')
        self.stdout.write(f'   Password: password123')
        self.stdout.write(f'   Full Name: {student_user2.full_name}')
        self.stdout.write(f'   Role: Student (View own invoices & payments)')
        self.stdout.write('   Status: In Arrears (645,000 UGX outstanding)\n')

        self.stdout.write(
            self.style.SUCCESS('='*90)
        )
        self.stdout.write(
            self.style.SUCCESS('📊 INSTITUTION TEST DATA SUMMARY')
        )
        self.stdout.write(
            self.style.SUCCESS('='*90)
        )

        self.stdout.write(f'✓ Institution: {institution.name} (ID: {institution.id})')
        self.stdout.write(f'✓ Users Created: 5 (1 admin, 1 finance officer, 1 teacher, 2 students)')
        self.stdout.write(f'✓ Institution Memberships: 5 users assigned with roles')
        self.stdout.write(f'✓ Financial Periods: 4 months (Jan - Apr 2024)')
        self.stdout.write(f'✓ Fee Categories: 6 (Tuition, Exam, Lab, Boarding, Uniform, Books)')
        self.stdout.write(f'✓ Fee Templates: 1 (645,000 UGX total per term)')
        self.stdout.write(f'✓ Student Financial Profiles: 2')
        self.stdout.write(f'✓ Invoices: 4 (2 per student, all overdue)')
        self.stdout.write(f'✓ Payments: 1 (200,000 UGX from Student 1)')
        self.stdout.write(f'✓ Chart of Accounts: 8 GL accounts\n')

        self.stdout.write(
            self.style.WARNING('🔗 INSTITUTION-SCOPED ACCESS')
        )
        self.stdout.write(f'   Institution Dashboard: /dashboard/institution/{institution.id}/')
        self.stdout.write(f'   Finance Hub Branch: Click "Finance & Bursary Hub" in Institution Dashboard')
        self.stdout.write(f'   API Access: /api/v1/institutions/{institution.id}/finance/\n')

        self.stdout.write(
            self.style.WARNING('📍 TESTING ACCESS CONTROL')
        )
        self.stdout.write('   ✅ Admin can access: /api/v1/institutions/{id}/finance/ (own institution)')
        self.stdout.write('   ❌ Admin CANNOT access: /api/v1/institutions/{other_id}/finance/ (403 Forbidden)')
        self.stdout.write('   ✅ Student can view: /api/v1/institutions/{id}/finance/my-invoices/')
        self.stdout.write('   ❌ Student CANNOT view: /api/v1/institutions/{id}/finance/students/ (403 Forbidden)\n')
        
        self.stdout.write(
            self.style.SUCCESS('✨ MULTI-INSTITUTION SUPPORT: Create more institutions with:')
        )
        self.stdout.write(f'   python manage.py populate_finance_test_data --institution=2\n')
