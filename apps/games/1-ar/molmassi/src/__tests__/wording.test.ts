import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Wording a student reads, held to the textbook and to `ordabok.md`. Scans the
 * game's source outside `__tests__`, comments included — so a comment that
 * explains one of these must describe it without writing it out.
 *
 * - **The unit is `g/mól`.** Stig 1 and 3 wrote `g/mol`, the Stig 2 intro
 *   `g/mól`, on adjacent screens. `ordabok.md` names the unit `mól` and is silent
 *   on the symbol; the textbook writes `g/mól` 79 times and the other form
 *   never, as it writes `mól/L` and `L/mól`.
 * - **The periodic-table legend** used two names `ordabok.md` does not:
 *   transition metals are `hliðarmálmar` and nonmetals `málmleysingjar`, which
 *   the textbook also uses (155 and 233 times) against none for the others.
 *   Its footer said `atómeiningarmassi`, which is no word; the glossary's is
 *   `atómmassaeining`.
 * - **Grammar**, each a one-off, listed so none of them comes back.
 */

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.(tsx?)$/.test(name) ? [path] : [];
  });
}

const FILES = sourceFiles(SRC).map((path) => ({
  name: relative(SRC, path),
  text: readFileSync(path, 'utf8'),
}));

/** [what must not appear, what to write instead] */
const NEVER: [RegExp, string][] = [
  [/g\/mol\b/, 'g/mól'],
  [/Skiptimálm/i, 'hliðarmálmar'],
  [/Ómálm/i, 'málmleysingjar'],
  [/atómeiningarmass/i, 'atómmassaeining'],
  // `mistökin` is plural.
  [/var mistökin/, 'voru mistökin'],
  // `lokið` takes the dative, as in `Leik lokið`.
  [/Æfing lokið/, 'Æfingu lokið'],
  // `mól` is neuter.
  [/Ein mól\b/, 'Eitt mól'],
  // A plural subject, `eindir`.
  [/hversu þungt \d/, 'hversu þungar'],
  // Two nouns side by side are not a compound.
  [/Heild mólmass/, 'Heildarmólmassi'],
  [/Algeng atómmass/, 'Algengir atómmassar'],
  [/\(heil tölu\)/, '(heila tölu)'],
  // The genitive plural of `lyf` is `lyfja`, as in `lyfjafræðingar`.
  [/skammta lyfa\b/, 'skammta lyfja'],
];

describe('wording in the game source', () => {
  it('finds the source it scans', () => {
    expect(FILES.map((f) => f.name)).toEqual(
      expect.arrayContaining(['App.tsx', 'components/Level1.tsx', 'components/PeriodicTable.tsx'])
    );
  });

  it.each(NEVER.map(([pattern, instead]) => [String(pattern), pattern, instead] as const))(
    'never %s',
    (_label, pattern, instead) => {
      for (const file of FILES) {
        file.text.split('\n').forEach((line, i) => {
          expect(line, `${file.name}:${i + 1} — write ${instead}`).not.toMatch(pattern);
        });
      }
    }
  );
});
