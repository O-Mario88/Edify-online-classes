from django.urls import path
from .views import LearnerSettingsView

urlpatterns = [
    path('', LearnerSettingsView.as_view(), name='learner-settings'),
]
