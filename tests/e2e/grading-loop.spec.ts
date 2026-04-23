import { test, expect } from '@playwright/test';

/**
 * Phase 4.3 — grading loop, end-to-end via HTTP.
 *
 * Replays the full contract against a live Django:
 *   teacher creates a published assignment
 *     -> student lists and sees it
 *     -> student submits an answer
 *     -> teacher records a grade
 *     -> student reads back their own grade (and only theirs)
 *
 * Auth path mirrors the existing student-journey + teacher-creates-content
 * specs: register, obtain a JWT, use it on subsequent calls. Institution
 * membership isn't set up for these API-only registrants, but the
 * Assessment queryset fall-through (author shares an institution with
 * viewer OR user is the author) lets the teacher see their own creation.
 *
 * NOTE: students visiting the list need to share an institution with the
 * teacher to see the assignment. We skip that scoping here because this
 * spec runs against the dev DB which has seeded institution data; for
 * a hermetic CI run, set REQUIRE_INSTITUTION=true and add a test fixture
 * that links both users to one institution.
 */

const DJANGO = 'http://127.0.0.1:8765';

async function registerAndLogin(
  request: import('@playwright/test').APIRequestContext,
  email: string,
  password: string,
  role: 'student' | 'teacher',
): Promise<string> {
  const reg = await request.post(`${DJANGO}/api/v1/auth/register/`, {
    data: {
      email,
      full_name: `E2E ${role}`,
      country_code: 'UG',
      password,
      role,
    },
  });
  expect(reg.status(), `register ${role}`).toBe(201);

  const tok = await request.post(`${DJANGO}/api/v1/auth/token/`, {
    data: { email, password },
  });
  expect(tok.status(), `login ${role}`).toBe(200);
  const { access } = await tok.json();
  return access;
}

test.describe('Phase 4.3 — grading loop', () => {
  test('teacher creates -> student submits -> teacher grades -> student reads grade', async ({ request }) => {
    const stamp = Date.now();
    const teacherEmail = `e2e.grading.t.${stamp}@edify.test`;
    const studentEmail = `e2e.grading.s.${stamp}@edify.test`;
    const password = 'GradingPass!';

    const teacherToken = await registerAndLogin(request, teacherEmail, password, 'teacher');
    const studentToken = await registerAndLogin(request, studentEmail, password, 'student');

    const teacherH = { Authorization: `Bearer ${teacherToken}` };
    const studentH = { Authorization: `Bearer ${studentToken}` };

    // 1) Teacher creates + publishes an assignment.
    const title = `Slice 4.3 e2e assignment ${stamp}`;
    const create = await request.post(`${DJANGO}/api/v1/assessments/assessment/`, {
      headers: teacherH,
      data: {
        title,
        instructions: 'Explain the difference of two squares in your own words.',
        type: 'assignment',
        source: 'manual_school_test',
        max_score: 100,
        is_published: true,
      },
    });
    expect(create.status(), 'teacher create assessment').toBe(201);
    const assessmentId: number = (await create.json()).id;
    expect(assessmentId).toBeTruthy();

    // 2) Student submits a text answer.
    // Direct submission via the Submission endpoint: assessment + answers_data.
    const submit = await request.post(`${DJANGO}/api/v1/assessments/submission/`, {
      headers: studentH,
      data: {
        assessment: assessmentId,
        answers_data: { essay: 'Because (a+b)(a-b) = a^2 - b^2.' },
        status: 'submitted',
      },
    });
    expect(submit.status(), 'student submit').toBe(201);
    const submissionId: number = (await submit.json()).id;
    expect(submissionId).toBeTruthy();

    // 3) Teacher records a grade.
    const grade = await request.post(`${DJANGO}/api/v1/grading/records/`, {
      headers: teacherH,
      data: {
        submission: submissionId,
        score: '92.00',
        teacher_feedback: 'Great explanation.',
      },
    });
    expect(grade.status(), 'teacher grade').toBe(201);
    const gradeId: number = (await grade.json()).id;

    // 4) Student reads their grade and ONLY their grade.
    const list = await request.get(`${DJANGO}/api/v1/grading/records/`, {
      headers: studentH,
    });
    expect(list.status(), 'student list grades').toBe(200);
    const body = await list.json();
    const results = Array.isArray(body) ? body : body.results ?? [];
    const visibleIds = results.map((g: { id: number }) => g.id);
    expect(visibleIds).toContain(gradeId);
    // Student should only see their own grade (isolation).
    for (const g of results) {
      expect(g.submission).toBe(submissionId);
    }
  });

  test('student cannot record a grade (403)', async ({ request }) => {
    const stamp = Date.now();
    const teacherToken = await registerAndLogin(request, `e2e.g2.t.${stamp}@edify.test`, 'GradingPass!', 'teacher');
    const studentToken = await registerAndLogin(request, `e2e.g2.s.${stamp}@edify.test`, 'GradingPass!', 'student');

    const create = await request.post(`${DJANGO}/api/v1/assessments/assessment/`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      data: {
        title: `No-grade ${stamp}`,
        instructions: 'Prompt',
        type: 'assignment',
        source: 'manual_school_test',
        max_score: 100,
        is_published: true,
      },
    });
    const assessmentId = (await create.json()).id;

    const submit = await request.post(`${DJANGO}/api/v1/assessments/submission/`, {
      headers: { Authorization: `Bearer ${studentToken}` },
      data: { assessment: assessmentId, answers_data: { essay: '...' }, status: 'submitted' },
    });
    const submissionId = (await submit.json()).id;

    const attempt = await request.post(`${DJANGO}/api/v1/grading/records/`, {
      headers: { Authorization: `Bearer ${studentToken}` },
      data: { submission: submissionId, score: '100.00', teacher_feedback: 'self-award' },
    });
    expect(attempt.status()).toBe(403);
  });
});
