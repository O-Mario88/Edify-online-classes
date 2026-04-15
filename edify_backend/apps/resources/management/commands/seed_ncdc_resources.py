import os
import re
import time
import requests
from urllib.parse import urljoin
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from resources.models import Resource
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Scrape and ingest NCDC curriculum materials into the Resource library.'

    def handle(self, *args, **kwargs):
        URL = "https://ncdc.go.ug/resource/"
        self.stdout.write(self.style.SUCCESS(f"Fetching NCDC resources from {URL}..."))
        
        # User auth required by Resource model
        User = get_user_model()
        uploader = User.objects.filter(is_superuser=True).first()
        if not uploader:
            uploader, _ = User.objects.get_or_create(
                email="ncdc_system@maple.edu",
                defaults={
                    "full_name": "System Administrator",
                    "role": "platform_admin"
                }
            )
            uploader.set_password("SecureSeed123!")
            uploader.save()

        try:
            # Add headers to avoid 403 Forbidden or being blocked by WAF
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
            }
            response = requests.get(URL, headers=headers, timeout=30)
            response.raise_for_status()
            html_content = response.text
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to fetch {URL}: {e}"))
            return

        # Simple regex to find all <a href="...pdf"> tags and their containing text
        # Because we don't have bs4 installed, we use regex.
        # Find all a tags
        a_tags = re.findall(r'<a\s+(?:[^>]*?\s+)?href=["\']([^"\']+\.pdf)["\'][^>]*>(.*?)</a>', html_content, re.IGNORECASE | re.DOTALL)
        
        if not a_tags:
            self.stdout.write(self.style.WARNING("No PDF links found on the page! Checking for any generic download links..."))
            a_tags = re.findall(r'<a\s+(?:[^>]*?\s+)?href=["\']([^"\']+(?:download|resource)[^"\']*)["\'][^>]*>(.*?)</a>', html_content, re.IGNORECASE | re.DOTALL)

        downloaded_count = 0
        skipped_count = 0
        
        # Deduplicate links
        unique_links = {}
        for href, text in a_tags:
            # Clean up the text
            clean_text = re.sub(r'<[^>]+>', '', text).strip()
            if not clean_text:
                clean_text = "NCDC Document"
            
            # Make absolute URL
            absolute_url = urljoin(URL, href)
            unique_links[absolute_url] = clean_text

        self.stdout.write(self.style.SUCCESS(f"Found {len(unique_links)} unique PDF resources to process."))
        
        # Limit to 15 resources to prevent disk explosion and timeout mapping during the demo
        items = list(unique_links.items())[:15]
        
        for url, text_title in items:
            from urllib.parse import unquote
            title = text_title
            if title.lower() in ["free download", "download", "ncdc document", ""]:
                # Extract from URL
                filename_part = url.split('/')[-1]
                title = unquote(filename_part).replace('-', ' ').replace('_', ' ').replace('.pdf', '')
                title = title.title()
                
            # Truncate title
            if len(title) > 200:
                title = title[:200]
                
            # Check if it already exists
            if Resource.objects.filter(external_url=url).exists() or Resource.objects.filter(title=title).exists():
                self.stdout.write(f"Skipping already existing resource: {title}")
                skipped_count += 1
                continue
                
            self.stdout.write(f"Downloading: {title} ...")
            try:
                # Small sleep to be polite to NCDC servers
                time.sleep(1)
                
                pdf_response = requests.get(url, headers=headers, timeout=30)
                pdf_response.raise_for_status()
                
                # Create the resource database object
                resource = Resource(
                    owner_type='platform',
                    visibility='platform_shared',
                    author='NCDC Uganda',
                    category='Official Syllabus / Material',
                    price=0.00,
                    title=title,
                    description=f"Official resource automatically synchronized from the National Curriculum Development Centre portal ({URL}).",
                    uploaded_by=uploader,
                    external_url=url
                )
                
                # Save the file. Filename extraction:
                filename = url.split('/')[-1]
                if not filename.endswith('.pdf'):
                    filename += '.pdf'
                    
                # The file_path is the field name on Resource model
                resource.file_path.save(f"ncdc/{filename}", ContentFile(pdf_response.content), save=False)
                resource.save()
                
                downloaded_count += 1
                self.stdout.write(self.style.SUCCESS(f"Successfully processed {title}"))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to download/process {url}: {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"Finished! Processed {len(items)} items. Downloaded {downloaded_count}, Skipped {skipped_count}."
        ))
