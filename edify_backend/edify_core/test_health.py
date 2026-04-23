"""Tests for the /api/health/ liveness endpoint."""
from unittest.mock import patch

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class HealthEndpointTests(TestCase):
    URL = '/api/health/'

    def test_health_returns_200_when_everything_ok(self):
        resp = APIClient().get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'ok')
        self.assertEqual(resp.data['db'], 'ok')
        self.assertEqual(resp.data['cache'], 'ok')

    def test_health_is_public_no_auth_required(self):
        """Monitoring probes must reach this endpoint without credentials."""
        resp = APIClient().get(self.URL)
        self.assertNotEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_health_returns_503_when_db_down(self):
        with patch('edify_core.health._check_db', return_value='error: OperationalError'):
            resp = APIClient().get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(resp.data['status'], 'degraded')
        self.assertTrue(resp.data['db'].startswith('error'))
