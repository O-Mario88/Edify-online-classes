"""Phase 1 Mastery Tracks tests.

Covers:
  - anonymous can't browse tracks
  - only published tracks surface
  - idempotent enroll (second enroll returns existing enrollment, not a new one)
  - progress endpoint lists every item with completed flag
  - marking a valid item complete updates progress percentage
  - marking an item that doesn't belong to the track is rejected
  - completing every required item flips status to 'completed' with timestamp
  - a learner cannot see another learner's enrollments
"""
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from .models import MasteryTrack, MasteryTrackModule, MasteryTrackItem

User = get_user_model()


class MasteryPhase1Tests(TestCase):
    TRACKS_URL = '/api/v1/mastery/tracks/'
    DETAIL_URL = '/api/v1/mastery/tracks/{slug}/'
    ENROLL_URL = '/api/v1/mastery/tracks/{slug}/enroll/'
    MY_TRACKS_URL = '/api/v1/mastery/enrollments/my-tracks/'

    def setUp(self):
        cache.clear()
        self.author = User.objects.create_user(
            email='mastery.author@edify.test', full_name='Author',
            country_code='UG', password='Pass!', role='teacher',
        )
        self.student = User.objects.create_user(
            email='mastery.student@edify.test', full_name='Student',
            country_code='UG', password='Pass!', role='student',
        )
        self.other = User.objects.create_user(
            email='mastery.other@edify.test', full_name='Other',
            country_code='UG', password='Pass!', role='student',
        )

        self.track = MasteryTrack.objects.create(
            title='Reading Mastery Track',
            slug='reading-mastery',
            description='Weekly reading practice with teacher feedback.',
            tagline='Read smoothly. Understand deeply.',
            outcome_statement='Read grade-level text fluently with comprehension.',
            target_role='student', level='beginner',
            is_published=True, is_featured=True,
            created_by=self.author,
        )
        self.hidden_track = MasteryTrack.objects.create(
            title='Draft Track', slug='draft-track',
            description='Still being built.',
            target_role='student', level='beginner',
            is_published=False,
            created_by=self.author,
        )

        self.module = MasteryTrackModule.objects.create(
            track=self.track, title='Week 1 — Fluency', order=1,
        )
        self.item_a = MasteryTrackItem.objects.create(
            module=self.module, item_type='content', order=1,
            required_for_completion=True,
            placeholder_title='Intro to fluency',
        )
        self.item_b = MasteryTrackItem.objects.create(
            module=self.module, item_type='practice_lab', order=2,
            required_for_completion=True,
            placeholder_title='Fluency lab — read aloud',
        )
        self.item_optional = MasteryTrackItem.objects.create(
            module=self.module, item_type='content', order=3,
            required_for_completion=False,
            placeholder_title='Bonus reading list',
        )

        # Item that belongs to a DIFFERENT track — used to prove scoping.
        other_track = MasteryTrack.objects.create(
            title='Other Track', slug='other-track',
            target_role='student', level='beginner',
            is_published=True, created_by=self.author,
        )
        other_mod = MasteryTrackModule.objects.create(track=other_track, title='Mod', order=1)
        self.foreign_item = MasteryTrackItem.objects.create(
            module=other_mod, item_type='content', order=1,
            required_for_completion=True, placeholder_title='Foreign item',
        )

        self.student_client = APIClient()
        self.student_client.force_authenticate(user=self.student)
        self.other_client = APIClient()
        self.other_client.force_authenticate(user=self.other)

    def test_anonymous_cannot_browse(self):
        resp = APIClient().get(self.TRACKS_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_only_published_tracks_surface(self):
        resp = self.student_client.get(self.TRACKS_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        slugs = {row['slug'] for row in resp.data.get('results', resp.data)}
        self.assertIn('reading-mastery', slugs)
        self.assertNotIn('draft-track', slugs)

    def test_detail_returns_modules_and_items(self):
        resp = self.student_client.get(self.DETAIL_URL.format(slug='reading-mastery'))
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        body = resp.data
        self.assertEqual(len(body['modules']), 1)
        self.assertEqual(len(body['modules'][0]['items']), 3)

    def test_enroll_is_idempotent(self):
        url = self.ENROLL_URL.format(slug='reading-mastery')
        first = self.student_client.post(url, {}, format='json')
        self.assertEqual(first.status_code, status.HTTP_201_CREATED, first.content)
        second = self.student_client.post(url, {}, format='json')
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(first.data['id'], second.data['id'])

    def test_my_tracks_returns_only_mine(self):
        enroll_url = self.ENROLL_URL.format(slug='reading-mastery')
        self.student_client.post(enroll_url, {}, format='json')
        self.other_client.post(enroll_url, {}, format='json')
        resp = self.student_client.get(self.MY_TRACKS_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Each learner only sees their own.
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['track']['slug'], 'reading-mastery')

    def test_progress_flow_marks_items_and_flips_to_completed(self):
        enroll_url = self.ENROLL_URL.format(slug='reading-mastery')
        enroll_resp = self.student_client.post(enroll_url, {}, format='json')
        enrollment_id = enroll_resp.data['id']
        progress_url = f'/api/v1/mastery/enrollments/{enrollment_id}/progress/'
        mark_url = f'/api/v1/mastery/enrollments/{enrollment_id}/mark-item-complete/'

        # Before any work, 0%.
        resp = self.student_client.get(progress_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['enrollment']['progress_percentage'], 0.0)
        self.assertEqual(len(resp.data['items']), 3)

        # Complete the first required item → 50% (1 of 2 required).
        resp = self.student_client.post(mark_url, {'item_id': str(self.item_a.id)}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['progress_percentage'], 50.0)
        self.assertEqual(resp.data['status'], 'active')

        # Complete the second required item → 100% + status completed.
        resp = self.student_client.post(mark_url, {'item_id': str(self.item_b.id)}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['progress_percentage'], 100.0)
        self.assertEqual(resp.data['status'], 'completed')
        self.assertIsNotNone(resp.data['completed_at'])

    def test_marking_foreign_item_complete_is_rejected(self):
        enroll_url = self.ENROLL_URL.format(slug='reading-mastery')
        enroll_resp = self.student_client.post(enroll_url, {}, format='json')
        enrollment_id = enroll_resp.data['id']
        mark_url = f'/api/v1/mastery/enrollments/{enrollment_id}/mark-item-complete/'
        resp = self.student_client.post(
            mark_url, {'item_id': str(self.foreign_item.id)}, format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST, resp.content)

    def test_learner_cannot_see_other_learners_enrollment(self):
        enroll_url = self.ENROLL_URL.format(slug='reading-mastery')
        enroll_resp = self.student_client.post(enroll_url, {}, format='json')
        enrollment_id = enroll_resp.data['id']
        # Other learner tries to read it.
        resp = self.other_client.get(f'/api/v1/mastery/enrollments/{enrollment_id}/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
