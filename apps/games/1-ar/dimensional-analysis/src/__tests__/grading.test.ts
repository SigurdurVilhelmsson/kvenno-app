import { describe, it, expect } from 'vitest';

import { level2Problems } from '../data/problems';
import {
  applyFactorPath,
  isAnswerCorrect,
  parseStudentNumber,
  RELATIVE_TOLERANCE,
} from '../utils/grading';

/**
 * Guards B13 (an absolute 0,01 grading tolerance) and the half of B9 that lives
 * in this game (`parseFloat` cannot read an Icelandic decimal comma).
 *
 * Both were in the same expression in `Level2.tsx`, twice over, and in three
 * places in `Level3.tsx`.
 */

describe('parseStudentNumber', () => {
  it('reads the Icelandic decimal comma', () => {
    // parseFloat('0,5') stops at the comma and returns 0. The game's own worked
    // example writes the answer as "0,5 g", so this is the format it teaches.
    expect(parseStudentNumber('0,5')).toBe(0.5);
    expect(parseStudentNumber('2,5')).toBe(2.5);
  });

  it('still reads a decimal point', () => {
    expect(parseStudentNumber('0.5')).toBe(0.5);
  });

  it('ignores surrounding whitespace', () => {
    expect(parseStudentNumber('  2,5  ')).toBe(2.5);
  });

  it('returns NaN for empty or unreadable input', () => {
    expect(parseStudentNumber('')).toBeNaN();
    expect(parseStudentNumber('   ')).toBeNaN();
    expect(parseStudentNumber('abc')).toBeNaN();
  });
});

describe('isAnswerCorrect', () => {
  it('rejects zero against a small expected answer — the B13 case', () => {
    // L2-7 converts 5000 mg to 0,005 kg. Under the old absolute 0,01 tolerance,
    // |0 - 0.005| < 0.01, so typing `0` scored correct.
    expect(isAnswerCorrect(0, 0.005)).toBe(false);
    expect(isAnswerCorrect(0.005, 0.005)).toBe(true);
  });

  it('means the same thing at every scale', () => {
    for (const expected of [0.005, 0.5, 25, 7200, 50000, 5_000_000]) {
      expect(isAnswerCorrect(expected, expected), `exact ${expected}`).toBe(true);
      expect(isAnswerCorrect(expected * 1.2, expected), `20% high on ${expected}`).toBe(false);
      expect(isAnswerCorrect(0, expected), `zero against ${expected}`).toBe(false);
    }
  });

  it('allows rounding up to the stated tolerance and no further', () => {
    const expected = 100;
    expect(isAnswerCorrect(expected * (1 + RELATIVE_TOLERANCE), expected)).toBe(true);
    expect(isAnswerCorrect(expected * (1 - RELATIVE_TOLERANCE), expected)).toBe(true);
    expect(isAnswerCorrect(expected * (1 + RELATIVE_TOLERANCE * 2), expected)).toBe(false);
  });

  it('rejects unreadable input rather than treating it as zero', () => {
    expect(isAnswerCorrect(Number.NaN, 0.5)).toBe(false);
    expect(isAnswerCorrect(Number.POSITIVE_INFINITY, 0.5)).toBe(false);
  });

  it('requires an exact zero when the expected value is zero', () => {
    expect(isAnswerCorrect(0, 0)).toBe(true);
    expect(isAnswerCorrect(0.001, 0)).toBe(false);
  });

  it('handles a negative expected value', () => {
    // The Level 3 relative branch computed `expected * 0.01` as its tolerance,
    // which is negative when the expected value is, so nothing could satisfy it.
    expect(isAnswerCorrect(-50, -50)).toBe(true);
    expect(isAnswerCorrect(-60, -50)).toBe(false);
  });
});

describe('the real Level 2 problem set', () => {
  const withAnswers = level2Problems.map(
    (p) => [p.id, p, applyFactorPath(p.startValue, p.correctPath)] as const
  );

  it.each(withAnswers)('%s accepts its own answer, typed with a comma', (_id, _problem, answer) => {
    const asStudentWritesIt = String(answer).replace('.', ',');
    expect(isAnswerCorrect(parseStudentNumber(asStudentWritesIt), answer)).toBe(true);
  });

  it.each(withAnswers)('%s rejects a typed zero', (_id, _problem, answer) => {
    expect(isAnswerCorrect(parseStudentNumber('0'), answer)).toBe(false);
  });

  it('has an answer for every problem, none of them zero or unreadable', () => {
    expect(withAnswers.length).toBe(15);
    for (const [id, , answer] of withAnswers) {
      expect(Number.isFinite(answer), id).toBe(true);
      expect(answer, id).not.toBe(0);
    }
  });

  it('reproduces two answers computed by hand', () => {
    const byId = (id: string) => withAnswers.find(([i]) => i === id)![2];
    expect(byId('L2-1')).toBeCloseTo(0.5, 10); // 500 mg -> g
    expect(byId('L2-7')).toBeCloseTo(0.005, 10); // 5000 mg -> kg
  });
});
