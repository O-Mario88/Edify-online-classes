from rest_framework.routers import DefaultRouter
from .views import MentorReviewRequestViewSet

router = DefaultRouter()
router.register(r'requests', MentorReviewRequestViewSet, basename='mentor-review-request')

urlpatterns = router.urls
