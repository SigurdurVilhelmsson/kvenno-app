import { describe, it, expect } from 'vitest';

import { CHEMICALS } from '../data';
import type { Chemical, Difficulty, Problem } from '../types';
import { generateProblem } from '../utils/problem-generator';

const ALL: Chemical[] = [...CHEMICALS.simple, ...CHEMICALS.medium, ...CHEMICALS.hard];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const RUNS = 4000;

/**
 * The highest molarity any solution in the problem reaches. Every generator
 * either states a molarity outright or implies one through mass and volume.
 */
function peakMolarity(p: Problem): number {
  const g = p.given as Record<string, number | undefined>;
  const candidates: number[] = [];

  if (typeof p.answer === 'number' && p.unit === 'M') candidates.push(p.answer);
  for (const key of ['M1', 'M2', 'molarity'] as const) {
    if (typeof g[key] === 'number') candidates.push(g[key] as number);
  }
  if (typeof g.moles === 'number' && typeof g.volume === 'number' && g.volume > 0) {
    candidates.push(g.moles / g.volume);
  }
  if (
    typeof g.massInGrams === 'number' &&
    typeof g.volumeInML === 'number' &&
    g.volumeInML > 0 &&
    p.chemical
  ) {
    candidates.push(g.massInGrams / p.chemical.molarMass / (g.volumeInML / 1000));
  }
  return candidates.length ? Math.max(...candidates) : 0;
}

describe('every chemical declares a solubility ceiling', () => {
  it.each(ALL.map((c) => [c.name, c] as const))(
    '%s has a maxMolarity',
    (_name, chemical: Chemical) => {
      expect(typeof chemical.maxMolarity).toBe('number');
      expect(chemical.maxMolarity).toBeGreaterThan(0);
    }
  );
});

describe('generated problems are physically possible', () => {
  it.each(DIFFICULTIES)(
    '%s: no problem asks for a solution more concentrated than the substance dissolves',
    (difficulty) => {
      const impossible: string[] = [];
      for (let i = 0; i < RUNS; i++) {
        const p = generateProblem(difficulty);
        if (!p.chemical) continue;
        const peak = peakMolarity(p);
        // No slack: quantities that determine a molarity are rounded down, so a
        // draw at the ceiling stays at or under it.
        if (peak > p.chemical.maxMolarity) {
          impossible.push(
            `${p.type} ${p.chemical.name}: ${peak.toFixed(2)} M > ${p.chemical.maxMolarity} M`
          );
        }
      }
      expect(impossible.slice(0, 5)).toEqual([]);
    }
  );
});
