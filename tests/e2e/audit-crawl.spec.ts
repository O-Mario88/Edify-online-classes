import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Audit crawler: visits every routed path in App.tsx (hydrated from
 * docs/audit/static.json) as an authenticated teacher, captures console
 * errors + failed network requests, writes findings to
 * docs/audit/frontend_probe.json.
 *
 * Skipped because Playwright's webServer config only spins up Django,
 * not Vite — see playwright.config.ts. Run manually alongside a Vite
 * dev server:
 *
 *   1. In one terminal: npm run dev
 *   2. In another:      npx playwright test audit-crawl.spec.ts --project=chromium
 *
 * This spec is intentionally NOT hooked into the CI suite — it's a
 * manual diagnostic, not a regression.
 */

test.skip(
  !process.env.AUDIT_CRAWL,
  'Audit crawl only runs when AUDIT_CRAWL=1 is set (needs Vite dev server on :5173).',
);

const DJANGO = 'http://127.0.0.1:8765';
const VITE = process.env.VITE_BASE_URL || 'http://127.0.0.1:5173';

// Routes hand-picked from App.tsx. Parameterised routes use realistic
// placeholder values; if the page hard-fails on them that's a finding.
const ROUTES: string[] = [
  '/',
  '/about',
  '/login',
  '/register',
  '/forgot-password',
  '/classes',
  '/live-sessions',
  '/library',
  '/resources',
  '/payment',
  '/p/student1',
  '/t/teacher1',
  '/marketplace',
  '/peer-tutoring',
  '/exam-registration',
  '/institution-management',
  '/learning-path',
  '/projects',
  '/ai-assistant',
  '/dashboard/student',
  '/dashboard/teacher',
  '/dashboard/parent',
  '/dashboard/admin',
  '/dashboard/institution',
  '/dashboard/library',
  '/dashboard/interventions',
  '/dashboard/earnings',
  '/dashboard/analytics',
  '/dashboard/analytics/platform',
  '/dashboard/analytics/institution',
  '/dashboard/admin/intelligence',
  '/dashboard/admin/intelligence/risk',
  '/primary',
  '/primary/p7-readiness',
  '/primary/class/p7',
];

test('crawl every routed page and capture console + network errors', async ({ page, request }) => {
  test.setTimeout(10 * 60 * 1000); // crawl is O(routes) — give it 10 min
  // Bootstrap: register + log in a teacher, stash JWT in localStorage via
  // the frontend's key.
  const email = `audit.t.${Date.now()}@edify.test`;
  const password = 'AuditPass!';
  await request.post(`${DJANGO}/api/v1/auth/register/`, {
    data: { email, full_name: 'Audit Teacher', country_code: 'UG', password, role: 'teacher' },
  });
  const tokResp = await request.post(`${DJANGO}/api/v1/auth/token/`, {
    data: { email, password },
  });
  const { access, refresh } = await tokResp.json();

  const findings: Array<{
    route: string;
    status: number | null;
    load_ms: number;
    console_errors: string[];
    failed_requests: Array<{ url: string; status: number | string; failure?: string }>;
  }> = [];

  for (const route of ROUTES) {
    const consoleErrors: string[] = [];
    const failedRequests: Array<{ url: string; status: number | string; failure?: string }> = [];

    page.removeAllListeners('console');
    page.removeAllListeners('response');
    page.removeAllListeners('requestfailed');
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300));
    });
    page.on('response', (resp) => {
      const status = resp.status();
      if (status >= 500 || (status >= 400 && resp.url().includes('/api/'))) {
        failedRequests.push({ url: resp.url(), status });
      }
    });
    page.on('requestfailed', (req) => {
      failedRequests.push({ url: req.url(), status: 'failed', failure: req.failure()?.errorText });
    });

    // Plant tokens so the app thinks the user is logged in.
    await page.addInitScript(
      ([a, r]) => {
        try {
          localStorage.setItem('access_token', a as string);
          localStorage.setItem('refresh_token', r as string);
        } catch {
          // localStorage unavailable in this context — the crawl will
          // just report the auth-gated pages as unauth.
        }
      },
      [access, refresh],
    );

    const t0 = Date.now();
    let status: number | null = null;
    try {
      const resp = await page.goto(`${VITE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      status = resp ? resp.status() : null;
    } catch (e) {
      findings.push({
        route,
        status: null,
        load_ms: Date.now() - t0,
        console_errors: [`navigation threw: ${String(e).slice(0, 200)}`],
        failed_requests: failedRequests.slice(0, 30),
      });
      continue;
    }
    // Allow async effects to fire.
    await page.waitForTimeout(800);

    findings.push({
      route,
      status,
      load_ms: Date.now() - t0,
      console_errors: consoleErrors.slice(0, 20),
      failed_requests: failedRequests.slice(0, 30),
    });
  }

  const out = resolve(process.cwd(), 'docs/audit/frontend_probe.json');
  writeFileSync(
    out,
    JSON.stringify(
      {
        base_url: VITE,
        routes_tested: findings.length,
        findings,
      },
      null,
      2,
    ),
  );
  console.log(`Frontend probe written to ${out}`);
  expect(findings.length).toBeGreaterThan(0);
});
