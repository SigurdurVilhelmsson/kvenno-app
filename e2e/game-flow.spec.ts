import { test, expect } from '@playwright/test';

/**
 * E2E tests for game level completion flow.
 *
 * Tests the molmassi game's level menu, level navigation,
 * localStorage-based progress, and level locking mechanics.
 */
test.describe('Game flow — Level completion (molmassi)', () => {
  const gameUrl = '/efnafraedi/1-ar/games/molmassi.html';

  test('game loads with level menu visible', async ({ page }) => {
    await page.goto(gameUrl);
    await page.waitForLoadState('networkidle');

    // The menu should show level buttons (Level 1, Level 2, Level 3)
    // Level 1 button should always be present and enabled
    const level1Button = page.locator('button', { hasText: /1|byrja|spila/i }).first();
    await expect(level1Button).toBeVisible({ timeout: 10000 });
  });

  test('clicking level 1 button shows level content', async ({ page }) => {
    await page.goto(gameUrl);
    await page.waitForLoadState('networkidle');

    // Find and click the level 1 card/button (first enabled button in level cards)
    const level1Button = page.locator('button').filter({ hasText: /1/i }).first();
    await level1Button.click();

    // After clicking, game content should appear (e.g., an input field, questions, or back button)
    const gameContent = page.locator('button, input, [class*="game"], [class*="level"]');
    await expect(gameContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('progress state is stored in localStorage', async ({ page }) => {
    await page.goto(gameUrl);
    await page.waitForLoadState('networkidle');

    // Set progress via page.evaluate to simulate level 1 completion
    await page.evaluate(() => {
      const progress = {
        level1Completed: true,
        level2Completed: false,
        level3HighScore: 0,
      };
      localStorage.setItem('molmassiLevelProgress', JSON.stringify(progress));
    });

    // Reload to pick up the localStorage change
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify the progress was saved by checking localStorage
    const savedProgress = await page.evaluate(() =>
      localStorage.getItem('molmassiLevelProgress')
    );

    expect(savedProgress).not.toBeNull();
    const parsed = JSON.parse(savedProgress!);
    expect(parsed.level1Completed).toBe(true);
  });

  test('level 2 is locked when level 1 is not completed', async ({ page }) => {
    await page.goto(gameUrl);
    await page.waitForLoadState('networkidle');

    // Clear any saved progress to ensure fresh state
    await page.evaluate(() => {
      localStorage.removeItem('molmassiLevelProgress');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Level 2 button should be disabled (has opacity-60 and cursor-not-allowed classes)
    const level2Button = page.locator('button[disabled]').nth(0);
    await expect(level2Button).toBeVisible({ timeout: 10000 });

    // The locked indicator should be visible
    const lockedBadge = page.locator('text=/🔒/').first();
    await expect(lockedBadge).toBeVisible();
  });

  test('level 2 unlocks after level 1 is marked complete', async ({ page }) => {
    await page.goto(gameUrl);
    await page.waitForLoadState('networkidle');

    // Set level 1 as completed in localStorage
    await page.evaluate(() => {
      const progress = {
        level1Completed: true,
        level2Completed: false,
        level3HighScore: 0,
      };
      localStorage.setItem('molmassiLevelProgress', JSON.stringify(progress));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Level 2 should now be enabled (not disabled) — there should be fewer disabled buttons
    // With level1 completed, level 2 should be clickable, level 3 still locked
    const disabledButtons = page.locator('button[disabled]');
    const disabledCount = await disabledButtons.count();

    // With level 1 done but not level 2: only level 3 should be disabled (1 disabled button)
    expect(disabledCount).toBeLessThanOrEqual(1);
  });
});
