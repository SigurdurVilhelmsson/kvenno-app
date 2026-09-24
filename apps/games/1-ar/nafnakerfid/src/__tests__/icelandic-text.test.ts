import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { greekPrefixes } from '../components/Level2';
import { PREFIXES } from '../data/naming';

/**
 * Icelandic in this game that was wrong, each with the reason it was wrong.
 *
 * Every pattern below is written so that this file does not itself contain the
 * banned string — a character class in the middle — because the platform
 * guards scan test files too, and a test that explains a banned form must not
 * trip the guard it explains.
 */

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return entry === '__tests__' ? [] : sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

const BANNED: { pattern: RegExp; why: string }[] = [
  // The textbook's prefix table (ch02/m68698) writes `mónó-`, and so does this
  // game's own Level 3 tray (`PREFIXES[1]` in data/naming.ts). Levels 1 and 2
  // taught it without its accents, so a student learned one spelling and was
  // then asked to build the other. `font-mono` is a class name, not a prefix.
  { pattern: /(?<![-\w])m[o]no/i, why: 'the Greek prefix is mónó-' },
  // `forskeyti` is neuter, plural `forskeyti`, so `grísk forskeyti`.
  { pattern: /forskeyt[i]r/, why: 'the plural of forskeyti is forskeyti' },
  { pattern: /grísk[a]r forskeyti/, why: 'neuter plural: grísk forskeyti' },
  // The rule said the second element always gets "the president" — a one-letter
  // slip for the word it meant.
  { pattern: /fors[e]tið/, why: 'a typo for forskeyti' },
  // ordabok.md: transition metal;hliðarmálmur. The corpus agrees, 169 to 0.
  { pattern: /[Þþ]r[ó]unarmálm/, why: 'ordabok.md: hliðarmálmur' },
  // ordabok.md: halogen;halógen. The corpus plural is `halógenar`.
  { pattern: /halóg[e]in/, why: 'the plural is halógenar' },
  // Icelandic writes a compound noun as one word; the corpus agrees each time.
  { pattern: /klór [a]tóm/, why: 'one word: klóratóm' },
  { pattern: /(súlfat|nítrat|hýdroxíð) [j]ón/, why: 'one word: súlfatjón, nítratjón, hýdroxíðjón' },
  { pattern: /Heilda[r] stig/, why: 'one word: Heildarstig' },
  // Agreement: `jón` is feminine, `basi` masculine, `kalk` neuter,
  // `brennisteinn` masculine, and the info line describes a neuter `efni`.
  { pattern: /tvö Cl⁻ j[ó]n/, why: 'jón is feminine: tvær' },
  { pattern: /Sterk[t] basi/, why: 'basi is masculine: sterkur basi' },
  { pattern: /Bren[n]d kalk/, why: 'kalk is neuter: brennt kalk' },
  { pattern: /Eit[t] brennisteinn/, why: 'brennisteinn is masculine: einn' },
  { pattern: /Algengu[r] í sápu/, why: 'agrees with the compound, neuter: algengt' },
  { pattern: /Hvítu[r] seti/, why: 'ordabok.md: precipitate;botnfall, neuter' },
  // `munu` is the plural of the auxiliary "will"; the sentence meant "differ".
  { pattern: /sem mun[u] milli/, why: 'ungrammatical: the letters that differ' },
  // English inside an Icelandic string.
  { pattern: /(?<![\w-])r[u]st(?!\w)/, why: 'English: the word is ryð' },
  // Not words at all.
  { pattern: /Göseðlisg[a]s|efnasambin[d]u/, why: 'ordabok.md: noble gas;eðalgas' },
  { pattern: /brennisteinsnei[t]un/, why: 'not a word' },
  // The textbook's defined term (ch02/m68698) is `tvíefnasamband`; `endi` is
  // an end, not a suffix, which the game calls `ending` everywhere else.
  { pattern: /tvíefn[i]/, why: 'the textbook term is tvíefnasamband' },
  { pattern: /End[i] -íð/, why: 'the suffix is an ending' },
  // A doubled ASCII hyphen standing in for a dash, in feedback text.
  { pattern: /\} -[-] /, why: 'a dash, not two hyphens' },
  // Icelandic puts no comma before the `eða` that closes a list.
  { pattern: /nítrat, eð[a]/, why: 'no comma before eða in a list' },
];

describe('Nafnakerfið Icelandic text', () => {
  const files = sourceFiles(SRC);

  it('scans the game source', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const { pattern, why } of BANNED) {
    it(`has no ${pattern} (${why})`, () => {
      const hits = files.flatMap((file) =>
        readFileSync(file, 'utf8')
          .split('\n')
          .map((line, i) => ({ line, at: `${relative(SRC, file)}:${i + 1}` }))
          .filter(({ line }) => pattern.test(line))
          .map(({ line, at }) => `${at}: ${line.trim()}`)
      );
      expect(hits).toEqual([]);
    });
  }
});

describe('The Greek prefixes Level 2 teaches', () => {
  it('are spelled exactly as the Level 3 parts that build them', () => {
    for (const { count, prefix } of greekPrefixes) {
      expect(prefix.replace(/-$/, ''), `prefix for ${count}`).toBe(PREFIXES[count]);
    }
  });
});
