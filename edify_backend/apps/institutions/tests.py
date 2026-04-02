from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from institutions.models import Institution, InstitutionMembership
from rest_framework import status

User = get_user_model()

class InstitutionIsolationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Build School A
        self.school_a = Institution.objects.create(name="School A")
        self.school_a_admin = User.objects.create_user(email='adminA@school.com', password='password123')
        InstitutionMembership.objects.create(user=self.school_a_admin, institution=self.school_a, role='headteacher', status='active')
        
        # Build School B
        self.school_b = Institution.objects.create(name="School B")
        self.school_b_admin = User.objects.create_user(email='adminB@school.com', password='password123')
        InstitutionMembership.objects.create(user=self.school_b_admin, institution=self.school_b, role='headteacher', status='active')

    def test_admin_a_cannot_see_school_b_members(self):
        self.client.force_authenticate(user=self.school_a_admin)
        response = self.client.get('/api/v1/institution-memberships/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should only see self (1 member in School A)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['institution'], self.school_a.id)

    def test_admin_b_cannot_see_school_a_billing(self):
        self.client.force_authenticate(user=self.school_b_admin)
        response = self.client.get('/api/v1/billing/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['institution'], "School B")
