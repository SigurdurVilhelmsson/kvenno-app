import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { test, expect } from '@playwright/test';

import { GAME_SCREENS } from './mobile-game-screens';
import { describeVerticalLoops } from './mobile-vertical-checks';

/**
 * Vertical scrolling on phones: every play loop recorded in
 * mobile-game-screens.ts (a screen's optional `loop`) is held to the
 * guarantees of docs/plans/2026-09-23-vertical-scroll-design.md §6.2 — the
 * screen opens at its heading, the action is on screen, the verdict and Næsta
 * land on screen after a raw tap with focus in the feedback, a double Enter or
 * double tap never skips the feedback, pins never hide focus or eat the screen,
 * typed screens carry no pins, landscape stays usable, and the page never
 * scrolls sideways. The checks live in mobile-vertical-checks.ts.
 *
 * Chromium runs every loop at every viewport the loop names, plus the anti-skip,
 * typed, landscape and 844×390 smoke runs. Firefox has no touch emulation and
 * replays one loop per game (see the firefox project's grepInvert in
 * playwright.config.ts).
 */
describeVerticalLoops(GAME_SCREENS);

/**
 * §6.2.11 — where a pinned `TaskStrip` or `PinnedActions` may be used. P8 allows
 * a pin only after compaction and anchoring have been measured and the primary
 * action is still more than a screen from its question. Each entry names the
 * file (and so the game and screen) and the measurement that justified it; the
 * list only shrinks, or grows in the same change as that measurement.
 */
const PIN_USES: { file: string; component: 'TaskStrip' | 'PinnedActions'; measured: string }[] = [
  {
    file: 'apps/games/2-ar/hess-law/src/components/Level2.tsx',
    component: 'TaskStrip',
    measured:
      'Stig 2, after compaction and anchoring, 360x640 touch, one equation chosen: the ' +
      'Markmiðsjafna box at y 234 and Athuga lausn at y 1230, about 1 000 px apart. The ' +
      'target and the running ΔH were never on screen together (design §1.2, §4 Phase 1).',
  },
  {
    file: 'apps/games/2-ar/hess-law/src/components/Level2.tsx',
    component: 'PinnedActions',
    measured:
      'Stig 2, same measurement: Athuga lausn about 1 000 px below the target, more than a ' +
      'screen. No text input, and the verdict is one short line. Carries Heildar-ΔH as status.',
  },
  {
    file: 'apps/games/2-ar/organic-nomenclature/src/components/Level2.tsx',
    component: 'PinnedActions',
    measured:
      'Stig 2 name builder, drag mode, after compaction, the fitted molecule and anchoring, ' +
      '360x640 touch, the first seven molecules: the screen opens at its heading with the ' +
      'molecule at y 152 and Athuga svar, unpinned, 625-747 px below it (its bottom at y ' +
      '777-899), so the molecule and its action are never on screen together without a ' +
      'scroll. No text input: the typed mode renders the same row unpinned. The bar holds ' +
      'Vísbending | Athuga only and leaves with them on commit, so it never sits over feedback.',
  },
];

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

function gameSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      return e.name === 'node_modules' || e.name === '__tests__' ? [] : gameSources(p);
    }
    return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : [];
  });
}

test(
  'pinned regions are used only where a measurement allowed them',
  { tag: '@chromium-only' },
  () => {
    const found: string[] = [];
    const gamesRoot = join(repoRoot, 'apps', 'games');
    for (const year of readdirSync(gamesRoot).filter((y) => /^\d-ar$/.test(y))) {
      for (const game of readdirSync(join(gamesRoot, year), { withFileTypes: true })) {
        if (!game.isDirectory()) continue;
        let files: string[];
        try {
          files = gameSources(join(gamesRoot, year, game.name, 'src'));
        } catch {
          continue;
        }
        for (const file of files) {
          const text = readFileSync(file, 'utf8');
          for (const component of ['TaskStrip', 'PinnedActions'] as const) {
            const uses = text.match(new RegExp(`<${component}\\b`, 'g'))?.length ?? 0;
            for (let i = 0; i < uses; i++) {
              found.push(`${relative(repoRoot, file)} ${component}`);
            }
          }
        }
      }
    }
    const allowed = PIN_USES.map((u) => `${u.file} ${u.component}`);
    expect(found.sort(), 'Every pin needs an entry in PIN_USES, and no entry may go stale').toEqual(
      allowed.sort()
    );
  }
);
