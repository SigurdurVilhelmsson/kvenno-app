import { test, expect } from '@playwright/test';

/**
 * E2E tests for mobile viewport rendering.
 *
 * Tests that the main pages render correctly on a mobile-sized viewport
 * (iPhone SE dimensions: 375x667) without horizontal overflow or layout issues.
 */
test.describe('Mobile viewport tests', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('landing page renders and track cards are visible on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Main heading should be visible
    await expect(page.locator('h1').first()).toBeVisible();

    // Track cards live in <main>; the sidebar nav also references these names
    // but may be collapsed on a 375px viewport, so scope to the main region.
    const main = page.locator('main');
    await expect(main.locator('text=Efnafræði').first()).toBeVisible();
    await expect(main.locator('text=Íslenskubraut').first()).toBeVisible();
  });

  test('chemistry hub year cards are visible on small screen', async ({ page }) => {
    await page.goto('/efnafraedi');
    await page.waitForLoadState('networkidle');

    // Hub title should be visible
    await expect(page.locator('h1')).toContainText('Efnafræði');

    // Year tiles should be visible
    await expect(page.locator('text=1. ár').first()).toBeVisible();
    await expect(page.locator('text=2. ár').first()).toBeVisible();
    await expect(page.locator('text=3. ár').first()).toBeVisible();
  });

  test('game menu loads correctly on mobile viewport', async ({ page }) => {
    await page.goto('/efnafraedi/1-ar/games/molmassi.html');
    await page.waitForLoadState('networkidle');

    // Game title/heading should be visible
    const gameContent = page.locator('h1, h2, button').first();
    await expect(gameContent).toBeVisible({ timeout: 10000 });

    // Level buttons should be visible
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('no horizontal overflow on main pages', async ({ page }) => {
    const pagesToCheck = [
      '/',
      '/efnafraedi',
      '/efnafraedi/1-ar',
      '/efnafraedi/1-ar/games/',
      '/efnafraedi/2-ar/games/',
      '/efnafraedi/3-ar/games/',
      '/islenskubraut/',
    ];

    for (const url of pagesToCheck) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Check that body scrollWidth does not exceed viewport width (with small tolerance)
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5;
      });

      expect(hasHorizontalOverflow, `Horizontal overflow detected on ${url}`).toBe(false);
    }
  });
});

/**
 * The route a student takes to a game, at the narrowest supported phone.
 *
 * 320px is where the long one-word game titles bite: "Millisameindakraftar" on
 * the 2-ar games hub pushed the whole page sideways until the cards stepped
 * down their padding and title size below md:.
 */
test.describe('Hub pages at 320px', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  const hubs = [
    '/',
    '/efnafraedi',
    '/efnafraedi/1-ar',
    '/efnafraedi/2-ar',
    '/efnafraedi/3-ar',
    '/efnafraedi/f-bekkir',
    '/efnafraedi/1-ar/games/',
    '/efnafraedi/2-ar/games/',
    '/efnafraedi/3-ar/games/',
  ];

  for (const url of hubs) {
    test(`${url} has no horizontal overflow`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `Horizontal overflow on ${url}`).toBeLessThanOrEqual(1);
    });
  }

  test('the phone tab bar never covers the footer', async ({ page }) => {
    await page.goto('/efnafraedi/1-ar/games/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

    const navTop = await page
      .getByRole('navigation', { name: 'Aðalfletting' })
      .evaluate((el) => el.getBoundingClientRect().top);
    const footerBottom = await page
      .locator('footer p')
      .last()
      .evaluate((el) => el.getBoundingClientRect().bottom);
    expect(footerBottom).toBeLessThanOrEqual(navTop);
  });
});
