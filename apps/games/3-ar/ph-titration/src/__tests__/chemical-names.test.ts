import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Guards two misspellings that shipped in this game's student-facing data.
 *
 * `Saltssýra` (four sites in `data/titrations.ts`) carried a spurious genitive
 * -s-: HCl is `saltsýra`, salt + sýra, and `1-ar/molmassi` and
 * `2-ar/intermolecular-forces` all spelled it correctly. One game in three
 * disagreeing with the other two is the one-platform-two-words defect the
 * glossary work exists to stop, in a word the glossary happens not to cover.
 *
 * `Ammoníak` was missing its acute. The platform was 27 to 5 in favour of
 * `ammóníak` before this fix, so the minority spelling was measurably the
 * error, not a variant.
 *
 * Neither word is in `ordabok.md` — it carries no acid or reagent names at all
 * — so `governed-terms.test.ts` could not have caught either. This test is the
 * local equivalent, kept beside the game whose data was wrong.
 */

const dataDir = join(__dirname, '..', 'data');

function dataSources(): { file: string; text: string }[] {
  return readdirSync(dataDir)
    .filter((f) => /\.tsx?$/.test(f))
    .map((f) => ({ file: f, text: readFileSync(join(dataDir, f), 'utf8') }));
}

describe('chemical names in the titration data', () => {
  it('finds data files to scan, so it cannot silently cover nothing', () => {
    expect(dataSources().length).toBeGreaterThan(0);
  });

  it('spells hydrochloric acid Saltsýra, never Saltssýra', () => {
    const offences = dataSources()
      .filter(({ text }) => /Saltssýra/i.test(text))
      .map(({ file }) => file);
    expect(offences, 'HCl is salt + sýra — one s, not two').toEqual([]);
  });

  it('spells ammonia with its acute, ammóníak', () => {
    // Matches the bare stem only when it is NOT already accented.
    const offences = dataSources()
      .filter(({ text }) => /ammoníak/i.test(text))
      .map(({ file }) => file);
    expect(offences, 'ammóníak carries an acute on the o').toEqual([]);
  });

  it('still names both reagents somewhere, so the guards are not vacuous', () => {
    const all = dataSources()
      .map((d) => d.text)
      .join('\n');
    expect(all).toMatch(/Saltsýra/);
    expect(all).toMatch(/ammóníak/i);
  });
});
