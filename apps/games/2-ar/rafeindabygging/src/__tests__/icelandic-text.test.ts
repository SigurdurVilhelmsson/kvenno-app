import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Wording this game shipped and has corrected, held so it does not return.
 *
 * Scans the game's source (not its tests, which quote the old forms) and its
 * `index.html`, comments included — so an explanation of why a form is avoided
 * has to be written without writing the form.
 *
 * Terms follow `packages/shared/i18n/ordabok.md` first and the school's
 * textbook corpus second, as CLAUDE.md orders them:
 * - electron configuration is `rafeindaskipan` (ordabok; corpus 165 to 2)
 * - the Pauli principle is `einsetulögmál Paulis` (ordabok and corpus, 8 to 0)
 * - spin is `spuni` (ordabok; the corpus writes `gagnstæðan spuna`)
 * - electron pair is `rafeindapar` (ordabok; corpus 307 to 0)
 * - subshell is `undirhvolf` (ordabok) — a 3p or d subshell is not a `hvolf`
 * - repulsion is `fráhrinding` (corpus 28 to 0; `2-ar/vsepr-geometry` agrees)
 * - sodium, calcium and strontium take the -íum names the corpus uses (as bare
 *   words, natríum 73 to 2, kalsíum 37 to 5, strontíum 15 to 5), as `1-ar/lotukerfid` and
 *   this game's own menu already did. Nitrogen is deliberately not held here:
 *   the corpus writes both köfnunarefni and nitur, the platform ships both, and
 *   which one the games should use is Siggi's call.
 */
const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /rafeindauppsetning/i, why: 'electron configuration is rafeindaskipan' },
  { pattern: /útilokunarregl/i, why: 'the Pauli principle is einsetulögmál Paulis' },
  { pattern: /\bspinn/i, why: 'spin is spuni' },
  { pattern: /snúning/i, why: 'spin is spuni' },
  { pattern: /rafeindarapar/i, why: 'electron pair is rafeindapar' },
  { pattern: /\b\d?[spdf]-hvolf/, why: 'a 3p or d subshell is an undirhvolf' },
  { pattern: /fráhrun/i, why: 'repulsion is fráhrinding' },
  { pattern: /\b(natrín|kalsín|strontín)\b/i, why: 'natríum, kalsíum, strontíum' },
  { pattern: /dreifastar/i, why: 'not a verb form: rafeindir dreifast' },
  { pattern: /\bHvert rafeind/, why: 'rafeind is feminine: hver rafeind' },
  { pattern: /öll fjögur skammtatölur/, why: 'skammtatala is feminine: allar fjórar' },
  { pattern: /of mörg/, why: 'agreed with no noun; the hint says aukalega' },
  { pattern: /Þú vantar/, why: 'vanta takes the accusative: þig vantar' },
  { pattern: /\bNotuðu\b/, why: 'typo for Notaðu' },
  { pattern: /\bBiltu\b/, why: 'not a word: hafðu bil' },
  { pattern: /Heildar stig/, why: 'one word: heildarstig' },
  { pattern: /Aufbau (reglan|röð)/, why: 'hyphenated, as the intro writes it' },
  { pattern: /\bfull d\b/, why: 'neuter, and parallel to hálffyllt: fullfyllt d' },
  { pattern: /eftir af 8/, why: 'eftir means remaining; the count is of electrons placed' },
  { pattern: /liggur innar/, why: 'the 4s orbital does not lie closer to the nucleus than 3d' },
  {
    pattern: /nánast[a-záéíóúýþæö]* eðalgas/i,
    why: 'the core is the noble gas before the element; the nearest one is krypton for Cu, Se, Br',
  },
  { pattern: /Stig 3: Eðalgasstytting/, why: 'the menu names Stig 3 Lotukerfi og rafeindir' },
  { pattern: /[spdf] svigrúmið \(l =/, why: 'a subshell of l ≥ 1 has several svigrúm' },
];

const ROOT = join(__dirname, '..', '..');

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === '__tests__' || name === 'node_modules') return [];
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(tsx?|html)$/.test(name) ? [path] : [];
  });
}

describe('corrected wording in rafeindabygging', () => {
  const files = [...sources(join(ROOT, 'src')), join(ROOT, 'index.html')];

  it('scans the files it means to', () => {
    const names = files.map((f) => relative(ROOT, f));
    for (const expected of [
      'index.html',
      'src/App.tsx',
      'src/components/Level1.tsx',
      'src/components/Level2.tsx',
      'src/components/Level3.tsx',
      'src/data/electron-configs.ts',
      'src/data/periodic-configs.ts',
      'src/data/quantum-numbers.ts',
      'src/i18n.ts',
    ]) {
      expect(names).toContain(expected);
    }
  });

  it('ships none of the corrected forms', () => {
    const hits: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          for (const { pattern, why } of BANNED) {
            if (pattern.test(line)) hits.push(`${relative(ROOT, file)}:${i + 1} — ${why}`);
          }
        });
    }
    expect(hits).toEqual([]);
  });
});
