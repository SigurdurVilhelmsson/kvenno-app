import { describe, expect, it } from 'vitest';

import { STANDARD_ENTROPY } from '@shared/data/thermo';

import { PROBLEMS } from '../data/problems';

/**
 * ΔS° agrees with the book's S° column wherever the book can give it. The book's appendix
 * m68865 lists S° beside ΔHf°; until 2026-11-14 no ΔS° here was checked against it, and
 * PCl₅ → PCl₃ + Cl₂ carried 140 where the book gives 170,5.
 */

const all = [...PROBLEMS.beginner, ...PROBLEMS.intermediate, ...PROBLEMS.advanced];

const ALIASES: Record<string, string> = {
  'C(grafít)': 'C(s)',
  'C(demant)': 'C(s, demantur)',
};

function derive(reaction: string): number | null {
  const [left, right] = reaction.split('→').map((side) => side.trim());
  let total = 0;
  for (const [side, sign] of [
    [left, -1],
    [right, 1],
  ] as const) {
    for (const term of side.split(' + ')) {
      const m = term.trim().match(/^(\d+|½)?(.+)$/)!;
      const n = m[1] === '½' ? 0.5 : Number(m[1] ?? 1);
      const value = STANDARD_ENTROPY[ALIASES[m[2]] ?? m[2]];
      if (value === undefined) return null;
      total += sign * n * value;
    }
  }
  return total;
}

/** Problems the book's S° column cannot reach, each for a reason. */
const NOT_IN_THE_BOOK: Record<number, string> = {
  2: 'ice: the table has no H₂O(s) row',
  12: 'CaCO₃: the book’s row disagrees with itself (see STANDARD_ENTROPY)',
  14: 'glucose: the table has no C₆H₁₂O₆ row',
  26: 'a protein is not a species with an entropy',
  27: 'ATP, ADP and phosphate are not in the table (sourced elsewhere: atp-values.test.ts)',
  29: 'ice: the table has no H₂O(s) row',
};

describe('ΔS° from the book', () => {
  it.each(all.map((p) => [p.id, p] as const))('problem %i', (id, problem) => {
    const derived = derive(problem.reaction);
    if (id in NOT_IN_THE_BOOK) {
      expect(derived, `${problem.reaction} became derivable`).toBeNull();
      return;
    }
    expect(derived, `${problem.reaction}: a species has no row`).not.toBeNull();
    // Most are stored as whole numbers: within 1,5 J/(mol·K) of the book.
    expect(Math.abs(problem.deltaS - derived!)).toBeLessThanOrEqual(1.5);
  });

  it('puts PCl₅ at the book’s 170,5, not 140', () => {
    expect(all.find((p) => p.id === 20)!.deltaS).toBe(170.5);
  });
});
