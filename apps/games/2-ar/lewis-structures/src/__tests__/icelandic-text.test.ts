import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Wording this game shipped and must not ship again, scanned from its source.
 *
 * Comments are stripped first, so an explanation may name what it avoids. The
 * English check reads only lines that also carry Icelandic letters, which is
 * what separates a sentence shown to a student from an identifier such as the
 * `'tetrahedral'` geometry key in `lewisConverter.ts` or the `'hybrid'` option id.
 */

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

const stripComments = (text: string) =>
  text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/\/\/.*$/gm, '');

const files = sourceFiles(SRC).map((path) => ({
  name: relative(SRC, path),
  lines: stripComments(readFileSync(path, 'utf-8')).split('\n'),
}));

/** Misspellings and ungrammatical forms that shipped, with what replaced them. */
const WRONG: [RegExp, string][] = [
  [/Áttureglann/, 'Áttureglan'],
  [/rafeinapunkta/, 'rafeindapunktaformúlur'],
  [/rafeinadrægn/, 'rafneikvæðasta — ordabok: electronegativity;rafneikvæðni'],
  [/rafeindarap[aö]r/, 'rafeindapar / rafeindapör'],
  [/Vetni klóríð/, 'Vetnisklóríð'],
  [/Heildar stig/, 'Heildarstig'],
  [/\blykilin\b/, 'lykillinn'],
  [/(?<!ó)bundin rafeindir/, 'bundnar rafeindir'],
  [/óbundin \+ ½ bundin\b/, 'óbundnar + ½ bundnar'],
  [/Raunveruleg sameindin/, 'Raunverulega sameindin'],
  [/sameindina er meðaltal/, 'sameindin er meðaltal'],
  [/er þreföld tengsl/, 'eru þreföld tengsl'],
  [/Hvert einföld tengi/, 'Hvert einfalt tengi'],
  [/tengsla-lengd/, 'tengilengd'],
  [/róttæk/, 'stakeind — ordabok: radical;stakeind'],
  [/Rafeindaskort(?!ur)[:\s(]/, 'Rafeindaskortur, as a label in the nominative'],
  [/} pör\b/, 'pairCount(), which says "1 par"'],
  [/>Heildar</, 'Alls — heildar- is a prefix, not a word on its own'],
  [/óparuð/, 'ópöruð — the feminine of óparaður, as the textbook writes it'],
];

/** English that stood inside Icelandic sentences. */
const ENGLISH =
  /\b(tetrahedral|hybrid|lone pairs?|radicals?|electron deficient|expanded octet|octet rule|formal charge)\b/i;
const ICELANDIC_LETTER = /[áðéíóúýþæöÁÐÉÍÓÚÝÞÆÖ]/;

describe('lewis-structures source', () => {
  it('found the files it scans', () => {
    expect(files.map((f) => f.name)).toEqual(
      expect.arrayContaining(['App.tsx', 'components/Level2.tsx', 'components/Level3.tsx'])
    );
  });

  it('ships none of the misspelled or ungrammatical forms it used to', () => {
    const hits = files.flatMap(({ name, lines }) =>
      lines.flatMap((line, i) =>
        WRONG.filter(([pattern]) => pattern.test(line)).map(
          ([pattern, fix]) => `${name}:${i + 1} matches ${pattern} — use ${fix}`
        )
      )
    );
    expect(hits).toEqual([]);
  });

  it('puts no English word inside Icelandic text', () => {
    const hits = files.flatMap(({ name, lines }) =>
      lines
        .map((line, i) => ({ line, at: `${name}:${i + 1}` }))
        .filter(({ line }) => ICELANDIC_LETTER.test(line) && ENGLISH.test(line))
        .map(({ line, at }) => `${at}: ${line.trim()}`)
    );
    expect(hits).toEqual([]);
  });
});
