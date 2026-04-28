from rest_framework.routers import DefaultRouter
from .views import MasteryTrackViewSet, MasteryEnrollmentViewSet

router = DefaultRouter()
router.register(r'tracks', MasteryTrackViewSet, basename='mastery-track')
router.register(r'enrollments', MasteryEnrollmentViewSet, basename='mastery-enrollment')

urlpatterns = router.urls
