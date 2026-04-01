from django.db import models
from django.conf import settings

class Listing(models.Model):
    VISIBILITY_STATES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=255)
    price_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default='UGX')
    visibility_state = models.CharField(max_length=20, choices=VISIBILITY_STATES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ListingTopicBinding(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='topic_bindings')
    topic = models.ForeignKey('curriculum.Topic', on_delete=models.CASCADE, related_name='listings')

    class Meta:
        unique_together = ('listing', 'topic')

    def __str__(self):
        return f"{self.listing.title} mapped to {self.topic.name}"

class LicenseDeal(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='licenses')
    purchaser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='purchased_licenses')
    access_granted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.purchaser.email} licensed {self.listing.title}"

class Wallet(models.Model):
    teacher = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    def __str__(self):
        return f"Wallet for {self.teacher.email} - Balance: {self.balance}"

class PayoutRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('processed', 'Processed'),
        ('rejected', 'Rejected'),
    ]
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='payout_requests')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payout of {self.amount} for {self.wallet.teacher.email} ({self.status})"
