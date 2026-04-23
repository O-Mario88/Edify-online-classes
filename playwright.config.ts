import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the end-to-end student-journey smoke test.
 *
 * Current scope: API-level journey only. Spins up Django alone and hits
 * the real HTTP endpoints with the Playwright request API — no browser
 * needed for the asserts we care about right now.
 *
 * Browser-driven UI tests will come back once the Vite dev-server boot
 * under Playwright's webServer is tuned for CI. For now, `npm test`
 * (Vitest + React Testing Library) covers frontend unit-level signals.
 *
 * Locally:   npx playwright test
 * In CI:     npx playwright test (see .github/workflows/ci.yml)
 */
const DJANGO_PORT = 8765;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://127.0.0.1:${DJANGO_PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: './venv/bin/python manage.py runserver 127.0.0.1:' + DJANGO_PORT,
    cwd: 'edify_backend',
    url: `http://127.0.0.1:${DJANGO_PORT}/api/health/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
