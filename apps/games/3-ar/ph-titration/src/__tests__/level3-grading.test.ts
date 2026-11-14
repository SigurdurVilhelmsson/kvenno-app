import { describe, expect, it } from 'vitest';

import { formatDecimal, formatScientific } from '@shared/utils';

import { isAnswerCorrect, LEVEL3_CHALLENGES } from '../data/level3-challenges';

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
    expect(phProblems.map((c) => c.id)).toEqual([6, 8]);
    for (const c of phProblems) {
      expect(c.absoluteTolerance).toBe(0.02);
      // ±2 % of pH 4,86 would accept 4,96, a tenth of a pH unit off.
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

  it('does not print the half-equivalence answer in the question (problem 8)', () => {
    const c = LEVEL3_CHALLENGES.find((x) => x.id === 8)!;
    expect(c.givenData.pKa).toBeUndefined();
    expect(c.descriptionIs).not.toContain('3,17');
    expect(c.descriptionIs).toContain(formatScientific(c.givenData.Ka!, 2));
    expect(-Math.log10(c.givenData.Ka!)).toBeCloseTo(c.correctAnswer, 2);
  });
});
