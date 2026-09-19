import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * The Year-1 counterpart of `3-ar/syrufastinn`'s chain test.
 *
 * Every Y1 game prints the same `Námsleiðin` chain, and adding a node means
 * editing all of them — nine since `reynsluformulur` landed, and this test is
 * what made that edit safe: four of the nine wrap the string across lines. `CLAUDE.md`'s "Adding a new game" step 4 says so, and until
 * Sep 2026 only Year 3 enforced it — so Y1 had the rule written down, followed
 * by hand, and checked by nobody. Miss one game and a student sees two different
 * course maps depending on which tile they opened.
 *
 * This is deliberately a near-copy of the Y3 test rather than a shared helper.
 * The two chains differ in length and content, the file layouts differ (Y3 has
 * one game whose chain lives in `MenuScreen.tsx`), and a shared abstraction over
 * two call sites would be harder to read than the duplication. If Y2 gets one
 * too, that is the point to extract.
 *
 * The whitespace handling below is load-bearing and is explained inline — it
 * models how JSX renders the markup rather than merely collapsing it.
 */

const repoRoot = join(__dirname, '../../../../../..');

const CHAIN_FILES = [
  'apps/games/1-ar/dimensional-analysis/src/App.tsx',
  'apps/games/1-ar/lotukerfid/src/App.tsx',
  'apps/games/1-ar/nafnakerfid/src/App.tsx',
  'apps/games/1-ar/molmassi/src/App.tsx',
  'apps/games/1-ar/reynsluformulur/src/App.tsx',
  'apps/games/1-ar/jafna-jofnur/src/App.tsx',
  'apps/games/1-ar/takmarkandi/src/App.tsx',
  'apps/games/1-ar/lausnir/src/App.tsx',
  'apps/games/1-ar/einingakedjan/src/App.tsx',
];

const EXPECTED =
  'Einingagreining → Lotukerfið → Nafnakerfið → Mólmassi → Reynsluformúlur → Stilla efnajöfnur → Takmarkandi → Lausnir → Einingakeðjan';

const MARKER = '<strong>Námsleiðin:</strong>';

function chainOf(relative: string): string {
  const src = readFileSync(join(repoRoot, relative), 'utf8');
  const start = src.indexOf(MARKER);
  expect(start, `no chain string in ${relative}`).toBeGreaterThan(-1);
  const end = src.indexOf('</div>', start);
  const raw = src.slice(start + MARKER.length, end);

  // Model JSX whitespace rather than just collapsing it. A text child's leading
  // whitespace is dropped when it contains a newline, so `</u>` followed by a
  // newline and then `→` renders with NO space. Collapsing /\s+/ first would
  // silently insert a space JSX does not produce, and the test would then pass
  // over exactly the defect Prettier introduced in the Y3 chain.
  return (
    raw
      .replace(/(<\/?u>)\s*\n\s*/g, '$1')
      .replace(/<\/?u>/g, '')
      // An explicit {' '} is a real space and survives — which is why it is the
      // fix when a rewrap removes one.
      .replace(/\{' '\}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

describe('the Y1 Námsleiðin chain', () => {
  it.each(CHAIN_FILES)('%s prints the whole chain', (file) => {
    expect(chainOf(file)).toBe(EXPECTED);
  });

  it('marks exactly one node as the current game in each file', () => {
    for (const file of CHAIN_FILES) {
      const src = readFileSync(join(repoRoot, file), 'utf8');
      const start = src.indexOf(MARKER);
      const segment = src.slice(start, src.indexOf('</div>', start));
      expect(segment.match(/<u>/g)?.length, file).toBe(1);
    }
  });

  it('covers every game the build script emits for 1-ar', () => {
    // So a future game cannot be added to the build and quietly skip the chain.
    const build = readFileSync(join(repoRoot, 'scripts/build-games.mjs'), 'utf8');
    const emitted = [...build.matchAll(/\['1-ar', '([a-z-]+)'/g)].map((m) => m[1]);
    expect(emitted.length).toBe(CHAIN_FILES.length);
    for (const game of emitted) {
      expect(
        CHAIN_FILES.some((f) => f.includes(`/1-ar/${game}/`)),
        `${game} is built but has no chain-string entry here`
      ).toBe(true);
    }
  });
});
