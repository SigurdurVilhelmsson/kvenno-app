import { describe, expect, it } from 'vitest';

import { molarMassOf } from '@shared/utils';

import { REACTIONS } from '../data/reactions';
import { YIELD_PROBLEMS } from '../data/yieldProblems';
import { MAX_SENSIBLE_PERCENT, solveMassYield } from '../utils/yield';

/**
 * Heimtur — the mass half of the book's own module, `ch04/m68714`.
 *
 * The arithmetic is checked against the book where the book states an answer,
 * and against properties everywhere else. The properties matter more: a
 * generated problem set can be internally consistent and still pose something
 * a student cannot answer, which is what these are for.
 */

const by = (id: string) => YIELD_PROBLEMS.find((p) => p.id === id)!;
const reaction = (id: string) => REACTIONS.find((r) => r.id === id)!;

describe("the book's worked example", () => {
  it('reproduces the copper sulfate percent yield', () => {
    // ch04/m68714: 1,274 g CuSO₄ with excess zinc gives 0,392 g Cu.
    // Theoretical 0,5072 g, printed answer 77,3 %.
    //
    // The game's reaction list has no CuSO₄ + Zn entry — this checks the
    // engine against the book directly, with a throwaway reaction, so the
    // arithmetic is pinned even though no shipped problem uses it.
    const cuso4 = {
      id: 'bok',
      equation: 'CuSO₄ + Zn → Cu + ZnSO₄',
      reactant1: { formula: 'CuSO₄', coeff: 1, color: '#000' },
      reactant2: { formula: 'Zn', coeff: 1, color: '#000' },
      products: [
        { formula: 'Cu', coeff: 1, color: '#000' },
        { formula: 'ZnSO₄', coeff: 1, color: '#000' },
      ],
      difficulty: 'hard' as const,
    };
    // Zinc is in excess, so give plenty of it.
    const solved = solveMassYield(cuso4, 1.274, 50, 0.392, 'Cu');
    expect(solved.limitingFormula).toBe('CuSO₄');
    expect(solved.theoreticalGrams).toBeCloseTo(0.5072, 3);
    expect(solved.percent).toBeCloseTo(77.3, 1);
  });

  it('reproduces the Freon check-your-learning answer', () => {
    // CCl₄ + 2HF → CF₂Cl₂ + 2HCl: 32,9 g CCl₄ with excess HF gives 12,5 g
    // CF₂Cl₂. Printed answer 48,3 %.
    const freon = {
      id: 'freon',
      equation: 'CCl₄ + 2HF → CF₂Cl₂ + 2HCl',
      reactant1: { formula: 'CCl₄', coeff: 1, color: '#000' },
      reactant2: { formula: 'HF', coeff: 2, color: '#000' },
      products: [
        { formula: 'CF₂Cl₂', coeff: 1, color: '#000' },
        { formula: 'HCl', coeff: 2, color: '#000' },
      ],
      difficulty: 'hard' as const,
    };
    const solved = solveMassYield(freon, 32.9, 100, 12.5, 'CF₂Cl₂');
    expect(solved.limitingFormula).toBe('CCl₄');
    expect(solved.percent).toBeCloseTo(48.3, 1);
  });
});

