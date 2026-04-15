import logging
from marketplace.models import Wallet
from institutions.models import Institution
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

def seed_finance(users_dict, institutions_dict):
    """Initializes financial ledgers."""
    logger.info("Seeding Level 6: Finance & Commercial State")
    
    # 1. Wallets (for Teacher Dashboard Earnings)
    teacher_wallet, _ = Wallet.objects.get_or_create(teacher=users_dict["teacher.demo@edify.ug"], defaults={"balance": 150000})
    independent_wallet, _ = Wallet.objects.get_or_create(teacher=users_dict["teacher.independent@edify.ug"], defaults={"balance": 450000})
    
    logger.info(" - Seeded Wallet Earnings.")
