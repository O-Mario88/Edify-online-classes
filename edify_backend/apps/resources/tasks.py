import os
import logging
from celery import shared_task
from django.conf import settings
from .models import Resource
from .vimeo_service import VimeoService

logger = logging.getLogger(__name__)

@shared_task
def process_vimeo_upload(resource_id):
    """
    Background job to upload a locally stored mp4 file to Vimeo,
    update the resource external url, and delete the local file.
    """
    try:
        resource = Resource.objects.get(id=resource_id)
    except Resource.DoesNotExist:
        logger.error(f"Cannot process Vimeo upload: Resource {resource_id} not found.")
        return

    if not resource.file_path:
        logger.error("No file path found on resource.")
        resource.vimeo_upload_status = 'failed'
        resource.save()
        return

    local_file_path = resource.file_path.path
    if not os.path.exists(local_file_path):
        logger.error(f"File not found on disk: {local_file_path}")
        resource.vimeo_upload_status = 'failed'
        resource.save()
        return

    resource.vimeo_upload_status = 'processing'
    resource.save()

    try:
        vimeo_service = VimeoService()
        video_id = vimeo_service.upload_video(
            file_path=local_file_path,
            title=resource.title,
            description=f"Auto-uploaded from Edify platform. Resource ID: {resource.id}"
        )

        # Update resource with playback URL
        resource.vimeo_video_id = video_id
        resource.external_url = f"https://vimeo.com/{video_id}"
        resource.vimeo_upload_status = 'completed'
        
        # We no longer need to host the heavy file, delete it from storage proxy
        try:
            os.remove(local_file_path)
            resource.file_path.delete(save=False)
        except Exception as e:
            logger.warning(f"Could not delete local file {local_file_path}: {e}")

        resource.save()
        logger.info(f"Successfully uploaded resource {resource_id} to Vimeo: {video_id}")

    except Exception as e:
        logger.error(f"Vimeo upload failed for resource {resource_id}. Exception: {e}")
        resource.vimeo_upload_status = 'failed'
        resource.save()
