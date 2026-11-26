import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke play-through against the production build (vite preview), so the CSP and service worker are exercised.
 * Run with `npm run e2e` (always --trace off). Browsers come from PLAYWRIGHT_BROWSERS_PATH; CI downloads Chromium
 * only when none is found (.github/workflows/ci.yml). In CI a failed test is retried once (QA F14: one cold-start run
 * timed out on serviceWorker.ready); a test that needs the retry is reported as flaky.
 */
const port = Number(process.env['PW_PORT'] ?? 4173);
const baseURL = `http://127.0.0.1:${port}/`;
/** A second build with VITE_FEEDBACK_EMAIL set, for tests/e2e/comment-email.spec.ts (its own outDir and port). */
export const EMAIL_PORT = Number(process.env['PW_EMAIL_PORT'] ?? port + 1);
export const FEEDBACK_EMAIL = 'pripomienky@validion.example';
/** A third build with VITE_FEEDBACK_ENDPOINT (and the address) set, for tests/e2e/comment-send.spec.ts; page.route mocks it. */
export const SEND_PORT = Number(process.env['PW_SEND_PORT'] ?? port + 2);
export const FEEDBACK_ENDPOINT = 'https://feedback.validion.example/api/feedback';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: 'list',
  use: { baseURL, trace: 'off' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    { name: 'phone-360', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 }, hasTouch: true } },
  ],
  webServer: [
    {
      command: `npm run build && npx vite preview --port ${port} --strictPort --host 127.0.0.1`,
      url: baseURL,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: `npx vite build --outDir dist-email && npx vite preview --outDir dist-email --port ${EMAIL_PORT} --strictPort --host 127.0.0.1`,
      url: `http://127.0.0.1:${EMAIL_PORT}/`,
      env: { VITE_FEEDBACK_EMAIL: FEEDBACK_EMAIL },
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: `npx vite build --outDir dist-send && npx vite preview --outDir dist-send --port ${SEND_PORT} --strictPort --host 127.0.0.1`,
      url: `http://127.0.0.1:${SEND_PORT}/`,
      env: { VITE_FEEDBACK_EMAIL: FEEDBACK_EMAIL, VITE_FEEDBACK_ENDPOINT: FEEDBACK_ENDPOINT },
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
});
