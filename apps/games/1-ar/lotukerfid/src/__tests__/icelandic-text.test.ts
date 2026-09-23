import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Words this game once shipped and must not ship again.
 *
 * The platform's `governed-terms.test.ts` guards the rulings every game
 * shares; these are the ones found in this game on 2026-09-23 — two words for
 * one concept inside the same game, a coinage neither `ordabok.md` nor the
 * textbook uses, or a phrase that is not grammatical. Each row names what it is
 * replaced by and why, so a failure says what to write instead.
 *
 * Source files are scanned whole, comments included: a comment that quotes a
 * banned form trips it, so explain without writing the string.
 */

const ROOT = join(__dirname, '..', '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'node_modules' || entry.name === '__tests__' ? [] : sourceFiles(full);
    }
    return /\.(tsx?|html)$/.test(entry.name) ? [full] : [];
  });
}

const BANNED: { pattern: RegExp; use: string; why: string }[] = [
  {
    pattern: /prótón/iu,
    use: 'róteind',
    why: 'ordabok `proton;róteind`; corpus 236 to 0. Stig 3 said both.',
  },
  {
    pattern: /frumeindamass/iu,
    use: 'meðalatómmassi',
    why: 'ordabok `relative atomic mass;meðalatómmassi`, and the textbook names a table cell "sætistölu þess, tákn, meðalatómmassa". The coinage has 0 corpus hits, and Stig 1 said atómmassi beside it.',
  },
  {
    pattern: /málmleysingur/iu,
    use: 'málmleysingi',
    why: 'ordabok `nonmetal;málmleysingi`, the form Stig 2 grades against.',
  },
  {
    pattern: /hálf-málm/iu,
    use: 'hálfmálmur',
    why: 'ordabok `metalloid;hálfmálmur`, one word.',
  },
  {
    pattern: /lotubundn\p{L}* sveifl/iu,
    use: 'lotubundnir eiginleikar',
    why: 'ordabok `periodic trends;lotubundnir eiginleikar`; the corpus has 9 for it and 0 for the other.',
  },
  {
    pattern: /sameindagerð/iu,
    use: 'atómbygging',
    why: 'this game counts particles in atoms, not molecules. HARVEST.md already corrected the Stig 3 title for the same reason; the subtitle kept it.',
  },
  {
    pattern: /eitt gildisrafeind/iu,
    use: 'eina gildisrafeind',
    why: '`rafeind` is feminine.',
  },
  {
    pattern: /eiga sér \S+ gildisrafeind/iu,
    use: 'hafa … gildisrafeindir',
    why: 'the game says `hafa` everywhere else it counts valence electrons.',
  },
  {
    pattern: /svipuð efnaeiginleika/iu,
    use: 'svipaða efnaeiginleika',
    why: '`eiginleiki` is masculine; accusative plural is `svipaða`.',
  },
  {
    pattern: /litinn segir/iu,
    use: 'liturinn segir',
    why: 'the subject of `segir` is nominative.',
  },
  {
    // Letter lookarounds, because `\b` does not know that `á` is a letter:
    // `hjá lotu` and `á lotukerfinu` are not this.
    pattern: /(?<!\p{L})á (lotu|flokki)(?!\p{L})/iu,
    use: 'í lotu …, flokki …',
    why: 'the textbook writes `í lotu 1, flokki 1` (155 `í lotu` to 1 `á lotu`, 76 `í flokki` to 0), and so do this game’s own hints and misconceptions.',
  },
  {
    pattern: /skiptimálm/iu,
    use: 'hliðarmálmur',
    why: 'ordabok `transition metal;hliðarmálmur`; corpus 169 to 0. The legend, the category label and two Stig 2 options used the other word. 1-ar/molmassi’s table made the same correction.',
  },
  {
    pattern: /(?<!\p{L})ómálm/iu,
    use: 'málmleysingi',
    why: 'ordabok `nonmetal;málmleysingi`; corpus 261 to 0. The legend said one word while Stig 2 graded the other, so an answer and the table under it named one kind of element two ways.',
  },
  {
    pattern: /g\/mol/u,
    use: 'amu',
    why: 'the number on the table is a meðalatómmassi, which the textbook gives in amu. A mass per mole is a mólmassi, which this game does not teach.',
  },
];

describe('Lotukerfið writes its Icelandic as ruled', () => {
  const files = sourceFiles(ROOT);

  it('finds the source it scans', () => {
    // index.html, App, i18n, four components, three data/util modules at least.
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  it.each(BANNED.map((b) => [b.pattern.source, b] as const))('%s', (_source, banned) => {
    const offences: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          const match = banned.pattern.exec(line);
          if (match) offences.push(`${relative(ROOT, file)}:${i + 1} — "${match[0]}"`);
        });
    }
    expect(offences, `write "${banned.use}" instead: ${banned.why}`).toEqual([]);
  });
});
