import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Every Y3 game prints the same `Námsleiðin` chain, and adding a node means
 * editing all of them.
 *
 * `CLAUDE.md`'s "Adding a new game" step 4 says so, and nothing enforced it —
 * which is precisely the shape of defect this repo keeps finding: a rule written
 * down, followed once, and then silently half-applied. Miss one game and a
 * student sees two different course maps depending on which tile they opened.
 *
 * The strings are wrapped by Prettier at different points in each file, so the
 * comparison normalises whitespace and strips the `<u>…</u>` that marks the
 * game you are currently in.
 */

const repoRoot = join(__dirname, '../../../../../..');

const CHAIN_FILES = [
  'apps/games/3-ar/gas-law-challenge/src/components/MenuScreen.tsx',
  'apps/games/3-ar/equilibrium-shifter/src/App.tsx',
  'apps/games/3-ar/syrufastinn/src/App.tsx',
  'apps/games/3-ar/thermodynamics-predictor/src/App.tsx',
  'apps/games/3-ar/ph-titration/src/App.tsx',
  'apps/games/3-ar/buffer-recipe-creator/src/App.tsx',
];

const EXPECTED = 'Gaslögmál → Jafnvægi → Sýrufastinn → Varmafræði → pH Títrun → Stuðpúðar';

function chainOf(relative: string): string {
  const src = readFileSync(join(repoRoot, relative), 'utf8');
  const start = src.indexOf('<strong>Námsleiðin:</strong>');
  expect(start, `no chain string in ${relative}`).toBeGreaterThan(-1);
  const end = src.indexOf('</div>', start);
  const raw = src.slice(start + '<strong>Námsleiðin:</strong>'.length, end);

  // Model JSX whitespace rather than just collapsing it. A text child's leading
  // whitespace is dropped when it contains a newline, so `</u>` followed by a
  // newline and then `→` renders with NO space — which is exactly the defect
  // Prettier introduced in thermodynamics-predictor when it rewrapped this line.
  // Collapsing /\s+/ first would silently insert the space JSX does not.
  return (
    raw
      // Element followed by a newline then text: JSX drops that whitespace
      // entirely, so the two render flush against each other. Do this BEFORE
      // collapsing, or the collapse inserts a space JSX never produces.
      .replace(/(<\/?u>)\s*\n\s*/g, '$1')
      .replace(/<\/?u>/g, '')
      // An explicit {' '} is a real space and survives — which is exactly why
      // it is the fix for the case above.
      .replace(/\{' '\}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

describe('the Y3 Námsleiðin chain', () => {
  it.each(CHAIN_FILES)('%s prints the whole chain', (file) => {
    expect(chainOf(file)).toBe(EXPECTED);
  });

  it('marks exactly one node as the current game in each file', () => {
    for (const file of CHAIN_FILES) {
      const src = readFileSync(join(repoRoot, file), 'utf8');
      const start = src.indexOf('<strong>Námsleiðin:</strong>');
      const segment = src.slice(start, src.indexOf('</div>', start));
      expect(segment.match(/<u>/g)?.length, file).toBe(1);
    }
  });

  it('covers every game the build script emits for 3-ar', () => {
    // So a future game cannot be added to the build and quietly skip the chain.
    const build = readFileSync(join(repoRoot, 'scripts/build-games.mjs'), 'utf8');
    const emitted = [...build.matchAll(/\['3-ar', '([a-z-]+)'/g)].map((m) => m[1]);
    expect(emitted.length).toBe(CHAIN_FILES.length);
    for (const game of emitted) {
      expect(
        CHAIN_FILES.some((f) => f.includes(`/3-ar/${game}/`)),
        `${game} is built but has no chain-string entry here`
      ).toBe(true);
    }
  });
});
