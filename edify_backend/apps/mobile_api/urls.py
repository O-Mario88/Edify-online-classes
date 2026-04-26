from django.urls import path
from .views import AppConfigView, StudentHomeView, LessonDetailView, LessonMarkAttendedView

urlpatterns = [
    path('app-config/', AppConfigView.as_view(), name='mobile-app-config'),
    path('student-home/', StudentHomeView.as_view(), name='mobile-student-home'),
    path('lesson/<int:lesson_id>/', LessonDetailView.as_view(), name='mobile-lesson-detail'),
    path('lesson/<int:lesson_id>/mark-attended/', LessonMarkAttendedView.as_view(), name='mobile-lesson-mark-attended'),
]
