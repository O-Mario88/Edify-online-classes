import os
import uuid
import logging
from celery import shared_task
from .models import LiveSession
from .google_workspace_service import GoogleWorkspaceService
# Importing VimeoService from the resources app proxy we built earlier
from resources.vimeo_service import VimeoService 

logger = logging.getLogger(__name__)

@shared_task
def sync_meet_recordings_job():
    """
    Periodic task that runs (e.g. every hour) to find completed LiveSessions
    that haven't synced their recording artifact, pulls it from Google Drive,
    and proxies it to Vimeo.
    """
    sessions_to_sync = LiveSession.objects.filter(
        status='completed',
        artifact_sync_status='pending'
    )

    if not sessions_to_sync.exists():
        return "No pending session artifacts to sync."

    gws = GoogleWorkspaceService()
    vimeo_svc = VimeoService()

    TMP_DIR = '/tmp/edify_recordings'
    os.makedirs(TMP_DIR, exist_ok=True)

    for session in sessions_to_sync:
        session.artifact_sync_status = 'syncing'
        session.save(update_fields=['artifact_sync_status'])

        meeting_code = session.meeting_link.split('/')[-1].split('?')[0] if session.meeting_link else None
        
        if not meeting_code:
            logger.error(f"Cannot sync session {session.id}: invalid meeting link.")
            session.artifact_sync_status = 'failed'
            session.save(update_fields=['artifact_sync_status'])
            continue

        try:
            # 1. Fetch Google Drive ID
            drive_file_id = gws.get_meeting_recording_file_id(meeting_code)
            
            if not drive_file_id:
                logger.warning(f"Recording not yet available in Drive for session {session.id}")
                session.artifact_sync_status = 'pending' # Re-queue for next execution
                session.save(update_fields=['artifact_sync_status'])
                continue

            # 2. Download from Google Drive to local temp
            tmp_filename = f"{TMP_DIR}/meet_artifact_{uuid.uuid4().hex}.mp4"
            gws.download_drive_file(drive_file_id, tmp_filename)

            # 3. Upload to Vimeo
            logger.info(f"Uploading session {session.id} to Vimeo...")
            vimeo_video_id = vimeo_svc.upload_video(
                file_path=tmp_filename,
                title=f"Replay: {session.lesson.title}",
                description=f"Auto-synced Live Session Recording. Session ID: {session.id}"
            )

            # 4. Update Model mapping
            session.replay_url = f"https://vimeo.com/{vimeo_video_id}"
            session.artifact_sync_status = 'completed'
            session.save(update_fields=['replay_url', 'artifact_sync_status'])
            logger.info(f"Successfully synced Live Session {session.id} artifact to Vimeo!")

        except Exception as e:
            logger.error(f"Pipeline failed for session {session.id}: {e}")
            session.artifact_sync_status = 'failed'
            session.save(update_fields=['artifact_sync_status'])

        finally:
            # 5. Cleanup Security protocol: Shred temp files
            if 'tmp_filename' in locals() and os.path.exists(tmp_filename):
                try:
                    os.remove(tmp_filename)
                except Exception as e:
                    logger.warning(f"Could not destroy temporary artifact {tmp_filename}: {e}")

    return f"Processed {sessions_to_sync.count()} sessions."
