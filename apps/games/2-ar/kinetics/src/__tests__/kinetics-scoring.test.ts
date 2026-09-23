import { describe, it, expect } from 'vitest';

import { calculateScore } from '../utils/kinetics-scoring';

describe('calculateScore', () => {
  it('returns full points for a correct answer', () => {
    expect(calculateScore(true)).toBe(20);
  });

  it('returns 0 for an incorrect answer', () => {
    expect(calculateScore(false)).toBe(0);
  });

  it('uses custom base points', () => {
    expect(calculateScore(true, 50)).toBe(50);
    expect(calculateScore(false, 50)).toBe(0);
  });

  it('takes no hint argument, so there is nothing to penalise', () => {
    // Hint usage is never penalised (CLAUDE.md). The old signature was
    // (isCorrect, usedHint, basePoints, hintPenalty) and docked 10 of 20.
    expect(calculateScore.length).toBeLessThanOrEqual(1);
  });
});
