import { describe, expect, it } from 'vitest';

import {
  addReactions,
  applyCoupledSteps,
  equationOf,
  findCoupledRoute,
  reverseReaction,
  sameEquation,
  scaleReaction,
} from '@shared/engine/equilibrium';

import { COMBINATION_PROBLEMS, COUPLED_PROBLEMS, SINGLE_STEP_PROBLEMS } from '../data/coupled';
import { reactionBy } from '../data/reactions';

/**
 * Tengd jafnvægi — the three operations, and the book's printed answers.
 *
 * The operations are one fact wearing three hats: K is a ratio of product
 * terms over reactant terms. So these tests check the arithmetic against the
 * book where the book states an answer, and check the *property* everywhere
 * else — that a route's K depends on the equation it reaches and not on how it
 * got there.
 */

const byId = (id: string) => COUPLED_PROBLEMS.find((p) => p.id === id)!;

describe('the three operations', () => {
  it('reverses an equation and inverts its constant', () => {
    const haber = reactionBy('ammoniak');
    const back = reverseReaction(haber);
    expect(back.reactants.map((s) => s.formula)).toEqual(['NH₃']);
    expect(back.products.map((s) => s.formula)).toEqual(['N₂', 'H₂']);
    expect(back.constant!.value).toBeCloseTo(1 / haber.constant!.value, 12);
    // Reversing twice is the identity, on the equation and on the number.
    const there = reverseReaction(back);
    expect(sameEquation(there, haber)).toBe(true);
    expect(there.constant!.value).toBeCloseTo(haber.constant!.value, 12);
  });

  it('scales the coefficients and raises the constant to that power', () => {
    const hi = reactionBy('vetnisjodid');
    const doubled = scaleReaction(hi, 2);
    expect(doubled.products[0].coefficient).toBe(4);
    expect(doubled.constant!.value).toBeCloseTo(hi.constant!.value ** 2, 9);
    // A fractional factor is legitimate — halving an equation is as valid as
    // doubling it — and it must undo the doubling exactly.
    expect(scaleReaction(doubled, 0.5).constant!.value).toBeCloseTo(hi.constant!.value, 9);
  });

  it('refuses a scale factor that is not positive', () => {
    // A factor of zero deletes the equation, and a negative one is rule 1 in
    // disguise: two spellings for one operation would let a route claim it
    // never reversed anything.
    const hi = reactionBy('vetnisjodid');
    expect(() => scaleReaction(hi, 0)).toThrow(/positive/);
    expect(() => scaleReaction(hi, -1)).toThrow(/positive/);
  });

  it('adds two equations and multiplies their constants', () => {
    const a = reverseReaction(reactionBy('ammoniak'));
    const b = scaleReaction(reactionBy('vetnisjodid'), 3);
    const sum = addReactions(a, b);
    expect(sum.constant!.value).toBeCloseTo(a.constant!.value * b.constant!.value, 6);
  });

  it('cancels a species appearing on both sides, by the smaller coefficient', () => {
    // 2NH₃ ⇌ N₂ + 3H₂ plus 3H₂ + 3I₂ ⇌ 6HI: the hydrogen is 3 against 3 and
    // leaves nothing at all.
    const sum = addReactions(
      reverseReaction(reactionBy('ammoniak')),
      scaleReaction(reactionBy('vetnisjodid'), 3)
    );
    expect(sum.reactants.map((s) => s.formula).sort()).toEqual(['I₂', 'NH₃']);
    expect(sum.products.map((s) => s.formula).sort()).toEqual(['HI', 'N₂']);
  });

  it('leaves the remainder when the coefficients differ', () => {
    const sum = addReactions(
      reverseReaction(reactionBy('ammoniak')),
      reactionBy('vetnisjodid') // only 1 H₂ on the left against 3 on the right
    );
    const leftover = sum.products.find((s) => s.formula === 'H₂');
    expect(leftover?.coefficient).toBe(2);
    expect(sum.reactants.some((s) => s.formula === 'H₂')).toBe(false);
  });

  it('cancels a solid against itself, which is what the cobalt pair is for', () => {
    const sum = addReactions(
      reverseReaction(reactionBy('kobolt-koloxid')),
      reactionBy('kobolt-vetni')
    );
    expect(sum.reactants.map((s) => s.formula).sort()).toEqual(['CO₂', 'H₂']);
    expect(sum.products.map((s) => s.formula).sort()).toEqual(['CO', 'H₂O']);
    expect([...sum.reactants, ...sum.products].some((s) => s.phase === 's')).toBe(false);
  });

  it('does not cancel one phase against another', () => {
    // Water as steam on one side and as a liquid on the other is two different
    // terms — one is in K and the other is not — so they must not annihilate.
    const steam = {
      id: 'gufa',
      name: 'gufa',
      reactants: [{ formula: 'H₂O', coefficient: 1, phase: 'l' as const }],
      products: [{ formula: 'H₂O', coefficient: 1, phase: 'g' as const }],
      source: { module: 'próf', where: 'próf' },
    };
    const sum = addReactions(steam, steam);
    expect(sum.reactants).toHaveLength(1);
    expect(sum.products).toHaveLength(1);
    expect(sum.reactants[0].coefficient).toBe(2);
  });

  it('refuses to combine constants measured at different temperatures', () => {
    // K is a function of temperature, so the product of two constants taken at
    // different ones describes no single system. Better no number than a
    // plausible one nothing supports.
    const cold = reactionBy('no2-n2o4'); // 25 °C
    const hot = reactionBy('vatnsgas'); // 800 °C
    expect(addReactions(cold, hot).constant).toBeUndefined();
  });

  it('carries no constant when one of the parts has none', () => {
    const sourced = reactionBy('vetnisjodid');
    const unsourced = reactionBy('ozon'); // deliberately has no constant
    expect(unsourced.constant).toBeUndefined();
    expect(addReactions(sourced, unsourced).constant).toBeUndefined();
  });
});

