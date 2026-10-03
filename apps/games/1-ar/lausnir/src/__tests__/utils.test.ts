import { describe, it, expect } from 'vitest';

import { generateProblem } from '../utils/problem-generator';
import { validateInput, checkAnswer, getContextualFeedback } from '../utils/validation';

// ---------------------------------------------------------------------------
// utils/validation.ts
// ---------------------------------------------------------------------------

describe('validateInput', () => {
  it('returns invalid with no error for empty string', () => {
    const result = validateInput('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeNull();
  });

  it('returns invalid with no error for whitespace-only string', () => {
    const result = validateInput('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBeNull();
  });

  it('reads the Icelandic decimal comma', () => {
    // B9: `parseFloat('0,5')` is 0, so a student writing the answer the way the
    // game's own worked examples write it graded as a tenth of it.
    expect(validateInput('0,5')).toEqual({ valid: true, error: null, value: 0.5 });
    expect(validateInput('12,25')).toEqual({ valid: true, error: null, value: 12.25 });
    // A full stop still works, for a student on a different keyboard.
    expect(validateInput('0.5')).toEqual({ valid: true, error: null, value: 0.5 });
  });

  it('returns error for NaN input', () => {
    const result = validateInput('abc');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Sláðu inn tölu');
  });

  it('returns error for zero', () => {
    const result = validateInput('0');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Sláðu inn jákvæða tölu');
  });

  it('returns error for negative number', () => {
    const result = validateInput('-5');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Sláðu inn jákvæða tölu');
  });

  it('returns error when value is >= 1000', () => {
    const result = validateInput('1000');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Talan er of há (< 1000)');
  });

  it('accepts valid positive number below 1000', () => {
    const result = validateInput('42.5');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.value).toBe(42.5);
  });

  it('handles scientific notation like 1e2', () => {
    const result = validateInput('1e2');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(100);
  });

  it('rejects scientific notation that exceeds bounds', () => {
    const result = validateInput('1e4');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Talan er of há (< 1000)');
  });
});

describe('checkAnswer', () => {
  it('accepts exact answer', () => {
    expect(checkAnswer(2.5, 2.5)).toBe(true);
  });

  it('accepts answer within default 2% tolerance', () => {
    // 2% of 10 = 0.2, so 10.15 should be accepted
    expect(checkAnswer(10.15, 10)).toBe(true);
  });

  it('rejects answer outside default 2% tolerance', () => {
    // 2% of 10 = 0.2, so 10.25 should be rejected
    expect(checkAnswer(10.25, 10)).toBe(false);
  });

  it('uses custom tolerance when provided', () => {
    // 5% of 100 = 5, so 104 should be accepted
    expect(checkAnswer(104, 100, 5)).toBe(true);
    // but 106 should not
    expect(checkAnswer(106, 100, 5)).toBe(false);
  });

  it('uses minimum tolerance of 0.01 when correct answer is very small', () => {
    // For correctAnswer close to 0, percentage tolerance would be tiny.
    // The || 0.01 fallback ensures a minimum tolerance of 0.01.
    expect(checkAnswer(0.005, 0, 2)).toBe(true);
    expect(checkAnswer(0.02, 0, 2)).toBe(false);
  });
});

describe('getContextualFeedback', () => {
  it('returns "very far" message for > 50% error', () => {
    const feedback = getContextualFeedback(200, 100);
    expect(feedback).toContain('Mjög langt frá');
  });

  it('returns unit-conversion hint for 20-50% error', () => {
    const feedback = getContextualFeedback(70, 100);
    expect(feedback).toContain('mL í L');
  });

  it('returns "close" message for 5-20% error', () => {
    const feedback = getContextualFeedback(92, 100);
    expect(feedback).toContain('Nálægt');
  });

  it('returns precision hint for <= 5% error', () => {
    const feedback = getContextualFeedback(99, 100);
    expect(feedback).toContain('Mjög nálægt');
  });
});

// ---------------------------------------------------------------------------
// utils/problem-generator.ts
// ---------------------------------------------------------------------------

describe('generateProblem', () => {
  it('returns a valid Problem object with all required fields', () => {
    const problem = generateProblem('easy');
    expect(problem).toHaveProperty('id');
    expect(problem).toHaveProperty('type');
    expect(problem).toHaveProperty('description');
    expect(problem).toHaveProperty('given');
    expect(problem).toHaveProperty('question');
    expect(problem).toHaveProperty('answer');
    expect(problem).toHaveProperty('unit');
    expect(problem).toHaveProperty('difficulty');
    expect(problem).toHaveProperty('hints');
  });

  it('generates a hints array of length 3', () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateProblem('medium');
      expect(problem.hints).toHaveLength(3);
    }
  });

  it('generates a positive numeric answer', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateProblem('easy');
      expect(typeof problem.answer).toBe('number');
      expect(problem.answer).toBeGreaterThan(0);
      expect(Number.isFinite(problem.answer)).toBe(true);
    }
  });

  it('only generates easy types (dilution, molarity, molarityFromMass) for easy difficulty', () => {
    const easyTypes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      easyTypes.add(generateProblem('easy').type);
    }
    for (const t of easyTypes) {
      expect(['dilution', 'molarity', 'molarityFromMass']).toContain(t);
    }
  });

  it('can generate mixing and massFromMolarity types for hard difficulty', () => {
    const hardTypes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      hardTypes.add(generateProblem('hard').type);
    }
    // With 100 iterations, all 5 types should appear
    expect(hardTypes.has('mixing')).toBe(true);
    expect(hardTypes.has('massFromMolarity')).toBe(true);
  });

  it('dilution problems satisfy M1*V1 = M2*V2', () => {
    for (let i = 0; i < 30; i++) {
      const problem = generateProblem('easy');
      if (problem.type === 'dilution') {
        const { M1, V1, V2 } = problem.given;
        // For easy dilution, answer = M2 = (M1*V1)/V2
        const expected = (M1 * V1) / V2;
        expect(problem.answer).toBeCloseTo(expected, 2);
        return; // Found and verified at least one dilution problem
      }
    }
    // If we never generated a dilution problem in 30 tries, that would be very unlikely
    // but we should not fail. The easy pool guarantees dilution is available.
  });

  it('molarity problems satisfy M = n / V', () => {
    for (let i = 0; i < 30; i++) {
      const problem = generateProblem('easy');
      if (problem.type === 'molarity') {
        const { moles, volume } = problem.given;
        const expected = moles / volume;
        expect(problem.answer).toBeCloseTo(expected, 2);
        return;
      }
    }
  });
});
