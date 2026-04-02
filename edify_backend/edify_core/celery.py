import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')

app = Celery('edify_core')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automatically discover tasks in all installed apps
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
