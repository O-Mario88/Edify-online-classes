from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FeeItemViewSet, FeeTemplateViewSet, InvoiceViewSet, PaymentViewSet,
    BursarySchemeViewSet, ExpenseCategoryViewSet, ExpenseRecordViewSet
)

router = DefaultRouter()
router.register(r'fee-items', FeeItemViewSet, basename='fee-item')
router.register(r'fee-templates', FeeTemplateViewSet, basename='fee-template')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'bursaries', BursarySchemeViewSet, basename='bursary')
router.register(r'expense-categories', ExpenseCategoryViewSet, basename='expense-category')
router.register(r'expenses', ExpenseRecordViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]
