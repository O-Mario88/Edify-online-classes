"""URL configuration for Maple Online School (edify_core project).

v1 scope per docs/STRATEGY.md. The following apps are ARCHIVED in Phase 0 —
their code is retained in apps/ but is unhooked from runtime here:

    ai_services, marketplace, tutoring, live_sessions,
    interventions, intelligence, discussions

To reactivate any of them post-PMF: re-add to INSTALLED_APPS in settings.py,
then restore the relevant imports + router registrations + URL patterns below
(see the git history of this file: pre-archive commit lives just before the
Phase 0 archive).
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView

from edify_core.health import HealthView
from accounts.views import (
    VerifiedEmailTokenObtainPairView as TokenObtainPairView,
    PublicProfileView,
    PilotFeedbackCreateView,
)

from curriculum.views import (
    CountryViewSet, SubjectViewSet, ClassLevelViewSet, TopicViewSet,
    CurriculumTreeView, TopicCompetencyViewSet, ResourceQualityReviewViewSet,
)
from institutions.views import (
    InstitutionViewSet, InstitutionMembershipViewSet, LearnerRegistrationViewSet,
    AdminPinResetView, InstitutionOnboardingAPIView,
)
from classes.views import ClassViewSet, ClassEnrollmentViewSet
from scheduling.views import TimetableSlotViewSet
from attendance.views import DailyRegisterViewSet, LessonAttendanceViewSet
from grading.views import SubjectGradeViewSet, ReportCardViewSet, GradeRecordViewSet
from analytics.views import (
    AnalyticsEventViewSet, DailyPlatformMetricViewSet, DailyInstitutionMetricViewSet,
    SubjectPerformanceSnapshotViewSet, SystemHealthSnapshotViewSet,
    StudentDashboardView, TeacherDashboardView, ParentDashboardView,
    AdminDashboardView, InstitutionDashboardView, CustomerSuccessChurnView,
)
from assessments.views import (
    AssessmentWindowViewSet, AssessmentViewSet, QuestionViewSet, SubmissionViewSet,
)
from exams.views import (
    ExamCenterViewSet, CandidateRegistrationViewSet,
    SubjectSelectionViewSet, BoardSubmissionBatchViewSet,
)
from lessons.views import (
    LessonViewSet, LessonNoteViewSet, LessonRecordingViewSet, LessonAttendanceViewSet,
)
from notifications.views import NotificationViewSet
from parent_portal.views import (
    ParentStudentLinkViewSet, WeeklySummaryViewSet, RiskAlertViewSet,
)
from resources.upload_view import ResourceUploadViewSet
from resources.views import ResourceViewSet, SharedResourceLinkViewSet
from resources.content_views import (
    ContentItemViewSet, TeacherContentViewSet, InstitutionContentViewSet,
    AdminContentViewSet, ContentDeliveryView, ClassContentView,
    ContentEngagementViewSet, ContentTagViewSet,
    ContentAssignmentViewSet, ContentRecommendationViewSet,
    StudentContentDashboardView, TeacherContentDashboardView,
    ParentContentDashboardView,
)


router = DefaultRouter()

# Curriculum
router.register(r'curriculum/countries', CountryViewSet)
router.register(r'curriculum/subjects', SubjectViewSet)
router.register(r'curriculum/class-levels', ClassLevelViewSet)
router.register(r'curriculum/topics', TopicViewSet)
router.register(r'curriculum/topic-competencies', TopicCompetencyViewSet, basename='topic-competency')
router.register(r'curriculum/resource-reviews', ResourceQualityReviewViewSet, basename='resource-review')

# School OS
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'institution-memberships', InstitutionMembershipViewSet, basename='institution-membership')
router.register(r'institutions/learner-registrations', LearnerRegistrationViewSet, basename='learner-registration')
router.register(r'classes', ClassViewSet, basename='class')
router.register(r'class-enrollments', ClassEnrollmentViewSet, basename='class-enrollment')
router.register(r'scheduling/timetable', TimetableSlotViewSet, basename='timetable-slot')
router.register(r'attendance/daily', DailyRegisterViewSet, basename='daily-register')
router.register(r'attendance/lesson', LessonAttendanceViewSet, basename='lesson-attendance')
router.register(r'grading/subjects', SubjectGradeViewSet, basename='subject-grade')
router.register(r'grading/reports', ReportCardViewSet, basename='report-card')
router.register(r'grading/records', GradeRecordViewSet, basename='grade-record')

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
router.register(r'resources', ResourceViewSet, basename='resources-resource')
router.register(r'resources-upload', ResourceUploadViewSet, basename='resources-upload')
router.register(r'resources/shared-resource-link', SharedResourceLinkViewSet, basename='resources-shared-resource-link')

# Content Management System
router.register(r'content/items', ContentItemViewSet, basename='content-item')
router.register(r'content/teacher', TeacherContentViewSet, basename='content-teacher')
router.register(r'content/institution', InstitutionContentViewSet, basename='content-institution')
router.register(r'content/admin', AdminContentViewSet, basename='content-admin')
router.register(r'content/engagement', ContentEngagementViewSet, basename='content-engagement')
router.register(r'content/tags', ContentTagViewSet, basename='content-tag')
router.register(r'content/assignments', ContentAssignmentViewSet, basename='content-assignment')
router.register(r'content/recommendations', ContentRecommendationViewSet, basename='content-recommendation')

# Communications
router.register(r'notifications/notification', NotificationViewSet, basename='notifications-notification')
router.register(r'parent-portal/parent-student-link', ParentStudentLinkViewSet, basename='parent_portal-parent-student-link')
router.register(r'parent-portal/weekly-summary', WeeklySummaryViewSet, basename='parent_portal-weekly-summary')
router.register(r'parent-portal/risk-alert', RiskAlertViewSet, basename='parent_portal-risk-alert')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthView.as_view(), name='health'),
    path('api/v1/', include(router.urls)),

    # Auth
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Logout posts the refresh token here so it's invalidated server-side. Combined
    # with BLACKLIST_AFTER_ROTATION=True this kills the stolen-refresh-token window.
    path('api/v1/auth/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # Public profile (badges/certs stubbed empty while `intelligence` is archived).
    path('api/v1/users/profile/<str:username>/', PublicProfileView.as_view(), name='public-profile'),

    # Pilot feedback capture — see docs/PILOT.md.
    path('api/v1/feedback/', PilotFeedbackCreateView.as_view(), name='pilot-feedback'),

    # Dashboards
    path('api/v1/analytics/student-dashboard/', StudentDashboardView.as_view(), name='student_dashboard_api'),
    path('api/v1/analytics/teacher-dashboard/', TeacherDashboardView.as_view(), name='teacher_dashboard_api'),
    path('api/v1/analytics/parent-dashboard/', ParentDashboardView.as_view(), name='parent_dashboard_api'),
    path('api/v1/analytics/admin-dashboard/', AdminDashboardView.as_view(), name='admin_dashboard_api'),
    path('api/v1/analytics/institution-dashboard/', InstitutionDashboardView.as_view(), name='institution_dashboard_api'),
    path('api/v1/analytics/churn-signals/', CustomerSuccessChurnView.as_view(), name='admin_churn_signals_api'),
    path('api/v1/institutions/admin-pin-reset/', AdminPinResetView.as_view(), name='admin_pin_reset'),

    # Institution Onboarding
    path('api/v1/institutions/onboard-basic/', InstitutionOnboardingAPIView.as_view(), name='institution_onboard_basic'),

    # Full Curriculum Tree Endpoint
    path('api/v1/curriculum/full-tree/', CurriculumTreeView.as_view(), name='curriculum_full_tree'),

    # Content Delivery
    path('api/v1/content/library/', ContentDeliveryView.as_view(), name='content-library'),
    path('api/v1/content/classroom/', ClassContentView.as_view(), name='content-classroom'),
    path('api/v1/content/dashboard/student/', StudentContentDashboardView.as_view(), name='content-dashboard-student'),
    path('api/v1/content/dashboard/teacher/', TeacherContentDashboardView.as_view(), name='content-dashboard-teacher'),
    path('api/v1/content/dashboard/parent/', ParentContentDashboardView.as_view(), name='content-dashboard-parent'),
]

# Serve media files in development
from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
