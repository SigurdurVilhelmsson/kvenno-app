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
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // The CI runner has no GPU, and Firefox sometimes blocks WebGL 2 there ("AllowWebgl2:false
        // restricts context creation on this system"), so WebGL is forced on. On other runs it
        // finds no GL driver at all, which no setting fixes: the lazy-load test accepts the
        // viewer's no-WebGL panel in that case (docs/REVIEW-QUEUE.md D2).
        launchOptions: { firefoxUserPrefs: { 'webgl.force-enabled': true } },
      },
      // mobile-games.spec.ts tags most of its per-screen paths chromium-only
      // to keep CI time down; Firefox replays a spread-out sample.
      // mobile-vertical.spec.ts does the same: Firefox cannot emulate touch or
      // isMobile, so it replays one play loop per game (with the mouse) and
      // leaves the per-viewport, anti-skip, typed, landscape and 844x390 runs
      // to Chromium.
      grepInvert: /@chromium-only/,
    },
  ],
  webServer: {
    command: 'node e2e/preview-server.mjs',
    port: 4173,
    env: { PORT: '4173' },
    reuseExistingServer: !process.env.CI,
  },
});
