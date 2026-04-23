"""Data migration: mark every pre-existing user as email_verified.

Without this, the 586 seeded users (and any future fixture users) would
all fail the login gate once REQUIRE_EMAIL_VERIFICATION is turned on in
production. New users created after this migration runs keep the field's
default value (False) and must complete the activation flow.
"""
from django.db import migrations
from django.utils import timezone


def grandfather_existing(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(email_verified=False).update(
        email_verified=True,
        email_verified_at=timezone.now(),
    )


def undo(apps, schema_editor):
    # Reverse is intentionally a no-op: if we drop the columns we'd lose
    # everyone's status anyway, and clearing verification retroactively
    # could lock live users out.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0003_add_email_verified'),
    ]

    operations = [
        migrations.RunPython(grandfather_existing, undo),
    ]
