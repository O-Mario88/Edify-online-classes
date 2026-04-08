"""
Executive Intelligence - Finance KPI Aggregator API
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from datetime import timedelta
from django.utils import timezone

from ..models import Invoice, Payment, StudentFinancialProfile, JournalEntry
from ..permissions import IsInstitutionAdminOrFinanceOfficer

class FinanceDashboardAnalyticsAPIView(APIView):
    """
    Returns aggregated KPIs for the Enterprise School Financial ERP dashboard.
    Institution-scoped.
    """
    permission_classes = [IsAuthenticated, IsInstitutionAdminOrFinanceOfficer]

    def get(self, request, *args, **kwargs):
        institution_id = request.headers.get('X-Institution-Id') or request.GET.get('institution_id')
        if not institution_id:
            return Response({"error": "institution_id is required either via header X-Institution-Id or query param"}, status=400)

        now = timezone.now()
        yesterday = now - timedelta(days=1)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # 1. Total Invoiced & Total Arrears
        profiles = StudentFinancialProfile.objects.filter(institution_id=institution_id)
        aggregated = profiles.aggregate(
            total_invoiced=Sum('total_invoiced'),
            total_paid=Sum('total_paid'),
            total_arrears=Sum('arrears_balance')
        )
        total_invoiced = aggregated.get('total_invoiced') or 0
        total_paid = aggregated.get('total_paid') or 0
        total_arrears = aggregated.get('total_arrears') or 0
        collection_rate = round((float(total_paid) / float(total_invoiced) * 100)) if total_invoiced > 0 else 0

        # 2. Daily Collections
        daily_collections = Payment.objects.filter(
            institution_id=institution_id,
            payment_date__gte=today_start,
            status='confirmed'
        ).aggregate(daily_total=Sum('amount'))['daily_total'] or 0

        # 3. Pending Approvals
        pending_journal = JournalEntry.objects.filter(
            institution_id=institution_id,
            status='submitted'
        ).count()
        
        pending_payments = Payment.objects.filter(
            institution_id=institution_id,
            status='pending'
        ).count()
        
        total_pending_approvals = pending_journal + pending_payments

        # 4. Net Cash Position (simplified here as total_paid without separating operating expenses for MVP)
        net_cash_position = total_paid

        # 5. Finance Locks (Students in "suspended" financial status)
        locked_students = profiles.filter(financial_status='suspended').count()

        return Response({
            "kpis": {
                "totalInvoiced": total_invoiced,
                "totalPaid": total_paid,
                "totalArrears": total_arrears,
                "collectionRate": collection_rate,
                "lockedStudents": locked_students,
                "dailyCollections": daily_collections,
                "pendingApprovals": total_pending_approvals,
                "netCashPosition": net_cash_position,
                "operatingExpenses": 0 # GL mapping not fully wired in MVP
            }
        })
