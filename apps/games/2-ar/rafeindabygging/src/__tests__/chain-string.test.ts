import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Every Y2 game prints the same `Námsleiðin` chain, and adding a node means
 * editing all eight — the Y3 equivalent lives in `3-ar/syrufastinn`, the Y1 one
 * in `1-ar/einingakedjan`.
 *
 * Until 2026-10-01 the Y2 chain was half English (`IMF`, `Hess`, `Kinetics`,
 * `Redox`, `Organic`) while Y1 and Y3 were Icelandic and guarded
 * (docs/plans/2026-09-23-mobile-pass-decisions.md, item 3). The nodes are now the
 * hub-card names from `apps/landing/src/pages/GamesHub.tsx`, so a student meets
 * one name per game; `VSEPR` keeps its acronym, as Y3 keeps `pH Títrun`.
 *
 * The strings are wrapped by Prettier at different points in each file, so the
 * comparison models JSX whitespace and strips the `<u>…</u>` that marks the
 * game you are currently in.
 */

const repoRoot = join(__dirname, '../../../../../..');

const CHAIN_FILES = [
  'apps/games/2-ar/rafeindabygging/src/App.tsx',
  'apps/games/2-ar/lewis-structures/src/App.tsx',
  'apps/games/2-ar/vsepr-geometry/src/App.tsx',
  'apps/games/2-ar/intermolecular-forces/src/App.tsx',
  'apps/games/2-ar/hess-law/src/App.tsx',
  'apps/games/2-ar/kinetics/src/App.tsx',
  'apps/games/2-ar/redox-reactions/src/App.tsx',
  'apps/games/2-ar/organic-nomenclature/src/App.tsx',
];

const EXPECTED =
  'Rafeindabygging → Lewis-formúlur → VSEPR → Millisameindakraftar → Lögmál Hess → ' +
  'Hvarfhraði → Oxun og afoxun → Lífræn nafnagift';

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

describe('the Y2 Námsleiðin chain', () => {
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

  it('names no node in English', () => {
    for (const file of CHAIN_FILES) {
      expect(chainOf(file), file).not.toMatch(/\b(IMF|Kinetics|Redox|Organic)\b|→ Hess →/);
    }
  });

  it('covers every game the build script emits for 2-ar', () => {
    // So a future game cannot be added to the build and quietly skip the chain.
    const build = readFileSync(join(repoRoot, 'scripts/build-games.mjs'), 'utf8');
    const emitted = [...build.matchAll(/\['2-ar', '([a-z-]+)'/g)].map((m) => m[1]);
    expect(emitted.length).toBe(CHAIN_FILES.length);
    for (const game of emitted) {
      expect(
        CHAIN_FILES.some((f) => f.includes(`/2-ar/${game}/`)),
        `${game} is built but has no chain-string entry here`
      ).toBe(true);
    }
  });
});
