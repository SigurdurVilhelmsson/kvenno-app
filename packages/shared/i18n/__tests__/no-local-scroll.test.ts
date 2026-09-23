import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * No game scrolls the page by itself: scrolling goes through `@shared/utils`
 * (`revealSpan`, `revealTop`, `revealInline`, `useScreenTop`, `useItemTop`,
 * `usableArea`) — docs/plans/2026-09-23-vertical-scroll-design.md §6.4.
 *
 * **Why this exists.** Before the vertical-scroll pass, sixteen games carried
 * their own reveal/scroll helper, each with its own idea of the sticky header,
 * and most of them moved the page at any width. A guard on helper *names* cannot
 * catch the next copy — it already missed thirteen of the names shipping — so
 * this guards the *calls*: no non-test file under `apps/games/<year>/<game>/src`
 * may call `scrollIntoView`, `scrollTo` or `scrollBy`, assign `scrollTop`, or
 * read `innerHeight` (the usable height is `usableArea()`, which subtracts the
 * header and pins and follows the soft keyboard).
 *
 * **The allow-list only shrinks.** It holds today's files and how many calls
 * each makes. A file not on it may make none; a file on it may not make more.
 * When a migration removes calls, the test fails until the count here is
 * lowered (or the entry deleted), so the list cannot silently go stale and
 * leave room for a new call.
 *
 * Comments are stripped before scanning, so a comment explaining why a game
 * does not call one of these is not a call.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');
const gamesRoot = join(repoRoot, 'apps', 'games');

/** Calls per file on 2026-09-23, relative to apps/games. Lower these; never raise them. */
const ALLOWED: Record<string, number> = {
  '1-ar/einingakedjan/src/utils/reveal.ts': 3,
  '1-ar/jafna-jofnur/src/App.tsx': 1,
  '1-ar/jafna-jofnur/src/components/Level.tsx': 2,
  '1-ar/lausnir/src/App.tsx': 1,
  '1-ar/lausnir/src/utils/reveal.ts': 1,
  '1-ar/lotukerfid/src/components/PeriodicTable.tsx': 1,
  '1-ar/lotukerfid/src/utils/phoneScroll.ts': 2,
  '1-ar/nafnakerfid/src/utils/reveal.ts': 4,
  '1-ar/reynsluformulur/src/utils/reveal.ts': 4,
  '1-ar/takmarkandi/src/App.tsx': 1,
  '1-ar/takmarkandi/src/components/Level1.tsx': 2,
  '1-ar/takmarkandi/src/components/Level2.tsx': 2,
  '1-ar/takmarkandi/src/components/Level3.tsx': 2,
  '1-ar/utfellingarhvorf/src/utils/reveal.ts': 3,
  '2-ar/lewis-structures/src/App.tsx': 1,
  '2-ar/lewis-structures/src/utils/useRevealOnChange.ts': 1,
  '2-ar/organic-nomenclature/src/hooks/useRevealWhenShown.ts': 3,
  '2-ar/rafeindabygging/src/App.tsx': 1,
  '2-ar/rafeindabygging/src/components/Level1.tsx': 2,
  '2-ar/rafeindabygging/src/components/Level2.tsx': 2,
  '2-ar/rafeindabygging/src/components/Level3.tsx': 1,
  '2-ar/redox-reactions/src/components/Level3.tsx': 1,
  '2-ar/vsepr-geometry/src/components/Level1.tsx': 1,
  '2-ar/vsepr-geometry/src/components/Level2.tsx': 1,
  '2-ar/vsepr-geometry/src/utils/phoneScroll.ts': 1,
  '3-ar/buffer-recipe-creator/src/App.tsx': 1,
  '3-ar/buffer-recipe-creator/src/components/Level3.tsx': 1,
  '3-ar/buffer-recipe-creator/src/utils/reveal.ts': 2,
  '3-ar/equilibrium-shifter/src/App.tsx': 1,
  '3-ar/equilibrium-shifter/src/utils/reveal.ts': 1,
  '3-ar/gas-law-challenge/src/App.tsx': 1,
  '3-ar/jafnvaegisfasti/src/utils/reveal.ts': 3,
  '3-ar/leysnijafnvaegi/src/utils/reveal.ts': 3,
  '3-ar/ph-titration/src/App.tsx': 1,
  '3-ar/ph-titration/src/components/Level2.tsx': 3,
  '3-ar/ph-titration/src/utils/reveal.ts': 1,
  '3-ar/syrufastinn/src/utils/reveal.ts': 3,
  '3-ar/thermodynamics-predictor/src/App.tsx': 4,
};

