/**
 * Molar volume: the third leg of the mole chain.
 *
 * Mass and particles both shipped; volume did not, and the August 2026 harvest
 * note filed it as a Year-3 gap belonging with the gas laws. That was wrong —
 * mol↔L is first-year material (Siggi, 2026-08-27) — and the mistake came from
 * inferring the curriculum from where the platform happened to mention molar
 * volume rather than from the course.
 *
 * The thing this file exists to prevent is the obvious way to get it wrong:
 * **22,4 L/mól is a fact about gases only.** Asking what volume a mole of table
 * salt occupies is the same defect as `lausnir` asking a student to weigh out a
 * gas, which was measured and fixed in August 2026. So every assertion below is
 * about which substance the question may be asked of, as much as about the
 * arithmetic.
 */

import { describe, it, expect } from 'vitest';

import { generateProblem, generateAllProblems, isGas, type ConvType } from '../components/Level2';
import { COMPOUNDS, STANDARD_MOLAR_VOLUME, STP_LABEL } from '../data/compounds';

const GASES = COMPOUNDS.filter(isGas);
const NOT_GASES = COMPOUNDS.filter((c) => !isGas(c));

/** The number the generated question actually states. */
function firstNumber(questionText: string): number {
  const match = questionText.match(/([\d.,]+)\s*(mól|L)/);
  if (!match) throw new Error(`no quantity in: ${questionText}`);
  return Number.parseFloat(match[1].replace(',', '.'));
}

describe('the constant', () => {
  it('is 22,4 L/mól, the value the school textbook teaches', () => {
    // The textbook states STP as 273,15 K and 1 atm, noting that IUPAC moved
    // standard pressure to 1 bar in 1982 and that it keeps the older definition.
    // At 1 bar this would be 22,7 — so the number and the conditions travel
    // together or neither means anything.
    expect(STANDARD_MOLAR_VOLUME).toBe(22.4);
    expect(STP_LABEL).toContain('1 atm');
    expect(STP_LABEL).toContain('0 °C');
  });
});

describe('which substances the question may be asked about', () => {
  it('has gases to ask about', () => {
    expect(GASES.map((c) => c.formula).sort()).toEqual(
      ['C₂H₆', 'C₃H₈', 'CH₄', 'CO₂', 'N₂', 'NH₃', 'O₂'].sort()
    );
  });

  it('does not count water as a gas', () => {
    // At STP water is not a vapour, and "one mole of water occupies 22,4 L" is
    // the single most likely wrong answer a student could be taught here.
    expect(isGas(COMPOUNDS.find((c) => c.formula === 'H₂O')!)).toBe(false);
  });

  it('does not count Saltsýra as a gas', () => {
    // The pure compound HCl is a gas. This game calls it Saltsýra, which is HCl
    // dissolved in water — a solution, and not something with a molar volume.
    // The label is what a student reads, so the state follows the label.
    // Flagged in HARVEST.md: the naming is worth a ruling of its own.
    expect(isGas(COMPOUNDS.find((c) => c.formula === 'HCl')!)).toBe(false);
  });

  it.each(NOT_GASES.map((c) => [c.formula, c] as const))(
    '%s is never asked for a gas volume',
    (formula, compound) => {
      for (const type of ['moles_to_gas_volume', 'gas_volume_to_moles'] as ConvType[]) {
        const problem = generateProblem(compound, type);
        expect(problem.questionText, formula).not.toContain('L af');
        expect(problem.questionText, formula).not.toContain('rúmmál');
      }
    }
  );

  it('never draws a non-gas for a molar-volume slot in a real run', () => {
    for (let run = 0; run < 200; run++) {
      for (const problem of generateAllProblems()) {
        if (!problem.questionText.includes(STP_LABEL)) continue;
        expect(isGas(problem.compound), problem.questionText).toBe(true);
      }
    }
  });
});

describe('the arithmetic', () => {
  it.each(GASES.map((c) => [c.formula, c] as const))(
    '%s — moles to volume is n x 22,4',
    (formula, compound) => {
      const problem = generateProblem(compound, 'moles_to_gas_volume');
      const moles = firstNumber(problem.questionText);
      expect(problem.correctAnswer / (moles * STANDARD_MOLAR_VOLUME), formula).toBeCloseTo(1, 9);
      expect(problem.questionText, formula).toContain(STP_LABEL);
    }
  );

  it.each(GASES.map((c) => [c.formula, c] as const))(
    '%s — volume to moles is V / 22,4',
    (formula, compound) => {
      const problem = generateProblem(compound, 'gas_volume_to_moles');
      const litres = firstNumber(problem.questionText);
      expect(problem.correctAnswer / (litres / STANDARD_MOLAR_VOLUME), formula).toBeCloseTo(1, 9);
      expect(problem.questionText, formula).toContain(STP_LABEL);
    }
  );

  it('states the conditions every time the constant is used', () => {
    // 22,4 without STP beside it is not a fact, it is a coincidence.
    for (const compound of GASES) {
      for (const type of ['moles_to_gas_volume', 'gas_volume_to_moles'] as ConvType[]) {
        const problem = generateProblem(compound, type);
        expect(problem.questionText, `${compound.formula} ${type}`).toContain(STP_LABEL);
      }
    }
  });

  it('says out loud that the rule is for gases only', () => {
    const problem = generateProblem(GASES[0], 'moles_to_gas_volume');
    expect(problem.solutionSteps).toContain('gas');
  });
});

describe('a Level 2 run', () => {
  it('asks the molar-volume conversion at all', () => {
    const problems = generateAllProblems();
    expect(problems.some((p) => p.questionText.includes(STP_LABEL))).toBe(true);
  });
});
