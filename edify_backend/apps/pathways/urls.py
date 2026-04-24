from rest_framework.routers import DefaultRouter
from .views import CareerPathwayViewSet

router = DefaultRouter()
router.register(r'', CareerPathwayViewSet, basename='pathway')

urlpatterns = router.urls
