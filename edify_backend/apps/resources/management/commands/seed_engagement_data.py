"""
Seed ContentAssignment, ContentRecommendation, ContentEngagement,
and ContentAccessSession with realistic demo data.

Usage:
    python manage.py seed_engagement_data
    python manage.py seed_engagement_data --clear   # wipe first
"""
import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from resources.content_models import (
    ContentItem,
    ContentEngagement,
    ContentAssignment,
    ContentRecommendation,
    ContentAccessSession,
)

User = get_user_model()


RECOMMENDATION_REASONS = [
    ("ai_weak_topic", "You scored below 50% on related quizzes — this resource covers the gaps."),
    ("ai_exam_readiness", "Your upcoming exam covers this topic. Reviewing this will boost readiness."),
    ("ai_missed_lesson", "You missed the lesson on this topic. This resource summarises what was covered."),
    ("ai_low_engagement", "You haven't opened any resources in this subject for over 2 weeks."),
    ("ai_practice_gap", "Your practice attempts on this topic are below average — try this guided resource."),
    ("teacher", "Your teacher recommended this to strengthen your understanding."),
    ("platform", "Popular among students in your class who scored highly."),
]

ASSIGNMENT_NOTES = [
    "Please complete before the next class.",
    "Review this carefully — it will be discussed in the next lesson.",
    "This covers everything from the missed lesson.",
    "Exam revision — focus on worked examples.",
    "Extra practice to strengthen your weak areas.",
    "",
]


class Command(BaseCommand):
    help = "Seed engagement, assignment, recommendation and session data for demo."

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Clear existing engagement data before seeding")

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("Clearing existing engagement data …")
            ContentAccessSession.objects.all().delete()
            ContentRecommendation.objects.all().delete()
            ContentAssignment.objects.all().delete()
            ContentEngagement.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Cleared."))

        students = list(User.objects.filter(role="student")[:20])
        teachers = list(User.objects.filter(role="teacher")[:5])
        content_items = list(ContentItem.objects.filter(publication_status="published")[:15])

        if not students:
            self.stdout.write(self.style.ERROR("No student users found. Run seed_full_platform first."))
            return
        if not content_items:
            self.stdout.write(self.style.ERROR("No published ContentItems found. Seed content first."))
            return

        now = timezone.now()

        # ── 1. Engagements ──────────────────────────────────────────
        self.stdout.write("Creating ContentEngagement records …")
        engagements_created = 0
        for student in students:
            # Each student engages with 3-8 random content items
            sample = random.sample(content_items, min(random.randint(3, 8), len(content_items)))
            for ci in sample:
                pct = random.choice([0, 0, 10, 25, 45, 60, 75, 88, 95, 100])
                is_completed = pct >= 90
                status = (
                    "completed" if is_completed
                    else "not_started" if pct == 0
                    else "in_progress" if pct > 30
                    else "started"
                )
                active_secs = random.randint(30, 3600) if pct > 0 else 0
                first_accessed = now - timedelta(days=random.randint(1, 14))
                last_accessed = first_accessed + timedelta(hours=random.randint(1, 48))

                eng, created = ContentEngagement.objects.update_or_create(
                    content_item=ci,
                    student=student,
                    defaults={
                        "status": status,
                        "completion_percentage": Decimal(str(pct)),
                        "active_time_seconds": active_secs,
                        "last_position": random.randint(0, 500) if pct > 0 else 0,
                        "is_completed": is_completed,
                        "completed_at": last_accessed if is_completed else None,
                        "first_accessed": first_accessed,
                        "last_accessed": last_accessed,
                    },
                )
                if created:
                    engagements_created += 1

        self.stdout.write(self.style.SUCCESS(f"  {engagements_created} engagements created."))

        # ── 2. Assignments ──────────────────────────────────────────
        self.stdout.write("Creating ContentAssignment records …")
        assignments_created = 0
        assigning_teacher = teachers[0] if teachers else None

        for ci in content_items[:8]:
            assigned_students = random.sample(students, min(random.randint(3, 10), len(students)))
            for student in assigned_students:
                _, created = ContentAssignment.objects.update_or_create(
                    content_item=ci,
                    student=student,
                    assigned_by_type="teacher",
                    defaults={
                        "assigned_by": assigning_teacher,
                        "assignment_type": random.choice(["required", "recommended"]),
                        "priority": random.choice(["low", "medium", "high"]),
                        "note": random.choice(ASSIGNMENT_NOTES),
                        "due_date": now + timedelta(days=random.randint(1, 14)),
                        "is_active": True,
                    },
                )
                if created:
                    assignments_created += 1

        self.stdout.write(self.style.SUCCESS(f"  {assignments_created} assignments created."))

        # ── 3. Recommendations ──────────────────────────────────────
        self.stdout.write("Creating ContentRecommendation records …")
        recs_created = 0
        for student in students:
            rec_items = random.sample(content_items, min(random.randint(1, 4), len(content_items)))
            for ci in rec_items:
                source, reason = random.choice(RECOMMENDATION_REASONS)
                _, created = ContentRecommendation.objects.get_or_create(
                    student=student,
                    content_item=ci,
                    source=source,
                    defaults={
                        "reason": reason,
                        "confidence_score": Decimal(str(round(random.uniform(0.55, 0.98), 2))),
                        "status": random.choice(["active", "active", "active", "dismissed"]),
                        "expires_at": now + timedelta(days=random.randint(7, 30)),
                    },
                )
                if created:
                    recs_created += 1

        self.stdout.write(self.style.SUCCESS(f"  {recs_created} recommendations created."))

        # ── 4. Access Sessions ──────────────────────────────────────
        self.stdout.write("Creating ContentAccessSession records …")
        sessions_created = 0
        engagements = ContentEngagement.objects.filter(active_time_seconds__gt=0).select_related("content_item")[:80]

        for eng in engagements:
            num_sessions = random.randint(1, 4)
            session_start = eng.first_accessed or (now - timedelta(days=7))

            for _ in range(num_sessions):
                active_secs = random.randint(60, 900)
                session_end = session_start + timedelta(seconds=active_secs + random.randint(10, 120))
                progress_start = Decimal(str(round(random.uniform(0, float(eng.completion_percentage)), 2)))
                progress_end = min(
                    eng.completion_percentage,
                    progress_start + Decimal(str(round(random.uniform(5, 20), 2)))
                )

                interaction = "video" if eng.content_item.content_type == "video" else "document"

                ContentAccessSession.objects.create(
                    student=eng.student,
                    content_item=eng.content_item,
                    engagement=eng,
                    active_seconds=active_secs,
                    interaction_type=interaction,
                    progress_at_start=progress_start,
                    progress_at_end=progress_end,
                )
                sessions_created += 1
                session_start = session_end + timedelta(hours=random.randint(1, 24))

        self.stdout.write(self.style.SUCCESS(f"  {sessions_created} sessions created."))
        self.stdout.write(self.style.SUCCESS("\nDone. Engagement seed data is ready."))
