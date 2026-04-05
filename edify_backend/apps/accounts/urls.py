from django.urls import path
from .views import UserRegistrationView, StudentOnboardingAPIView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('onboard-student/', StudentOnboardingAPIView.as_view(), name='onboard_student'),
]
