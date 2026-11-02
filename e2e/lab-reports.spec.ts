import { test, expect } from '@playwright/test';

test.describe('Lab Reports — 2nd Year', () => {
  // Paused until its rewrite (Siggi, 2026-11-02): apps/lab-reports/src/config/paused.ts.
  test('says the tool is paused and links back to the 2-ar hub', async ({ page }) => {
    await page.goto('/efnafraedi/2-ar/lab-reports/');
    await expect(page.getByRole('heading', { level: 1, name: 'Tilraunarskýrslur' })).toBeVisible();
    await expect(page.getByText(/Verkfærið er í hléi/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Til baka' })).toHaveAttribute(
      'href',
      '/efnafraedi/2-ar/'
    );
  });

  test('loads the 2-ar lab reports page', async ({ page }) => {
    await page.goto('/efnafraedi/2-ar/lab-reports/');

    // The page should load without errors
    await expect(page).toHaveTitle(/.*/);

    // Check for key UI elements (header or main content area)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('2-ar lab reports page has no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/efnafraedi/2-ar/lab-reports/');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('2-ar lab reports page loads CSS and JS assets', async ({ page }) => {
    const failedRequests: string[] = [];
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto('/efnafraedi/2-ar/lab-reports/');
    await page.waitForLoadState('networkidle');

    const criticalFailures = failedRequests.filter(
      (url) => url.endsWith('.js') || url.endsWith('.css')
    );
    expect(criticalFailures).toHaveLength(0);
  });
});

test.describe('Lab Reports — 3rd Year', () => {
  // Paused until its rewrite (Siggi, 2026-11-02): apps/lab-reports/src/config/paused.ts.
  test('says the tool is paused and links back to the 3-ar hub', async ({ page }) => {
    await page.goto('/efnafraedi/3-ar/lab-reports/');
    await expect(page.getByRole('heading', { level: 1, name: 'Tilraunarskýrslur' })).toBeVisible();
    await expect(page.getByText(/Verkfærið er í hléi/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Til baka' })).toHaveAttribute(
      'href',
      '/efnafraedi/3-ar/'
    );
  });

  test('loads the 3-ar lab reports page', async ({ page }) => {
    await page.goto('/efnafraedi/3-ar/lab-reports/');

    // The page should load without errors
    await expect(page).toHaveTitle(/.*/);

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('3-ar lab reports page has no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/efnafraedi/3-ar/lab-reports/');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('3-ar lab reports page loads CSS and JS assets', async ({ page }) => {
    const failedRequests: string[] = [];
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto('/efnafraedi/3-ar/lab-reports/');
    await page.waitForLoadState('networkidle');

    const criticalFailures = failedRequests.filter(
      (url) => url.endsWith('.js') || url.endsWith('.css')
    );
    expect(criticalFailures).toHaveLength(0);
  });
});
