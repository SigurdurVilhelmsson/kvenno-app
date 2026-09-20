/**
 * What a stress does to the numbers.
 *
 * This is the layer that turns Le Chatelier from a rule into arithmetic. The
 * qualitative engine (`utils/le-chatelier.ts`) already says which way the
 * system moves and is unchanged; this says how far, and by computing rather
 * than by asserting.
 *
 * **The whole topic is one distinction**, and it is the one this file encodes:
 * every stress but temperature moves **Q** and leaves K alone, while heating or
 * cooling moves **K itself** and leaves the mixture where it is. A student who
 * takes only that away has the subject.
 */

import {
  hasFormationData,
  reactionEnthalpy,
  shiftConstantWithTemperature,
} from '@shared/data/thermo';
import {
  amountsAtExtent,
  reactionQuotient,
  solveExtent,
  type Amounts,
  type PhaseTag,
  type Reaction,
  type Species,
} from '@shared/engine/equilibrium';

import type { EquilibriumConstant } from '../data/constants';
import type { Equilibrium, Molecule, Stress } from '../types';

/** How many degrees a temperature stress moves the system. */
export const TEMPERATURE_STEP_C = 100;

/** How much a pressure stress compresses or expands the vessel. */
export const VOLUME_FACTOR = 2;

/** The fraction by which an add- or remove- stress moves a species. */
export const CONCENTRATION_STEP = 0.5;

const toSpecies = (m: Molecule): Species => ({
  formula: m.formula,
  coefficient: m.coefficient,
  phase: m.phase as PhaseTag,
});

/** The shared engine's view of one of this game's equilibria. */
export function asReaction(equilibrium: Equilibrium): Reaction {
  return {
    id: String(equilibrium.id),
    name: equilibrium.nameIs,
    reactants: equilibrium.reactants.map(toSpecies),
    products: equilibrium.products.map(toSpecies),
    source: { module: 'ch13/m68799', where: equilibrium.nameIs },
  };
}

/**
 * ΔH° derived from the book's formation enthalpies, or `null` where the table
 * does not cover every species.
 *
 * Derived rather than read off `thermodynamics.deltaH`, for the reason
 * `@shared/data/thermo` gives: a stored ΔH can disagree with the equation it
 * belongs to and nothing notices. One already did — this game shipped +58 for
 * N₂O₄ ⇌ 2NO₂ where the book's own rows give +55,3.
 */
export function derivedEnthalpy(equilibrium: Equilibrium): number | null {
  const terms = (list: Molecule[]) =>
    list.map((m) => ({ formula: m.formula, phase: m.phase, coefficient: m.coefficient }));
  const all = [...terms(equilibrium.reactants), ...terms(equilibrium.products)];
  if (!hasFormationData(all)) return null;
  return reactionEnthalpy(terms(equilibrium.reactants), terms(equilibrium.products));
}

/** Whether the shared solver can find a new equilibrium for this system. */
export function canSolve(equilibrium: Equilibrium): boolean {
  const inK = (list: Molecule[]) => list.filter((m) => m.phase === 'g' || m.phase === 'aq');
  return inK(equilibrium.reactants).length > 0 && inK(equilibrium.products).length > 0;
}

export interface StressOutcome {
  /** The mixture sitting at equilibrium before anything was done to it. */
  before: Amounts;
  /** The mixture the instant after the stress, before the system responds. */
  afterStress: Amounts;
  /** Where it settles, when the solver can find it. */
  afterEquilibrium: Amounts | null;
  /** Q of the disturbed mixture. */
  q: number;
  kBefore: number;
  /** Differs from `kBefore` only for a temperature change. */
  kAfter: number;
  /** ΔH° used for the temperature case, when it could be derived. */
  deltaH: number | null;
  temperatureAfterC: number | null;
  /** True where the stress genuinely changes nothing — a catalyst, or Δn = 0. */
  inert: boolean;
  /**
   * True where the direction is known but the new K is not.
   *
   * A temperature change needs a reference temperature to move K from, and the
   * book states none for some constants — the PCl₅ decomposition holds "under
   * certain conditions". Without one, van 't Hoff has nothing to anchor to.
   * This is kept distinct from `inert` because the two look identical in the
   * numbers (K unchanged, mixture unchanged) and mean opposite things: one is
   * "nothing happens", the other is "something happens and we cannot say how
   * much". Collapsing them told the student a catalyst and a heater were the
   * same, which is the single misconception this game exists to remove.
   */
  kUnknown: boolean;
}

