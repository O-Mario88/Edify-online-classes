"""python manage.py recalculate_readiness

Run nightly (or hourly during a pilot) to refresh every student's
readiness snapshot and issue any newly-earned School Match badges.

  ./manage.py recalculate_readiness                   # all student-role users
  ./manage.py recalculate_readiness --user-id 42      # single user
  ./manage.py recalculate_readiness --limit 200       # cap for canary runs
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from institution_discovery.services_match import (
    recalculate_eligible_students,
    recalculate_student_readiness,
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Recompute StudentReadinessProfile snapshots and issue School Match badges.'

    def add_arguments(self, parser):
        parser.add_argument('--user-id', type=int, default=None,
                            help='Recompute a single user only (skips the bulk loop).')
        parser.add_argument('--limit', type=int, default=None,
                            help='Cap the number of users processed (canary runs).')

    def handle(self, *args, **opts):
        user_id = opts.get('user_id')
        limit = opts.get('limit')

        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'No user with id {user_id}.'))
                return
            result = recalculate_student_readiness(user)
            self.stdout.write(self.style.SUCCESS(
                f"Recomputed user={user.email}: lane={result['lane']} "
                f"score={result['overall_readiness_score']:.1f} "
                f"badges={result['badges_issued_now']}"
            ))
            return

        qs = User.objects.filter(role__icontains='student')
        if limit:
            qs = qs[:limit]
        counts = recalculate_eligible_students(qs)
        self.stdout.write(self.style.SUCCESS(
            f"processed={counts['processed']} eligible={counts['eligible']} "
            f"lane_a={counts['lane_a']} lane_b={counts['lane_b']} "
            f"badges_issued={counts['badges_issued']}"
        ))
