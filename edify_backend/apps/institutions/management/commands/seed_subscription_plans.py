"""
Seeds default subscription plans for student activation.
Run: python manage.py seed_subscription_plans
"""
from django.core.management.base import BaseCommand
from institutions.models import SubscriptionPlan


class Command(BaseCommand):
    help = 'Seeds default subscription plans for the student activation workflow'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'Monthly Plan',
                'slug': 'monthly',
                'description': 'Month-to-month access. Flexible billing for trial periods. Full access to all academic content.',
                'price_ugx': 150000,
                'price_usd': 40,
                'duration_days': 30,
                'access_scope': 'full',
            },
            {
                'name': 'Term Plan',
                'slug': 'termly',
                'description': 'Covers one full academic term (3 months). Includes timetable studio, analytics, and live sessions. Most popular choice.',
                'price_ugx': 400000,
                'price_usd': 110,
                'duration_days': 90,
                'access_scope': 'full',
            },
            {
                'name': 'Annual Plan',
                'slug': 'yearly',
                'description': 'Full year access with maximum savings (~12% discount). Includes priority support and all premium integrations.',
                'price_ugx': 1200000,
                'price_usd': 330,
                'duration_days': 365,
                'access_scope': 'premium',
            },
        ]

        created_count = 0
        for plan_data in plans:
            plan, created = SubscriptionPlan.objects.update_or_create(
                slug=plan_data['slug'],
                defaults=plan_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  ✔ Created plan: {plan.name} — UGX {plan.price_ugx:,.0f}"))
            else:
                self.stdout.write(self.style.WARNING(f"  ↻ Updated plan: {plan.name} — UGX {plan.price_ugx:,.0f}"))

        self.stdout.write(self.style.SUCCESS(f"\nDone. {created_count} new plans created, {len(plans) - created_count} updated."))
