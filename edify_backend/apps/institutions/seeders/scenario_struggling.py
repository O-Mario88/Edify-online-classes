from institutions.models import Institution

def seed_struggling_school():
    inst, _ = Institution.objects.get_or_create(
        name="Hillside Academy - DEMO",
        defaults={"address": "Kigali, Rwanda", "contact_phone": "+250 700 000000"}
    )
    print("-> Seeded Hillside Academy successfully.")
