/**
 * Playing on a phone: which keyboard an answer field opens, whether the answer
 * can be typed on it, and whether the formula headline fits.
 *
 * Stig 2 used to open a decimal keypad for every question. Two of its seven
 * conversion types (moles to molecules, moles to atoms of one element) have
 * Avogadro-scale answers, and a decimal keypad has no `e`, `×` or `^` — the
 * only route to a correct answer on a phone was typing all 24 digits.
 */

import { describe, it, expect } from 'vitest';

import { formulaSizeClass } from '../components/Level1';
import {
  answerInputMode,
  generateAllProblems,
  generateProblem,
  type ConvType,
} from '../components/Level2';
import { COMPOUNDS } from '../data/compounds';
import { parseScientificAnswer } from '../utils/parseAnswer';

const ALL_TYPES: ConvType[] = [
  'mass_to_moles',
  'moles_to_mass',
  'moles_to_particles',
  'particles_to_moles',
  'moles_to_element_atoms',
  'moles_to_gas_volume',
  'gas_volume_to_moles',
];

/** Characters a phone's decimal keypad offers (digits and both separators). */
const DECIMAL_KEYPAD = /^[0-9.,-]*$/;

/**
 * The same number as a student could type it on a phone's full keyboard — no
 * superscripts and no `×`, which most phone keyboards do not offer.
 */
function asPhoneTyped(value: number): string[] {
  const [mantissa, exponent] = value.toExponential(3).split('e');
  const m = mantissa.replace('.', ',');
  const e = String(Number(exponent));
  return [`${m}e${e}`, `${m} x 10^${e}`, `${m}*10^${e}`, `${m}E${e}`];
}

describe('Stig 2 answer keyboard', () => {
  it('opens the full keyboard for Avogadro-scale answers and the keypad otherwise', () => {
    for (const compound of COMPOUNDS) {
      for (const type of ALL_TYPES) {
        const problem = generateProblem(compound, type);
        const mode = answerInputMode(problem.correctAnswer);
        if (Math.abs(problem.correctAnswer) >= 1e6) {
          expect(mode, `${type} on ${compound.formula}`).toBe('text');
        } else {
          expect(mode, `${type} on ${compound.formula}`).toBe('decimal');
        }
      }
    }
  });

  it('gives every molecule and atom count the full keyboard', () => {
    for (const compound of COMPOUNDS) {
      for (const type of ['moles_to_particles', 'moles_to_element_atoms'] as const) {
        const problem = generateProblem(compound, type);
        expect(answerInputMode(problem.correctAnswer), `${type} on ${compound.formula}`).toBe(
          'text'
        );
      }
    }
  });

  it('can grade a correct answer typed on the keyboard it opens', () => {
    for (let run = 0; run < 20; run++) {
      for (const problem of generateAllProblems()) {
        const answer = problem.correctAnswer;
        if (answerInputMode(answer) === 'decimal') {
          // Four significant figures with a decimal comma: keypad characters only.
          const typed = String(Number(answer.toPrecision(4))).replace('.', ',');
          expect(typed, problem.questionText).toMatch(DECIMAL_KEYPAD);
          const read = parseScientificAnswer(typed);
          expect(read, typed).not.toBeNull();
          expect(Math.abs((read as number) - answer) / answer).toBeLessThanOrEqual(0.05);
        } else {
          for (const typed of asPhoneTyped(answer)) {
            const read = parseScientificAnswer(typed);
            expect(read, typed).not.toBeNull();
            expect(Math.abs((read as number) - answer) / answer, typed).toBeLessThanOrEqual(0.05);
          }
        }
      }
    }
  });
});

describe('Stig 1 formula headline', () => {
  it('starts every hydrate at the smallest size, since text-5xl splits it mid-formula', () => {
    const hydrates = COMPOUNDS.filter((c) => c.formula.includes('·'));
    expect(hydrates.length).toBeGreaterThan(0);
    for (const c of hydrates) {
      expect(formulaSizeClass(c.formula).split(' ')[0], c.formula).toBe('text-3xl');
    }
  });

  it('keeps text-5xl from sm up for every formula, so the desktop layout is unchanged', () => {
    for (const c of COMPOUNDS) {
      // Classes run from the narrowest screen up, and every breakpoint in them
      // is at or below sm, so the last one is what sm and wider render.
      const classes = formulaSizeClass(c.formula).split(' ');
      expect(classes.at(-1)?.split(':').at(-1), c.formula).toBe('text-5xl');
      for (const cls of classes.slice(0, -1)) {
        expect(cls, c.formula).toMatch(/^(text-[34]xl|min-\[360px\]:text-[45]xl)$/);
      }
    }
  });

  it('leaves short formulas at text-5xl on every screen', () => {
    for (const formula of ['H₂O', 'CO₂', 'NaCl', 'CaCO₃', 'NaHCO₃']) {
      expect(formulaSizeClass(formula)).toBe('text-5xl');
    }
  });
});
