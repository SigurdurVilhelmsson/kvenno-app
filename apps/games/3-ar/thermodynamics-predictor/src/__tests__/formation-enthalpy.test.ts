import { describe, expect, it } from 'vitest';

import { FORMATION_ENTHALPY } from '@shared/data/thermo';

import { PROBLEMS } from '../data/problems';

/**
 * ΔH° is the book's wherever the book can give it (mobile-pass decision 9, ruled (a)):
 * derived from the formation enthalpies in `@shared/data/thermo`, the Icelandic
 * textbook's appendix m68865, which `hess-law` and `equilibrium-shifter` read too.
 *
 * The game kept its own values until 2026-10-03. Two differed from the book by more
 * than rounding: CaCO₃ → CaO + CO₂ at 178 against the book's 191,6, and NO₂
 * dimerisation at −57 against −55,3. Neither changed a sign, so no verdict moved, but
 * a student checking a number against their book found the game disagreeing.
 */

const all = [...PROBLEMS.beginner, ...PROBLEMS.intermediate, ...PROBLEMS.advanced];

/** How the game writes a species that the shared table keys differently. */
const ALIASES: Record<string, string> = {
  'C(grafít)': 'C(s)',
  'C(demant)': 'C(s, demantur)',
};

/** ΔH° of a reaction string from the book's rows, or null if a species has none. */
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
      const species = ALIASES[m[2]] ?? m[2];
      const value = FORMATION_ENTHALPY[species];
      if (value === undefined) return null;
      total += sign * n * value;
    }
  }
  return total;
}

/**
 * The reactions the book's table cannot reach, each for a stated reason. Pinned, so a
 * row added to the table — or a problem added without one — is a decision someone
 * makes, not a drift nobody sees.
 */
const NOT_IN_THE_BOOK: Record<number, string> = {
  2: 'ice: the table has no H₂O(s) row',
  14: 'glucose: the table has no C₆H₁₂O₆ row',
  26: 'a protein is not a species with a formation enthalpy',
  27: 'ATP, ADP and phosphate are not in the table',
  29: 'ice: the table has no H₂O(s) row',
};

describe('ΔH° from the book', () => {
  it.each(all.map((p) => [p.id, p] as const))('problem %i', (id, problem) => {
    const derived = derive(problem.reaction);
    if (id in NOT_IN_THE_BOOK) {
      expect(derived, `${problem.reaction} became derivable`).toBeNull();
      return;
    }
    expect(derived, `${problem.reaction}: a species has no row`).not.toBeNull();
    // Printed to one decimal: within half a unit in that place.
    expect(Math.abs(problem.deltaH - derived!)).toBeLessThanOrEqual(0.05 + 1e-9);
  });

  it('puts calcium carbonate at the book’s 191,6, not 178', () => {
    expect(all.find((p) => p.id === 12)!.deltaH).toBe(191.6);
  });

  it('puts NO₂ dimerisation at the book’s −55,3, not −57', () => {
    expect(all.find((p) => p.id === 21)!.deltaH).toBe(-55.3);
  });
});
