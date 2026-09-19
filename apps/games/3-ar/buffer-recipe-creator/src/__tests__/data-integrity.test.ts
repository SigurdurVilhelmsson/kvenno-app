import { describe, it, expect } from 'vitest';

import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import { solveBuffer } from '../engine/buffer';
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

      // Henderson-Hasselbalch: pH = pKa + log10([Base]/[Acid]), so ratio = 10^(pH - pKa).
      // Nothing is stored any more, so this is now a check that the engine agrees
      // with the formula rather than that a hand-typed number does.
      const expectedRatio = Math.pow(10, problem.targetPH - problem.pKa);
      expect(solveBuffer(problem).ratio).toBeCloseTo(expectedRatio, 10);
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
      // 'ratio' is deliberately absent — it is derived by solveBuffer, not stored.

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
  const standardProblems = BUFFER_PROBLEMS.filter((p) => !p.rangeQuestion && p.targetPH > 0);

  it('ratio matches 10^(pH - pKa) for standard problems', () => {
    expect(standardProblems.length).toBeGreaterThan(0);
    for (const problem of standardProblems) {
      const expectedRatio = Math.pow(10, problem.targetPH - problem.pKa);
      expect(solveBuffer(problem).ratio).toBeCloseTo(expectedRatio, 10);
    }
  });

  it('beginner problems all have ratio = 1.00 (pH = pKa)', () => {
    const beginnerProblems = BUFFER_PROBLEMS.filter((p) => p.difficulty === 'beginner');
    for (const problem of beginnerProblems) {
      expect(problem.targetPH).toBeCloseTo(problem.pKa, 2);
      expect(solveBuffer(problem).ratio).toBeCloseTo(1.0, 2);
    }
  });

  // The three checks below are the ones that did not exist before Sep 2026, and
  // their absence is why 13 of 29 problems shipped with a mole or mass value that
  // disagreed with the ratio the test above was happily verifying. Checking one
  // link of a chain proves nothing about the others.

  it('moles split the total according to the ratio, and sum back to it', () => {
    for (const problem of standardProblems) {
      const { ratio, acidMoles, baseMoles } = solveBuffer(problem);
      const total = problem.totalConcentration * problem.volume;
      expect(acidMoles + baseMoles).toBeCloseTo(total, 10);
      expect(baseMoles / acidMoles).toBeCloseTo(ratio, 8);
    }
  });

  it('masses are their own moles times their own molar mass', () => {
    for (const problem of standardProblems) {
      const { acidMoles, baseMoles, acidMass, baseMass } = solveBuffer(problem);
      // A pH-adjustment problem weighs out all the acid, not just the acid fraction.
      const expectedAcidMoles = problem.phAdjustment
        ? problem.totalConcentration * problem.volume
        : acidMoles;
      expect(acidMass).toBeCloseTo(expectedAcidMoles * problem.acidMolarMass, 10);
      expect(baseMass).toBeCloseTo(baseMoles * problem.baseMolarMass, 10);
    }
  });

  it('round-trips: the derived recipe reproduces the target pH', () => {
    // The strongest statement available — whatever the engine hands a student,
    // putting it back into Henderson-Hasselbalch must give the pH that was asked for.
    for (const problem of standardProblems) {
      const { acidMoles, baseMoles } = solveBuffer(problem);
      const pH = problem.pKa + Math.log10(baseMoles / acidMoles);
      expect(pH).toBeCloseTo(problem.targetPH, 8);
    }
  });
});
