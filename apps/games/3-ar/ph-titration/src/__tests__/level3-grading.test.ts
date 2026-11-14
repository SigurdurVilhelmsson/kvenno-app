import { describe, expect, it } from 'vitest';

import { formatDecimal, formatScientific } from '@shared/utils';

import { isAnswerCorrect, LEVEL3_CHALLENGES } from '../data/level3-challenges';
import { getTitrationById } from '../data/titrations';
import { calculatePH } from '../utils/ph-calculations';

describe('Stig 3 grading', () => {
  it.each(LEVEL3_CHALLENGES.map((c) => [c.id, c] as const))(
    'problem %i accepts its answer and rejects 0, double, half and NaN',
    (_, c) => {
      expect(isAnswerCorrect(c, c.correctAnswer)).toBe(true);
      for (const wrong of [0, c.correctAnswer * 2, c.correctAnswer / 2, NaN]) {
        expect(isAnswerCorrect(c, wrong)).toBe(false);
      }
    }
  );

  it('grades every pH answer at an absolute ±0,02', () => {
    const phProblems = LEVEL3_CHALLENGES.filter((c) => c.unit === '' && /pH/.test(c.titleIs));
    expect(phProblems.map((c) => c.id)).toEqual([7, 8, 9, 10, 11]);
    for (const c of phProblems) {
      expect(c.absoluteTolerance).toBe(0.02);
      // ±2 % of pH 4,57 would accept 4,66, a tenth of a pH unit off.
      expect(isAnswerCorrect(c, c.correctAnswer + 0.05)).toBe(false);
      expect(isAnswerCorrect(c, c.correctAnswer + 0.02)).toBe(true);
    }
  });

  it('prints each answer to its significant figures, as its worked solution does', () => {
    for (const c of LEVEL3_CHALLENGES) {
      const shown = formatDecimal(c.correctAnswer, c.answerDecimals);
      expect(c.solutionStepsIs.join(' ')).toContain(shown);
    }
  });

  it('does not print the half-equivalence answer in the question (problem 7)', () => {
    const c = LEVEL3_CHALLENGES.find((x) => x.id === 7)!;
    expect(c.givenData.pKa).toBeUndefined();
    expect(c.descriptionIs).not.toContain('3,17');
    expect(c.descriptionIs).toContain(formatScientific(c.givenData.Ka!, 2));
    expect(-Math.log10(c.givenData.Ka!)).toBeCloseTo(c.correctAnswer, 2);
  });
});

/**
 * Four problems walk one titration (2026-11-14): 25,0 mL of 0,100 M ediksýra
 * with 0,100 M NaOH, the flask Stig 2 and Agnasýn draw. Each answer is the
 * game's own `calculatePH` at that volume, so the problems, the curve and the
 * worked solutions cannot disagree.
 */
describe('Stig 3 points on one titration curve', () => {
  const curve = LEVEL3_CHALLENGES.filter((c) => c.type === 'titration-curve');

  it('poses four, before, in the buffer region, at and past equivalence', () => {
    expect(curve.map((c) => c.fromCurve!.volume)).toEqual([0, 10, 25, 30]);
    expect(new Set(curve.map((c) => c.fromCurve!.titrationId)).size).toBe(1);
  });

  it.each(curve.map((c) => [c.id, c] as const))(
    'problem %i: its answer is the curve, rounded',
    (_, c) => {
      const t = getTitrationById(c.fromCurve!.titrationId)!;
      expect(c.correctAnswer).toBe(Number(calculatePH(t, c.fromCurve!.volume).toFixed(2)));
    }
  );

  it.each(curve.map((c) => [c.id, c] as const))(
    'problem %i: states the flask the curve is drawn for',
    (_, c) => {
      const t = getTitrationById(c.fromCurve!.titrationId)!;
      expect(c.givenData.analyteVolume).toBe(t.analyte.volume);
      expect(c.givenData.analyteMolarity).toBe(t.analyte.molarity);
      expect(c.givenData.titrantMolarity).toBe(t.titrant.molarity);
      expect(c.givenData.Ka).toBe((t as { Ka: number }).Ka);
      if (c.fromCurve!.volume > 0 && c.fromCurve!.volume !== 25) {
        expect(c.givenData.titrantAdded).toBe(c.fromCurve!.volume);
      }
    }
  );
});
