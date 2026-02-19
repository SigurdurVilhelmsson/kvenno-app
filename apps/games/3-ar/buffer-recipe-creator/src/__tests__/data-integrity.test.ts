import { describe, it, expect } from 'vitest';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import type { Difficulty } from '../types';

const VALID_DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

describe('LEVEL2_PUZZLES data integrity', () => {
  it('has at least one puzzle', () => {
    expect(LEVEL2_PUZZLES.length).toBeGreaterThan(0);
  });

  it('all puzzles have required fields', () => {
    for (const puzzle of LEVEL2_PUZZLES) {
      expect(puzzle).toHaveProperty('id');
      expect(puzzle).toHaveProperty('problemId');
      expect(puzzle).toHaveProperty('taskIs');
      expect(puzzle).toHaveProperty('ratioTolerance');
      expect(puzzle).toHaveProperty('massTolerance');
      expect(puzzle).toHaveProperty('hints');
      expect(puzzle).toHaveProperty('explanationIs');

      expect(typeof puzzle.id).toBe('number');
      expect(typeof puzzle.problemId).toBe('number');
      expect(typeof puzzle.taskIs).toBe('string');
      expect(typeof puzzle.ratioTolerance).toBe('number');
      expect(typeof puzzle.massTolerance).toBe('number');
      expect(typeof puzzle.explanationIs).toBe('string');
    }
  });

  it('all puzzles have complete hint objects', () => {
    for (const puzzle of LEVEL2_PUZZLES) {
      expect(puzzle.hints).toHaveProperty('topic');
      expect(puzzle.hints).toHaveProperty('strategy');
      expect(puzzle.hints).toHaveProperty('method');
      expect(puzzle.hints).toHaveProperty('solution');

      expect(typeof puzzle.hints.topic).toBe('string');
      expect(typeof puzzle.hints.strategy).toBe('string');
      expect(typeof puzzle.hints.method).toBe('string');
      expect(typeof puzzle.hints.solution).toBe('string');

      expect(puzzle.hints.topic.length).toBeGreaterThan(0);
      expect(puzzle.hints.strategy.length).toBeGreaterThan(0);
      expect(puzzle.hints.method.length).toBeGreaterThan(0);
      expect(puzzle.hints.solution.length).toBeGreaterThan(0);
    }
  });

  it('all puzzles have unique IDs', () => {
    const ids = LEVEL2_PUZZLES.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all puzzle problemIds reference valid BUFFER_PROBLEMS', () => {
    const problemIds = new Set(BUFFER_PROBLEMS.map((p) => p.id));
    for (const puzzle of LEVEL2_PUZZLES) {
      expect(problemIds.has(puzzle.problemId)).toBe(true);
    }
  });

  it('all puzzles have reasonable tolerances', () => {
    for (const puzzle of LEVEL2_PUZZLES) {
      expect(puzzle.ratioTolerance).toBeGreaterThan(0);
      expect(puzzle.ratioTolerance).toBeLessThanOrEqual(0.5);
      expect(puzzle.massTolerance).toBeGreaterThan(0);
      expect(puzzle.massTolerance).toBeLessThanOrEqual(0.5);
    }
  });
});

describe('Henderson-Hasselbalch verification for level 2 puzzles', () => {
  it('each puzzle targetPH approximately equals pKa + log10(baseToAcidRatio)', () => {
    for (const puzzle of LEVEL2_PUZZLES) {
      // Find the referenced buffer problem
      const problem = BUFFER_PROBLEMS.find((p) => p.id === puzzle.problemId);
      expect(problem).toBeDefined();
      if (!problem) continue;

      // Skip special problems (rangeQuestion, etc.)
      if (problem.rangeQuestion || problem.targetPH === 0) continue;

      // Henderson-Hasselbalch: pH = pKa + log10([Base]/[Acid])
      // So: ratio = 10^(pH - pKa)
      const expectedRatio = Math.pow(10, problem.targetPH - problem.pKa);

      // The stored ratio should match the Henderson-Hasselbalch calculation
      // Using a tolerance of 0.1 (10%) to account for rounding in stored values
      const relativeError = Math.abs(problem.ratio - expectedRatio) / expectedRatio;
      expect(relativeError).toBeLessThan(0.1);
    }
  });
});

