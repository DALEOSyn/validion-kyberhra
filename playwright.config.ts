import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke play-through against the production build (vite preview), so the CSP and service worker are exercised.
 * Run with `npm run e2e` (always --trace off). Browsers come from PLAYWRIGHT_BROWSERS_PATH; do not install any.
 */
const port = Number(process.env['PW_PORT'] ?? 4173);
const baseURL = `http://127.0.0.1:${port}/`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  reporter: 'list',
  use: { baseURL, trace: 'off' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    { name: 'phone-360', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 }, hasTouch: true } },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${port} --strictPort --host 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
