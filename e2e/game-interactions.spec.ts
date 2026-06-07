import { test, expect } from '@playwright/test';

test.describe('Game interaction tests', () => {
  test('molmassi — loads and shows level menu', async ({ page }) => {
    await page.goto('/efnafraedi/1-ar/games/molmassi.html');
    await page.waitForLoadState('networkidle');

    // Post-April-2026 restructure: the menu opens directly to level cards
    // (no separate "byrja/spila" entry button).
    const levelButton = page.locator('button').filter({ hasText: /level|stig|mól/i });
    await expect(levelButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('molmassi — can enter a level', async ({ page }) => {
    await page.goto('/efnafraedi/1-ar/games/molmassi.html');
    await page.waitForLoadState('networkidle');

    // Click the first level card; clicking it should navigate into level 1.
    const firstLevel = page
      .locator('button')
      .filter({ hasText: /level|stig|mól/i })
      .first();
    await firstLevel.click();

    // The menu uses h2 for level cards and has no h1; every level screen
    // renders a "Til baka" back button — assert it appears, which is the
    // most stable indicator that we've left the menu.
    await expect(page.getByRole('button', { name: /Til baka/i })).toBeVisible({ timeout: 10000 });
  });

  test('ph-titration — loads and shows pH display', async ({ page }) => {
    await page.goto('/efnafraedi/3-ar/games/ph-titration.html');
    await page.waitForLoadState('networkidle');

    // The pH titration game should show pH-related content
    const phContent = page.locator('text=/pH|[Tt]itration|[Ss]ýrustig/');
    await expect(phContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('equilibrium-shifter — loads and shows game content', async ({ page }) => {
    await page.goto('/efnafraedi/3-ar/games/equilibrium-shifter.html');
    await page.waitForLoadState('networkidle');

    // Should show equilibrium-related content
    const content = page.locator('text=/[Jj]afnvægi|[Ee]quilibrium|Le Chatelier/');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('equilibrium-shifter — can enter learning mode', async ({ page }) => {
    await page.goto('/efnafraedi/3-ar/games/equilibrium-shifter.html');
    await page.waitForLoadState('networkidle');

    // Look for a mode selection or start button
    const modeButton = page.locator('button', {
      hasText: /byrja|spila|æfing|kennsla|learning|start/i,
    });
    if (
      await modeButton
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await modeButton.first().click();

      // After clicking, game content should be present
      const gameArea = page.locator('[class*="game"], [class*="reaction"], main');
      await expect(gameArea.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('games have no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test a representative sample of games
    const gameUrls = [
      '/efnafraedi/1-ar/games/molmassi.html',
      '/efnafraedi/2-ar/games/lewis-structures.html',
      '/efnafraedi/3-ar/games/equilibrium-shifter.html',
    ];

    for (const url of gameUrls) {
      consoleErrors.length = 0;
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      expect(consoleErrors, `Console errors on ${url}`).toHaveLength(0);
    }
  });
});
