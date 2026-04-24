from rest_framework.routers import DefaultRouter
from .views import MasteryProjectViewSet, ProjectSubmissionViewSet

router = DefaultRouter()
router.register(r'projects', MasteryProjectViewSet, basename='mastery-project')
router.register(r'submissions', ProjectSubmissionViewSet, basename='mastery-project-submission')

urlpatterns = router.urls
