from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from institutions.models import Institution
from classes.models import Class, ClassEnrollment
from billing.models import InstitutionPricingTier, InstitutionBillingAccount

def seed_high_performing_school():
    User = get_user_model()
    
    # 1. Create Institution
    inst, _ = Institution.objects.get_or_create(
        name="Lakeside High School - DEMO",
        defaults={
            "address": "Entebbe Road, Kampala",
            "contact_phone": "+256 700 000000",
            "branding_colors": '{"primary": "#1d4ed8", "secondary": "#93c5fd"}'
        }
    )

    # 2. Assign Head Teacher & DOS
    headteacher, _ = User.objects.get_or_create(email="headteacher.lakeside@edify.ug", defaults={
        "first_name": "Sarah", "last_name": "Namatovu", "role": "institution_admin"
    })
    headteacher.set_password("Demo1234!")
    headteacher.save()

    dos, _ = User.objects.get_or_create(email="dos.lakeside@edify.ug", defaults={
        "first_name": "Kenneth", "last_name": "Kintu", "role": "institution_admin", "designation": "Director of Studies"
    })
    dos.set_password("Demo1234!")
    dos.save()

    # 3. Create Teachers
    teacher1, _ = User.objects.get_or_create(email="mr.okello@lakeside.ug", defaults={
        "first_name": "Robert", "last_name": "Okello", "role": "institution_teacher"
    })
    teacher1.set_password("Demo1234!")
    teacher1.save()

    # 4. Create Students and Classes
    s4_class, _ = Class.objects.get_or_create(
        institution=inst, 
        name="Senior 4 Blue",
        defaults={
            "level": "S4",
            "visibility": "private"
        }
    )

    for i in range(1, 11):
        stu, _ = User.objects.get_or_create(email=f"student{i}.lakeside@edify.ug", defaults={
            "first_name": f"Student{i}", "last_name": "Lakeside", "role": "institution_student"
        })
        stu.set_password("Demo1234!")
        stu.save()
        ClassEnrollment.objects.get_or_create(student=stu, enrolled_class=s4_class)

    # 5. Billing System Mock
    tier, _ = InstitutionPricingTier.objects.get_or_create(
        name="Premium Annual",
        defaults={"base_price_ugx": "1000000.00", "per_student_ugx": "50000.00"}
    )
    InstitutionBillingAccount.objects.get_or_create(
        institution=inst,
        defaults={
            "tier": tier,
            "status": "active",
            "next_billing_date": timezone.now() + timedelta(days=180)
        }
    )

    print(f"-> Seeded {inst.name} successfully.")
