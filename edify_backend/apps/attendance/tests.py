from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from institutions.models import Institution, InstitutionMembership
from rest_framework import status
from attendance.models import DailyRegister
import datetime

User = get_user_model()

class AttendanceIsolationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Build School A
        self.school_a = Institution.objects.create(name="School A")
        self.school_a_teacher = User.objects.create_user(email='teacherA@school.com', password='password123')
        InstitutionMembership.objects.create(user=self.school_a_teacher, institution=self.school_a, role='class_teacher', status='active')
        
        # Build School B
        self.school_b = Institution.objects.create(name="School B")
        self.school_b_teacher = User.objects.create_user(email='teacherB@school.com', password='password123')
        InstitutionMembership.objects.create(user=self.school_b_teacher, institution=self.school_b, role='class_teacher', status='active')
        
        # Create some registers
        self.student = User.objects.create_user(email='student@school.com', password='pwd')
        DailyRegister.objects.create(student=self.student, institution=self.school_b, date=datetime.date.today(), status='present')

    def test_teacher_a_cannot_see_school_b_registers(self):
        self.client.force_authenticate(user=self.school_a_teacher)
        response = self.client.get('/api/v1/attendance/daily/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Teacher A shouldn't see Teacher B's registers
        self.assertEqual(len(response.data), 0)

    def test_teacher_b_can_see_own_registers(self):
        self.client.force_authenticate(user=self.school_b_teacher)
        response = self.client.get('/api/v1/attendance/daily/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
