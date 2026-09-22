import { describe, it, expect } from 'vitest';

import { reactionEnthalpy } from '@shared/data/thermo';

import { PROBLEMS } from '../data/problems';
import { calculateDeltaG } from '../utils/thermo-calculations';

/**
 * Problem 25, C(s) + ½O₂(g) → CO(g), stores the enthalpy of formation of CO.
 *
 * **Why this exists.** Until 2026-09-22 it stored ΔH = −137 kJ/mol, which is
 * CO's standard Gibbs energy of formation, not its enthalpy. The game computes
 * ΔG° = ΔH − TΔS from the stored ΔH, so it subtracted TΔS a second time from a
 * number that already had it subtracted and showed ΔG° = −163,8 kJ/mol at 298 K.
 * The verdict was right by luck — ΔH < 0 and ΔS > 0 make the reaction
 * spontaneous at every temperature, so the sign could not come out wrong — but
 * every number on the screen was. With the enthalpy in place the game's own
 * arithmetic lands on the book's ΔGf°(CO), which is the check below.
 */
const all = [...PROBLEMS.beginner, ...PROBLEMS.intermediate, ...PROBLEMS.advanced];
const co = all.find((p) => p.id === 25)!;

describe('problem 25: carbon to carbon monoxide', () => {
  it('is the reaction this test is about', () => {
    expect(co.reaction).toBe('C(s) + ½O₂(g) → CO(g)');
  });

  it('stores the enthalpy the shared formation table derives', () => {
    const derived = reactionEnthalpy(
      [
        { formula: 'C', phase: 's', coefficient: 1 },
        { formula: 'O₂', phase: 'g', coefficient: 0.5 },
      ],
      [{ formula: 'CO', phase: 'g', coefficient: 1 }]
    );
    expect(co.deltaH).toBeCloseTo(derived, 0);
  });

  it('computes ΔG° at 298 K as the Gibbs energy of formation of CO', () => {
    // ΔGf°(CO) = −137,2 kJ/mol. Getting it from ΔH − TΔS is the proof that
    // ΔH is the enthalpy and not ΔG entered twice.
    expect(calculateDeltaG(co.deltaH, co.deltaS, 298)).toBeCloseTo(-137.2, 0);
  });
});
