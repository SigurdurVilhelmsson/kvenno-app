/**
 * Nærmynd: lead(II) nitrate and potassium iodide, the chemistry behind the scenes.
 *
 * Built on the particle-view template (docs/particle-view-template.md). The reaction is the
 * game's own `pbno3-ki` scenario, so the equations, the verdicts and the meðjónir all come
 * from `react()`, the engine every phase of this game reads. Nothing is random; the view
 * draws what these functions say.
 *
 * The beaker holds 25,0 mL of 0,100 M Pb(NO₃)₂, so 2,50 mmól Pb²⁺ and 5,00 mmól NO₃⁻. A
 * 0,200 M KI solution is added in portions. The progress is the amount of I⁻ added, in mmól:
 * every I⁻ that meets a Pb²⁺ falls out with it as PbI₂, as the net ionic equation says, until
 * no Pb²⁺ is left. After that the I⁻ stays in solution.
 */
import { molarMassOf } from '@shared/utils';

import type { Term } from './precipitation';
import { SCENARIOS } from '../data/problems';

const found = SCENARIOS.find((s) => s.id === 'pbno3-ki');
if (!found) throw new RangeError('Nærmynd needs the pbno3-ki scenario in data/problems.ts');
export const SCENARIO = found;
export const REACTION = SCENARIO.reaction;

const [LEAD_SALT, IODIDE_SALT] = REACTION.reactants;
const PRECIPITATE = REACTION.precipitates[0];
if (!PRECIPITATE) throw new RangeError('The pbno3-ki scenario must form a precipitate');

/** The salt that stays in solution, KNO₃. */
export const DISSOLVED_PRODUCT = REACTION.products.find((p) => p !== PRECIPITATE)!;
export const PRECIPITATE_FORMULA = PRECIPITATE.formula;

const coefficient = (terms: Term[], species: string) =>
  terms.find((t) => t.species === species)?.coefficient ?? 0;

/** I⁻ per PbI₂, from the net ionic equation the game teaches (2). */
export const IODIDE_PER_PRECIPITATE =
  coefficient(REACTION.net.left, IODIDE_SALT.anion.formula) /
  coefficient(REACTION.net.right, PRECIPITATE.formula);

export const LEAD_VOLUME_ML = 25.0;
export const LEAD_CONCENTRATION_M = 0.1;
export const IODIDE_CONCENTRATION_M = 0.2;

/** Pb²⁺ at the start, mmól. */
export const LEAD_START = LEAD_VOLUME_ML * LEAD_CONCENTRATION_M;
/** NO₃⁻ at the start, mmól: two per Pb(NO₃)₂. */
export const NITRATE_START = LEAD_START * LEAD_SALT.anionCount;
/** I⁻ that takes every Pb²⁺ out of solution, mmól. */
export const IODIDE_EQUIVALENCE = LEAD_START * IODIDE_PER_PRECIPITATE;
/** The slider goes one portion past the point where the lead runs out. */
export const IODIDE_MAX = IODIDE_EQUIVALENCE + 1;
/** Particles drawn per mmól. Two gives five Pb²⁺ and ten NO₃⁻ at the start. */
export const PER_MMOL = 2;

export interface Amounts {
  /** mmól. */
  Pb2: number;
  NO3: number;
  K: number;
  /** I⁻ still in solution. */
  I: number;
  /** PbI₂ fallen out. */
  PbI2: number;
  /** KI solution added, mL. */
  addedMl: number;
}

/** The reaction table after `iodide` mmól of I⁻ (as KI) has been added. */
export function amountsAt(iodide: number): Amounts {
  const n = Math.min(IODIDE_MAX, Math.max(0, iodide));
  const precipitate = Math.min(n / IODIDE_PER_PRECIPITATE, LEAD_START);
  return {
    Pb2: LEAD_START - precipitate,
    NO3: NITRATE_START,
    K: n * (IODIDE_SALT.cationCount / IODIDE_SALT.anionCount),
    I: n - IODIDE_PER_PRECIPITATE * precipitate,
    PbI2: precipitate,
    addedMl: n / IODIDE_CONCENTRATION_M,
  };
}

export interface Counts {
  Pb2: number;
  NO3: number;
  K: number;
  I: number;
  /** PbI₂ units on the floor of the beaker. */
  PbI2: number;
}

/** What the beaker draws: each amount on the fixed scale, rounded to whole particles. */
export function countsAt(iodide: number): Counts {
  const a = amountsAt(iodide);
  return {
    Pb2: Math.round(a.Pb2 * PER_MMOL),
    NO3: Math.round(a.NO3 * PER_MMOL),
    K: Math.round(a.K * PER_MMOL),
    I: Math.round(a.I * PER_MMOL),
    PbI2: Math.round(a.PbI2 * PER_MMOL),
  };
}

/** Grams of PbI₂ fallen out, from the molar mass the platform weighs everything with. */
export function precipitateMass(iodide: number): number {
  return (amountsAt(iodide).PbI2 / 1000) * molarMassOf(PRECIPITATE.formula);
}

/** The verdicts that decide the scene: the solid's rule and the dissolved product's. */
export const PRECIPITATE_VERDICT = REACTION.verdicts.find((v) => v.salt === PRECIPITATE)!.verdict;
export const DISSOLVED_VERDICT = REACTION.verdicts.find(
  (v) => v.salt === DISSOLVED_PRODUCT
)!.verdict;

/** The meðjónir as formulas, K⁺ and NO₃⁻. */
export const SPECTATORS = REACTION.spectators.map((s) => s.formula);
