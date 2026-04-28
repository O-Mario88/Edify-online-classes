from rest_framework.routers import DefaultRouter
from .views import DiagnosticSessionViewSet

router = DefaultRouter()
router.register(r'', DiagnosticSessionViewSet, basename='diagnostic-session')

urlpatterns = router.urls