/**
 * Settle a stated starting mixture into equilibrium.
 *
 * Every mixture this game shows is computed here rather than written down,
 * which is why none of them can drift from the constant they belong to.
 */
export function equilibrate(equilibrium: Equilibrium, k: number, start: Amounts): Amounts | null {
  if (!canSolve(equilibrium)) return null;
  const reaction = asReaction(equilibrium);
  try {
    return amountsAtExtent(reaction, start, solveExtent(reaction, start, k));
  } catch {
    return null;
  }
}

/** Gas species are the only ones a pressure change acts on. */
const isGas = (formula: string, equilibrium: Equilibrium): boolean =>
  [...equilibrium.reactants, ...equilibrium.products].some(
    (m) => m.formula === formula && m.phase === 'g'
  );

/**
 * Apply a stress to an equilibrium mixture and work out what follows.
 *
 * Returns `null` where the mixture cannot be settled in the first place, since
 * then there is nothing numeric to say and the game shows the qualitative
 * answer alone.
 */
export function applyStress(
  equilibrium: Equilibrium,
  constant: EquilibriumConstant,
  start: Amounts,
  stress: Stress
): StressOutcome | null {
  const reaction = asReaction(equilibrium);
  const before = equilibrate(equilibrium, constant.value, start);
  if (!before) return null;

  let afterStress: Amounts = { ...before };
  let kAfter = constant.value;
  let deltaH: number | null = null;
  let temperatureAfterC: number | null = null;
  let inert = false;
  let kUnknown = false;

  switch (stress.type) {
    case 'add-reactant':
    case 'add-product': {
      const target = stress.target ?? '';
      afterStress[target] = (before[target] ?? 0) * (1 + CONCENTRATION_STEP);
      break;
    }
    case 'remove-reactant':
    case 'remove-product': {
      const target = stress.target ?? '';
      afterStress[target] = (before[target] ?? 0) * (1 - CONCENTRATION_STEP);
      break;
    }
    case 'increase-pressure':
    case 'decrease-pressure': {
      // Compressing the vessel multiplies every GAS concentration by the same
      // factor. Dissolved species are not compressed, which is why a mixed
      // aqueous/gas system responds differently from an all-gas one.
      const factor = stress.type === 'increase-pressure' ? VOLUME_FACTOR : 1 / VOLUME_FACTOR;
      afterStress = Object.fromEntries(
        Object.entries(before).map(([formula, amount]) => [
          formula,
          isGas(formula, equilibrium) ? amount * factor : amount,
        ])
      );
      break;
    }
    case 'increase-temp':
    case 'decrease-temp': {
      // The mixture does not move; K does. This is the only stress for which
      // that is true, and it is the reason this game needs an enthalpy.
      deltaH = derivedEnthalpy(equilibrium);
      const from = constant.temperatureC;
      if (deltaH !== null && from !== undefined) {
        temperatureAfterC =
          from + (stress.type === 'increase-temp' ? TEMPERATURE_STEP_C : -TEMPERATURE_STEP_C);
        kAfter = shiftConstantWithTemperature(constant.value, deltaH, from, temperatureAfterC);
      } else {
        kUnknown = true;
      }
      break;
    }
    case 'add-catalyst':
      inert = true;
      break;
  }

  const q = reactionQuotient(reaction, afterStress);

  // A pressure change on a reaction with equal gas moles multiplies numerator
  // and denominator alike, so Q lands back exactly where it started. This test
  // deliberately skips the temperature cases: there the mixture is untouched
  // by design, so Q always equals K and reading that as "inert" would call a
  // heater a catalyst.
  const movesTheMixture = stress.type !== 'increase-temp' && stress.type !== 'decrease-temp';
  if (
    !inert &&
    movesTheMixture &&
    kAfter === constant.value &&
    Number.isFinite(q) &&
    Math.abs(q - constant.value) / constant.value < 1e-12
  ) {
    inert = true;
  }

  return {
    before,
    afterStress,
    afterEquilibrium: equilibrate(equilibrium, kAfter, afterStress),
    q,
    kBefore: constant.value,
    kAfter,
    deltaH,
    temperatureAfterC,
    inert,
    kUnknown,
  };
}
