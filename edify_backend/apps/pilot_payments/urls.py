from rest_framework.routers import DefaultRouter
from .views import UpgradeRequestViewSet, PremiumAccessViewSet

router = DefaultRouter()
router.register(r'upgrade-requests', UpgradeRequestViewSet, basename='upgrade-request')
router.register(r'premium-access', PremiumAccessViewSet, basename='premium-access')

urlpatterns = router.urls
