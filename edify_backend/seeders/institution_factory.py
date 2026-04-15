import logging
from institutions.models import Institution, InstitutionMembership
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()

def seed_institutions(users_dict):
    """Generates the Primary and Secondary school archetypes."""
    logger.info("Seeding Level 2: Institutions and Role Mappings")
    
    # 1. Maple Academy (Secondary Model)
    maple_sec, _ = Institution.objects.get_or_create(
        name="Maple Academy Secondary",
        defaults={
            "slug": "maple-secondary",
            "primary_color": "#1e40af", # deep blue
            "secondary_color": "#dbeafe",
            "school_level": "secondary",
            "grade_offerings": [8, 9, 10, 11, 12, 13], # S1-S6
            "subscription_plan": "enterprise",
            "is_active": True
        }
    )
    
    # 2. Sunrise Primary (Primary Model)
    sunrise_pri, _ = Institution.objects.get_or_create(
        name="Sunrise Junior School",
        defaults={
            "slug": "sunrise-primary",
            "primary_color": "#b45309", # amber
            "secondary_color": "#fef3c7",
            "school_level": "primary",
            "grade_offerings": [1, 2, 3, 4, 5, 6, 7], # P1-P7
            "subscription_plan": "pro",
            "is_active": True
        }
    )
    
    # 3. Dormant High (Onboarding stuck)
    dormant_high, _ = Institution.objects.get_or_create(
        name="Dormant High School",
        defaults={
            "slug": "dormant-high",
            "school_level": "secondary",
            "subscription_plan": "free",
            "is_active": False,
            "in_grace_period": True
        }
    )

    # Bind Memberships - Secondary
    InstitutionMembership.objects.get_or_create(user=users_dict["inst.demo@edify.ug"], institution=maple_sec, defaults={"role": "headteacher"})
    InstitutionMembership.objects.get_or_create(user=users_dict["teacher.demo@edify.ug"], institution=maple_sec, defaults={"role": "class_teacher"})
    InstitutionMembership.objects.get_or_create(user=users_dict["student.demo@edify.ug"], institution=maple_sec, defaults={"role": "student"})
    InstitutionMembership.objects.get_or_create(user=users_dict["student.stellar@edify.ug"], institution=maple_sec, defaults={"role": "student"})
    
    # Bind Memberships - Primary
    InstitutionMembership.objects.get_or_create(user=users_dict["inst.primary@edify.ug"], institution=sunrise_pri, defaults={"role": "headteacher"})
    InstitutionMembership.objects.get_or_create(user=users_dict["teacher.primary@edify.ug"], institution=sunrise_pri, defaults={"role": "class_teacher"})
    InstitutionMembership.objects.get_or_create(user=users_dict["student.primary@edify.ug"], institution=sunrise_pri, defaults={"role": "student"})
    
    # Bind Parent Globally (Can span institutions)
    InstitutionMembership.objects.get_or_create(user=users_dict["parent.demo@edify.ug"], institution=maple_sec, defaults={"role": "parent"})
    InstitutionMembership.objects.get_or_create(user=users_dict["parent.demo@edify.ug"], institution=sunrise_pri, defaults={"role": "parent"})

    logger.info(" - Seeded 3 Institutions.")
    return {"maple_sec": maple_sec, "sunrise_pri": sunrise_pri, "dormant_high": dormant_high}
