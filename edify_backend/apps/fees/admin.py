from django.contrib import admin
from .models import FeeAssessment, FeePayment


class FeePaymentInline(admin.TabularInline):
    model = FeePayment
    extra = 0
    readonly_fields = ('created_at', 'recorded_by')


@admin.register(FeeAssessment)
class FeeAssessmentAdmin(admin.ModelAdmin):
    list_display = ('institution', 'student', 'item', 'amount', 'currency', 'status', 'due_date')
    list_filter = ('status', 'institution', 'currency')
    search_fields = ('student__email', 'student__full_name', 'item', 'term_label')
    inlines = [FeePaymentInline]


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('assessment', 'amount', 'method', 'paid_on', 'reference')
    list_filter = ('method', 'paid_on')
    search_fields = ('assessment__student__email', 'reference')
