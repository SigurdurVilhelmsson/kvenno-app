import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * B10, repo-wide: on `type="number"` the browser discards the Icelandic decimal
 * comma before any of our code runs, so a student's `0,5` submits as `5` and
 * grades as a silent 10× error. No amount of normalising downstream recovers
 * it. Any field whose answer can be non-integer must be `type="text"` with
 * `inputMode="decimal"`.
 *
 * A `type="number"` field is fine — and better — where the answer is a count:
 * protons, electrons, molecules, coefficients, multipliers. Those files are
 * listed below with what they count.
 *
 * This checks the set of files, not every input, so adding a decimal field to a
 * file already on the list would slip through. It catches the case that
 * actually happened: reaching for `type="number"` in a new component because
 * that is what the neighbouring game does.
 */

const GAMES_DIR = join(__dirname, '..', '..', '..', '..', 'apps', 'games');

/** Files allowed to use `type="number"`, and the whole numbers they take. */
const COUNTS_ONLY: Record<string, string> = {
  '1-ar/takmarkandi/src/components/Level2.tsx': 'molecules formed, reaction runs',
  '1-ar/takmarkandi/src/components/Level3.tsx': 'molecules formed, excess left over',
  '1-ar/lotukerfid/src/components/Level3.tsx': 'protons, neutrons, electrons',
  '2-ar/lewis-structures/src/components/Level1.tsx': 'valence electrons',
  '2-ar/lewis-structures/src/components/LewisGuidedMode.tsx': 'electrons, bonds',
  '2-ar/redox-reactions/src/components/Level1.tsx': 'oxidation numbers',
  '2-ar/redox-reactions/src/components/Level3.tsx': 'electrons transferred, multipliers',
  '2-ar/vsepr-geometry/src/components/Level2.tsx': 'bonding and lone pairs',
};

function tsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...tsxFiles(full));
    else if (entry.endsWith('.tsx')) out.push(full);
  }
  return out;
}

describe('decimal answers never sit on a type="number" field', () => {
  const withNumberInputs = tsxFiles(GAMES_DIR)
    .filter((f) => readFileSync(f, 'utf8').includes('type="number"'))
    .map((f) => relative(GAMES_DIR, f).split('\\').join('/'))
    .sort();

  it('finds the games to check', () => {
    expect(withNumberInputs.length).toBeGreaterThan(0);
  });

  it('uses type="number" only where the answer is a whole count', () => {
    const unexpected = withNumberInputs.filter((f) => !(f in COUNTS_ONLY));
    expect(
      unexpected,
      'these files use type="number"; if the answer can be non-integer use ' +
        'type="text" + inputMode="decimal", otherwise add them to COUNTS_ONLY with what they count'
    ).toEqual([]);
  });

  it('keeps the list honest — every entry still has a number input', () => {
    const stale = Object.keys(COUNTS_ONLY).filter((f) => !withNumberInputs.includes(f));
    expect(stale, 'these are allow-listed but no longer use type="number"').toEqual([]);
  });

  it('never combines type="number" with a decimal step or inputMode', () => {
    for (const rel of withNumberInputs) {
      const source = readFileSync(join(GAMES_DIR, rel), 'utf8');
      expect(source, `${rel}: a decimal step on a type="number" field`).not.toMatch(/step="0\.\d/);
      expect(source, `${rel}: inputMode="decimal" on a type="number" field`).not.toMatch(
        /inputMode="decimal"/
      );
    }
  });
});
