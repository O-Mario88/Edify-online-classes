import logging
from django.contrib.auth import get_user_model
from institutions.models import Institution
from .scenario_high_performing import seed_high_performing_school
from .scenario_struggling import seed_struggling_school
from .scenario_marketplace import seed_marketplace_ecosystem
from .scenario_freemium import seed_free_setup_school

logger = logging.getLogger(__name__)

def seed_all(stdout, style, scenario='all'):
    User = get_user_model()

    # Base System Roles
    stdout.write("1/5: Seeding Base Platform Roles...")
    super_admin, _ = User.objects.get_or_create(email="super@edify.ug", defaults={
        "first_name": "Super", "last_name": "Admin", "role": "superadmin", "is_staff": True, "is_superuser": True
    })
    if super_admin.check_password("Demo1234!") == False:
        super_admin.set_password("Demo1234!")
        super_admin.save()
        
    platform_admin, _ = User.objects.get_or_create(email="admin@edify.ug", defaults={
        "first_name": "Platform", "last_name": "Admin", "role": "platform_admin"
    })
    if platform_admin.check_password("Demo1234!") == False:
        platform_admin.set_password("Demo1234!")
        platform_admin.save()

    if scenario in ['all', 'institution_a']:
        stdout.write("2/5: Seeding Institution A (High-Performing Paid)...")
        seed_high_performing_school()

    if scenario in ['all', 'institution_b']:
        stdout.write("3/5: Seeding Institution B (Struggling Paid)...")
        seed_struggling_school()

    if scenario in ['all', 'institution_free']:
        stdout.write("4/5: Seeding Institution C/D (Free & Overage)...")
        seed_free_setup_school()

    if scenario in ['all', 'marketplace']:
        stdout.write("5/5: Seeding Public Marketplace Ecosystem...")
        seed_marketplace_ecosystem()

    stdout.write(style.SUCCESS("Master Seeding Completed successfully."))
