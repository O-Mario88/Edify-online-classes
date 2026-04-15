import logging
from django.core.management.base import BaseCommand
from seeders.base_factory import seed_base_users
from seeders.institution_factory import seed_institutions
from seeders.academic_factory import seed_academic_structure
from seeders.content_factory import seed_content_and_assignments
from seeders.engagement_factory import seed_engagement
from seeders.finance_factory import seed_finance

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Wipes the database cleanly and seeds a deep, relational demonstration environment.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--layer',
            type=str,
            help='Which layer to seed: all, base, academic, content',
            default='all'
        )

    def handle(self, *args, **options):
        layer = options['layer']
        
        self.stdout.write(self.style.WARNING(f"Initializing Demo Seeding Protocol [Layer: {layer}]..."))
        
        try:
            # Enforce Layered Dependency Execution
            users = seed_base_users()
            institutions = seed_institutions(users)
            
            if layer in ['all', 'academic', 'content']:
                academic = seed_academic_structure(users, institutions)
                
            if layer in ['all', 'content']:
                content = seed_content_and_assignments(users, academic)
                seed_engagement(users, academic, content)
                
            if layer in ['all', 'finance']:
                seed_finance(users, institutions)
                
            self.stdout.write(self.style.SUCCESS('\nSUCCESS! Database has been deeply mapped for Demo Operations.'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\nFATAL SEEDING EXCEPTION: {str(e)}'))
            logger.exception("Seeding collapsed.")
