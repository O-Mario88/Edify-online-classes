from django.urls import path
from .views import AppConfigView, StudentHomeView

urlpatterns = [
    path('app-config/', AppConfigView.as_view(), name='mobile-app-config'),
    path('student-home/', StudentHomeView.as_view(), name='mobile-student-home'),
]
