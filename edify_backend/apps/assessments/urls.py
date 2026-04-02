from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssessmentWindowViewSet, AssessmentViewSet, QuestionViewSet, SubmissionViewSet

router = DefaultRouter()
router.register(r'windows', AssessmentWindowViewSet)
router.register(r'assessments', AssessmentViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'submissions', SubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
