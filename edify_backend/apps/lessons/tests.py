"""Regression tests for LessonViewSet filter behavior.

Pre-fix, `GET /api/v1/lessons/lesson/?parent_class=X` returned every lesson
in the DB because no filter_backends were configured. These tests lock in
the filtering so the teacher UI can narrow to one class.
"""
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from classes.models import Class
from curriculum.models import Country, CurriculumTrack, EducationLevel, ClassLevel
from institutions.models import Institution
from lessons.models import Lesson

User = get_user_model()


class LessonFilterTests(TestCase):
    LIST_URL = '/api/v1/lessons/lesson/'

    def setUp(self):
        cache.clear()  # isolate throttle buckets across tests
        self.teacher = User.objects.create_user(
            email='lesson.teacher@edify.test',
            full_name='Lesson Teacher',
            country_code='UG',
            password='TeacherPass!',
            role='teacher',
        )

        country = Country.objects.create(name='Uganda', code='UG')
        track = CurriculumTrack.objects.create(country=country, name='NCDC')
        level = EducationLevel.objects.create(track=track, name='Secondary')
        class_level = ClassLevel.objects.create(level=level, name='S1')

        institution = Institution.objects.create(name='Public Test Institution')

        # Two classes, both public so tenant filter lets the teacher see them.
        self.class_a = Class.objects.create(
            institution=institution,
            class_level=class_level,
            teacher=self.teacher,
            title='Class A',
            visibility='public',
        )
        self.class_b = Class.objects.create(
            institution=institution,
            class_level=class_level,
            teacher=self.teacher,
            title='Class B',
            visibility='public',
        )

        now = timezone.now()
        self.lessons_a = [
            Lesson.objects.create(parent_class=self.class_a, title=f'A{i}', scheduled_at=now)
            for i in range(3)
        ]
        self.lessons_b = [
            Lesson.objects.create(parent_class=self.class_b, title=f'B{i}', scheduled_at=now)
            for i in range(2)
        ]

        self.client = APIClient()
        self.client.force_authenticate(user=self.teacher)

    def _ids(self, resp):
        results = resp.data.get('results', resp.data) if isinstance(resp.data, dict) else resp.data
        return {r['id'] for r in results}

    def test_filter_by_parent_class_returns_only_that_class(self):
        resp = self.client.get(f'{self.LIST_URL}?parent_class={self.class_a.id}')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        returned = self._ids(resp)
        self.assertEqual(returned, {l.id for l in self.lessons_a})
        for lesson in self.lessons_b:
            self.assertNotIn(lesson.id, returned)

    def test_unfiltered_returns_all_visible(self):
        resp = self.client.get(self.LIST_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        returned = self._ids(resp)
        expected = {l.id for l in (self.lessons_a + self.lessons_b)}
        self.assertEqual(returned, expected)

    def test_nonexistent_parent_class_is_rejected(self):
        """django-filter validates FK PKs — a nonexistent id returns 400, not
        an empty success. Locks this in so UI code knows to guard client-side."""
        resp = self.client.get(f'{self.LIST_URL}?parent_class=999999')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
