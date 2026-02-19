import { describe, it, expect } from 'vitest';
import { validateInput, checkAnswer, getContextualFeedback } from '../utils/validation';
import {
  getPointValue,
  getHintPenalty,
  getSpeedBonus,
  getStreakBonus,
  getAchievement,
  getProblemCount,
} from '../utils/scoring';
import { generateProblem } from '../utils/problem-generator';

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
// utils/scoring.ts
// ---------------------------------------------------------------------------

describe('getPointValue', () => {
  it('returns 10 for easy', () => {
    expect(getPointValue('easy')).toBe(10);
  });

  it('returns 15 for medium', () => {
    expect(getPointValue('medium')).toBe(15);
  });

  it('returns 20 for hard', () => {
    expect(getPointValue('hard')).toBe(20);
  });
});

describe('getHintPenalty', () => {
  it('returns 0 for any hint level in practice mode', () => {
    expect(getHintPenalty(1, 'practice')).toBe(0);
    expect(getHintPenalty(2, 'practice')).toBe(0);
    expect(getHintPenalty(3, 'practice')).toBe(0);
  });

  it('returns escalating penalties in competition mode', () => {
    expect(getHintPenalty(1, 'competition')).toBe(2);
    expect(getHintPenalty(2, 'competition')).toBe(4);
    expect(getHintPenalty(3, 'competition')).toBe(7);
  });

  it('returns 0 for hint level 0 in competition mode', () => {
    expect(getHintPenalty(0, 'competition')).toBe(0);
  });
});

describe('getSpeedBonus', () => {
  it('returns 10 when time remaining > 70 and timer is active', () => {
    expect(getSpeedBonus(75, true)).toBe(10);
  });

  it('returns 5 when time remaining is between 61 and 70 and timer is active', () => {
    expect(getSpeedBonus(65, true)).toBe(5);
  });

  it('returns 0 when time remaining <= 60 and timer is active', () => {
    expect(getSpeedBonus(50, true)).toBe(0);
  });

  it('returns 0 regardless of time when timer is inactive', () => {
    expect(getSpeedBonus(90, false)).toBe(0);
  });
});

describe('getStreakBonus', () => {
  it('returns 5 for streak of 3', () => {
    expect(getStreakBonus(3)).toBe(5);
  });

  it('returns 10 for streak of 5', () => {
    expect(getStreakBonus(5)).toBe(10);
  });

  it('returns 0 for streaks that are not 3 or 5', () => {
    expect(getStreakBonus(1)).toBe(0);
    expect(getStreakBonus(4)).toBe(0);
    expect(getStreakBonus(10)).toBe(0);
  });
});

describe('getAchievement', () => {
  it('returns mixing achievement for streak 3 with mixing type', () => {
    const result = getAchievement(3, 'mixing');
    expect(result).toBe('Fullkomin blöndun! 🧪');
  });

  it('returns dilution achievement for streak 3 with dilution type', () => {
    const result = getAchievement(3, 'dilution');
    expect(result).toBe('Útþynningar sérfræðingur! 💧');
  });

  it('returns generic streak-5 achievement regardless of type', () => {
    const result = getAchievement(5, 'molarity');
    expect(result).toBe('5 réttar! 🔥🔥');
  });

  it('returns generic streak-3 achievement for non-special types', () => {
    const result = getAchievement(3, 'molarity');
    expect(result).toBe('3 í röð! 🔥');
  });

  it('returns null for streaks below 3', () => {
    expect(getAchievement(2, 'dilution')).toBeNull();
    expect(getAchievement(0, 'mixing')).toBeNull();
  });
});

describe('getProblemCount', () => {
  it('returns 8 for easy', () => {
    expect(getProblemCount('easy')).toBe(8);
  });

  it('returns 10 for medium', () => {
    expect(getProblemCount('medium')).toBe(10);
  });

  it('returns 12 for hard', () => {
    expect(getProblemCount('hard')).toBe(12);
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