describe("the book's printed answers", () => {
  it('reproduces the ammonia and iodine worked example', () => {
    // ch13/m68798: 2NH₃ + 3I₂ ⇌ N₂ + 6HI at 400 °C, from Kc₁ = 0,50 and
    // Kc₂ = 50. Reverse the first (2,0), cube the second (1,2 × 10⁵), add.
    // Printed answer: Kc = 2,5 × 10⁵.
    const problem = byId('ammoniak-jod');
    expect(Number(problem.result.constant!.value.toPrecision(2))).toBe(2.5e5);
    expect(problem.result.constant!.temperatureC).toBe(400);
  });

  it('reproduces the cobalt check-your-learning answer', () => {
    // ch13/m68798: H₂ + CO₂ ⇌ CO + H₂O at 550 °C from Kc₁ = 490 and Kc₂ = 67.
    // Printed answer: Kc = 0,14.
    const problem = byId('kobolt');
    expect(Number(problem.result.constant!.value.toPrecision(2))).toBe(0.14);
    expect(problem.result.constant!.temperatureC).toBe(550);
  });

  it('gets the same target at a different temperature from a different constant', () => {
    // The cobalt target is the water-gas shift written backwards, and this
    // game already ships that reaction at 800 °C. 1/0,64 = 1,56 against 0,14:
    // the same equation, two temperatures, two constants. Nothing is wrong —
    // it is what "K depends on temperature" means, and the problem says so.
    const at800 = 1 / reactionBy('vatnsgas').constant!.value;
    const at550 = byId('kobolt').result.constant!.value;
    expect(sameEquation(byId('kobolt').target, reverseReaction(reactionBy('vatnsgas')))).toBe(true);
    expect(at800 / at550).toBeGreaterThan(10);
  });
});

describe('the problem set', () => {
  it('reaches every target from its own givens', () => {
    // The route is found rather than asserted, so this restates what module
    // load already enforces — but it names the problem when it breaks.
    for (const p of COUPLED_PROBLEMS) {
      expect(sameEquation(p.result, p.target), `${p.id}: ${equationOf(p.result)}`).toBe(true);
    }
  });

  it('gives every problem a constant at a single temperature', () => {
    for (const p of COUPLED_PROBLEMS) {
      expect(p.result.constant, p.id).toBeDefined();
      expect(p.result.constant!.temperatureC, p.id).toBeDefined();
    }
  });

  it('teaches one rule at a time before combining them', () => {
    expect(SINGLE_STEP_PROBLEMS.length).toBeGreaterThan(0);
    expect(COMBINATION_PROBLEMS.length).toBeGreaterThan(0);
    const firstCombination = COUPLED_PROBLEMS.findIndex((p) => p.givens.length > 1);
    const lastSingle = COUPLED_PROBLEMS.map((p) => p.givens.length).lastIndexOf(1);
    expect(firstCombination).toBeGreaterThan(lastSingle);
  });

  it('covers all three rules across the set', () => {
    const rules = new Set(COUPLED_PROBLEMS.flatMap((p) => p.rules));
    expect([...rules].sort()).toEqual(['leggja', 'margfalda', 'snua']);
  });

  it("traces every given's constant to a cited place in the book", () => {
    for (const p of COUPLED_PROBLEMS) {
      for (const given of p.givens) {
        expect(given.constant, `${p.id}/${given.id}`).toBeDefined();
        expect(given.constant!.source.module, `${p.id}/${given.id}`).toMatch(/^ch13\/m687\d\d$/);
        expect(given.constant!.source.where.length, `${p.id}/${given.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('never grades a target that is simply one of the givens unchanged', () => {
    // A problem whose answer is "do nothing" teaches nothing, and the search
    // would happily return the identity route for one.
    for (const p of COUPLED_PROBLEMS) {
      for (const given of p.givens) {
        expect(sameEquation(p.target, given), `${p.id} restates ${given.id}`).toBe(false);
      }
    }
  });
});

describe('the route search', () => {
  it('returns null rather than a wrong answer when the target is unreachable', () => {
    const impossible = {
      ...reactionBy('ozon'),
      id: 'omogulegt',
      reactants: [{ formula: 'Xe', coefficient: 1, phase: 'g' as const }],
      products: [{ formula: 'Kr', coefficient: 1, phase: 'g' as const }],
    };
    expect(findCoupledRoute([reactionBy('ammoniak')], impossible)).toBeNull();
  });

  it('does not care which equation the student combines first', () => {
    // Addition commutes and so does multiplication, so the order the two
    // prepared equations are added in cannot change either the target or the
    // number. Worth holding: a student who writes the second equation at the
    // top of the page is not doing a different problem.
    //
    // Note this is *not* a claim that two genuinely different routes agree.
    // Neither shipped combination problem has a second route — the target
    // fixes the operations — so that claim has nothing to test it on here.
    for (const problem of COMBINATION_PROBLEMS) {
      const other = applyCoupledSteps([...problem.route].reverse(), 'hin-leidin', 'hin leiðin');
      expect(sameEquation(other, problem.target), problem.id).toBe(true);
      const mine = problem.result.constant!.value;
      expect(Math.abs(other.constant!.value - mine) / mine, problem.id).toBeLessThan(1e-12);
    }
  });
});
