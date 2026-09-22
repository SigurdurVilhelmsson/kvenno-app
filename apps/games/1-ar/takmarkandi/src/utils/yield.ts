import { molarMassOf } from '@shared/utils';

import type { Reaction } from '../types';

/**
 * Takmarkandi hvarfefni og heimtur, í grömmum.
 *
 * **This is the second half of the book's own module.** `ch04/m68714` runs
 * limiting reactant and percent yield as one continuous calculation in grams:
 * find which reactant runs out, use it to get the theoretical yield, compare
 * that with what was actually collected. Stig 1 and 2 teach the first step as
 * a picture of molecules; this is the same step as a chemist does it.
 *
 * **Nothing is stored.** A problem gives two masses and an actual yield; the
 * moles, the limiting reactant, the theoretical yield and the percentage are
 * all derived from the balanced equation and the molar masses. That is the
 * `1-ar/reynsluformulur` pattern, and the reason is `buffer-recipe-creator`:
 * it stored masses beside the moles they came from, 13 of 29 disagreed with
 * each other, and three of the six problems it served marked a correct
 * student wrong.
 */

export interface MassYield {
  /** Moles of each reactant supplied. */
  molesR1: number;
  molesR2: number;
  /** How many times the equation can run, as a real number rather than a count. */
  extentR1: number;
  extentR2: number;
  limitingFormula: string;
  excessFormula: string;
  /** Grams of the excess reactant left when the limiting one runs out. */
  excessLeftGrams: number;
  /** The most product the limiting reactant can give, in grams. */
  theoreticalGrams: number;
  /** What was collected, as given by the problem. */
  actualGrams: number;
  /** actual / theoretical × 100. */
  percent: number;
}

/**
 * Percent yield above 100 is not a rounding artefact — it is a wrong problem.
 *
 * A real one means the product was wet, or weighed with impurities, and the
 * book raises that as a thing to notice. But a *generated* one means the
 * actual yield was set above what the stoichiometry allows, and a student
 * cannot tell those apart. So the data refuses it rather than teaching it by
 * accident.
 */
export const MAX_SENSIBLE_PERCENT = 100;

export function solveMassYield(
  reaction: Reaction,
  gramsR1: number,
  gramsR2: number,
  actualGrams: number,
  productFormula = reaction.products[0].formula
): MassYield {
  if (gramsR1 <= 0 || gramsR2 <= 0) {
    throw new RangeError(`Reactant masses must be positive, got ${gramsR1} and ${gramsR2}`);
  }
  if (actualGrams < 0) {
    throw new RangeError(`Actual yield cannot be negative, got ${actualGrams}`);
  }
  const product = reaction.products.find((p) => p.formula === productFormula);
  if (!product) {
    throw new RangeError(`${reaction.id} has no product ${productFormula}`);
  }

  const molesR1 = gramsR1 / molarMassOf(reaction.reactant1.formula);
  const molesR2 = gramsR2 / molarMassOf(reaction.reactant2.formula);

  // "How many times can the equation run?" — the same quotient Stig 2 draws
  // with molecules, with moles in place of a count.
  const extentR1 = molesR1 / reaction.reactant1.coeff;
  const extentR2 = molesR2 / reaction.reactant2.coeff;
  const r1Limits = extentR1 < extentR2;
  const extent = Math.min(extentR1, extentR2);

  const excessLeftMoles = r1Limits
    ? molesR2 - extent * reaction.reactant2.coeff
    : molesR1 - extent * reaction.reactant1.coeff;
  const excessFormula = r1Limits ? reaction.reactant2.formula : reaction.reactant1.formula;

  const theoreticalGrams = extent * product.coeff * molarMassOf(product.formula);

  return {
    molesR1,
    molesR2,
    extentR1,
    extentR2,
    limitingFormula: r1Limits ? reaction.reactant1.formula : reaction.reactant2.formula,
    excessFormula,
    excessLeftGrams: excessLeftMoles * molarMassOf(excessFormula),
    theoreticalGrams,
    actualGrams,
    percent: (actualGrams / theoreticalGrams) * 100,
  };
}
