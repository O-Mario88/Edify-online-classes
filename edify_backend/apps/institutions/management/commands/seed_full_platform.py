from django.core.management.base import BaseCommand
from institutions.seeders.master_seeder import seed_all

class Command(BaseCommand):
    help = 'Seeds realistic, scenario-based mock data across the entire Edify platform.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--scenario',
            type=str,
            help='Which scenario to seed: all, institution_a, institution_b, marketplace',
            default='all'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE(f"Starting full-platform data seed ({options['scenario']})..."))
        
        seed_all(self.stdout, self.style, options['scenario'])
        
        self.stdout.write(self.style.SUCCESS('\nSUCCESS! The platform is now populated with realistic scenarios.'))
