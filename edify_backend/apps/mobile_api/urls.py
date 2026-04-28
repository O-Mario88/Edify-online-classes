from django.urls import path
from .views import (
    AppConfigView,
    StudentHomeView,
    ParentHomeView,
    TeacherHomeView,
    InstitutionHomeView,
    LessonDetailView,
    LessonMarkAttendedView,
    DeviceTokenView,
    NotificationPreferencesView,
    NotificationsListView,
    NotificationsMarkReadView,
)

urlpatterns = [
    path('app-config/', AppConfigView.as_view(), name='mobile-app-config'),
    path('student-home/', StudentHomeView.as_view(), name='mobile-student-home'),
    path('parent-home/', ParentHomeView.as_view(), name='mobile-parent-home'),
    path('teacher-home/', TeacherHomeView.as_view(), name='mobile-teacher-home'),
    path('institution-home/', InstitutionHomeView.as_view(), name='mobile-institution-home'),
    path('lesson/<int:lesson_id>/', LessonDetailView.as_view(), name='mobile-lesson-detail'),
    path('lesson/<int:lesson_id>/mark-attended/', LessonMarkAttendedView.as_view(), name='mobile-lesson-mark-attended'),
    path('device-token/', DeviceTokenView.as_view(), name='mobile-device-token'),
    path('notification-preferences/', NotificationPreferencesView.as_view(), name='mobile-notification-preferences'),
    path('notifications/', NotificationsListView.as_view(), name='mobile-notifications-list'),
    path('notifications/mark-read/', NotificationsMarkReadView.as_view(), name='mobile-notifications-mark-read'),
]
