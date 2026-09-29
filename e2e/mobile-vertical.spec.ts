import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { test, expect } from '@playwright/test';

import { GAME_SCREENS } from './mobile-game-screens';
import { describeVerticalLoops } from './mobile-vertical-checks';
import { runStep } from './screen-steps';

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
    file: 'apps/games/1-ar/einingakedjan/src/components/ChainBuilder.tsx',
    component: 'TaskStrip',
    measured:
      "Æfa and Beita, 'Keðjan þín' (named in design §4, the one accepted exception to the " +
      '120 px budget), 360x640 touch, the base build: Beita B1 with its three cards placed ' +
      'wrapped the chain onto three rows, heading at page y 564 and chain to y 1015, with ' +
      'the pool at 1191-1831, so the chain and the card being picked were never on screen ' +
      'together and every tap jumped the page up to the chain. After compaction the chain is ' +
      'one sideways-scrolling row, 72 px pinned; with the bar 137 px together at 360x640 and ' +
      '375x548, 132 at 390x664 and 155 at 320x640, inside the 28 % budget at each. No text ' +
      'input on the screen. It holds the chain only: no verdict, and in Æfa the unit it ends ' +
      'on is not shown, since the prediction asks for it.',
  },
  {
    file: 'apps/games/1-ar/einingakedjan/src/components/ChainBuilder.tsx',
    component: 'PinnedActions',
    measured:
      'Æfa and Beita, same measurement: on the base build Leysa sat at page y 1031 under the ' +
      'three-row chain, 160 px above the pool it follows and 800 px above the last pool card, ' +
      'so a student picking from the pool scrolled a screen back up to press it. On a ' +
      'portrait phone the actions now follow the pool (moved in the DOM, so the tab order is ' +
      'what is seen) and pin at the foot of the chain card, 60-83 px. A choice screen, no text ' +
      'input; the bar leaves with the board when Leysa is pressed, so it never sits over the ' +
      'worked solution or its feedback.',
  },
  {
    file: 'apps/games/1-ar/utfellingarhvorf/src/components/AefaScreen.tsx',
    component: 'PinnedActions',
    measured:
      'Æfa, after compaction (the verdict pair inside the compound card, rules py-1.5) and ' +
      'anchoring, 360x640 touch, all ten compounds of a run: the compound to Athuga, unpinned, ' +
      'is 602-622 px against 584 px of screen under the header (Athuga at y 766-786 on ' +
      'arrival), and 582 against 492 on the SE; base, two scrolls. A choice screen, no text ' +
      'input. The bar holds Athuga only and leaves with it on commit, so it never sits over ' +
      'the feedback.',
  },
  {
    file: 'apps/games/3-ar/jafnvaegisfasti/src/components/AefaScreen.tsx',
    component: 'TaskStrip',
    measured:
      'Æfa, Tengd jafnvægi (named in design §4), 360x640 touch, the two-given problem ' +
      '(ammoniak-jod): on the base build the Markjafnan box sat at page y 340-508 and the ' +
      'equation being built at 900-1004, under the givens, so the two were never on screen ' +
      'together. After compaction the built equation sits under the target on a phone and ' +
      'the strip holding both is 170 px, inside the 28 % budget at 360x640 and 390x664 (it ' +
      'stays in the flow on the SE, 375x548). Pinned only in the operations stage: the ' +
      'constant stage has a text input, and the strip leaves before it opens.',
  },
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
    file: 'apps/games/1-ar/stilla-efnajofnur/src/components/Level.tsx',
    component: 'PinnedActions',
    measured:
      'All three levels, after compaction and anchoring, 375x548 touch (the SE), all 20 ' +
      'equations: unpinned, Athuga ends at page y 582-688 on 13 of them (every Stig 3 ' +
      'equation, six of seven in Stig 2 and Li + H2O in Stig 1), 34-140 px below the ' +
      'screen, while at 360x640 and 390x664 it fits on 19 of 20. Named for the SE in ' +
      'design §4, so it pins only on a portrait phone at most 600 px tall. No text ' +
      'input; the bar holds Athuga | Vísbending only and leaves with them on commit, so ' +
      'it never sits over feedback.',
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
  {
    file: 'apps/games/2-ar/lewis-structures/src/components/LewisDrawingCanvas.tsx',
    component: 'PinnedActions',
    measured:
      'Stig 2 drawing board, after compaction (board capped at 42dvh, the electron count merged ' +
      'into the lone-pair heading, tighter lone-pair rows) and anchoring, touch, all nine ' +
      'molecules: on arrival Athuga, unpinned, ends at page y 721-1035 at 360x640 (81-395 px ' +
      'below the screen), 687-1045 at 390x664 and 654-996 at 375x548. Title to Athuga is ' +
      '595-937 px at 360x640 and 556-898 px at 375x548, over the screen for CO2, BF3, PCl5 and ' +
      'SF6 at 360x640 and for every molecule on the SE. No text input. The bar holds ' +
      'Hreinsa | Athuga with the electrons left as status, and leaves with the board once the ' +
      "drawing is right, so it never sits over the result; a wrong drawing's list opens above it.",
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

/**
 * No word breaks mid-letter at 320 px (the Outcome's claim for 320–390 px). The
 * sideways-scroll checks cannot see this: `overflow-wrap: break-word` keeps the
 * page inside the screen by splitting the word. Each entry is a recorded screen
 * where a phone-only one-line row once did exactly that; add one whenever a
 * compacted row is found splitting a word.
 */
const MID_WORD_SCREENS: { game: string; screen: string; why: string }[] = [
  {
    game: '2-ar/hess-law',
    screen: 'Stig 3 — tafla og vísbending',
    why:
      'The ΔH°f table folds each compound onto one line on a phone; at 320x640 ' +
      "'Koldíoxíð (fljótandi)' broke as Koldíoxí|ð until the row wrapped below 340 px.",
  },
];

/** Every place where a text node wraps between two letters, as `before|after in <tag.class>`. */
function midWordBreaks(): string[] {
  const out: string[] = [];
  const letter = /\p{L}/u;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent ?? '';
    const el = n.parentElement;
    if (text.trim().length < 2 || !el || !el.checkVisibility()) continue;
    const range = document.createRange();
    let prevTop: number | null = null;
    for (let i = 0; i < text.length; i++) {
      range.setStart(n, i);
      range.setEnd(n, i + 1);
      const rects = range.getClientRects();
      if (!rects.length) continue;
      const top = rects[0].top;
      if (
        prevTop !== null &&
        top > prevTop + 2 &&
        letter.test(text[i]) &&
        letter.test(text[i - 1])
      ) {
        out.push(
          `${text.slice(Math.max(0, i - 12), i)}|${text.slice(i, i + 6)} in <${el.tagName.toLowerCase()}.${[...el.classList].join('.')}>`
        );
      }
      prevTop = top;
    }
  }
  return out;
}

test.describe('no mid-word breaks at 320 px', () => {
  test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true });
  for (const { game, screen: name } of MID_WORD_SCREENS) {
    test(`${game}: ${name}`, { tag: '@chromium-only' }, async ({ page }) => {
      const screen = GAME_SCREENS[game]?.find((s) => s.name === name);
      expect(screen, `No recorded screen ${game} — ${name}`).toBeTruthy();
      const [year, slug] = game.split('/');
      await page.goto(`/efnafraedi/${year}/games/${slug}.html`);
      await page.waitForLoadState('networkidle');
      for (const step of screen!.steps) await runStep(page, step);
      expect(await page.evaluate(midWordBreaks), `Mid-word breaks — ${game}: ${name}`).toEqual([]);
    });
  }
});