describe('the engine', () => {
  it('picks the limiting reactant by moles, not by mass', () => {
    // The misconception the first problem exists to break: 4 g against 48 g,
    // and the 4 g runs out first.
    const water = by('vatn');
    expect(water.gramsR1).toBeLessThan(water.gramsR2);
    expect(water.result.limitingFormula).toBe('H₂');
  });

  it('leaves the right mass of the excess reactant', () => {
    // Mass balance: what went in and did not react is what is left.
    for (const p of YIELD_PROBLEMS) {
      const r = p.result;
      const suppliedExcess =
        r.excessFormula === p.reaction.reactant1.formula ? p.gramsR1 : p.gramsR2;
      expect(r.excessLeftGrams, p.id).toBeGreaterThanOrEqual(0);
      expect(r.excessLeftGrams, p.id).toBeLessThan(suppliedExcess);
    }
  });

  it('conserves mass into the theoretical yield', () => {
    // The limiting reactant's moles, through the coefficients, are the
    // product's moles. Checked independently of how the engine got there.
    for (const p of YIELD_PROBLEMS) {
      const r = p.result;
      const extent = Math.min(r.extentR1, r.extentR2);
      const product = p.reaction.products.find((x) => x.formula === p.productFormula)!;
      expect(r.theoreticalGrams, p.id).toBeCloseTo(
        extent * product.coeff * molarMassOf(p.productFormula),
        9
      );
    }
  });

  it('weighs the product the problem names, not just the first one', () => {
    // The thermite problem asks for copper; the reaction also makes Al₂O₃,
    // and the two theoretical yields differ. A screen that silently weighed
    // products[0] would mark a correct student wrong.
    const thermit = by('thermit');
    expect(thermit.productFormula).toBe('Cu');
    const other = solveMassYield(
      thermit.reaction,
      thermit.gramsR1,
      thermit.gramsR2,
      thermit.actualGrams,
      'Al₂O₃'
    );
    expect(other.theoreticalGrams).not.toBeCloseTo(thermit.result.theoreticalGrams, 1);
  });

  it('refuses input it cannot mean anything by', () => {
    const water = reaction('1');
    expect(() => solveMassYield(water, 0, 10, 1)).toThrow(/positive/);
    expect(() => solveMassYield(water, 10, -1, 1)).toThrow(/positive/);
    expect(() => solveMassYield(water, 10, 10, -1)).toThrow(/negative/);
    expect(() => solveMassYield(water, 10, 10, 1, 'Xx')).toThrow(/no product/);
  });
});

describe('the problem set', () => {
  it('never poses a yield above 100 %', () => {
    // A real over-100 % yield means a wet or impure product, which the book
    // raises as a thing to notice. A generated one means the data is wrong,
    // and a student cannot tell them apart — so the module throws on import
    // and this names it if that guard is ever loosened.
    for (const p of YIELD_PROBLEMS) {
      expect(p.result.percent, p.id).toBeGreaterThan(0);
      expect(p.result.percent, p.id).toBeLessThanOrEqual(MAX_SENSIBLE_PERCENT);
    }
  });

  it('keeps every percentage in a range a student would recognise', () => {
    // A 3 % yield is arithmetically fine and teaches nothing about recovery.
    for (const p of YIELD_PROBLEMS) {
      expect(p.result.percent, p.id).toBeGreaterThan(40);
    }
  });

  it('rejects zero, double, half and NaN as answers', () => {
    // The standing rule from `3-ar/syrufastinn`: assert the property, do not
    // trust the choice of comparison mode.
    for (const p of YIELD_PROBLEMS) {
      const right = p.result.percent;
      for (const wrong of [0, right * 2, right / 2, Number.NaN]) {
        expect(Math.abs(wrong - right) < 0.5, `${p.id} accepts ${wrong}`).toBe(false);
      }
    }
  });

  it('makes the limiting reactant something to compute, not to guess', () => {
    // If the lighter mass were always limiting, the answer would be readable
    // off the problem without any chemistry. At least one problem must break
    // that rule of thumb, and at least one must follow it.
    const lighterLimits = YIELD_PROBLEMS.map(
      (p) => p.gramsR1 < p.gramsR2 === (p.result.limitingFormula === p.reaction.reactant1.formula)
    );
    expect(lighterLimits).toContain(true);
    expect(lighterLimits).toContain(false);
  });

  it('reads every formula it ships', () => {
    for (const p of YIELD_PROBLEMS) {
      for (const f of [
        p.reaction.reactant1.formula,
        p.reaction.reactant2.formula,
        p.productFormula,
      ]) {
        expect(() => molarMassOf(f), `${p.id}/${f}`).not.toThrow();
      }
    }
  });
});
