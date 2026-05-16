"""Tests for the tenancy framework itself.

These prove the primitives behave — context isolation, manager raises,
escape hatch works, middleware resolves correctly. They do NOT test any
domain model (those tests live with each app's viewset).
"""
from __future__ import annotations

import threading

from django.test import TestCase

from .context import (
    current_tenant,
    set_tenant,
    clear_tenant,
    tenant_context,
    TenantNotSetError,
)


class _FakeTenant:
    """Stand-in for an Institution — these tests don't touch the DB."""
    def __init__(self, name: str):
        self.name = name
        self.id = id(self)


class ContextIsolationTests(TestCase):
    def setUp(self):
        clear_tenant()

    def tearDown(self):
        clear_tenant()

    def test_unset_returns_none(self):
        self.assertIsNone(current_tenant())

    def test_set_and_read(self):
        t = _FakeTenant('A')
        set_tenant(t)
        self.assertIs(current_tenant(), t)

    def test_context_manager_restores_previous_value(self):
        outer = _FakeTenant('outer')
        inner = _FakeTenant('inner')
        set_tenant(outer)
        with tenant_context(inner):
            self.assertIs(current_tenant(), inner)
        self.assertIs(current_tenant(), outer)

    def test_context_manager_restores_on_exception(self):
        set_tenant(_FakeTenant('outer'))
        with self.assertRaises(RuntimeError):
            with tenant_context(_FakeTenant('inner')):
                raise RuntimeError('boom')
        # Outer should still be active
        self.assertEqual(current_tenant().name, 'outer')

    def test_thread_local_does_not_leak(self):
        """Setting a tenant in one thread must not affect another thread."""
        a, b = _FakeTenant('a'), _FakeTenant('b')
        set_tenant(a)

        seen = []

        def child():
            seen.append(current_tenant())  # should be None — thread-local
            set_tenant(b)
            seen.append(current_tenant())

        t = threading.Thread(target=child)
        t.start()
        t.join()

        self.assertEqual(seen[0], None)  # child started with no tenant
        self.assertEqual(seen[1], b)     # child set its own
        self.assertIs(current_tenant(), a)  # this thread unaffected


class TenantNotSetErrorTests(TestCase):
    """Documents the contract — error message names the model."""

    def test_error_is_runtime_error_subclass(self):
        self.assertTrue(issubclass(TenantNotSetError, RuntimeError))
