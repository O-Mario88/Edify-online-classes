from rest_framework.routers import DefaultRouter
from .views import TeacherAvailabilityViewSet, SupportRequestViewSet, SupportSessionViewSet

router = DefaultRouter()
router.register(r'availability', TeacherAvailabilityViewSet, basename='standby-availability')
router.register(r'support-requests', SupportRequestViewSet, basename='standby-support-request')
router.register(r'sessions', SupportSessionViewSet, basename='standby-session')

urlpatterns = router.urls
