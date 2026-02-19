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

test.describe('Performance smoke tests — Load times', () => {
  test('landing page loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { timeout: 5000 });
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Verify the page actually rendered
    await expect(page.locator('h1').first()).toBeVisible();

    // Load time should be under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('game HTML files respond within 5 seconds', async ({ page }) => {
    const gameUrls = [
      '/efnafraedi/1-ar/games/molmassi.html',
      '/efnafraedi/2-ar/games/lewis-structures.html',
      '/efnafraedi/3-ar/games/ph-titration.html',
    ];

    for (const url of gameUrls) {
      const startTime = Date.now();
      const response = await page.goto(url, { timeout: 5000 });
      const loadTime = Date.now() - startTime;

      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);
      expect(loadTime, `${url} took ${loadTime}ms to load`).toBeLessThan(5000);
    }
  });

  test('no JavaScript errors in console on main pages', async ({ page }) => {
    const pages = [
      '/',
      '/efnafraedi',
      '/efnafraedi/1-ar',
      '/islenskubraut/',
    ];

    for (const url of pages) {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(url);
      await page.waitForLoadState('networkidle');

      expect(
        consoleErrors,
        `JavaScript errors on ${url}: ${consoleErrors.join('; ')}`
      ).toHaveLength(0);

      // Remove the listener for the next iteration
      page.removeAllListeners('console');
    }
  });

  test('all critical CSS and JS assets return 200', async ({ page }) => {
    const assetStatuses: { url: string; status: number }[] = [];

    page.on('response', (response) => {
      const url = response.url();
      if (url.endsWith('.js') || url.endsWith('.css')) {
        assetStatuses.push({ url, status: response.status() });
      }
    });

    // Load the landing page and islenskubraut (two separate SPAs)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.goto('/islenskubraut/');
    await page.waitForLoadState('networkidle');

    // All captured asset responses should be 200
    for (const asset of assetStatuses) {
      expect(
        asset.status,
        `Asset ${asset.url} returned ${asset.status}`
      ).toBe(200);
    }

    // We should have captured at least some assets
    expect(assetStatuses.length).toBeGreaterThan(0);
  });
});
