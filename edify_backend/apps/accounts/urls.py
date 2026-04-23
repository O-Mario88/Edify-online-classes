from django.urls import path
from .views import (
    UserRegistrationView,
    StudentOnboardingAPIView,
    ForgotPasswordView,
    AccountActivationView,
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('onboard-student/', StudentOnboardingAPIView.as_view(), name='onboard_student'),
    path('activate/', AccountActivationView.as_view(), name='activate'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
]
