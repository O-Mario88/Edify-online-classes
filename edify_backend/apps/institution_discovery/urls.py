from rest_framework.routers import DefaultRouter
from .views import InstitutionDiscoveryViewSet, InstitutionScoreRefreshViewSet

router = DefaultRouter()
router.register(r'institutions', InstitutionDiscoveryViewSet, basename='discovery-institution')
router.register(r'score', InstitutionScoreRefreshViewSet, basename='discovery-score')

urlpatterns = router.urls
