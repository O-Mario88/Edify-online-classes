from django.urls import path
from .views import CheckoutSubjectClassView, CheckoutInstitutionActivationView, PesapalWebhookReceiver

urlpatterns = [
    path('checkout/subject/', CheckoutSubjectClassView.as_view(), name='checkout-subject'),
    path('checkout/institution-activation/', CheckoutInstitutionActivationView.as_view(), name='checkout-institution-activation'),
    path('webhooks/pesapal/ipn/', PesapalWebhookReceiver.as_view(), name='pesapal-ipn'),
]
