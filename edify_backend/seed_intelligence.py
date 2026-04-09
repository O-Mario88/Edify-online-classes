hen """
Seed Intelligence Data — populates demo data for all intelligence pillars.
Run: python manage.py shell < seed_intelligence.py
"""
import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.utils import timezone
from datetime import timedelta, date
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== Seeding Intelligence Engine Data ===")

# Get some users
students = list(User.objects.filter(role='student')[:5])
teachers = list(User.objects.filter(role='teacher')[:3])
parents = list(User.objects.filter(role='parent')[:2])
admins = list(User.objects.filter(role__in=['institution_admin', 'school_admin'])[:2])

from institutions.models import Institution
institution = Institution.objects.first()

if not institution:
    print("No institution found. Creating a demo institution.")
    institution = Institution.objects.create(
        name="Kampala Model High School",
        institution_type="secondary",
        country_id=1 if hasattr(Institution, 'country') else None,
    )

from curriculum.models import Subject
subjects = list(Subject.objects.all()[:5])

print(f"Found: {len(students)} students, {len(teachers)} teachers, {len(parents)} parents, {len(admins)} admins")

# ─── 1. Badges ───
from intelligence.models import Badge, UserBadge

badges_data = [
    {"name": "Early Bird", "description": "Attended 5 sessions on time", "icon": "sunrise", "category": "attendance", "criteria": {"type": "attendance_streak", "count": 5}, "points_value": 15},
    {"name": "Top Improver", "description": "Improved score by 15%+ in one subject", "icon": "trending-up", "category": "improvement", "criteria": {"type": "score_improvement", "pct": 15}, "points_value": 25},
    {"name": "Perfect Week", "description": "Completed all study tasks in a week", "icon": "check-circle", "category": "consistency", "criteria": {"type": "plan_completion", "pct": 100}, "points_value": 20},
    {"name": "Peer Champion", "description": "Helped 3 classmates through peer tutoring", "icon": "users", "category": "peer_support", "criteria": {"type": "peer_help", "count": 3}, "points_value": 30},
    {"name": "Knowledge Seeker", "description": "Completed 10 resources", "icon": "book-open", "category": "academic", "criteria": {"type": "resource_completion", "count": 10}, "points_value": 20},
    {"name": "Leadership Star", "description": "Served as class leader for a term", "icon": "star", "category": "leadership", "criteria": {"type": "role", "role": "class_leader"}, "points_value": 40},
    {"name": "Comeback Kid", "description": "Recovered from at-risk status", "icon": "zap", "category": "improvement", "criteria": {"type": "risk_recovery"}, "points_value": 35},
    {"name": "Marathon Runner", "description": "30-day activity streak", "icon": "flame", "category": "consistency", "criteria": {"type": "streak", "days": 30}, "points_value": 50},
]

created_badges = []
for bd in badges_data:
    badge, created = Badge.objects.get_or_create(name=bd["name"], defaults=bd)
    created_badges.append(badge)
    if created:
        print(f"  Created badge: {badge.name}")

# Award badges to students
for i, student in enumerate(students[:3]):
    for badge in created_badges[:3 + i]:
        UserBadge.objects.get_or_create(user=student, badge=badge)
print(f"  Awarded badges to {min(3, len(students))} students")

# ─── 2. Challenges ───
from intelligence.models import Challenge, ChallengeParticipant

challenges_data = [
    {"title": "Attendance Champion", "description": "Maintain 95%+ attendance for 2 weeks", "scope": "institution", "metric": "attendance_rate", "goal_value": 95, "reward_points": 100},
    {"title": "Math Master Sprint", "description": "Score 80%+ on all Math assessments this week", "scope": "subject", "metric": "assessment_avg", "goal_value": 80, "reward_points": 75},
    {"title": "Resource Explorer", "description": "Complete 5 resources this week", "scope": "platform", "metric": "resource_count", "goal_value": 5, "reward_points": 50},
]

today = timezone.now().date()
for cd in challenges_data:
    challenge, created = Challenge.objects.get_or_create(
        title=cd["title"],
        defaults={
            **cd,
            "status": "active",
            "institution": institution,
            "subject": subjects[0] if cd["scope"] == "subject" and subjects else None,
            "start_date": today - timedelta(days=3),
            "end_date": today + timedelta(days=11),
            "reward_badge": created_badges[0] if created_badges else None,
            "created_by": teachers[0] if teachers else None,
        }
    )
    if created:
        print(f"  Created challenge: {challenge.title}")
        for student in students:
            ChallengeParticipant.objects.get_or_create(
                challenge=challenge, user=student,
                defaults={"current_value": 50 + (hash(student.email) % 50)}
            )

# ─── 3. House Teams ───
from intelligence.models import HouseTeam, HouseMembership

