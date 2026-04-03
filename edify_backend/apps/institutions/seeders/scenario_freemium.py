from institutions.models import Institution

def seed_free_setup_school():
    inst, _ = Institution.objects.get_or_create(
        name="East Model School - DEMO",
        defaults={"address": "Jinja, Uganda", "contact_phone": "+256 700 111111"}
    )
    print("-> Seeded East Model School successfully (Free Setup Mode).")
