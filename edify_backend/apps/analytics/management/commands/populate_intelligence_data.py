import random
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from institutions.models import Institution
from curriculum.models import Subject
from classes.models import Class
from analytics.models import (
    PlatformGrowthFunnel,
    EcosystemComparisonSnapshot,
    InstitutionHealthScore,
    ClassActivitySnapshot,
    ResourceEffectivenessSnapshot,
    EnhancedTeacherEffectivenessIndex,
    ParentEngagementIndex,
    SubjectDifficultySnapshot,
    InsightStoryCard
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the Maple Admin Intelligence system with realistic mock data.'

    def handle(self, *args, **options):
        self.stdout.write("🚀 Seeding Intelligence Mock Data...")
        
        # Ensure we have base objects
        institutions = list(Institution.objects.all()[:10])
        subjects = list(Subject.objects.all()[:5])
        
        if not institutions:
            self.stdout.write(self.style.ERROR("No institutions found. Please run seed scripts first."))
            return
            
        today = timezone.now().date()
        
        # 1. Fill Funnel and Ecosystem daily spans (Past 90 days)
        self.stdout.write("Generating 90-day rolling trend data...")
        for i in range(90, -1, -1):
            target_date = today - timedelta(days=i)
            
            PlatformGrowthFunnel.objects.update_or_create(
                date=target_date,
                defaults={
                    'institutions_onboarded': 120 + (90-i),
                    'institutions_activated': 80 + int((90-i)*0.8),
                    'institutions_dormant': 15 + random.randint(-5, 5),
                    'institutions_at_risk': 10 + random.randint(-2, 4),
                    'teachers_onboarded': 1500 + (90-i)*5,
                    'teachers_activated': 1200 + (90-i)*4,
                    'students_onboarded': 45000 + (90-i)*100,
                    'students_activated': 39000 + (90-i)*80,
                    'parents_linked': 25000 + (90-i)*60,
                    'parents_active': 12000 + (90-i)*30,
                    'independent_signups': 5000 + (90-i)*50,
                    'independent_active': 2000 + (90-i)*20,
                }
            )
            
            EcosystemComparisonSnapshot.objects.update_or_create(
                date=target_date,
                defaults={
                    'inst_teacher_activity_rate': random.uniform(65.0, 85.0),
                    'indep_teacher_activity_rate': random.uniform(40.0, 60.0),
                    'inst_student_engagement_rate': random.uniform(70.0, 90.0),
                    'indep_student_engagement_rate': random.uniform(50.0, 75.0),
                    'inst_resource_access_rate': random.uniform(80.0, 95.0),
                    'indep_resource_access_rate': random.uniform(45.0, 65.0),
                }
            )

        # 2. Institution Health Scores
        self.stdout.write("Generating Institution Health Scores...")
        for inst in institutions:
            health_states = ['highly_active', 'active', 'moderate', 'low', 'dormant', 'churn_risk']
            # Make the first 3 mostly active, others random
            status = random.choice(health_states[:3]) if institutions.index(inst) < 3 else random.choice(health_states)
            
            base_score = {
                'highly_active': 90,
                'active': 75,
                'moderate': 60,
                'low': 45,
                'dormant': 20,
                'churn_risk': 30
            }[status]

            InstitutionHealthScore.objects.update_or_create(
                institution=inst,
                defaults={
                    'student_attendance_score': max(0, min(100, base_score + random.uniform(-10, 10))),
                    'teacher_activity_score': max(0, min(100, base_score + random.uniform(-15, 15))),
                    'assignment_completion_score': max(0, min(100, base_score + random.uniform(-10, 5))),
                    'resource_engagement_score': max(0, min(100, base_score + random.uniform(-5, 10))),
                    'parent_engagement_score': max(0, min(100, base_score - 20 + random.uniform(0, 20))),
                    'online_offline_translation_score': max(0, min(100, base_score + random.uniform(-10, 20))),
                    'composite_health_score': base_score,
                    'status': status
                }
            )

        # 3. Insight Story Cards
        self.stdout.write("Generating AI Story Cards...")
        InsightStoryCard.objects.all().delete()
        
        stories = [
            ("Maple Admin", "Platform showing 14% WoW independent conversion growth.", "high", "growth", None),
            ("Maple Admin", "Mathematics topics in S4 showing critical drop-off in completion rates.", "high", "outcome", None),
            ("Institution", "Dormancy risk detected: Teacher activity dropped by 30% in last two weeks.", "high", "dormancy", institutions[3] if len(institutions)>3 else institutions[0]),
            ("Institution", "Great news! Offline test scores translating to +12% lift for online active students.", "medium", "outcome", institutions[0]),
        ]
        
        for scope, text, impact, category, inst in stories:
            InsightStoryCard.objects.create(
                scope=scope,
                title=text[:40] + "...",
                content=text,
                impact_level=impact,
                category=category,
                institution=inst
            )

        self.stdout.write(self.style.SUCCESS("✅ Mock Intelligence data successfully injected!"))
