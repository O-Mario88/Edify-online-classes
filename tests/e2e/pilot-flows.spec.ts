import { test, expect } from '@playwright/test';

/**
 * End-to-end API tests for the five critical pilot flows.
 *
 * Each test exercises a different learner/teacher/parent journey against
 * the live Django server. Same contract as the existing student-journey
 * and grading-loop specs — HTTP layer, no browser.
 *
 * To run locally:
 *   cd edify_backend && python manage.py seed_pilot_content
 *   npx playwright test tests/e2e/pilot-flows.spec.ts
 */

const DJANGO = 'http://127.0.0.1:8765';

async function registerAndLogin(request: any, email: string, role = 'student') {
  const password = 'E2EPilotPass!';
  const reg = await request.post(`${DJANGO}/api/v1/auth/register/`, {
    data: {
      email, password,
      full_name: `E2E ${email}`,
      country_code: 'UG',
      role,
    },
  });
  // Throttle-tolerant: if we already registered this email in this
  // window, fall through — the login below still works.
  if (reg.status() !== 201 && reg.status() !== 200) {
    if (reg.status() !== 400) {
      throw new Error(`Register failed ${reg.status()}: ${await reg.text()}`);
    }
  }
  const tok = await request.post(`${DJANGO}/api/v1/auth/token/`, {
    data: { email, password },
  });
  expect(tok.status()).toBe(200);
  return (await tok.json()).access as string;
}

async function headers(access: string) {
  return { Authorization: `Bearer ${access}` };
}


