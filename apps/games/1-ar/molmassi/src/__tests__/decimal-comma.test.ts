import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { generateProblem, type ConvType } from '../components/Level2';
import { buildProblem, DESCRIPTORS } from '../components/Level3';
import { COMPOUNDS } from '../data/compounds';
import { ELEMENTS } from '../data/elements';
import { gameTranslations } from '../i18n';
import { parseScientificAnswer } from '../utils/parseAnswer';

/**
 * Every number a student reads in this game is written with the Icelandic
 * decimal comma.
 *
 * **Why this exists.** The answer fields have read a comma since the Aug 2026
 * B9/B10 pass, but until 2026-09-22 the worked solutions printed `36.46`,
 * `1.204e+24` and `× 10^22` — and Stig 2 printed the summed molar mass raw, so
 * HCl appeared as `36.458000000000006 g`. A student was taught one format and
 * asked for another.
 *
 * English fields (`…En`, the `en` translation block) keep their full stop —
 * that is English. Polish, like Icelandic, writes a comma.
 */

const DECIMAL_POINT = /\d\.\d/;

/** Every string value in an object, skipping English-language fields. */
function icelandicStrings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, v]) =>
      /En$/.test(key) || key === 'en' ? [] : icelandicStrings(v, path ? `${path}.${key}` : key)
    );
  }
  return [];
}

const LEVEL2_TYPES: ConvType[] = [
  'mass_to_moles',
  'moles_to_mass',
  'moles_to_particles',
  'particles_to_moles',
  'moles_to_element_atoms',
  'moles_to_gas_volume',
  'gas_volume_to_moles',
];

describe('decimal comma', () => {
  const sources = [
    { what: 'compounds', value: COMPOUNDS },
    { what: 'elements', value: ELEMENTS },
    { what: 'translations', value: gameTranslations },
    // Stig 2 draws its numbers at random, so every compound and every
    // question type is generated several times over.
    ...COMPOUNDS.flatMap((c) =>
      LEVEL2_TYPES.flatMap((type) =>
        Array.from({ length: 5 }, (_, i) => ({
          what: `Stig 2 ${c.formula} ${type} #${i}`,
          value: { ...generateProblem(c, type), compound: undefined },
        }))
      )
    ),
    ...DESCRIPTORS.map((d) => ({
      what: `Stig 3 ${d.formula} ${d.type}`,
      value: buildProblem(d),
    })),
  ];

  it('finds text to check', () => {
    expect(sources.flatMap((s) => icelandicStrings(s.value)).length).toBeGreaterThan(500);
  });

  it('no Icelandic string a student reads writes a decimal point', () => {
    for (const { what, value } of sources) {
      for (const { path, text } of icelandicStrings(value)) {
        expect(text, `${what} ${path}`).not.toMatch(DECIMAL_POINT);
        // `1.204e+24` is how toExponential writes; `10^22` is not how
        // Icelandic writes a power of ten either.
        expect(text, `${what} ${path}`).not.toMatch(/\de[+-]\d|10\^/);
      }
    }
  });

  it('every Stig 3 answer it prints can be typed back and graded right', () => {
    // The printing half and the reading half of the same game must agree:
    // `Rétt svar: 1,20 × 10²⁴ sameindir` has to parse to within the level's 5 %.
    for (const d of DESCRIPTORS) {
      const problem = buildProblem(d);
      const lastStep = problem.steps[problem.steps.length - 1];
      const printed = lastStep.split('= ').pop()!.split('\n')[0];
      const value = parseScientificAnswer(printed);
      expect(value, `${d.formula}: ${printed}`).not.toBeNull();
      expect(Math.abs(value! - problem.answer) / problem.answer, printed).toBeLessThan(0.05);
    }
  });

  it('components format numbers through formatDecimal, not toFixed', () => {
    // `toFixed` writes a full stop. Nothing in these components needs one:
    // none of them draws SVG geometry from a formatted number.
    const dir = join(__dirname, '..', 'components');
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
      const lines = readFileSync(join(dir, file), 'utf8').split('\n');
      lines.forEach((line, i) => {
        expect(line, `${file}:${i + 1} formats a number with toFixed`).not.toMatch(
          /\.(toFixed|toExponential)\(/
        );
      });
    }
  });
});
