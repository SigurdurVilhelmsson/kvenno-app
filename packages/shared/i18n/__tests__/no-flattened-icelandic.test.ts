import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Icelandic words must keep their accents.
 *
 * **This is the Íslenskubraut defect, found live in a game.** That content's
 * server copy had lost every Icelandic character in places — `Orðaforði`
 * written `Orda{soft hyphen}fordi` — and it cost months because nobody could
 * see it. `scripts/islenskubraut/load.mjs` has validated the YAML since
 * August, and `no-invisible-characters.test.ts` covers game source for
 * zero-width characters. **Neither covered stripped accents in game source**,
 * which is exactly where the next one was: `1-ar/takmarkandi` shipped 30 of
 * them across its three level components, inconsistently, inside single
 * sentences — `'Deildu fjolda sameinda hvarfefnis med stuðli þess'`, where
 * `stuðli` and `þess` are right and `fjolda` and `med` are not. One of them,
 * `hvorfin`, was a misspelling on top of the flattening.
 *
 * **The test works from a list of known words, not from a rule.** There is no
 * way to tell `med` (nothing) from `með` (with) by shape alone, and a
 * heuristic that guessed would either miss most of them or fire on every
 * English word in the file. So this is a list of the flattened forms that
 * actually shipped plus the obvious neighbours, and it grows when a new one is
 * found. A list that catches the defect that happened is worth more than a
 * rule that catches nothing.
 */

const SCANNED_ROOTS = [
  'apps/games',
  'apps/landing/src',
  'apps/islenskubraut/src',
  'packages/shared/components',
];

/**
 * Flattened forms, each with the word it should be.
 *
 * Every entry must be a string that is **not** an English or a code word, or
 * the scan fires on `const med = ...` and on prose about a "method". Anything
 * ambiguous is handled by requiring Icelandic context around it below.
 */
const FLATTENED: { wrong: RegExp; right: string }[] = [
  { wrong: /\bhvarfefnid\b/i, right: 'hvarfefnið' },
  { wrong: /\bmyndefnid\b/i, right: 'myndefnið' },
  { wrong: /\beydist\b/i, right: 'eyðist' },
  { wrong: /\bhvorfin\b/i, right: 'hvörfin' },
  { wrong: /\bfjolda\b/i, right: 'fjölda' },
  { wrong: /\bfjoldi\b/i, right: 'fjöldi' },
  { wrong: /\bnidurstodur\b/i, right: 'niðurstöður' },
  { wrong: /\bnidurstada\b/i, right: 'niðurstaða' },
  { wrong: /\bUtreikningur\b/, right: 'Útreikningur' },
  { wrong: /\butreikningar\b/i, right: 'útreikningar' },
  { wrong: /\bNaesta\b/i, right: 'Næsta' },
  { wrong: /\bLjuka\b/i, right: 'Ljúka' },
  { wrong: /\bFullkomid\b/i, right: 'Fullkomið' },
  { wrong: /\bVelurdu\b/i, right: 'Veldu' },
  { wrong: /\bBerdu\b/i, right: 'Berðu' },
  { wrong: /\bMargfaldadu\b/i, right: 'Margfaldaðu' },
  { wrong: /\bDeildu fjolda\b/i, right: 'Deildu fjölda' },
  { wrong: /\bTil baka i\b/, right: 'Til baka í' },
  { wrong: /\bverkefni lokid\b/i, right: 'verkefni lokið' },
  { wrong: /\bstodugt\b/i, right: 'stöðugt' },
  { wrong: /\bthu\b/i, right: 'þú' },
  { wrong: /\bthetta\b/i, right: 'þetta' },
  { wrong: /\bthad\b/i, right: 'það' },
  { wrong: /\bRett!|\bRett svar\b/, right: 'Rétt' },
  { wrong: /\bLaerdu\b/i, right: 'Lærðu' },
  { wrong: /\bmolstyrk\b/i, right: 'mólstyrk' },
  { wrong: /\butthynning[a-z]*\b/i, right: 'útþynningu' },
  { wrong: /\bdaemi\b/i, right: 'dæmi' },
  { wrong: /\badferd[a-z]*\b/i, right: 'aðferð' },
  { wrong: /\bHalda afram\b/i, right: 'Halda áfram' },
  // `med` is the trap: a bare three-letter match would fire on English prose
  // and on code. Require an Icelandic word next to it.
  { wrong: /\bmed (stuðli|fjölda|fjolda|honum|henni|því|thvi)\b/i, right: 'með' },
];

const repoRoot = join(__dirname, '..', '..', '..', '..');

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
    return /\.(tsx?|html)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe('Icelandic keeps its accents', () => {
  it('no game ships an ASCII-flattened Icelandic word', () => {
    const offences: string[] = [];
    for (const root of SCANNED_ROOTS) {
      for (const file of sourceFiles(join(repoRoot, root))) {
        const text = readFileSync(file, 'utf8');
        const where = file.slice(repoRoot.length + 1);
        text.split('\n').forEach((line, i) => {
          for (const { wrong, right } of FLATTENED) {
            const hit = line.match(wrong);
            if (!hit) continue;
            // An ASCII identifier is not flattened prose. Every id in this
            // repo transliterates its Icelandic without accents on purpose —
            // `maurasyra`, `flussyra`, and the Direction union's `'afram'` /
            // `'afturabak'` — and renaming those would break stored progress
            // and data lookups. A quoted literal that is *only* the word is
            // one of those; prose has something else around it.
            if (new RegExp(`['"\`]${hit[0]}['"\`]`).test(line)) continue;
            offences.push(`${where}:${i + 1} — "${hit[0]}" should be "${right}"`);
          }
        });
      }
    }
    expect(
      offences,
      "Icelandic words must keep their accents; see this file's header for why a list rather than a rule:\n" +
        offences.join('\n')
    ).toEqual([]);
  });

  it('catches the defect it was written for', () => {
    // The guard on the guard. If the patterns stopped matching, the test above
    // would pass vacuously and say nothing — which is exactly how the
    // Íslenskubraut copy drifted for months under a header claiming a
    // generator that did not exist.
    const shipped = 'Deildu fjolda sameinda hvarfefnis med stuðli þess.';
    const matched = FLATTENED.filter(({ wrong }) => wrong.test(shipped)).map((f) => f.right);
    expect(matched).toContain('fjölda');
    expect(matched).toContain('með');
  });

  it('leaves English and code alone', () => {
    // The patterns must not fire on the language the code is written in.
    const innocent = [
      'const method = useMemo(() => ...)',
      '// we need to reduce the array',
      'import { medium } from "./sizes";',
      'className="flex items-center"',
      'expect(result).toBe(true);',
    ];
    for (const line of innocent) {
      for (const { wrong } of FLATTENED) {
        expect(wrong.test(line), `${wrong} fired on: ${line}`).toBe(false);
      }
    }
  });
});
