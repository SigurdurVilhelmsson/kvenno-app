import { describe, expect, it } from 'vitest';

import { ALL_PROBLEMS } from './play-helpers';
import {
  calculateDeltaG,
  DELTA_G_TOLERANCE_MAX,
  deltaGAxisHalfRange,
  deltaGTolerance,
  isDeltaGCorrect,
} from '../utils/thermo-calculations';

/**
 * The ΔG° grader.
 *
 * **Why this exists.** It graded within a flat ±3 kJ/mol, and several problems have a ΔG° not
 * much bigger than that: Demant → Grafít is −2,9 kJ/mol at 298 K, so `0`, half the answer and
 * double it were all marked right. Every graded answer must reject `0`, double, half and
 * `NaN` — the platform rule — so that is asserted here as a property over every problem at
 * every temperature the slider can reach, not over a chosen comparison mode.
 */

const comma = (x: number, decimals: number) => x.toFixed(decimals).replace('.', ',');

/** Every problem at every whole temperature the slider offers. */
const CASES = ALL_PROBLEMS.flatMap(({ problem }) =>
  Array.from({ length: 1001 }, (_, i) => 200 + i).map((T) => ({
    problem,
    T,
    deltaG: calculateDeltaG(problem.deltaH, problem.deltaS, T),
  }))
);

describe('isDeltaGCorrect', () => {
  it('covers every problem at every slider temperature', () => {
    expect(CASES.length).toBe(30 * 1001);
  });

  it('rejects 0, half, double and NaN wherever ΔG° is not itself about 0', () => {
    for (const { problem, T, deltaG } of CASES) {
      if (Math.abs(deltaG) <= 0.2) continue;
      const where = `id ${problem.id} at ${T} K (ΔG° = ${deltaG})`;
      expect(isDeltaGCorrect('0', deltaG), `${where}: 0`).toBe(false);
      expect(isDeltaGCorrect(comma(deltaG / 2, 4), deltaG), `${where}: half`).toBe(false);
      expect(isDeltaGCorrect(comma(deltaG * 2, 4), deltaG), `${where}: double`).toBe(false);
    }
    expect(isDeltaGCorrect('', -2.9)).toBe(false);
    expect(isDeltaGCorrect('-', -2.9)).toBe(false);
    expect(isDeltaGCorrect('abc', -2.9)).toBe(false);
  });

  it('accepts the answer written to one decimal with a comma, everywhere', () => {
    for (const { problem, T, deltaG } of CASES) {
      expect(isDeltaGCorrect(comma(deltaG, 1), deltaG), `id ${problem.id} at ${T} K`).toBe(true);
    }
  });

  it('accepts a whole-number answer wherever |ΔG°| is at least 2', () => {
    for (const { problem, T, deltaG } of CASES) {
      if (Math.abs(deltaG) < 2) continue;
      expect(isDeltaGCorrect(comma(deltaG, 0), deltaG), `id ${problem.id} at ${T} K`).toBe(true);
    }
  });

  it('accepts 0 at the equilibrium temperatures the game poses', () => {
    // Freezing water at 273 K and boiling it at 373 K: ΔG° is a hundredth either side of 0.
    for (const id of [2, 13, 29]) {
      const { problem } = ALL_PROBLEMS.find((p) => p.problem.id === id)!;
      const deltaG = calculateDeltaG(problem.deltaH, problem.deltaS, problem.defaultTemp);
      expect(isDeltaGCorrect('0', deltaG), `id ${id}`).toBe(true);
    }
  });

  it('never allows more than the ±3 kJ/mol the game has always stated', () => {
    for (const deltaG of [-2865, -800, -12, 0, 12, 3000]) {
      expect(deltaGTolerance(deltaG)).toBeLessThanOrEqual(DELTA_G_TOLERANCE_MAX);
    }
    expect(deltaGTolerance(-800)).toBe(3);
  });
});

describe('deltaGAxisHalfRange', () => {
  it('holds every problem’s whole ΔG° line', () => {
    for (const { problem } of ALL_PROBLEMS) {
      const half = deltaGAxisHalfRange(problem.deltaH, problem.deltaS, 200, 1200);
      for (const T of [200, 1200]) {
        const deltaG = calculateDeltaG(problem.deltaH, problem.deltaS, T);
        expect(Math.abs(deltaG), `id ${problem.id} at ${T} K`).toBeLessThanOrEqual(half);
      }
    }
  });

  it('keeps the ±500 axis for a line that fits in it', () => {
    expect(deltaGAxisHalfRange(-92, -199, 200, 1200)).toBe(500);
    expect(deltaGAxisHalfRange(-802, -5, 200, 1200)).toBe(1000);
    expect(deltaGAxisHalfRange(2803, -210, 200, 1200)).toBe(5000);
  });
});
