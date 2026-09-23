import { describe, it, expect } from 'vitest';

import { PUZZLES } from '../data/puzzles';
import { netChange, parseSide, reachesTarget } from '../utils/equation-math';
import { calculateSum } from '../utils/hess-calculations';

/**
 * Level 2 asks for a combination of equations that reaches a target equation. It
 * used to grade only the summed ΔH, which accepts any combination that happens to
 * land on the right number. Puzzle 5 has one: 3 × (S + O₂ → SO₂) plus
 * 2 × (S + 3/2O₂ → SO₃) reversed sums to −99,0 kJ as the target does, because
 * 4 × 297 = 3 × 396 exactly — yet the equation it builds is S + 2SO₃ → 3SO₂.
 * The level now grades on the equation, so these tests hold the data to it.
 */

function applySolution(puzzle: (typeof PUZZLES)[number]) {
  return puzzle.solution.map((step) => {
    const eq = puzzle.availableEquations.find((e) => e.id === step.equationId);
    if (!eq) throw new Error(`Puzzle ${puzzle.id}: no equation ${step.equationId}`);
    return { ...eq, isReversed: step.reverse, multiplier: step.multiply };
  });
}

describe('parseSide', () => {
  it('reads integer, slash and vulgar-fraction coefficients', () => {
    expect([...parseSide('2C(s) + 3H₂(g) + ½O₂(g)')]).toEqual([
      ['C(s)', 2],
      ['H₂(g)', 3],
      ['O₂(g)', 0.5],
    ]);
    expect(parseSide('S(s) + 3/2O₂(g)').get('O₂(g)')).toBe(1.5);
  });

  it('keeps the phase as part of the species', () => {
    const net = netChange([{ reactants: 'H₂O(l)', products: 'H₂O(g)' }]);
    expect(net.get('H₂O(l)')).toBe(-1);
    expect(net.get('H₂O(g)')).toBe(1);
  });
});

describe.each(PUZZLES.map((p) => [p.id, p] as const))('puzzle %i', (_id, puzzle) => {
  it('its stored solution builds the target equation', () => {
    expect(reachesTarget(applySolution(puzzle), puzzle.targetEquation)).toBe(true);
  });

  it('its stored solution sums to the target ΔH', () => {
    expect(Math.abs(calculateSum(applySolution(puzzle)) - puzzle.targetDeltaH)).toBeLessThan(0.5);
  });

  it('only the stored solution reaches the target', () => {
    // Every choice a student can make: each equation left out, or taken ×1–3,
    // either way round. Exactly one choice must reach the target.
    const options = [null, 1, 2, 3, -1, -2, -3];
    let reaching = 0;
    const walk = (i: number, chosen: { factor: number; index: number }[]) => {
      if (i === puzzle.availableEquations.length) {
        const picked = chosen.map(({ factor, index }) => ({
          ...puzzle.availableEquations[index],
          isReversed: factor < 0,
          multiplier: Math.abs(factor),
        }));
        if (reachesTarget(picked, puzzle.targetEquation)) reaching += 1;
        return;
      }
      for (const option of options) {
        walk(i + 1, option === null ? chosen : [...chosen, { factor: option, index: i }]);
      }
    };
    walk(0, []);
    expect(reaching).toBe(1);
  });
});

describe('the puzzle-5 look-alike', () => {
  const puzzle = PUZZLES.find((p) => p.id === 5)!;
  const [so2, so3] = puzzle.availableEquations;
  const lookAlike = [
    { ...so2, isReversed: false, multiplier: 3 },
    { ...so3, isReversed: true, multiplier: 2 },
  ];

  it('sums to the target ΔH', () => {
    expect(calculateSum(lookAlike)).toBeCloseTo(puzzle.targetDeltaH);
  });

  it('does not build the target equation', () => {
    expect(reachesTarget(lookAlike, puzzle.targetEquation)).toBe(false);
  });
});
