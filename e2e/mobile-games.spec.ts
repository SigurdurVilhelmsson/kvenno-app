import { test, expect, type Page } from '@playwright/test';

import { GAME_SCREENS, type ScreenStep } from './mobile-game-screens';

/**
 * Every game, screen by screen, at phone width.
 *
 * The paths in mobile-game-screens.ts were recorded during the 2026-09 mobile
 * pass: for each game, one agent fixed the phone layout and a second replayed
 * every path from a fresh load and confirmed it ends on the screen it names.
 * This spec replays them and asserts the one thing a phone student cannot work
 * around — the page scrolling sideways, which hides the edge of every row.
 *
 * The step semantics must stay identical to the harness the paths were verified
 * with: `click` is a button, then a link, then any text containing the label,
 * and every step settles for 200 ms.
 *
 * No touch emulation: Firefox cannot emulate `isMobile`, and overflow is a
 * layout property, so a 360 px mouse viewport measures the same thing.
 */

const PHONE = { width: 360, height: 740 };

async function runStep(page: Page, step: ScreenStep): Promise<void> {
  if (step.click !== undefined) {
    await page
      .getByRole('button', { name: step.click })
      .or(page.getByRole('link', { name: step.click }))
      .or(page.getByText(step.click, { exact: false }))
      .first()
      .click();
  } else if (step.clickRole) {
    const [role, name] = step.clickRole;
    await page.getByRole(role, { name }).first().click();
  } else if (step.css !== undefined) {
    await page.locator(step.css).first().click();
  } else if (step.fill) {
    await page.locator(step.fill[0]).first().fill(step.fill[1]);
  } else if (step.press !== undefined) {
    await page.keyboard.press(step.press);
  } else if (step.wait !== undefined) {
    await page.waitForTimeout(step.wait);
  }
  await page.waitForTimeout(200);
}

function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

test.describe('Games at phone width', () => {
  test.describe.configure({ mode: 'parallel' });
  test.use({ viewport: PHONE });

  for (const [game, screens] of Object.entries(GAME_SCREENS)) {
    const [year, slug] = game.split('/');
    const url = `/efnafraedi/${year}/games/${slug}.html`;

    test(`${game}: menu fits and the back link is a 44 px target`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      expect(
        await horizontalOverflow(page),
        `Horizontal overflow on ${game} menu`
      ).toBeLessThanOrEqual(1);

      const back = await page
        .locator('header a')
        .first()
        .evaluate((el) => {
          const b = el.getBoundingClientRect();
          return { width: b.width, height: b.height };
        });
      expect(back.width).toBeGreaterThanOrEqual(44);
      expect(back.height).toBeGreaterThanOrEqual(44);
    });

    for (const screen of screens) {
      test(`${game}: ${screen.name}`, async ({ page }) => {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        for (const step of screen.steps) await runStep(page, step);

        expect(
          await horizontalOverflow(page),
          `Horizontal overflow on ${game} — ${screen.name}`
        ).toBeLessThanOrEqual(1);
      });
    }
  }
});
