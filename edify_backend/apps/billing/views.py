from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import (
    SubjectClassProduct, StudentSubscription, InstitutionBillingProfile,
    Invoice, TransactionRecord, TeacherAccessFeeAccount
)
from .services import PesapalMockService
import uuid

class CheckoutSubjectClassView(views.APIView):
    """
    Initiates checkout for an independent student buying a monthly Subject/Class subscription.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id required'}, status=status.HTTP_400_BAD_REQUEST)
            
        product = get_object_or_404(SubjectClassProduct, id=product_id)
        
        # 1. Create Invoice
        invoice = Invoice.objects.create(
            user=request.user,
            amount_due=product.monthly_price,
            currency=product.currency,
            description=f"Monthly Subscription for {product.subject.name} - {product.class_level.name}"
        )
        
        # 2. Call Pesapal Service
        pesapal_res = PesapalMockService.submit_order(invoice)
        
        # 3. Create Transaction Record
        transaction = TransactionRecord.objects.create(
            invoice=invoice,
            amount=product.monthly_price,
            currency=product.currency,
            pesapal_tracking_id=pesapal_res['tracking_id'],
            pesapal_merchant_reference=pesapal_res['merchant_reference'],
            status='initiated'
        )
        
        # 4. Create pending StudentSubscription
        StudentSubscription.objects.create(
            student=request.user,
            product=product,
            status='pending_payment'
            # Note: We link this loosely; in a full implementation, you'd associate the transaction 
            # with the specific subscription target via an Order item or generic relation.
        )
        
        return Response({
            'invoice_id': invoice.id,
            'tracking_id': transaction.pesapal_tracking_id,
            'redirect_url': pesapal_res['redirect_url']
        })

class CheckoutInstitutionActivationView(views.APIView):
    """
    Initiates payment for an institution to unlock full features.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        institution_id = request.data.get('institution_id')
        if not institution_id:
            return Response({'error': 'institution_id required'}, status=status.HTTP_400_BAD_REQUEST)
            
        from institutions.models import Institution
        institution = get_object_or_404(Institution, id=institution_id)
        
        # Get or create billing profile
        profile, _ = InstitutionBillingProfile.objects.get_or_create(institution=institution)
        
        active_students = institution.active_student_count
        # Overage / Unpaid calculation
        unpaid_seats = active_students - profile.paid_seat_count
        if unpaid_seats <= 0:
            return Response({'message': 'All active seats are already paid for.'})
            
        if not profile.active_plan:
             return Response({'error': 'Institution must select a billing plan before activating seats.'}, status=status.HTTP_400_BAD_REQUEST)
             
        amount_due = profile.active_plan.price_per_student * unpaid_seats
        
        # Create Invoice
        invoice = Invoice.objects.create(
            institution=institution,
            amount_due=amount_due,
            currency=profile.currency,
            description=f"Activation of {unpaid_seats} student seats at {profile.active_plan.price_per_student} each ({profile.active_plan.name})."
        )
        
        # Call Pesapal
        pesapal_res = PesapalMockService.submit_order(invoice)
        
        # Create Transaction
        TransactionRecord.objects.create(
            invoice=invoice,
            amount=amount_due,
            currency=profile.currency,
            pesapal_tracking_id=pesapal_res['tracking_id'],
            status='initiated'
        )
        
        return Response({
            'invoice_id': invoice.id,
            'tracking_id': pesapal_res['tracking_id'],
            'redirect_url': pesapal_res['redirect_url'],
            'unpaid_seats_billed': unpaid_seats
        })

class PesapalWebhookReceiver(views.APIView):
    """
    Simulates the IPN callback url hitting the backend to fulfill the order.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # usually pesapal calls via GET with OrderTrackingId and OrderNotificationType
        tracking_id = request.query_params.get('OrderTrackingId')
        if not tracking_id:
            return Response({'error': 'Missing OrderTrackingId'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Verify payment status
        verification = PesapalMockService.verify_payment(tracking_id)
        
        if verification['payment_status_description'] == 'COMPLETED':
            transaction = get_object_or_404(TransactionRecord, pesapal_tracking_id=tracking_id)
            if transaction.status == 'completed':
                return Response({'status': 'already processed'})
                
            transaction.status = 'completed'
            transaction.completed_at = timezone.now()
            transaction.save()
            
            invoice = transaction.invoice
            invoice.is_paid = True
            invoice.save()
            
            # Application Logic: Unlock
            # If it's a student subscription:
            if invoice.user:
                # Find pending subscription
                # Extremely simplified unlock mapping:
                pending_sub = StudentSubscription.objects.filter(student=invoice.user, status='pending_payment').last()
                if pending_sub:
                    pending_sub.status = 'active'
                    pending_sub.start_date = timezone.now()
                    pending_sub.end_date = timezone.now() + timedelta(days=30)
                    pending_sub.save()
                    
            # If it's an institution:
            if invoice.institution:
                profile = invoice.institution.billing_profile
                active_plan = profile.active_plan
                
                # Parse seat count from invoice (mocking robust logic)
                if active_plan and active_plan.price_per_student > 0:
                     added_seats = int(invoice.amount_due / active_plan.price_per_student)
                else: 
                     added_seats = 0 # Fallback
                     
                profile.paid_seat_count += added_seats
                profile.activation_status = 'active'
                profile.save()
                
            return Response({'status': 'Payment fulfilled and access unlocked.'})
            
        return Response({'status': 'Payment not completed or failed verification.'})
