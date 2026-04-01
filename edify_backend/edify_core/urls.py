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
from institutions.views import InstitutionViewSet, InstitutionMembershipViewSet
from classes.views import ClassViewSet, ClassEnrollmentViewSet
from scheduling.views import TimetableSlotViewSet
from attendance.views import DailyRegisterViewSet, LessonAttendanceViewSet
from grading.views import SubjectGradeViewSet, ReportCardViewSet

router = DefaultRouter()
router.register(r'curriculum/countries', CountryViewSet)
router.register(r'curriculum/subjects', SubjectViewSet)
router.register(r'curriculum/class-levels', ClassLevelViewSet)
router.register(r'curriculum/topics', TopicViewSet)
router.register(r'marketplace/listings', ListingViewSet)

# School OS Endpoints
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'institution-memberships', InstitutionMembershipViewSet, basename='institution-membership')
router.register(r'classes', ClassViewSet, basename='class')
router.register(r'class-enrollments', ClassEnrollmentViewSet, basename='class-enrollment')
router.register(r'scheduling/timetable', TimetableSlotViewSet, basename='timetable-slot')
router.register(r'attendance/daily', DailyRegisterViewSet, basename='daily-register')
router.register(r'attendance/lesson', LessonAttendanceViewSet, basename='lesson-attendance')
router.register(r'grading/subjects', SubjectGradeViewSet, basename='subject-grade')
router.register(r'grading/reports', ReportCardViewSet, basename='report-card')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/ai/copilot/ask/', CopilotInferenceView.as_view(), name='copilot_ask'),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
