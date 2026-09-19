import { describe, it, expect } from 'vitest';

import { BUFFER_PROBLEMS } from '../data/problems';
import { bufferRange, solveBuffer } from '../engine/buffer';

/**
 * Pin `solveBuffer` against values worked by hand.
 *
 * The consistency checks in `data-integrity.test.ts` are now tautological — a
 * derived mass cannot disagree with the moles it was derived from — so they
 * guard the engine's internal coherence but say nothing about whether the
 * engine is *right*. These do.
 *
 * The expectations below are also the numbers the old hand-typed data carried
 * for the problems that were internally consistent, which is the strongest
 * evidence available that deriving reproduces the intended recipes rather than
 * quietly inventing new ones: #11 stored 4.65 g / 8.69 g against the engine's
 * 4.642 / 8.704, and #25 stored 6.01 g / 2.58 g against 6.005 / 2.581.
 */

const byId = (id: number) => {
  const p = BUFFER_PROBLEMS.find((x) => x.id === id);
  if (!p) throw new Error(`problem ${id} missing`);
  return p;
};

describe('solveBuffer', () => {
  it('#11 — a standard two-salt recipe, pKa 7.2 to pH 7.4', () => {
    const s = solveBuffer(byId(11));
    expect(s.ratio).toBeCloseTo(1.584893, 5);
    expect(s.acidMoles).toBeCloseTo(0.038686, 5);
    expect(s.baseMoles).toBeCloseTo(0.061314, 5);
    expect(s.acidMass).toBeCloseTo(4.6416, 3);
    expect(s.baseMass).toBeCloseTo(8.7041, 3);
  });

  it('#25 — phAdjustment weighs out ALL the acid, not the acid fraction', () => {
    // The branch that would have been silently lost by deriving with the
    // standard formula: Level2.tsx never read the flag, so this model existed
    // only in the stored numbers. 0.1 mol x 60.05 = 6.005 g of acetic acid,
    // then 0.0645 mol x 40.0 = 2.581 g of NaOH to convert part of it.
    const p = byId(25);
    expect(p.phAdjustment).toBe(true);
    const s = solveBuffer(p);
    expect(s.acidMass).toBeCloseTo(6.005, 3);
    expect(s.baseMass).toBeCloseTo(2.5814, 3);
    // The acid MASS is the total, while the acid MOLES remain the buffer fraction.
    expect(s.acidMoles).toBeCloseTo(0.035465, 5);
    expect(s.acidMass).toBeCloseTo(p.totalConcentration * p.volume * p.acidMolarMass, 6);
  });

  it('a standard problem does NOT take the phAdjustment branch', () => {
    // Guards the branch in the other direction: if the flag were ignored, or
    // applied to everything, one of these two tests would go red.
    const p = byId(11);
    const s = solveBuffer(p);
    expect(s.acidMass).not.toBeCloseTo(p.totalConcentration * p.volume * p.acidMolarMass, 2);
    expect(s.acidMass).toBeCloseTo(s.acidMoles * p.acidMolarMass, 8);
  });

  it('pH = pKa gives a 1:1 buffer', () => {
    const p = byId(1);
    expect(p.targetPH).toBeCloseTo(p.pKa, 6);
    const s = solveBuffer(p);
    expect(s.ratio).toBeCloseTo(1, 10);
    expect(s.acidMoles).toBeCloseTo(s.baseMoles, 10);
  });

  it('concentrations are moles over the stated volume', () => {
    for (const p of BUFFER_PROBLEMS) {
      const s = solveBuffer(p);
      expect(s.acidConc).toBeCloseTo(s.acidMoles / p.volume, 10);
      expect(s.baseConc).toBeCloseTo(s.baseMoles / p.volume, 10);
    }
  });

  it('bufferRange is pKa +/- 1, and agrees with the range question that asks for it', () => {
    const p = BUFFER_PROBLEMS.find((x) => x.rangeQuestion);
    if (!p) throw new Error('no range question');
    const { low, high } = bufferRange(p);
    expect(low).toBeCloseTo(p.pKa - 1, 10);
    expect(high).toBeCloseTo(p.pKa + 1, 10);
    // The prose answer stored on the problem must say the same thing.
    expect(p.effectiveRange).toContain(low.toFixed(2));
    expect(p.effectiveRange).toContain(high.toFixed(2));
  });
});
