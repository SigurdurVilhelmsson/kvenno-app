import { test, expect, type Page } from '@playwright/test';

import { GAME_SCREENS } from './mobile-game-screens';
import { runStep } from './screen-steps';

/**
 * Every game, screen by screen, at phone width.
 *
 * The paths in mobile-game-screens.ts were recorded during the 2026-09 mobile
 * pass: for each game, one agent fixed the phone layout and a second replayed
 * every path from a fresh load and confirmed it ends on the screen it names.
 * This spec replays them and asserts the one thing a phone student cannot work
 * around — the page scrolling sideways, which hides the edge of every row —
 * and, since every screen is already open, that no number on it is written
 * with a decimal point (see `decimalPoints`).
 *
 * The step semantics (screen-steps.ts) must stay identical to the harness the
 * paths were verified with: `click` is a button, then a link, then any text
 * containing the label, and every step settles for 200 ms.
 *
 * No touch emulation: Firefox cannot emulate `isMobile`, and overflow is a
 * layout property, so a 360 px mouse viewport measures the same thing.
 */

const PHONE = { width: 360, height: 740 };

/**
 * CI time: replaying all ~290 paths in both browsers took the E2E job from
 * about 2 minutes to 14. Chromium replays every path; Firefox replays each
 * game's menu and every fourth path, spread across all levels rather than only
 * the first screens. Firefox is here for its different text metrics, and a
 * sample on every level still exercises them.
 */
const FIREFOX_EVERY = 4;
const CHROMIUM_ONLY = '@chromium-only';

function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

/**
 * Every number on screen, with its context, that is written with a decimal
 * point. Icelandic writes `2,5`, and the games print through `formatDecimal`;
 * a full stop between two digits means one slipped past it. Checked on the
 * text a student sees, so it catches what a source scan cannot: a raw number
 * dropped into a sentence. All ~290 paths showed none on 2026-11-02 (1 554
 * decimals across 20 games, each with a comma).
 */
function decimalPoints(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.body.innerText.matchAll(/.{0,30}\d\.\d.{0,30}/g)].map((m) => m[0])
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
      expect(await decimalPoints(page), `Decimal point on ${game} menu`).toEqual([]);

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

    for (const [i, screen] of screens.entries()) {
      // Firefox replays every FIREFOX_EVERY-th path (and every menu), Chromium
      // all of them: see the firefox project's grepInvert in playwright.config.ts.
      const tag = i % FIREFOX_EVERY === 0 ? [] : [CHROMIUM_ONLY];
      test(`${game}: ${screen.name}`, { tag }, async ({ page }) => {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        for (const step of screen.steps) await runStep(page, step);

        expect(
          await horizontalOverflow(page),
          `Horizontal overflow on ${game} — ${screen.name}`
        ).toBeLessThanOrEqual(1);
        expect(await decimalPoints(page), `Decimal point on ${game} — ${screen.name}`).toEqual([]);
      });
    }
  }
});
