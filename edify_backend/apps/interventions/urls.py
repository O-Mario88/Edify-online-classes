from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentRiskAlertViewSet, InterventionPlanViewSet, InterventionActionViewSet

router = DefaultRouter()
router.register(r'alerts', StudentRiskAlertViewSet, basename='alerts')
router.register(r'plans', InterventionPlanViewSet, basename='plans')
router.register(r'actions', InterventionActionViewSet, basename='actions')

urlpatterns = [
    path('', include(router.urls)),
]