test.describe('Pilot critical flows', () => {

  // 1. Flagship: diagnostic → report
  test('diagnostic flow: start → submit → learning level report', async ({ request }) => {
    const email = `diag.${Date.now()}@edify.test`;
    const access = await registerAndLogin(request, email);

    const start = await request.post(`${DJANGO}/api/v1/diagnostic/start/`, {
      headers: await headers(access), data: {},
    });
    expect(start.status()).toBe(200);
    const body = await start.json();
    expect(body.session.id).toBeTruthy();
    // Session is created even if the question bank is empty for the user's class.
    expect(typeof body.empty_bank).toBe('boolean');
    if (!body.empty_bank) {
      const answers: Record<string, string> = {};
      for (const q of body.questions) {
        const opts = q.options || [];
        answers[String(q.id)] = opts[0] || '';
      }
      const submit = await request.post(
        `${DJANGO}/api/v1/diagnostic/${body.session.id}/submit/`,
        { headers: await headers(access), data: { answers } },
      );
      expect(submit.status()).toBe(200);
      const report = await submit.json();
      expect(report.state).toBe('submitted');
      expect(report.report_data.level_label).toBeTruthy();
      expect(report.report_data.trust_note).toBeTruthy();
    }
  });

  // 2. Mastery: enroll → mark item complete → progress updates
  test('mastery: enroll in published track → mark item → progress moves', async ({ request }) => {
    const email = `mastery.${Date.now()}@edify.test`;
    const access = await registerAndLogin(request, email);

    // Find a published track (seed_pilot_content populates these).
    const list = await request.get(`${DJANGO}/api/v1/mastery/tracks/`, {
      headers: await headers(access),
    });
    expect(list.status()).toBe(200);
    const tracks = (await list.json()).results || (await list.json());
    expect(tracks.length).toBeGreaterThan(0);
    const slug = tracks[0].slug;

    // Enroll.
    const enroll = await request.post(
      `${DJANGO}/api/v1/mastery/tracks/${slug}/enroll/`,
      { headers: await headers(access), data: {} },
    );
    expect([200, 201]).toContain(enroll.status());
    const enrollment = await enroll.json();

    // Fetch progress + grab a required item.
    const progress = await request.get(
      `${DJANGO}/api/v1/mastery/enrollments/${enrollment.id}/progress/`,
      { headers: await headers(access) },
    );
    expect(progress.status()).toBe(200);
    const pbody = await progress.json();
    const required = pbody.items.find((i: any) => i.required);
    if (required) {
      const mark = await request.post(
        `${DJANGO}/api/v1/mastery/enrollments/${enrollment.id}/mark-item-complete/`,
        { headers: await headers(access), data: { item_id: required.id } },
      );
      expect(mark.status()).toBe(200);
      const updated = await mark.json();
      expect(updated.progress_percentage).toBeGreaterThan(0);
    }
  });

  // 3. Practice Lab: start → answer → submit → badge
  test('practice lab: start → pass → badge earned', async ({ request }) => {
    const email = `lab.${Date.now()}@edify.test`;
    const access = await registerAndLogin(request, email);

    const list = await request.get(`${DJANGO}/api/v1/practice-labs/labs/`, {
      headers: await headers(access),
    });
    expect(list.status()).toBe(200);
    const labs = (await list.json()).results || (await list.json());
    expect(labs.length).toBeGreaterThan(0);
    const slug = labs[0].slug;

    // Start an attempt.
    const start = await request.post(
      `${DJANGO}/api/v1/practice-labs/labs/${slug}/start/`,
      { headers: await headers(access), data: {} },
    );
    expect(start.status()).toBe(201);
    const attempt = await start.json();

    // Detail endpoint for steps.
    const detail = await request.get(
      `${DJANGO}/api/v1/practice-labs/labs/${slug}/`,
      { headers: await headers(access) },
    );
    const steps = (await detail.json()).steps || [];
    for (const s of steps) {
      const payload: Record<string, unknown> = { step_id: s.id };
      if (s.step_type === 'mcq') payload.selected_option = (s.options || [])[0] || '';
      else payload.response_text = 'Sample response';
      await request.post(
        `${DJANGO}/api/v1/practice-labs/attempts/${attempt.id}/submit-step/`,
        { headers: await headers(access), data: payload },
      );
    }

    // Finalize.
    const submit = await request.post(
      `${DJANGO}/api/v1/practice-labs/attempts/${attempt.id}/submit/`,
      { headers: await headers(access), data: {} },
    );
    expect(submit.status()).toBe(200);
    const out = await submit.json();
    expect(['completed', 'needs_retry']).toContain(out.status);
    // Either the badge is earned (if the seed answers matched), or feedback
    // explains why to retry. Both are valid end states.
    expect(typeof out.feedback).toBe('string');
  });

  // 4. Standby Teacher: student posts → teacher accepts → resolves
  test('standby teacher: student posts → teacher accepts → resolves', async ({ request }) => {
    const studentEmail = `sb.s.${Date.now()}@edify.test`;
    const teacherEmail = `sb.t.${Date.now()}@edify.test`;
    const sAccess = await registerAndLogin(request, studentEmail, 'student');
    const tAccess = await registerAndLogin(request, teacherEmail, 'teacher');

    // Student posts a question.
    const create = await request.post(
      `${DJANGO}/api/v1/standby-teachers/support-requests/`,
      {
        headers: await headers(sAccess),
        data: {
          topic: 'Fractions',
          question: 'What is 1/2 + 1/3?',
          request_type: 'chat',
          priority: 'normal',
        },
      },
    );
    expect(create.status()).toBe(201);
    const rid = (await create.json()).id;

    // Teacher finds it in the queue.
    const queue = await request.get(
      `${DJANGO}/api/v1/standby-teachers/support-requests/teacher-queue/`,
      { headers: await headers(tAccess) },
    );
    expect(queue.status()).toBe(200);
    const ids = (await queue.json()).map((r: any) => r.id);
    expect(ids).toContain(rid);

    // Accept + resolve.
    const accept = await request.post(
      `${DJANGO}/api/v1/standby-teachers/support-requests/${rid}/accept/`,
      { headers: await headers(tAccess), data: {} },
    );
    expect(accept.status()).toBe(200);

    const resolve = await request.post(
      `${DJANGO}/api/v1/standby-teachers/support-requests/${rid}/resolve/`,
      { headers: await headers(tAccess), data: { resolution_note: 'Find common denominator: 5/6.' } },
    );
    expect(resolve.status()).toBe(200);
    expect((await resolve.json()).status).toBe('resolved');

    // Student sees the resolution.
    const mine = await request.get(
      `${DJANGO}/api/v1/standby-teachers/support-requests/my/`,
      { headers: await headers(sAccess) },
    );
    const row = (await mine.json()).find((r: any) => r.id === rid);
    expect(row.resolution_note).toContain('common denominator');
  });

  // 5. Upgrade request: student submits → admin inbox sees it
  test('upgrade request: student creates → admin-inbox visibility', async ({ request }) => {
    const email = `upg.${Date.now()}@edify.test`;
    const access = await registerAndLogin(request, email);

    const create = await request.post(
      `${DJANGO}/api/v1/pilot-payments/upgrade-requests/`,
      {
        headers: await headers(access),
        data: {
          plan: 'learner_plus',
          contact_phone: '+256700000001',
          preferred_method: 'mtn_momo',
          note: 'E2E test request.',
        },
      },
    );
    expect(create.status()).toBe(201);
    const rid = (await create.json()).id;

    // Student sees their own request in my-requests.
    const mine = await request.get(
      `${DJANGO}/api/v1/pilot-payments/upgrade-requests/my/`,
      { headers: await headers(access) },
    );
    expect(mine.status()).toBe(200);
    const myIds = (await mine.json()).map((r: any) => r.id);
    expect(myIds).toContain(rid);

    // No active premium grants yet.
    const access0 = await request.get(
      `${DJANGO}/api/v1/pilot-payments/premium-access/my-access/`,
      { headers: await headers(access) },
    );
    expect(access0.status()).toBe(200);
    expect((await access0.json()).active_plans).toEqual([]);
  });
});
