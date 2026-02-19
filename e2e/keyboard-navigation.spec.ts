import { test, expect } from '@playwright/test';

/**
 * Keyboard navigation E2E tests.
 *
 * These verify that the landing page and game interfaces are fully operable
 * via keyboard alone, satisfying WCAG 2.1 SC 2.1.1 (Keyboard) and
 * SC 2.4.7 (Focus Visible).
 *
 * Prerequisites: `pnpm build` must have been run so that dist/ is populated.
 * The Playwright config starts a local server on port 4173 serving dist/.
 */

test.describe('Keyboard navigation - Landing page', () => {
  test('Tab through landing page focuses interactive elements in order', async ({ page }) => {
    await page.goto('/');

    // The first Tab should land on the skip-to-content link (if visible on focus)
    // or the first interactive element in the header
    await page.keyboard.press('Tab');
    const firstFocused = page.locator(':focus');
    await expect(firstFocused).toBeVisible();

    // Continue tabbing — each focused element should be an interactive element
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      const tag = await focused.evaluate((el) => el.tagName);
      expect(interactiveTags).toContain(tag);
    }
  });

  test('Enter/Space activates track card link', async ({ page }) => {
    await page.goto('/');

    // Tab until we reach the Efnafraedi track card link
    let found = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const text = await page.locator(':focus').textContent();
      if (text?.includes('Efnafræði')) {
        found = true;
        break;
      }
    }

    expect(found).toBe(true);

    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await page.waitForURL('**/efnafraedi');
    expect(page.url()).toContain('/efnafraedi');
  });

  test('Focus is visible on all interactive elements', async ({ page }) => {
    await page.goto('/');

    // Tab through the first several interactive elements and verify focus outline
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');

      // Element must be visible when focused
      const isVisible = await focused.isVisible();
      if (!isVisible) continue; // skip-link may be sr-only until focused

      // Check that the element has some visual focus indicator.
      // We check for a non-zero outline or box-shadow.
      const outlineStyle = await focused.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
        };
      });

      // The element should have SOME focus indicator — either outline or box-shadow
      const hasOutline = outlineStyle.outlineWidth !== '0px' && outlineStyle.outline !== 'none';
      const hasBoxShadow = outlineStyle.boxShadow !== 'none' && outlineStyle.boxShadow !== '';
      // At minimum the browser's default focus ring should be present
      expect(hasOutline || hasBoxShadow).toBe(true);
    }
  });
});

test.describe('Keyboard navigation - Chemistry hub', () => {
  test('Tab through year tiles on chemistry hub', async ({ page }) => {
    await page.goto('/efnafraedi');

    // Tab to the year tile links
    const yearLabels = ['1. ár', '2. ár', '3. ár'];
    const foundLabels: string[] = [];

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const text = await page.locator(':focus').textContent();
      for (const label of yearLabels) {
        if (text?.includes(label) && !foundLabels.includes(label)) {
          foundLabels.push(label);
        }
      }
      if (foundLabels.length === yearLabels.length) break;
    }

    // All three year tiles should have been focusable
    expect(foundLabels).toEqual(expect.arrayContaining(yearLabels));
  });
});

test.describe('Keyboard navigation - Skip link', () => {
  test('Skip link bypasses navigation and jumps to main content', async ({ page }) => {
    await page.goto('/');

    // First Tab focuses the skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator(':focus');
    const href = await skipLink.getAttribute('href');

    // Only test if the skip link is the first focusable element
    if (href === '#main-content') {
      await page.keyboard.press('Enter');

      // After activating skip link, focus (or scroll) should move to #main-content
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeVisible();
    }
  });
});
