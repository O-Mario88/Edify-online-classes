import { test, expect } from '@playwright/test';

/**
 * Phase 4 slice #1: teacher-creates-content-student-engages, over HTTP.
 *
 * The Vitest suite covers the TeacherQuickNote component in isolation.
 * The Django suite covers the two-role contract inside the DB transaction.
 * This e2e spec runs the same contract against a live server so middleware,
 * throttling, auth header parsing, and serializer configuration are all
 * exercised as one.
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

test.describe('Phase 4 — teacher creates content → student engages', () => {
  test('teacher POSTs a note, student sees it, student marks complete', async ({ request }) => {
    const stamp = Date.now();
    const teacherEmail = `e2e.t.${stamp}@edify.test`;
    const studentEmail = `e2e.s.${stamp}@edify.test`;
    const password = 'E2ETestPass!';

    const teacherToken = await registerAndLogin(request, teacherEmail, password, 'teacher');
    const studentToken = await registerAndLogin(request, studentEmail, password, 'student');

    // 1) Teacher publishes a note
    const title = `Slice 4 e2e note ${stamp}`;
    const body = 'Students should see this paragraph immediately after publish.';
    const create = await request.post(`${DJANGO}/api/v1/content/items/`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      data: {
        title,
        description: body,
        content_type: 'notes',
        owner_type: 'teacher',
        visibility_scope: 'global',
        publication_status: 'published',
      },
    });
    expect(create.status(), 'teacher create').toBe(201);
    const created = await create.json();
    const itemId: string = created.id;
    expect(itemId, 'created id present').toBeTruthy();

    // 2) Student lists content and finds the new note
    const list = await request.get(`${DJANGO}/api/v1/content/items/?page_size=200`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    expect(list.status(), 'student list').toBe(200);
    const { results } = await list.json();
    const found = results.find((r: { id: string }) => String(r.id) === String(itemId));
    expect(found, 'note visible to student').toBeTruthy();
    expect(found.title).toBe(title);

    // 3) Student records engagement all the way to completion
    const track = await request.post(`${DJANGO}/api/v1/content/engagement/track/`, {
      headers: { Authorization: `Bearer ${studentToken}` },
      data: {
        content_item_id: itemId,
        completion_percentage: 100,
        is_completed: true,
      },
    });
    expect(track.status(), 'student track').toBe(200);
    const engagement = await track.json();
    expect(engagement.is_completed).toBe(true);
    expect(engagement.status).toBe('completed');
  });
});