describe('BUFFER_PROBLEMS data integrity', () => {
  it('has at least one problem', () => {
    expect(BUFFER_PROBLEMS.length).toBeGreaterThan(0);
  });

  it('all problems have required fields', () => {
    for (const problem of BUFFER_PROBLEMS) {
      expect(problem).toHaveProperty('id');
      expect(problem).toHaveProperty('difficulty');
      expect(problem).toHaveProperty('system');
      expect(problem).toHaveProperty('acidName');
      expect(problem).toHaveProperty('baseName');
      expect(problem).toHaveProperty('pKa');
      expect(problem).toHaveProperty('targetPH');
      expect(problem).toHaveProperty('volume');
      expect(problem).toHaveProperty('totalConcentration');
      expect(problem).toHaveProperty('acidMolarMass');
      expect(problem).toHaveProperty('baseMolarMass');
      expect(problem).toHaveProperty('context');
      expect(problem).toHaveProperty('ratio');

      expect(typeof problem.id).toBe('number');
      expect(typeof problem.difficulty).toBe('string');
      expect(typeof problem.acidName).toBe('string');
      expect(typeof problem.baseName).toBe('string');
      expect(typeof problem.pKa).toBe('number');
    }
  });

  it('all problems have valid difficulty values', () => {
    for (const problem of BUFFER_PROBLEMS) {
      expect(VALID_DIFFICULTIES).toContain(problem.difficulty);
    }
  });

  it('all problems have unique IDs', () => {
    const ids = BUFFER_PROBLEMS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all problems have non-empty acid and base names', () => {
    for (const problem of BUFFER_PROBLEMS) {
      expect(problem.acidName.length).toBeGreaterThan(0);
      expect(problem.baseName.length).toBeGreaterThan(0);
    }
  });

  it('all problems have positive pKa values', () => {
    for (const problem of BUFFER_PROBLEMS) {
      expect(problem.pKa).toBeGreaterThan(0);
    }
  });

  it('all problems have non-empty descriptions (context)', () => {
    for (const problem of BUFFER_PROBLEMS) {
      expect(typeof problem.context).toBe('string');
      expect(problem.context.length).toBeGreaterThan(0);
    }
  });

  it('all problems have positive volume and concentration', () => {
    for (const problem of BUFFER_PROBLEMS) {
      expect(problem.volume).toBeGreaterThan(0);
      expect(problem.totalConcentration).toBeGreaterThan(0);
    }
  });

  it('all problems have positive molar masses', () => {
    for (const problem of BUFFER_PROBLEMS) {
      expect(problem.acidMolarMass).toBeGreaterThan(0);
      expect(problem.baseMolarMass).toBeGreaterThan(0);
    }
  });

  it('problems cover all difficulty levels', () => {
    const difficulties = new Set(BUFFER_PROBLEMS.map((p) => p.difficulty));
    for (const level of VALID_DIFFICULTIES) {
      expect(difficulties.has(level)).toBe(true);
    }
  });
});

describe('Henderson-Hasselbalch verification for all non-special problems', () => {
  it('ratio matches 10^(pH - pKa) for standard problems', () => {
    const standardProblems = BUFFER_PROBLEMS.filter(
      (p) => !p.rangeQuestion && p.targetPH > 0 && p.ratio > 0
    );

    expect(standardProblems.length).toBeGreaterThan(0);

    for (const problem of standardProblems) {
      const expectedRatio = Math.pow(10, problem.targetPH - problem.pKa);
      const relativeError = Math.abs(problem.ratio - expectedRatio) / expectedRatio;
      expect(relativeError).toBeLessThan(0.1);
    }
  });

  it('beginner problems all have ratio = 1.00 (pH = pKa)', () => {
    const beginnerProblems = BUFFER_PROBLEMS.filter(
      (p) => p.difficulty === 'beginner'
    );
    for (const problem of beginnerProblems) {
      expect(problem.ratio).toBe(1.00);
      expect(problem.targetPH).toBeCloseTo(problem.pKa, 2);
    }
  });
});
