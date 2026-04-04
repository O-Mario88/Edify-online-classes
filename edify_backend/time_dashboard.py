import time
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edify_core.settings")
django.setup()

from django.contrib.auth import get_user_model
from analytics.views import TeacherDashboardView, StudentDashboardView, AdminDashboardView
from django.test import RequestFactory

User = get_user_model()
factory = RequestFactory()

try:
    user = User.objects.filter(role='platform_admin').first() or User.objects.first()
    request = factory.get('/')
    request.user = user

    print("--- Teacher ---")
    view = TeacherDashboardView()
    t0 = time.time()
    view.get(request)
    print(time.time() - t0)

    print("--- Student ---")
    view = StudentDashboardView()
    t0 = time.time()
    view.get(request)
    print(time.time() - t0)

    print("--- Admin ---")
    view = AdminDashboardView()
    t0 = time.time()
    view.get(request)
    print(time.time() - t0)

except Exception as e:
    print("Error:", e)
