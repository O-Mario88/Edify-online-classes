"""Mandatory cross-tenant denial test for every tenanted viewset.

Mix this into the test case for any new viewset that operates on a
TenantedModel. The mixin demands two attributes on the subclass:

  - `list_url`         — collection endpoint, e.g. '/api/v1/attendance/daily/'
  - `make_row(tenant)` — callable that creates and returns one row scoped
                         to `tenant`

It then runs a single assertion: when user A from tenant A queries the row
created in tenant B, the response is 404 (not 200, not 403 — a 404 doesn't
leak that the row exists).

Drop-in example:

    class DailyRegisterIsolationTests(CrossTenantDenialTestMixin, TestCase):
        list_url = '/api/v1/attendance/daily/'

        def make_row(self, tenant):
            with tenant_context(tenant):
                return DailyRegister.objects.create(
                    student=make_student(tenant),
                    record_date=date.today(),
                    status='present',
                )
"""
from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from .context import tenant_context


User = get_user_model()


class CrossTenantDenialTestMixin:
    """Asserts a viewset enforces tenant isolation. See module docstring."""

    list_url: str = ''  # subclass must set

    # Subclass MUST override.
    def make_row(self, tenant):  # noqa: D401
        raise NotImplementedError(
            'CrossTenantDenialTestMixin subclasses must implement '
            'make_row(self, tenant) -> Model instance.'
        )

    # Subclass MAY override (default uses institutions factory).
    def make_tenant(self, name: str):
        from institutions.models import Institution
        return Institution.objects.create(name=name, country_code='UG')

    def make_membership(self, user, tenant, role: str = 'class_teacher'):
        from institutions.models import InstitutionMembership
        return InstitutionMembership.objects.create(
            user=user, institution=tenant, role=role, status='active',
        )

    def make_user(self, email: str):
        return User.objects.create_user(
            email=email, full_name='Test', country_code='UG',
            password='TenantTest!', role='teacher',
        )

    def _token_for(self, email: str, password: str = 'TenantTest!') -> str:
        client = APIClient()
        resp = client.post(
            '/api/v1/auth/token/',
            {'email': email, 'password': password},
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK, resp.content
        return resp.data['access']

    def test_cross_tenant_row_returns_404(self):
        """Mandatory: user A cannot read user B's row, even by guessing the ID."""
        assert self.list_url, 'subclass must set list_url'

        tenant_a = self.make_tenant('Tenant A')
        tenant_b = self.make_tenant('Tenant B')
        user_a = self.make_user('user.a@tenancy.test')
        user_b = self.make_user('user.b@tenancy.test')
        self.make_membership(user_a, tenant_a)
        self.make_membership(user_b, tenant_b)

        # Row created under Tenant B
        with tenant_context(tenant_b):
            row_b = self.make_row(tenant_b)

        # User A queries it by ID. Use X-Tenant-Id to be explicit.
        client = APIClient()
        token = self._token_for('user.a@tenancy.test')
        client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {token}',
            HTTP_X_TENANT_ID=str(tenant_a.id),
        )
        detail_url = f'{self.list_url.rstrip("/")}/{row_b.pk}/'
        resp = client.get(detail_url)
        # 404, not 403: don't reveal that the row exists in another tenant.
        assert resp.status_code == status.HTTP_404_NOT_FOUND, (
            f'Cross-tenant leak: {self.list_url} returned {resp.status_code} '
            f'for tenant A reading tenant B\'s row. Expected 404. '
            f'Body: {resp.content[:200]!r}'
        )
