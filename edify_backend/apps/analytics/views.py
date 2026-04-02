from rest_framework import viewsets, exceptions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from institutions.models import Institution, InstitutionMembership
from classes.models import Class
from live_sessions.models import LiveSession
from edify_core.permissions import SCHOOL_ADMIN_ROLES

from .models import AnalyticsEvent, DailyPlatformMetric, DailyInstitutionMetric, SubjectPerformanceSnapshot, SystemHealthSnapshot
from .serializers import AnalyticsEventSerializer, DailyPlatformMetricSerializer, DailyInstitutionMetricSerializer, SubjectPerformanceSnapshotSerializer, SystemHealthSnapshotSerializer

User = get_user_model()

class TenantFilterMixin:
    def get_user_institutions(self):
        return InstitutionMembership.objects.filter(
            user=self.request.user, status='active'
        ).values_list('institution_id', flat=True)

class AnalyticsEventViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = AnalyticsEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'platform_admin':
            return AnalyticsEvent.objects.all()
        return AnalyticsEvent.objects.filter(institution_id__in=self.get_user_institutions())

class DailyPlatformMetricViewSet(viewsets.ModelViewSet):
    queryset = DailyPlatformMetric.objects.all()
    serializer_class = DailyPlatformMetricSerializer
    permission_classes = [IsAuthenticated] # Will be platform admin only in future

class DailyInstitutionMetricViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = DailyInstitutionMetricSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'platform_admin':
            return DailyInstitutionMetric.objects.all()
        return DailyInstitutionMetric.objects.filter(institution_id__in=self.get_user_institutions())

class SubjectPerformanceSnapshotViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    serializer_class = SubjectPerformanceSnapshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'platform_admin':
            return SubjectPerformanceSnapshot.objects.all()
        return SubjectPerformanceSnapshot.objects.filter(institution_id__in=self.get_user_institutions())

class SystemHealthSnapshotViewSet(viewsets.ModelViewSet):
    queryset = SystemHealthSnapshot.objects.all()
    serializer_class = SystemHealthSnapshotSerializer
    permission_classes = [IsAuthenticated]

# ------------------------------------------------------------------
# MASS AGGREGATE ENDPOINTS FOR DATA-DRIVEN DASHBOARDS
# Hybrid approach: Query fast relational limits, map complex heuristics
# ------------------------------------------------------------------

from .services import ReadinessEngine

class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        kpis = ReadinessEngine.get_student_kpis(request.user)
        subject_performance = ReadinessEngine.get_subject_performance(request.user)
        next_session = ReadinessEngine.get_next_session(request.user)

        return Response({
            "kpis": kpis,
            "subjectPerformance": subject_performance,
            "nextSession": next_session,
            "assessmentSnapshot": [
                { "name": 'Physics Quiz 3', "scored": 45, "average": 65 },
                { "name": 'Math Mid-Term', "scored": 88, "average": 70 },
            ]
        })


from marketplace.models import Wallet
from institutions.models import TeacherQualityScore

class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active_classes = Class.objects.filter(teacher=request.user).count() if request.user.is_authenticated else 4
        
        wallet_balance = 0
        try:
            if hasattr(request.user, 'wallet') and request.user.wallet:
                wallet_balance = request.user.wallet.balance
        except Exception:
            pass
            
        try:
            quality_score = TeacherQualityScore.objects.filter(teacher=request.user).first()
        except Exception:
            quality_score = None

        return Response({
            "kpis": {
                "activeClasses": active_classes,
                "totalLearners": 128,
                "avgAttendance": 85,
                "markingBacklog": 42,
                "avgClassScore": 68,
                "engagementRate": 74,
                "liveAttendance": 92,
                "monthlyEarnings": float(wallet_balance),
            },
            "qualityScore": {
                "curriculumFidelity": float(getattr(quality_score, 'curriculum_fidelity_score', 80.0)),
                "consistency": float(getattr(quality_score, 'consistency_score', 85.0)),
                "ncdcVerified": getattr(quality_score, 'is_ncdc_verified', False)
            },
            "teachingIntelligence": {
                "hardestTopic": 'Kinematics (S4 Physics)',
                "missedAssessment": 'Q4: Vector Addition',
                "lowestEngagementClass": 'S3 Biology East',
                "bestPerformingClass": 'S4 Physics North',
                "aiSummary": "The S4 Physics cohort is struggling uniformly with Vector Addition concepts introduced this week. I recommend scheduling a 30-minute remediation live session before the unit exam to prevent cascading failures."
            },
            "classHealth": [
                { "name": 'S4 Physics North', "enrolled": 45, "attendance": 92, "avgScore": 78, "completion": 60, "riskCount": 2, "topWeakTopic": 'Electromagnetism' },
                { "name": 'S3 Biology East', "enrolled": 38, "attendance": 65, "avgScore": 54, "completion": 45, "riskCount": 12, "topWeakTopic": 'Genetics' },
                { "name": 'S2 Chemistry Core', "enrolled": 45, "attendance": 85, "avgScore": 68, "completion": 55, "riskCount": 4, "topWeakTopic": 'Mole Concept' },
            ],
            "contentPerformance": [
                { "title": 'O-Level Physics Revision PDF', "views": 1205, "downloads": 850, "completion": 92, "rating": 4.8 },
                { "title": 'Circuits Virtual Lab Video', "views": 800, "downloads": 0, "completion": 45, "rating": 4.2 },
            ]
        })


class ParentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # We simulate the parent fetching their primary registered child
        # In full production we'd do: child_user = request.user.parent_profile.children.first()
        child_user = request.user 
        child_kpis = ReadinessEngine.get_student_kpis(child_user)
        subject_performance = ReadinessEngine.get_subject_performance(child_user)

        return Response({
            "kpis": {
                "attendance": 92,
                "classProgress": 68,
                "avgPerformance": 74,
                "readinessScore": child_kpis['readinessScore'],
                "missedTasks": child_kpis['overdueTasks'],
                "alertLevel": 'High' if child_kpis['overdueTasks'] > 1 else 'Moderate'
            },
            "riskAlert": {
                "severity": 'high',
                "title": 'Attention Required: Consecutive Missed Assignments',
                "description": 'Grace has missed 2 assignments in Advanced Physics. The system has automatically flagged this as a risk for the upcoming mock exams.',
                "action": 'We recommend scheduling a brief check-in with Mr. Omondi (Physics Tutor).',
                "status": 'Pending Parent Acknowledgment'
            },
            "weeklySummary": {
                "strongestSubject": 'Biology',
                "weakestTopic": 'Kinematics',
                "attendanceChange": '+2%',
                "assessmentTrend": 'Declining in calculation-based subjects',
                "recommendedFocus": 'Review Physics Kinematics modules specifically focusing on Vector equations.',
                "aiNarrative": "Grace has maintained excellent attendance across all core subjects this week. However, there has been a notable dip in quiz scores related to purely mathematical concepts in Physics."
            },
            "childPerformance": {
                "name": 'Grace Nakato',
                "grade": 'S4 Target UCE',
                "subjects": subject_performance
            }
        })


from marketplace.models import PayoutRequest
from curriculum.models import ResourceQualityReview

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60 * 5))
    def get(self, request):
        users_count = User.objects.count()
        institutions_count = Institution.objects.count()
        pending_payouts = PayoutRequest.objects.filter(status='pending').count()
        pending_moderation = ResourceQualityReview.objects.filter(status='pending').count()

        return Response({
            "kpis": {
                "activeUsers": f"{users_count:,}",
                "activeInstitutions": f"{institutions_count:,}",
                "dailyLessonCompletions": '8,405',
                "liveSessionCompletionRate": '88%',
                "monthlyRevenue": '45.2M',
                "failedJobs": 3,
                "examRegistrations": 1420
            },
            "marketplaceOps": {
                "pendingPayouts": pending_payouts,
                "pendingModeration": pending_moderation,
                "totalMarketplaceListings": 45
            },
            "institutionPerformance": [
                { "name": 'Kampala Model High', "students": 1205, "activation": 94, "attendance": 92, "avgPerformance": 76, "readiness": 88, "status": 'Active', "revenue": '4.2M', "risk": 0 },
                { "name": 'Gulu Core Institute', "students": 840, "activation": 72, "attendance": 65, "avgPerformance": 54, "readiness": 45, "status": 'Active', "revenue": '1.8M', "risk": 3 },
                { "name": 'Mbale Secondary', "students": 450, "activation": 88, "attendance": 85, "avgPerformance": 62, "readiness": 60, "status": 'Payment Due', "revenue": '0', "risk": 1 },
            ],
            "platformHealth": {
                "syncQueueDepth": 12,
                "celeryFailures": 3,
                "redisHealth": 'Operational',
                "pageLatency": '42ms',
                "videoBacklog": 5,
                "notificationDelivery": '99.8%',
            },
            "aiOps": {
                "copilotRequests": '14,200',
                "parentSummaries": '3,800',
                "lowConfidence": 45,
                "responseTime": '1.2s'
            }
        })


class InstitutionDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60 * 5))
    def get(self, request):
        has_access = InstitutionMembership.objects.filter(
            user=request.user,
            role__in=SCHOOL_ADMIN_ROLES,
            status='active'
        ).exists()
        
        # if not has_access and request.user.role != 'platform_admin':
        #     raise exceptions.PermissionDenied("You must be an active school administrator to view the Intelligence Command Center.")
            
        from institutions.models import InstitutionImplementationScorecard
        # Simulating fetching the first institution they manage, or active one
        membership = InstitutionMembership.objects.filter(user=request.user, status='active').first()
        scorecard = None
        if membership:
            try:
                scorecard = membership.institution.compliance_scorecard
            except Exception:
                pass


        return Response({
            "kpis": {
                "totalStudents": 1205,
                "totalTeachers": 42,
                "activeClasses": 84,
                "attendanceToday": 94,
                "avgPerformance": 76,
                "riskAlerts": 8
            },
            "academicPerformance": [
                { "subject": 'S4 Physics Core', "enrollment": 145, "avgScore": 68, "completion": 82, "teacher": 'Mr. Omondi', "status": 'On Track' },
                { "subject": 'S3 Biology East', "enrollment": 112, "avgScore": 54, "completion": 65, "teacher": 'Mrs. Kintu', "status": 'At Risk' },
                { "subject": 'S4 Mathematics', "enrollment": 145, "avgScore": 72, "completion": 80, "teacher": 'Mr. Kato', "status": 'On Track' },
            ],
            "financialMetrics": {
                "plan": 'Premium (Active)',
                "feeCollection": 88,
                "outstandingBalance": '12.4M UGX',
                "examPayments": 95
            },
            "complianceTracking": {
                "syllabusCoveragePct": float(getattr(scorecard, 'syllabus_coverage_pct', 85.5)),
                "assessmentCompliance": float(getattr(scorecard, 'assessment_compliance_score', 92.0)),
                "practicalLearning": float(getattr(scorecard, 'practical_learning_score', 65.0))
            }
        })
