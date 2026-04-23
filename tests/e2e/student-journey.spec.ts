import { test, expect } from '@playwright/test';

/**
 * End-to-end smoke test for the student slice.
 *
 * Exercises the real HTTP contract against a live Django server (started
 * by playwright.config.ts -> webServer). Runs in parallel with the
 * in-process Django unit tests (StudentSliceTests) but over the wire,
 * so a transport-layer regression (CORS, middleware, URL routing, auth
 * header parsing) will surface here even if the unit tests pass.
 */

const DJANGO = 'http://127.0.0.1:8765';

test.describe('Student slice (API)', () => {
  test('GET /api/health/ returns 200 with db+cache ok', async ({ request }) => {
    const resp = await request.get(`${DJANGO}/api/health/`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.status).toBe('ok');
    expect(body.db).toBe('ok');
    expect(body.cache).toBe('ok');
  });

  test('register -> JWT -> browse content -> record engagement', async ({ request }) => {
    const email = `e2e.${Date.now()}@edify.test`;
    const password = 'E2ETestPass!';

    const reg = await request.post(`${DJANGO}/api/v1/auth/register/`, {
      data: {
        email,
        full_name: 'E2E Student',
        country_code: 'UG',
        password,
        role: 'student',
      },
    });
    expect(reg.status(), 'register').toBe(201);

    const token = await request.post(`${DJANGO}/api/v1/auth/token/`, {
      data: { email, password },
    });
    expect(token.status(), 'login').toBe(200);
    const { access } = await token.json();
    expect(access, 'access token').toBeTruthy();

    const authHeaders = { Authorization: `Bearer ${access}` };

    const items = await request.get(`${DJANGO}/api/v1/content/items/`, {
      headers: authHeaders,
    });
    expect(items.status(), 'list content').toBe(200);
    const list = await items.json();
    expect(list).toHaveProperty('results');

    // If the dev DB has any globally visible content, exercise the track
    // endpoint on the first one. Otherwise this just verifies the list path.
    if (list.results && list.results.length > 0) {
      const firstId = list.results[0].id;
      const track = await request.post(`${DJANGO}/api/v1/content/engagement/track/`, {
        headers: authHeaders,
        data: { content_item_id: firstId, completion_percentage: 25 },
      });
      expect(track.status(), 'track engagement').toBe(200);
    }
  });

  test('unauthenticated content access is rejected', async ({ request }) => {
    const resp = await request.get(`${DJANGO}/api/v1/content/items/`);
    expect(resp.status()).toBe(401);
  });
});
