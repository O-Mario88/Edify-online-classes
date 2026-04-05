"""
URL configuration for edify_core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from curriculum.views import CountryViewSet, SubjectViewSet, ClassLevelViewSet, TopicViewSet
from marketplace.views import ListingViewSet
from ai_services.views import CopilotInferenceView
from institutions.views import InstitutionViewSet, InstitutionMembershipViewSet, BillingStatusView, LearnerRegistrationViewSet, AdminPinResetView
from classes.views import ClassViewSet, ClassEnrollmentViewSet
from scheduling.views import TimetableSlotViewSet
from attendance.views import DailyRegisterViewSet, LessonAttendanceViewSet
from grading.views import SubjectGradeViewSet, ReportCardViewSet
from analytics.views import AnalyticsEventViewSet, DailyPlatformMetricViewSet, DailyInstitutionMetricViewSet, SubjectPerformanceSnapshotViewSet, SystemHealthSnapshotViewSet, StudentDashboardView, TeacherDashboardView, ParentDashboardView, AdminDashboardView, InstitutionDashboardView
from assessments.views import AssessmentWindowViewSet, AssessmentViewSet, QuestionViewSet, SubmissionViewSet
from discussions.views import ThreadViewSet, PostViewSet
from exams.views import ExamCenterViewSet, CandidateRegistrationViewSet, SubjectSelectionViewSet, BoardSubmissionBatchViewSet
from lessons.views import LessonViewSet, LessonNoteViewSet, LessonRecordingViewSet, LessonAttendanceViewSet
from live_sessions.views import LiveSessionViewSet, SessionReminderViewSet
from notifications.views import NotificationViewSet
from parent_portal.views import ParentStudentLinkViewSet, WeeklySummaryViewSet, RiskAlertViewSet
from resources.views import ResourceViewSet, SharedResourceLinkViewSet
from tutoring.views import MatchRequestViewSet, PeerPointsLedgerViewSet

router = DefaultRouter()
router.register(r'curriculum/countries', CountryViewSet)
router.register(r'curriculum/subjects', SubjectViewSet)
router.register(r'curriculum/class-levels', ClassLevelViewSet)
router.register(r'curriculum/topics', TopicViewSet)

# New Phase 1: NCDC Foundations
from curriculum.views import TopicCompetencyViewSet, ResourceQualityReviewViewSet
router.register(r'curriculum/topic-competencies', TopicCompetencyViewSet, basename='topic-competency')
router.register(r'curriculum/resource-reviews', ResourceQualityReviewViewSet, basename='resource-review')

from marketplace.views import ListingViewSet, PayoutRequestViewSet, PayoutBatchViewSet, LessonQualificationViewSet, MonetizationOverviewView, TeacherPayoutProfileViewSet
router.register(r'marketplace/listings', ListingViewSet, basename='marketplace-listing')
router.register(r'marketplace/payouts', PayoutRequestViewSet, basename='marketplace-payout')
router.register(r'marketplace/payout-profile', TeacherPayoutProfileViewSet, basename='marketplace-payout-profile')
router.register(r'marketplace/teacher-batches', PayoutBatchViewSet, basename='marketplace-teacher-batch')
router.register(r'marketplace/lesson-qualifications', LessonQualificationViewSet, basename='marketplace-lesson-qual')

# School OS Endpoints
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'institution-memberships', InstitutionMembershipViewSet, basename='institution-membership')
router.register(r'institutions/learner-registrations', LearnerRegistrationViewSet, basename='learner-registration')
router.register(r'billing', BillingStatusView, basename='billing')
router.register(r'classes', ClassViewSet, basename='class')
router.register(r'class-enrollments', ClassEnrollmentViewSet, basename='class-enrollment')
router.register(r'scheduling/timetable', TimetableSlotViewSet, basename='timetable-slot')
router.register(r'attendance/daily', DailyRegisterViewSet, basename='daily-register')
router.register(r'attendance/lesson', LessonAttendanceViewSet, basename='lesson-attendance')
router.register(r'grading/subjects', SubjectGradeViewSet, basename='subject-grade')
router.register(r'grading/reports', ReportCardViewSet, basename='report-card')

# Analytics
router.register(r'analytics/analytics-event', AnalyticsEventViewSet, basename='analytics-analytics-event')
router.register(r'analytics/daily-platform-metric', DailyPlatformMetricViewSet, basename='analytics-daily-platform-metric')
router.register(r'analytics/daily-institution-metric', DailyInstitutionMetricViewSet, basename='analytics-daily-institution-metric')
router.register(r'analytics/subject-performance-snapshot', SubjectPerformanceSnapshotViewSet, basename='analytics-subject-performance-snapshot')
router.register(r'analytics/system-health-snapshot', SystemHealthSnapshotViewSet, basename='analytics-system-health-snapshot')

# Assessments & Exams
router.register(r'assessments/assessment-window', AssessmentWindowViewSet, basename='assessments-assessment-window')
router.register(r'assessments/assessment', AssessmentViewSet, basename='assessments-assessment')
router.register(r'assessments/question', QuestionViewSet, basename='assessments-question')
router.register(r'assessments/submission', SubmissionViewSet, basename='assessments-submission')
router.register(r'exams/exam-center', ExamCenterViewSet, basename='exams-exam-center')
router.register(r'exams/candidate-registration', CandidateRegistrationViewSet, basename='exams-candidate-registration')
router.register(r'exams/subject-selection', SubjectSelectionViewSet, basename='exams-subject-selection')
router.register(r'exams/board-submission-batch', BoardSubmissionBatchViewSet, basename='exams-board-submission-batch')

# Classroom & Resources
router.register(r'lessons/lesson', LessonViewSet, basename='lessons-lesson')
router.register(r'lessons/lesson-note', LessonNoteViewSet, basename='lessons-lesson-note')
router.register(r'lessons/lesson-recording', LessonRecordingViewSet, basename='lessons-lesson-recording')
router.register(r'lessons/lesson-attendance', LessonAttendanceViewSet, basename='lessons-lesson-attendance')
router.register(r'live-sessions/live-session', LiveSessionViewSet, basename='live_sessions-live-session')
router.register(r'live-sessions/session-reminder', SessionReminderViewSet, basename='live_sessions-session-reminder')
router.register(r'resources/resource', ResourceViewSet, basename='resources-resource')
router.register(r'resources/shared-resource-link', SharedResourceLinkViewSet, basename='resources-shared-resource-link')

# Community & Extensions
router.register(r'discussions/thread', ThreadViewSet, basename='discussions-thread')
router.register(r'discussions/post', PostViewSet, basename='discussions-post')
router.register(r'notifications/notification', NotificationViewSet, basename='notifications-notification')
router.register(r'parent-portal/parent-student-link', ParentStudentLinkViewSet, basename='parent_portal-parent-student-link')
router.register(r'parent-portal/weekly-summary', WeeklySummaryViewSet, basename='parent_portal-weekly-summary')
router.register(r'parent-portal/risk-alert', RiskAlertViewSet, basename='parent_portal-risk-alert')
router.register(r'tutoring/match-request', MatchRequestViewSet, basename='tutoring-match-request')
router.register(r'tutoring/peer-points-ledger', PeerPointsLedgerViewSet, basename='tutoring-peer-points-ledger')

# Finance Module Endpoints
from finance.views import (
    FeeItemViewSet, FeeTemplateViewSet, InvoiceViewSet, PaymentViewSet,
    BursarySchemeViewSet, ExpenseCategoryViewSet, ExpenseRecordViewSet
)
router.register(r'finance/fee-items', FeeItemViewSet, basename='finance-fee-item')
router.register(r'finance/fee-templates', FeeTemplateViewSet, basename='finance-fee-template')
router.register(r'finance/invoices', InvoiceViewSet, basename='finance-invoice')
router.register(r'finance/payments', PaymentViewSet, basename='finance-payment')
router.register(r'finance/bursaries', BursarySchemeViewSet, basename='finance-bursary')
router.register(r'finance/expense-categories', ExpenseCategoryViewSet, basename='finance-expense-category')
router.register(r'finance/expenses', ExpenseRecordViewSet, basename='finance-expense')


from institutions.views import InstitutionOnboardingAPIView
from marketplace.views import IndependentTeacherOnboardingView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/ai/copilot/ask/', CopilotInferenceView.as_view(), name='copilot_ask'),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Custom dashboard routes
    path('api/v1/analytics/student-dashboard/', StudentDashboardView.as_view(), name='student_dashboard_api'),
    path('api/v1/analytics/teacher-dashboard/', TeacherDashboardView.as_view(), name='teacher_dashboard_api'),
    path('api/v1/analytics/parent-dashboard/', ParentDashboardView.as_view(), name='parent_dashboard_api'),
    path('api/v1/analytics/admin-dashboard/', AdminDashboardView.as_view(), name='admin_dashboard_api'),
    path('api/v1/analytics/institution-dashboard/', InstitutionDashboardView.as_view(), name='institution_dashboard_api'),
    path('api/v1/institutions/admin-pin-reset/', AdminPinResetView.as_view(), name='admin_pin_reset'),
    
    # Institution Onboarding Phase 1-3
    path('api/v1/institutions/onboard-basic/', InstitutionOnboardingAPIView.as_view(), name='institution_onboard_basic'),

    path('api/v1/marketplace/onboard-teacher/', IndependentTeacherOnboardingView.as_view(), name='independent_teacher_onboard'),
    path('api/v1/marketplace/monetization-overview/', MonetizationOverviewView.as_view(), name='monetization_overview_api'),
    
    # Billing / Subscriptions / Monetization
    path('api/v1/billing/', include('billing.urls')),
]
