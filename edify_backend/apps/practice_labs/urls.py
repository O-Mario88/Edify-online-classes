from rest_framework.routers import DefaultRouter
from .views import PracticeLabViewSet, PracticeLabAttemptViewSet

router = DefaultRouter()
router.register(r'labs', PracticeLabViewSet, basename='practice-lab')
router.register(r'attempts', PracticeLabAttemptViewSet, basename='practice-lab-attempt')

urlpatterns = router.urls
