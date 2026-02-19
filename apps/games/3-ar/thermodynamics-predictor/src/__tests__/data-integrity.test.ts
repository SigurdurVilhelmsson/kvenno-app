import { describe, it, expect } from 'vitest';

import { PROBLEMS } from '../data/problems';
import type { Problem } from '../types';

const allProblems: Problem[] = [
  ...PROBLEMS.beginner,
  ...PROBLEMS.intermediate,
  ...PROBLEMS.advanced,
];

describe('problems data integrity - required fields', () => {
  it('every problem has a numeric id', () => {
    for (const problem of allProblems) {
      expect(problem.id, `Problem "${problem.name}" missing id`).toBeTypeOf('number');
    }
  });

  it('every problem has a non-empty name', () => {
    for (const problem of allProblems) {
      expect(problem.name, `Problem id=${problem.id} has empty name`).toBeTruthy();
      expect(problem.name.length).toBeGreaterThan(0);
    }
  });

  it('every problem has deltaH as a number', () => {
    for (const problem of allProblems) {
      expect(problem.deltaH, `Problem "${problem.name}" missing deltaH`).toBeTypeOf('number');
    }
  });

  it('every problem has deltaS as a number', () => {
    for (const problem of allProblems) {
      expect(problem.deltaS, `Problem "${problem.name}" missing deltaS`).toBeTypeOf('number');
    }
  });

  it('every problem has a valid difficulty label', () => {
    const validDifficulties = ['Auðvelt', 'Miðlungs', 'Erfitt'];
    for (const problem of allProblems) {
      expect(
        validDifficulties,
        `Problem "${problem.name}" has invalid difficulty: "${problem.difficulty}"`
      ).toContain(problem.difficulty);
    }
  });

  it('every problem has a non-empty reaction string', () => {
    for (const problem of allProblems) {
      expect(problem.reaction, `Problem "${problem.name}" missing reaction`).toBeTruthy();
      expect(problem.reaction.length).toBeGreaterThan(0);
    }
  });

  it('every problem has a valid scenario (1-4)', () => {
    for (const problem of allProblems) {
      expect(
        [1, 2, 3, 4],
        `Problem "${problem.name}" has invalid scenario: ${problem.scenario}`
      ).toContain(problem.scenario);
    }
  });

  it('every problem has a positive defaultTemp in Kelvin', () => {
    for (const problem of allProblems) {
      expect(problem.defaultTemp, `Problem "${problem.name}" has non-positive temp`).toBeGreaterThan(0);
    }
  });

  it('all problem ids are unique', () => {
    const ids = allProblems.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('problems data integrity - scenario classification', () => {
  it('scenario 1 problems have ΔH<0 and ΔS>0', () => {
    const scenario1 = allProblems.filter(p => p.scenario === 1);
    expect(scenario1.length).toBeGreaterThan(0);
    for (const problem of scenario1) {
      expect(problem.deltaH, `Problem "${problem.name}" (scenario 1) should have ΔH<0`).toBeLessThan(0);
      expect(problem.deltaS, `Problem "${problem.name}" (scenario 1) should have ΔS>0`).toBeGreaterThan(0);
    }
  });

  it('scenario 2 problems have ΔH>0 and ΔS<0', () => {
    const scenario2 = allProblems.filter(p => p.scenario === 2);
    expect(scenario2.length).toBeGreaterThan(0);
    for (const problem of scenario2) {
      expect(problem.deltaH, `Problem "${problem.name}" (scenario 2) should have ΔH>0`).toBeGreaterThan(0);
      expect(problem.deltaS, `Problem "${problem.name}" (scenario 2) should have ΔS<0`).toBeLessThan(0);
    }
  });

  it('scenario 3 problems have ΔH<0 and ΔS<0', () => {
    const scenario3 = allProblems.filter(p => p.scenario === 3);
    expect(scenario3.length).toBeGreaterThan(0);
    for (const problem of scenario3) {
      expect(problem.deltaH, `Problem "${problem.name}" (scenario 3) should have ΔH<0`).toBeLessThan(0);
      expect(problem.deltaS, `Problem "${problem.name}" (scenario 3) should have ΔS<0`).toBeLessThan(0);
    }
  });

  it('scenario 4 problems have ΔH>0 and ΔS>0', () => {
    const scenario4 = allProblems.filter(p => p.scenario === 4);
    expect(scenario4.length).toBeGreaterThan(0);
    for (const problem of scenario4) {
      expect(problem.deltaH, `Problem "${problem.name}" (scenario 4) should have ΔH>0`).toBeGreaterThan(0);
      expect(problem.deltaS, `Problem "${problem.name}" (scenario 4) should have ΔS>0`).toBeGreaterThan(0);
    }
  });
});

describe('problems data integrity - difficulty levels', () => {
  it('has beginner problems', () => {
    expect(PROBLEMS.beginner.length).toBeGreaterThan(0);
  });

  it('has intermediate problems', () => {
    expect(PROBLEMS.intermediate.length).toBeGreaterThan(0);
  });

  it('has advanced problems', () => {
    expect(PROBLEMS.advanced.length).toBeGreaterThan(0);
  });

  it('beginner problems have "Auðvelt" difficulty label', () => {
    for (const problem of PROBLEMS.beginner) {
      expect(problem.difficulty).toBe('Auðvelt');
    }
  });

  it('intermediate problems have "Miðlungs" difficulty label', () => {
    for (const problem of PROBLEMS.intermediate) {
      expect(problem.difficulty).toBe('Miðlungs');
    }
  });

  it('advanced problems have "Erfitt" difficulty label', () => {
    for (const problem of PROBLEMS.advanced) {
      expect(problem.difficulty).toBe('Erfitt');
    }
  });
});
