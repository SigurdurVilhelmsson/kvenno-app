import { describe, it, expect } from 'vitest';

import { calculateScore } from '../utils/kinetics-scoring';

describe('calculateScore', () => {
  it('returns full points for correct answer without hint', () => {
    expect(calculateScore(true, false)).toBe(20);
  });

  it('returns reduced points for correct answer with hint', () => {
    expect(calculateScore(true, true)).toBe(10);
  });

  it('returns 0 for incorrect answer without hint', () => {
    expect(calculateScore(false, false)).toBe(0);
  });

  it('returns 0 for incorrect answer with hint', () => {
    expect(calculateScore(false, true)).toBe(0);
  });

  it('uses custom base points', () => {
    expect(calculateScore(true, false, 50)).toBe(50);
  });

  it('uses custom hint penalty', () => {
    expect(calculateScore(true, true, 50, 20)).toBe(30);
  });

  it('handles case where penalty equals base points', () => {
    expect(calculateScore(true, true, 20, 20)).toBe(0);
  });

  it('handles zero base points', () => {
    expect(calculateScore(true, false, 0)).toBe(0);
  });
});
