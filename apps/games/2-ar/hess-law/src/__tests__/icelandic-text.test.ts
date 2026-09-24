import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { CHALLENGES } from '../data/challenges';
import { PUZZLES } from '../data/puzzles';
import { gameTranslations } from '../i18n';

/**
 * Wording this game shipped and should not ship again. Each entry was live in a
 * student-facing string on 2026-09-23.
 *
 * - English inside Icelandic sentences and concept chips (`exothermic`, `Exothermic`)
 *   and Icelandicised loans nobody uses (`Exóþermt`, `Entalpí`, `innhitað`). The
 *   glossary governs these: útvermið, innvermið, vermi, myndunarvermi.
 * - Grammar: `Þú slóðir inn`, `VER GETUM`, `Lykillhugtak`, `gleymdist að`, `snúðir`,
 *   `Þreföld efnismagn`, `Réttur tölugildið`, `Samsett aðgerðir`, `Heildar stig`.
 * - Challenge 4 of Level 1 told students the order of reversing and multiplying
 *   matters. It does not: both only scale ΔH, and scaling commutes.
 *
 * The scan reads component and data source with comments stripped (a comment may
 * name a form to explain why it is avoided), and the Icelandic translation block
 * through the module, since the English block rightly says "exothermic".
 */

const SRC = join(__dirname, '..');

const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /\bexothermic\b/i, why: 'útvermið (ordabok: exothermic;útvermið)' },
  { pattern: /\bendothermic\b/i, why: 'innvermið (ordabok: endothermic;innvermið)' },
  { pattern: /exóþerm|endóþerm/i, why: 'útvermið / innvermið' },
  { pattern: /entalpí/i, why: 'vermi (ordabok: enthalpy;vermi)' },
  { pattern: /myndunarvarm/i, why: 'myndunarvermi (ordabok: enthalpy of formation)' },
  { pattern: /innhita|varmagjafandi|varmagleypandi/i, why: 'innvermið / útvermið' },
  { pattern: /thermít|þermít/i, why: 'termít, as the textbook writes it' },
  {
    pattern: /hv[öa]rfvarm/i,
    why: 'hvarfvermi: the book reckons ΔH of a reaction as hvarfvermi under lögmál Hess',
  },
  { pattern: /ástandsbreyt[au]\b/, why: 'ástandsfall (ordabok: state function)' },
  { pattern: /fuel cells|catalytic converters/i, why: 'efnarafall / hvarfakútur' },
  { pattern: /\bslóðir\b/, why: 'slóst' },
  { pattern: /\bVER GETUM\b/, why: 'VIÐ GETUM' },
  { pattern: /Lykillhugtak/, why: 'Lykilhugtak' },
  { pattern: /gleymdist að/, why: 'gleymdir að' },
  { pattern: /\bsnúðir\b/, why: 'snerir' },
  { pattern: /Þreföld efnismagn|Meiri efnismagn/, why: 'efnismagn is neuter' },
  { pattern: /Réttur tölugildið/, why: 'Rétt tölugildi' },
  { pattern: /Samsett aðgerðir/, why: 'Samsettar aðgerðir' },
  { pattern: /Heildar stig/, why: 'Heildarstig' },
  { pattern: /[Hh]eildar (ΔH|orku)/, why: 'heildar- is a prefix: Heildar-ΔH, heildarorkubreyting' },
  { pattern: /tvíoxíð/i, why: 'díoxíð, as 1-ar/nafnakerfid names NO₂' },
  { pattern: /járnbrautatein/, why: 'járnbrautarteina, as the book and the c6 hint write it' },
  { pattern: /Kolmonoxíð|Brennisteinstrioxíð|Vetni klóríð/, why: 'compound names' },
  { pattern: /röð aðgerða|í réttri röð|Mundu röðina/, why: 'the order does not matter' },
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && entry.name !== 'i18n.ts' ? [full] : [];
  });
}

function withoutComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function strings(node: unknown): string[] {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(strings);
  if (node && typeof node === 'object') return Object.values(node).flatMap(strings);
  return [];
}

const IS = (gameTranslations as unknown as { is: unknown }).is;

describe('hess-law Icelandic wording', () => {
  it('finds files and strings to scan', () => {
    expect(sourceFiles(SRC).length).toBeGreaterThan(8);
    expect(strings(IS).length).toBeGreaterThan(50);
  });

  it.each(BANNED.map((b) => [b.pattern.source, b] as const))(
    'no source string matches /%s/',
    (_source, { pattern, why }) => {
      const hits: string[] = [];
      for (const file of sourceFiles(SRC)) {
        withoutComments(readFileSync(file, 'utf8'))
          .split('\n')
          .forEach((line, i) => {
            if (pattern.test(line)) hits.push(`${file.slice(SRC.length + 1)}:${i + 1}`);
          });
      }
      for (const s of strings(IS)) if (pattern.test(s)) hits.push(`i18n is: ${s}`);
      expect(hits, `should be ${why}`).toEqual([]);
    }
  );

  it('prints numbers in its Icelandic text with the decimal comma', () => {
    const texts = [
      ...strings(IS),
      ...strings(CHALLENGES),
      ...PUZZLES.flatMap((p) => [p.title, p.description, p.hint, p.explanation]),
    ];
    expect(texts.filter((s) => /\d\.\d/.test(s))).toEqual([]);
  });
});