/**
 * What counts as scrolling the page yourself. The method calls allow the
 * optional-call form (`el.scrollIntoView?.(…)`), which is how most games write
 * them; a name that merely contains one (`revealScrollTo`) does not match.
 */
const SCROLL_CALLS: { what: string; re: RegExp }[] = [
  {
    what: 'scrollIntoView/scrollTo/scrollBy call',
    re: /(?<![\w$])(?:scrollIntoView(?:IfNeeded)?|scrollTo|scrollBy)\s*(?:\?\.)?\s*\(/g,
  },
  { what: 'scrollTop assignment', re: /\.scrollTop\s*(?:[+-]?=)(?!=)/g },
  { what: 'innerHeight read', re: /(?<![\w$])innerHeight\b/g },
];

/** Block and line comments out; a `//` inside a string such as a URL is kept. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}

function countScrollCalls(src: string): number {
  const code = stripComments(src);
  return SCROLL_CALLS.reduce((n, { re }) => n + (code.match(re)?.length ?? 0), 0);
}

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      return e.name === '__tests__' || e.name === 'node_modules' ? [] : sources(p);
    }
    return /\.(m?[jt]sx?)$/.test(e.name) && !/\.(test|spec)\.[jt]sx?$/.test(e.name) ? [p] : [];
  });
}

function gameCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const year of readdirSync(gamesRoot).filter((y) => /^\d-ar$/.test(y))) {
    for (const game of readdirSync(join(gamesRoot, year), { withFileTypes: true })) {
      const src = join(gamesRoot, year, game.name, 'src');
      if (!game.isDirectory() || !existsSync(src)) continue;
      for (const file of sources(src)) {
        const n = countScrollCalls(readFileSync(file, 'utf8'));
        if (n > 0) out[relative(gamesRoot, file).split('\\').join('/')] = n;
      }
    }
  }
  return out;
}

describe('games scroll only through @shared/utils', () => {
  const counts = gameCounts();

  it('finds the game sources (the scan is not silently empty)', () => {
    expect(Object.keys(counts).length).toBeGreaterThan(0);
  });

  it('no file outside the allow-list scrolls the page itself', () => {
    const extra = Object.keys(counts).filter((f) => !(f in ALLOWED));
    expect(
      extra,
      'Scroll through @shared/utils (revealSpan, revealTop, useScreenTop, …), not a local call'
    ).toEqual([]);
  });

  it('no allow-listed file gained a call', () => {
    const grew = Object.entries(counts)
      .filter(([f, n]) => f in ALLOWED && n > ALLOWED[f])
      .map(([f, n]) => `${f}: ${n} > ${ALLOWED[f]}`);
    expect(grew).toEqual([]);
  });

  it('the allow-list is not stale: lower a count when a migration removes calls', () => {
    const stale = Object.entries(ALLOWED)
      .filter(([f, n]) => (counts[f] ?? 0) < n)
      .map(([f, n]) => `${f}: allowed ${n}, now ${counts[f] ?? 0}`);
    expect(stale).toEqual([]);
  });

  it('the patterns catch the forms games write and ignore mentions', () => {
    expect(countScrollCalls('el.scrollIntoView?.({ block: "start" });')).toBe(1);
    expect(countScrollCalls('window.scrollTo({ top: 0 });')).toBe(1);
    expect(countScrollCalls('window.scrollBy(0, 10);')).toBe(1);
    expect(countScrollCalls('box.scrollTop = 0;')).toBe(1);
    expect(countScrollCalls('box.scrollTop += 5;')).toBe(1);
    expect(countScrollCalls('if (r.bottom > window.innerHeight) go();')).toBe(1);
    expect(countScrollCalls('if (box.scrollTop === 0) go();')).toBe(0);
    expect(countScrollCalls('revealScrollTo(el);')).toBe(0);
    expect(countScrollCalls("import { scrollTopOnPhone } from './phoneScroll';")).toBe(0);
    expect(countScrollCalls('// never call el.scrollIntoView() here')).toBe(0);
    expect(countScrollCalls('/* window.innerHeight is wrong on iOS */')).toBe(0);
    expect(countScrollCalls("const url = 'https://x.is'; scrollTo(0, 0);")).toBe(1);
  });
});
