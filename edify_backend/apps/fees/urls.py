from rest_framework.routers import DefaultRouter
from .views import FeeAssessmentViewSet, FeePaymentViewSet

router = DefaultRouter()
router.register(r'assessments', FeeAssessmentViewSet, basename='fees-assessment')
router.register(r'payments', FeePaymentViewSet, basename='fees-payment')

urlpatterns = router.urls