houses_data = [
    {"name": "Eagles", "color": "#EF4444"},
    {"name": "Lions", "color": "#F59E0B"},
    {"name": "Panthers", "color": "#3B82F6"},
    {"name": "Wolves", "color": "#10B981"},
]

for i, hd in enumerate(houses_data):
    house, created = HouseTeam.objects.get_or_create(
        name=hd["name"], institution=institution,
        defaults={"color": hd["color"], "total_points": 500 + (i * 120)}
    )
    if created:
        print(f"  Created house: {house.name}")
        # Assign students to houses
        for j, student in enumerate(students):
            if j % 4 == i:
                HouseMembership.objects.get_or_create(house=house, student=student)

# ─── 4. Points Ledger ───
from intelligence.models import PointsLedger

for student in students[:3]:
    for source, pts in [('attendance', 20), ('assignment', 35), ('streak', 15), ('peer_help', 25)]:
        PointsLedger.objects.get_or_create(
            user=student, source=source, description=f"Demo {source} points",
            defaults={"points": pts, "institution": institution}
        )
print(f"  Seeded points for {min(3, len(students))} students")

# ─── 5. Student Passports ───
from intelligence.models import StudentPassport

for student in students[:3]:
    passport, created = StudentPassport.objects.get_or_create(
        student=student,
        defaults={
            "strongest_subjects": [s.name for s in subjects[:2]] if subjects else ["Mathematics"],
            "weakest_subjects": [s.name for s in subjects[2:4]] if len(subjects) > 2 else ["Physics"],
            "overall_gpa": 3.2 + (hash(student.email) % 10) / 10,
            "total_lessons_attended": 45 + (hash(student.email) % 30),
            "total_resources_completed": 12 + (hash(student.email) % 15),
            "total_assessments_submitted": 8 + (hash(student.email) % 10),
            "current_streak_days": 5 + (hash(student.email) % 20),
            "longest_streak_days": 15 + (hash(student.email) % 30),
            "badges": [{"name": b.name, "category": b.category} for b in created_badges[:3]],
            "career_interests": ["Engineering", "Medicine"] if hash(student.email) % 2 == 0 else ["Law", "Business"],
            "timeline": [
                {"event": "Joined Edify", "date": "2025-09-01"},
                {"event": "First Perfect Score", "date": "2025-10-15"},
                {"event": "Earned Top Improver Badge", "date": "2026-01-20"},
            ],
        }
    )
    if created:
        print(f"  Created student passport: {student}")

# ─── 6. Teacher Passports ───
from intelligence.models import TeacherPassport

for teacher in teachers:
    passport, created = TeacherPassport.objects.get_or_create(
        teacher=teacher,
        defaults={
            "total_lessons_delivered": 85 + (hash(teacher.email) % 50),
            "total_classes_taught": 4 + (hash(teacher.email) % 3),
            "total_resources_created": 15 + (hash(teacher.email) % 20),
            "total_students_impacted": 60 + (hash(teacher.email) % 40),
            "average_student_improvement": 8.5 + (hash(teacher.email) % 10),
            "interventions_launched": 5 + (hash(teacher.email) % 5),
            "intervention_success_rate": 65 + (hash(teacher.email) % 30),
            "badges": [{"name": "Master Teacher", "category": "academic"}],
            "subject_effectiveness": {str(s.id): {"score": 70 + (hash(teacher.email) % 25), "trend": "up"} for s in subjects[:3]} if subjects else {},
            "milestones": [
                {"event": "First 100 lessons", "date": "2025-12-01"},
                {"event": "Won Teaching Excellence Award", "date": "2026-02-15"},
            ],
        }
    )
    if created:
        print(f"  Created teacher passport: {teacher}")

# ─── 7. Story Cards ───
from intelligence.models import StoryCard

story_cards_data = [
    {"audience": "student", "headline": "🔥 12-Day Streak!", "body": "You've been active for 12 days straight. Your consistency is paying off!", "tone": "celebration"},
    {"audience": "student", "headline": "Mathematics is Your Strength", "body": "Your readiness score in Mathematics is 85%. Consider helping peers.", "tone": "positive"},
    {"audience": "teacher", "headline": "78% of Students On Track", "body": "Your teaching impact is visible with 78% of students showing satisfactory readiness.", "tone": "positive"},
    {"audience": "teacher", "headline": "5 Submissions Awaiting Marks", "body": "Students are waiting for feedback. Prompt marking helps them learn faster.", "tone": "warning"},
    {"audience": "parent", "headline": "Great Attendance This Week!", "body": "Your child attended 5 out of 5 days this week (100%). Keep it up!", "tone": "celebration"},
    {"audience": "institution_admin", "headline": "School Health Score: 74/100", "body": "Strong areas: Student Attendance, Teacher Activity. Needs improvement: Parent Engagement.", "tone": "neutral"},
]

