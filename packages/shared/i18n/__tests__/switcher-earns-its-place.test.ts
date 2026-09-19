import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * A game may only ship a language switcher if it actually translates something.
 *
 * **Siggi's ruling, 2026-09-19: strip the switcher from the games that route
 * nothing through `t()`.** Before it, all 20 games with i18n wiring imported
 * `useGameI18n` and rendered `LanguageSwitcher`, and **eight of them had no
 * `t()` call worth the name** — a student who picked English or Polish watched
 * the control change and the page stay in Icelandic. That is worse than no
 * switcher: it is a promise the game does not keep.
 *
 * The rule below is stated as a property rather than as a list of the eight,
 * so it also covers the next game someone wires up halfway. The list is kept
 * too, as a second assertion, because the eight are exactly the ones whose dead
 * `i18n.ts` files were deleted and those files must not come back.
 *
 * **What this does not settle.** `2-ar/rafeindabygging` has exactly one `t()`
 * call (`game.title`) and `2-ar/vsepr-geometry` and `1-ar/takmarkandi` have two
 * each. They pass this test and are barely translated — finishing or stripping
 * them is a separate decision, tracked in the roadmap's i18n item. This test
 * draws the line at zero, which is where the ruling drew it.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');
const gamesRoot = join(repoRoot, 'apps', 'games');

/** The eight stripped on 2026-09-19, as `year/game`. */
const STRIPPED = [
  '2-ar/intermolecular-forces',
  '2-ar/kinetics',
  '2-ar/lewis-structures',
  '2-ar/organic-nomenclature',
  '3-ar/buffer-recipe-creator',
  '3-ar/gas-law-challenge',
  '3-ar/ph-titration',
  '3-ar/thermodynamics-predictor',
];

function sourceFiles(dir: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') return [];
      return sourceFiles(full);
    }
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function games(): { id: string; dir: string; files: string[] }[] {
  return readdirSync(gamesRoot, { withFileTypes: true })
    .filter((y) => y.isDirectory() && /^\d-ar$/.test(y.name))
    .flatMap((y) =>
      readdirSync(join(gamesRoot, y.name), { withFileTypes: true })
        .filter((g) => g.isDirectory())
        .map((g) => {
          const dir = join(gamesRoot, y.name, g.name, 'src');
          return { id: `${y.name}/${g.name}`, dir, files: sourceFiles(dir) };
        })
        .filter((g) => g.files.length > 0)
    );
}

/**
 * Count real `t(` call sites.
 *
 * The lookbehind matters: a bare `t\(` also matches `format(`, `print(` and
 * `expect(`, which is how an earlier count of these games came out an order of
 * magnitude too high. It must also catch the template-literal and variable-key
 * forms — `docs/i18n-coverage.md` records that a `t('`-only grep undercounted
 * seven games.
 */
function translationCalls(files: string[]): number {
  const pattern = /(?<![A-Za-z0-9_.$])t\(/g;
  return files.reduce((n, f) => n + (readFileSync(f, 'utf8').match(pattern)?.length ?? 0), 0);
}

const ALL = games();

describe('the language switcher earns its place', () => {
  it('finds the games to check, so it cannot silently cover nothing', () => {
    expect(ALL.length).toBeGreaterThanOrEqual(22);
  });

  it.each(ALL.map((g) => [g.id, g] as const))(
    '%s does not ship a switcher that changes nothing',
    (id, game) => {
      const rendersSwitcher = game.files.some((f) =>
        /<LanguageSwitcher\b/.test(readFileSync(f, 'utf8'))
      );
      if (!rendersSwitcher) return;
      expect(
        translationCalls(game.files),
        `${id} renders LanguageSwitcher but routes no string through t(), so ` +
          'switching language changes nothing a student can see. Either wire the ' +
          'UI through t() or remove the switcher — Siggi ruled the latter on 2026-09-19.'
      ).toBeGreaterThan(0);
    }
  );

  it.each(STRIPPED)('%s stays stripped', (id) => {
    const game = ALL.find((g) => g.id === id);
    expect(game, `${id} is not a game directory any more — update this list`).toBeDefined();
    const src = game!.files.map((f) => readFileSync(f, 'utf8')).join('\n');
    expect(src, `${id} re-added LanguageSwitcher`).not.toMatch(/LanguageSwitcher/);
    expect(src, `${id} re-added useGameI18n`).not.toMatch(/useGameI18n/);
    expect(
      existsSync(join(game!.dir, 'i18n.ts')),
      `${id} re-added a dead i18n.ts — it was deleted 2026-09-19 with zero consumers`
    ).toBe(false);
  });

  it('leaves the translated games alone', () => {
    // The ruling stripped the games with nothing to translate, not the switcher
    // itself. If this ever reaches zero, the change went further than the ruling.
    const withSwitcher = ALL.filter((g) =>
      g.files.some((f) => /<LanguageSwitcher\b/.test(readFileSync(f, 'utf8')))
    );
    expect(withSwitcher.length).toBeGreaterThan(5);
  });
});
