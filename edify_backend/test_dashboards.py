import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edify_core.settings")
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from apps.analytics.views import StudentDashboardView, TeacherDashboardView

User = get_user_model()
factory = RequestFactory()

student = User.objects.get(email="student.demo@edify.ug")
request = factory.get('/api/v1/analytics/student-dashboard/')
request.user = student

view = StudentDashboardView.as_view()
response = view(request)
print("StudentDashboardView status:", response.status_code)

teacher = User.objects.get(email="teacher.demo@edify.ug")
request_t = factory.get('/api/v1/analytics/teacher-dashboard/')
request_t.user = teacher

view_t = TeacherDashboardView.as_view()
response_t = view_t(request_t)
print("TeacherDashboardView status:", response_t.status_code)
