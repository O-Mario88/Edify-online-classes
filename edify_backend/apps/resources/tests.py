"""Phase 4, slice #1: teacher creates content → student engages.

End-to-end contract: a teacher posts a note, the student lists content
and sees that note among the results, and the student can record
engagement against it. Failure of any link breaks the content loop.
"""
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class TeacherCreatesContentStudentEngagesTests(TestCase):
    CONTENT_URL = '/api/v1/content/items/'
    TRACK_URL = '/api/v1/content/engagement/track/'

    def setUp(self):
        cache.clear()
        self.teacher = User.objects.create_user(
            email='slice4.teacher@edify.test',
            full_name='Slice 4 Teacher',
            country_code='UG',
            password='TeacherPass!',
            role='teacher',
        )
        self.student = User.objects.create_user(
            email='slice4.student@edify.test',
            full_name='Slice 4 Student',
            country_code='UG',
            password='StudentPass!',
            role='student',
        )
        self.teacher_client = APIClient()
        self.teacher_client.force_authenticate(user=self.teacher)
        self.student_client = APIClient()
        self.student_client.force_authenticate(user=self.student)

    def test_teacher_posts_note_student_sees_and_engages(self):
        # 1) Teacher creates a globally-visible published note
        create_resp = self.teacher_client.post(
            self.CONTENT_URL,
            {
                'title': 'Slice 4: Factorisation basics',
                'description': 'Short note covering the difference of two squares.',
                'content_type': 'notes',
                'owner_type': 'teacher',
                'visibility_scope': 'global',
                'publication_status': 'published',
            },
            format='json',
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED, create_resp.content)
        item_id = create_resp.data['id']

        # 2) Student lists content and sees the new note
        list_resp = self.student_client.get(self.CONTENT_URL)
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        results = list_resp.data.get('results', list_resp.data)
        ids_visible = [str(r['id']) for r in results]
        self.assertIn(str(item_id), ids_visible, 'Student cannot see the teacher-created note')

        # 3) Student engages — track view + mark complete
        track_resp = self.student_client.post(
            self.TRACK_URL,
            {'content_item_id': str(item_id), 'completion_percentage': 100, 'is_completed': True},
            format='json',
        )
        self.assertEqual(track_resp.status_code, status.HTTP_200_OK, track_resp.content)
        self.assertTrue(track_resp.data['is_completed'])
        self.assertEqual(track_resp.data['status'], 'completed')

    def test_draft_content_is_invisible_to_students(self):
        """Drafts must not leak to students until published."""
        self.teacher_client.post(
            self.CONTENT_URL,
            {
                'title': 'Slice 4: Draft note',
                'description': 'should not be listed',
                'content_type': 'notes',
                'owner_type': 'teacher',
                'visibility_scope': 'global',
                'publication_status': 'draft',
            },
            format='json',
        )
        list_resp = self.student_client.get(self.CONTENT_URL)
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        titles = [r['title'] for r in list_resp.data.get('results', list_resp.data)]
        self.assertNotIn('Slice 4: Draft note', titles)
