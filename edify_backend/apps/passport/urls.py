from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    LearningPassportViewSet, CredentialViewSet,
    public_passport, verify_credential, issue_credential,
)

router = DefaultRouter()
router.register(r'', LearningPassportViewSet, basename='passport')
router.register(r'credentials', CredentialViewSet, basename='credential')

urlpatterns = [
    path('public/<str:token>/', public_passport, name='public-passport'),
    path('credentials/verify/<str:code>/', verify_credential, name='verify-credential'),
    path('credentials/issue/', issue_credential, name='issue-credential'),
] + router.urls
