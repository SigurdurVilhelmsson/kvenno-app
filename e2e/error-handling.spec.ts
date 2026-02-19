import { test, expect } from '@playwright/test';

/**
 * E2E tests for error states and resilience.
 *
 * Tests that the application handles invalid routes, bad parameters,
 * and edge cases gracefully without crashing or showing console errors.
 */
test.describe('Error handling — Invalid routes', () => {
  test('non-existent route shows content or redirects gracefully', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    // The server (npx serve -s) does SPA fallback, so it serves index.html for unknown routes.
    // We verify the page at least loads without crashing.
    expect(response).not.toBeNull();
    const status = response!.status();
    // Should be 200 (SPA fallback) or 404
    expect([200, 404]).toContain(status);

    // If 200, the SPA landing page should render
    if (status === 200) {
      await page.waitForLoadState('networkidle');
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('invalid efnafraedi year shows content without crashing', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/efnafraedi/99-ar');
    await page.waitForLoadState('networkidle');

    // The page should not crash — it should show some content
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // No JavaScript errors should be thrown
    expect(consoleErrors).toHaveLength(0);
  });

  test('invalid islenskubraut category shows error message', async ({ page }) => {
    await page.goto('/islenskubraut/spjald/nonexistent-category');
    await page.waitForLoadState('networkidle');

    // The SpjaldPage component shows "Flokkur fannst ekki" for invalid categories
    const errorMessage = page.locator('text=Flokkur fannst ekki');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });

    // A "Til baka" link should be available for recovery
    const backLink = page.locator('a', { hasText: 'Til baka' });
    await expect(backLink).toBeVisible();
  });

  test('main pages load without JavaScript errors during navigation', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through the main routes in sequence
    const routes = [
      '/',
      '/efnafraedi',
      '/efnafraedi/1-ar',
      '/efnafraedi/2-ar',
      '/efnafraedi/3-ar',
    ];

    for (const route of routes) {
      consoleErrors.length = 0;
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      expect(
        consoleErrors,
        `Console errors on ${route}: ${consoleErrors.join(', ')}`
      ).toHaveLength(0);
    }
  });
});
