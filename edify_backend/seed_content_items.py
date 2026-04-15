#!/usr/bin/env python3
import os, sys
from pathlib import Path
from django.utils import timezone

sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')

import django
django.setup()

from resources.models import Resource
from resources.content_models import ContentItem

def migrate_resources_to_content_items():
    print("Migrating Legacy Resources to new ContentItem architecture for Library API...")
    resources = Resource.objects.all()
    count = 0
    for res in resources:
        # Map owner type
        owner_map = {
            'platform': 'platform_admin',
            'institution': 'institution',
            'teacher': 'teacher'
        }
        
        # Map visibility to new valid choices
        vis_map = {
            'private': 'private',
            'institution_only': 'institution',
            'platform_shared': 'global',
            'marketplace_public': 'global'  # ContentItem model uses 'global' for site-wide
        }
        
        # Map category
        cat = res.category or 'other'
        valid_cats = [c[0] for c in ContentItem.CONTENT_TYPE_CHOICES]
        if cat not in valid_cats:
            cat = 'other'

        # Since this is a migration script we use the actual file or a mock URL
        file_val = res.file_path if res.file_path else None
        
        citem = ContentItem.objects.create(
            title=res.title,
            description=res.description or '',
            content_type=cat,
            uploaded_by=res.uploaded_by,
            owner_type=owner_map.get(res.owner_type, 'teacher'),
            owner_institution=res.owner_institution,
            subject=res.subject,
            class_level=res.class_level,
            topic=res.topic,
            visibility_scope=vis_map.get(res.visibility, 'private'),
            publication_status='published',
            published_at=res.created_at,
            file=file_val,
            external_url=res.external_url or '',
            vimeo_video_id=res.vimeo_video_id or '',
            is_featured=res.is_featured
        )
        count += 1
        
    print(f"Successfully migrated/populated {count} ContentItems to power the Library view.")

if __name__ == '__main__':
    migrate_resources_to_content_items()
