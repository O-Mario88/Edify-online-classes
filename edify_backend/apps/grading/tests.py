"""Phase 4.3 — assignment + submission + grading end-to-end contract.

Exercises the real HTTP endpoints for the full loop:
  teacher creates assessment (published)
    -> student lists, sees it
    -> student submits
    -> teacher records a grade
    -> student reads their grade (and only theirs)

Locks in the authorization model: students cannot create assessments,
students see only their own grades, unpublished assessments stay hidden.
"""
from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from assessments.models import Assessment, Submission
from grading.models import GradeRecord
from institutions.models import Institution, InstitutionMembership

User = get_user_model()


class GradingLoopTests(TestCase):
    """The teacher-assigns-student-submits-teacher-grades loop."""

    ASSESSMENTS_URL = '/api/v1/assessments/assessment/'
    SUBMISSIONS_URL = '/api/v1/assessments/submission/'
    GRADES_URL = '/api/v1/grading/records/'

    def setUp(self):
        cache.clear()
        # An institution and memberships so the TenantFilterMixin lets our
        # users see each other's assessments.
        self.inst = Institution.objects.create(name='Slice-4.3 Test School')

        self.teacher = User.objects.create_user(
            email='slice43.teacher@edify.test',
            full_name='Slice 4.3 Teacher',
            country_code='UG',
            password='TeacherPass!',
            role='teacher',
        )
        self.student = User.objects.create_user(
            email='slice43.student@edify.test',
            full_name='Slice 4.3 Student',
            country_code='UG',
            password='StudentPass!',
            role='student',
        )
        self.other_student = User.objects.create_user(
            email='slice43.other@edify.test',
            full_name='Other Student',
            country_code='UG',
            password='OtherPass!',
            role='student',
        )
        for user, inst_role in (
            (self.teacher, 'subject_teacher'),
            (self.student, 'student'),
            (self.other_student, 'student'),
        ):
            InstitutionMembership.objects.create(
                user=user, institution=self.inst, role=inst_role, status='active',
            )

        self.teacher_client = APIClient()
        self.teacher_client.force_authenticate(user=self.teacher)
        self.student_client = APIClient()
        self.student_client.force_authenticate(user=self.student)
        self.other_client = APIClient()
        self.other_client.force_authenticate(user=self.other_student)

    def _create_assessment(self, *, published=True, title='Essay 1'):
        return Assessment.objects.create(
            title=title,
            instructions='Write two paragraphs on the difference of two squares.',
            type='assignment',
            source='manual_school_test',
            max_score=100,
            created_by=self.teacher,
            is_published=published,
        )

    def test_full_loop_teacher_assigns_student_submits_teacher_grades(self):
        assessment = self._create_assessment()

        # Student lists assessments — they see the published one.
        resp = self.student_client.get(self.ASSESSMENTS_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        visible_ids = {r['id'] for r in resp.data.get('results', resp.data)}
        self.assertIn(assessment.id, visible_ids)

        # Student submits.
        sub = Submission.objects.create(
            assessment=assessment,
            student=self.student,
            status='submitted',
            answers_data={'essay': 'An answer.'},
        )

        # Teacher records a grade via the API.
        grade_resp = self.teacher_client.post(
            self.GRADES_URL,
            {'submission': sub.id, 'score': '85.00', 'teacher_feedback': 'Clear argument, watch spelling.'},
            format='json',
        )
        self.assertEqual(grade_resp.status_code, status.HTTP_201_CREATED, grade_resp.content)
        grade_id = grade_resp.data['id']

        # Student can read their grade and only their grade.
        read_resp = self.student_client.get(self.GRADES_URL)
        self.assertEqual(read_resp.status_code, status.HTTP_200_OK)
        results = read_resp.data.get('results', read_resp.data)
        grade_ids = [g['id'] for g in results]
        self.assertEqual(grade_ids, [grade_id])
        self.assertEqual(results[0]['teacher_feedback'], 'Clear argument, watch spelling.')

        # Persistence sanity: the underlying row exists.
        self.assertTrue(GradeRecord.objects.filter(pk=grade_id).exists())

    def test_draft_assessments_are_invisible_to_students(self):
        self._create_assessment(published=False, title='Unpublished draft')
        resp = self.student_client.get(self.ASSESSMENTS_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        titles = [r['title'] for r in resp.data.get('results', resp.data)]
        self.assertNotIn('Unpublished draft', titles)

    def test_student_cannot_create_an_assessment(self):
        resp = self.student_client.post(
            self.ASSESSMENTS_URL,
            {
                'title': 'Forbidden',
                'instructions': 'Nope',
                'type': 'assignment',
                'source': 'manual_school_test',
                'max_score': '100',
                'is_published': True,
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN, resp.content)

    def test_student_cannot_record_a_grade(self):
        assessment = self._create_assessment()
        sub = Submission.objects.create(
            assessment=assessment, student=self.student, status='submitted',
        )
        resp = self.student_client.post(
            self.GRADES_URL,
            {'submission': sub.id, 'score': '100.00', 'teacher_feedback': 'self-award'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN, resp.content)
        self.assertFalse(GradeRecord.objects.filter(submission=sub).exists())

    def test_student_cannot_see_another_students_grade(self):
        assessment = self._create_assessment()
        other_sub = Submission.objects.create(
            assessment=assessment, student=self.other_student, status='submitted',
        )
        self.teacher_client.post(
            self.GRADES_URL,
            {'submission': other_sub.id, 'score': '60.00', 'teacher_feedback': 'private'},
            format='json',
        )

        resp = self.student_client.get(self.GRADES_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data.get('results', resp.data)
        # Student has no submissions of their own, so they see no grades.
        self.assertEqual(results, [])
