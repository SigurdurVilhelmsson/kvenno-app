import { test, expect } from '@playwright/test';

test.describe('Smoke tests — HTTP responses', () => {
  test('landing page returns 200', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
  });

  test('chemistry hub returns 200', async ({ request }) => {
    const response = await request.get('/efnafraedi/');
    expect(response.status()).toBe(200);
  });

  test('islenskubraut returns 200', async ({ request }) => {
    const response = await request.get('/islenskubraut/');
    expect(response.status()).toBe(200);
  });
});

test.describe('Smoke tests — Game HTML files', () => {
  test('molmassi game HTML is accessible', async ({ request }) => {
    const response = await request.get('/efnafraedi/1-ar/games/molmassi.html');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<!DOCTYPE html>');
  });

  test('nafnakerfid game HTML is accessible', async ({ request }) => {
    const response = await request.get('/efnafraedi/1-ar/games/nafnakerfid.html');
    expect(response.status()).toBe(200);
  });

  test('lewis-structures game HTML is accessible', async ({ request }) => {
    const response = await request.get('/efnafraedi/2-ar/games/lewis-structures.html');
    expect(response.status()).toBe(200);
  });

  test('ph-titration game HTML is accessible', async ({ request }) => {
    const response = await request.get('/efnafraedi/3-ar/games/ph-titration.html');
    expect(response.status()).toBe(200);
  });
});

test.describe('Smoke tests — Static assets', () => {
  test('landing page loads CSS and JS assets', async ({ page }) => {
    const failedRequests: string[] = [];
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto('/');
    // Wait for the page to finish loading
    await page.waitForLoadState('networkidle');

    // No critical asset requests should have failed
    const criticalFailures = failedRequests.filter(
      (url) => url.endsWith('.js') || url.endsWith('.css')
    );
    expect(criticalFailures).toHaveLength(0);
  });

  test('islenskubraut page loads assets without errors', async ({ page }) => {
    const failedRequests: string[] = [];
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto('/islenskubraut/');
    await page.waitForLoadState('networkidle');

    const criticalFailures = failedRequests.filter(
      (url) => url.endsWith('.js') || url.endsWith('.css')
    );
    expect(criticalFailures).toHaveLength(0);
  });
});

test.describe('Smoke tests — No console errors on critical pages', () => {
  test('landing page has no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('chemistry hub has no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/efnafraedi');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe('Smoke tests — Mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('landing page works on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Main heading should be visible
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('landing page has no console errors on mobile', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('chemistry hub works on mobile', async ({ page }) => {
    await page.goto('/efnafraedi/');
    await page.waitForLoadState('networkidle');

    // Page body should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('islenskubraut works on mobile', async ({ page }) => {
    await page.goto('/islenskubraut/');
    await page.waitForLoadState('networkidle');

    // Page body should be visible
    await expect(page.locator('body')).toBeVisible();
  });
});
