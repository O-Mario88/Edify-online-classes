import os
import vimeo

class VimeoService:
    def __init__(self):
        # MVP: Assuming master platform token is available in Env
        self.access_token = os.getenv('VIMEO_ACCESS_TOKEN', None)
        self.client_id = os.getenv('VIMEO_CLIENT_ID', None)
        self.client_secret = os.getenv('VIMEO_CLIENT_SECRET', None)
        self.client = self._get_client()

    def _get_client(self):
        if not self.access_token:
            raise ValueError("Vimeo API credentials missing.")
        return vimeo.VimeoClient(
            token=self.access_token,
            key=self.client_id,
            secret=self.client_secret
        )

    def upload_video(self, file_path, title, description=""):
        try:
            # Upload the video to Vimeo
            video_uri = self.client.upload(file_path, data={
                'name': title,
                'description': description,
                'privacy': {
                    'view': 'disable' # Prevents viewing on Vimeo.com (allows domain embed only if PRO)
                }
            })
            
            # The URI returned is usually in the format "/videos/123456789"
            video_id = video_uri.split('/')[-1]
            return video_id
        except Exception as e:
            import logging
            logging.error(f"Vimeo upload error: {e}")
            raise e
