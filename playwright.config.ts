import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration for kvenno.app.
 *
 * Prerequisites: Run `pnpm build` before running E2E tests.
 * The webServer serves the full dist/ directory using `npx serve`.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx serve dist -l 4173 -s',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
