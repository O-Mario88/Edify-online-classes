from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import FeeAssessmentViewSet, FeePaymentViewSet, FeePaymentIpnView

router = DefaultRouter()
router.register(r'assessments', FeeAssessmentViewSet, basename='fees-assessment')
router.register(r'payments', FeePaymentViewSet, basename='fees-payment')

urlpatterns = router.urls + [
    # Provider IPN webhook — POSTed by Pesapal / Airtel Money / etc.
    # See providers.py for the reference convention. Public endpoint;
    # signature verification happens inside the view.
    path('ipn/<str:provider_name>/', FeePaymentIpnView.as_view(), name='fees-ipn'),
]
