#!/usr/bin/env python3
"""
Setup script to initialize database without interactive prompts
"""

import os
import sys
import django
from pathlib import Path

# Add the edify_backend to path
sys.path.insert(0, '/Users/omario/Desktop/Notebook LM/edify online school/edify_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')

# Setup Django
django.setup()

from django.core.management import call_command

print("🔧 Setting up database...")

try:
    # Clear old migrations
    print("Clearing old migrations...")
    migration_dir = Path('/Users/omario/Desktop/Notebook LM/edify online school/edify_backend/apps')
    for app_dir in migration_dir.iterdir():
        if app_dir.is_dir():
            mig_path = app_dir / 'migrations'
            if mig_path.exists():
                for f in mig_path.glob('*.py'):
                    if f.name != '__init__.py':
                        f.unlink()
    
    # Remove database
    db_path = Path('/Users/omario/Desktop/Notebook LM/edify online school/edify_backend/db.sqlite3')
    if db_path.exists():
        db_path.unlink()
    
    print("✅ Cleaned old data")
    
    # Create fresh migrations
    print("Creating migrations...")
    call_command('makemigrations')
    
    # Apply migrations
    print("Applying migrations...")
    call_command('migrate')
    
    print("✅ Database setup complete!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