for i, scd in enumerate(story_cards_data):
    user = None
    if scd["audience"] == "student" and students:
        user = students[0]
    elif scd["audience"] == "teacher" and teachers:
        user = teachers[0]
    elif scd["audience"] == "parent" and parents:
        user = parents[0]
    elif scd["audience"] == "institution_admin" and admins:
        user = admins[0]

    StoryCard.objects.get_or_create(
        headline=scd["headline"],
        defaults={
            **scd,
            "user": user,
            "institution": institution,
            "data_sources": ["seed_intelligence.py"],
            "confidence": 0.9,
        }
    )
print(f"  Seeded {len(story_cards_data)} story cards")

# ─── 8. National Exam Results ───
from intelligence.models import NationalExamResult

for year in [2024, 2025]:
    NationalExamResult.objects.get_or_create(
        institution=institution, exam_type="UCE", year=year,
        defaults={
            "total_candidates": 120 + (year - 2024) * 10,
            "division_1": 25 + (year - 2024) * 5,
            "division_2": 35 + (year - 2024) * 3,
            "division_3": 30,
            "division_4": 20 - (year - 2024) * 5,
            "failures": 10 - (year - 2024) * 3,
            "subject_results": [
                {"subject": "Mathematics", "distinctions": 15, "credits": 40, "passes": 30, "failures": 5},
                {"subject": "English", "distinctions": 20, "credits": 45, "passes": 25, "failures": 2},
            ],
            "uploaded_by": admins[0] if admins else None,
            "is_verified": True,
        }
    )
print("  Seeded national exam results")

# ─── 9. Institution Health Snapshot ───
from intelligence.models import InstitutionHealthSnapshot

snapshot, created = InstitutionHealthSnapshot.objects.get_or_create(
    institution=institution, date=today,
    defaults={
        "overall_score": 74,
        "teacher_activity_score": 78,
        "student_attendance_score": 85,
        "assignment_completion_score": 65,
        "resource_engagement_score": 58,
        "parent_engagement_score": 42,
        "intervention_completion_score": 70,
        "offline_result_trend_score": 72,
        "online_result_trend_score": 68,
        "adoption_depth_score": 62,
        "risk_level": "healthy",
        "risk_factors": ["Warning: Parent Engagement at 42%"],
        "previous_score": 71,
        "score_change": 3,
    }
)
if created:
    print("  Created health snapshot")

# ─── 10. Learning Progress ───
from intelligence.models import LearningProgress

for student in students[:3]:
    for ct, cid, pct in [("resource", 1, 65), ("video", 2, 30), ("lesson", 3, 100)]:
        LearningProgress.objects.get_or_create(
            user=student, content_type=ct, content_id=cid,
            defaults={
                "progress_pct": pct,
                "last_position": {"page": 5} if ct == "resource" else {"timestamp": 120} if ct == "video" else {},
                "is_completed": pct >= 100,
            }
        )
print(f"  Seeded learning progress for {min(3, len(students))} students")

# ─── 11. Next Best Actions (via engine) ───
from intelligence.services import NextBestActionEngine

engine = NextBestActionEngine()

for student in students[:2]:
    try:
        actions = engine.generate_for_student(student, institution)
        print(f"  Generated {len(actions)} NBA actions for student: {student}")
    except Exception as e:
        print(f"  NBA generation skipped for {student}: {e}")

for teacher in teachers[:1]:
    try:
        actions = engine.generate_for_teacher(teacher, institution)
        print(f"  Generated {len(actions)} NBA actions for teacher: {teacher}")
    except Exception as e:
        print(f"  NBA generation skipped for {teacher}: {e}")

for parent in parents[:1]:
    try:
        actions = engine.generate_for_parent(parent, institution)
        print(f"  Generated {len(actions)} NBA actions for parent: {parent}")
    except Exception as e:
        print(f"  NBA generation skipped for {parent}: {e}")

for admin in admins[:1]:
    try:
        actions = engine.generate_for_institution_admin(admin, institution)
        print(f"  Generated {len(actions)} NBA actions for admin: {admin}")
    except Exception as e:
        print(f"  NBA generation skipped for {admin}: {e}")

print("\n=== Intelligence Engine Seeding Complete ===")
print(f"  Badges: {Badge.objects.count()}")
print(f"  Challenges: {Challenge.objects.count()}")
print(f"  Houses: {HouseTeam.objects.count()}")
print(f"  Student Passports: {StudentPassport.objects.count()}")
print(f"  Teacher Passports: {TeacherPassport.objects.count()}")
print(f"  Story Cards: {StoryCard.objects.count()}")
print(f"  Points Entries: {PointsLedger.objects.count()}")
print(f"  Learning Progress: {LearningProgress.objects.count()}")
print(f"  National Exam Results: {NationalExamResult.objects.count()}")
print(f"  Health Snapshots: {InstitutionHealthSnapshot.objects.count()}")

from intelligence.models import NextBestAction
print(f"  Next Best Actions: {NextBestAction.objects.count()}")
