/**
 * Nærmynd: zinc in CuSO₄ solution, the chemistry behind the scenes.
 *
 * Built on the particle-view template (docs/particle-view-template.md). Every number
 * here comes from data the game already uses: the half-reactions and multipliers from
 * Stig 3's first problem (`problems[0]`, Zn + Cu²⁺), and E° from the book's table
 * (`@shared/data/electrode-potentials`). Nothing is random; the view draws what these
 * functions say.
 *
 * The flask holds 50,0 mL of 0,100 M CuSO₄, so 5,00 mmól Cu²⁺ and 5,00 mmól SO₄²⁻, and a
 * zinc plate with more zinc than the copper ions can use. The progress of the reaction is
 * its extent ξ in mmól: ξ of zinc has gone into solution as Zn²⁺ and ξ of Cu²⁺ has come
 * out as copper on the plate.
 */
import { cellPotential, standardPotential } from '@shared/data/electrode-potentials';

import { problems } from '../data/half-reactions';

export const PROBLEM = problems[0];
export const VOLUME_ML = 50.0;
export const CONCENTRATION_M = 0.1;
/** Cu²⁺ at the start, mmól. */
export const CU_START = VOLUME_ML * CONCENTRATION_M;
/** Particles drawn per mmól. Two gives ten Cu²⁺ and ten SO₄²⁻. */
export const PER_MMOL = 2;
/** Zinc atoms drawn on the plate's surface at the start: more than the Cu²⁺ can take. */
export const ZINC_ATOMS = 14;

/** Electrons per Zn atom and per Cu²⁺ ion, from the half-reactions the game teaches. */
export const ELECTRONS = PROBLEM.oxidationHalf.electrons;

export interface Amounts {
  /** mmól in solution or on the plate. */
  Cu2: number;
  SO4: number;
  Zn2: number;
  Cu: number;
  /** mmól of electrons that have moved from zinc to copper ions. */
  electrons: number;
}

/** The reaction table at extent ξ (mmól), clamped to what the copper ions allow. */
export function amountsAt(xi: number): Amounts {
  const x = Math.min(CU_START, Math.max(0, xi));
  const perCu = PROBLEM.multiplierRed;
  const perZn = PROBLEM.multiplierOx;
  return {
    Cu2: CU_START - perCu * x,
    SO4: CU_START,
    Zn2: perZn * x,
    Cu: perCu * x,
    electrons: ELECTRONS * perZn * x,
  };
}

export interface Counts {
  Cu2: number;
  SO4: number;
  Zn2: number;
  /** Copper atoms on the plate. */
  Cu: number;
  /** Zinc atoms left on the plate's surface. */
  Zn: number;
}

/** What the flask draws: each amount on the fixed scale, rounded to whole particles. */
export function countsAt(xi: number): Counts {
  const a = amountsAt(xi);
  const zn2 = Math.round(a.Zn2 * PER_MMOL);
  return {
    Cu2: Math.round(a.Cu2 * PER_MMOL),
    SO4: Math.round(a.SO4 * PER_MMOL),
    Zn2: zn2,
    Cu: Math.round(a.Cu * PER_MMOL),
    Zn: ZINC_ATOMS - zn2,
  };
}

/** [Cu²⁺] in M, which sets how blue the solution is. */
export function copperConcentration(xi: number): number {
  return amountsAt(xi).Cu2 / VOLUME_ML;
}

/** How blue the solution is drawn, 0–1, in proportion to [Cu²⁺]. */
export function blueness(xi: number): number {
  return copperConcentration(xi) / CONCENTRATION_M;
}

export const E_ZINC = standardPotential('Zn2+/Zn');
export const E_COPPER = standardPotential('Cu2+/Cu');
/** E°cell = E°(Cu²⁺/Cu) − E°(Zn²⁺/Zn), positive, so the reaction runs by itself. */
export const E_CELL = cellPotential('Cu2+/Cu', 'Zn2+/Zn');
