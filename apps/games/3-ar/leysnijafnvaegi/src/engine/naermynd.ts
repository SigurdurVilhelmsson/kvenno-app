import { mixAndCompare, molarSolubility, precipitationOrder, solubilityWithCommonIon } from './ksp';
import { saltBy } from '../data/salts';

/**
 * The chemistry behind this game's Nærmynd: silver chloride saturated, with a
 * common ion, mixed from two solutions, and the Mohr titration.
 *
 * **Every picture here is exaggerated, and the screen says so.** A saturated
 * AgCl solution holds 1,3 × 10⁻⁵ M of each ion, one Ag⁺ for every four million
 * water molecules, so a picture with any ion in it at all is a picture of
 * something too small to see. The counts drawn are chosen to show which way
 * things go; every number printed beside them is computed here, from Brown's
 * Appendix D.3 values through `engine/ksp.ts`.
 */

export const AGCL = saltBy('AgCl');
export const AG2CRO4 = saltBy('Ag₂CrO₄');

/** Molar concentration of water, mol/L, for "one ion per N water molecules". */
export const WATER_M = 55.5;

/** Molar solubility of AgCl in pure water. */
export const S_WATER = molarSolubility(AGCL);

/** Water molecules per dissolved Ag⁺ in a saturated solution. */
export const WATER_PER_ION = WATER_M / S_WATER;

/** The common ion: 0,010 M NaCl. */
export const COMMON_CL = 0.01;
export const S_COMMON = solubilityWithCommonIon(AGCL, 'anion', COMMON_CL).exact;
/** How many times less AgCl dissolves with the common ion present. */
export const COMMON_FACTOR = S_WATER / S_COMMON;

/** The mixing scene: 50 mL of AgNO₃ and 50 mL of NaCl at the same concentration. */
export const MIX_VOLUME_ML = 50;
export const MIX_CONCENTRATIONS = [1e-3, 1e-4, 1e-5, 1e-6] as const;

export function mixAt(c: number) {
  return mixAndCompare(
    AGCL,
    { concentration: c, volume: MIX_VOLUME_ML },
    { concentration: c, volume: MIX_VOLUME_ML }
  );
}

/** The Mohr titration: 0,010 M each of Cl⁻ and CrO₄²⁻, with Ag⁺ added. */
export const MOHR_CL = 0.01;
export const MOHR_CRO4 = 0.01;

export const MOHR_ORDER = precipitationOrder('cation', [
  { salt: AGCL, otherIonConcentration: MOHR_CL },
  { salt: AG2CRO4, otherIonConcentration: MOHR_CRO4 },
]);

/** [Ag⁺] at which white AgCl starts to form. */
export const AG_FOR_AGCL = MOHR_ORDER.find((o) => o.salt.formula === 'AgCl')!.threshold;
/** [Ag⁺] at which red Ag₂CrO₄ starts to form. */
export const AG_FOR_AG2CRO4 = MOHR_ORDER.find((o) => o.salt.formula === 'Ag₂CrO₄')!.threshold;
/** [Cl⁻] still dissolved when the red first appears. */
export const CL_LEFT_AT_RED = AGCL.ksp / AG_FOR_AG2CRO4;
/** Share of the chloride already precipitated when the red first appears. */
export const CL_GONE_AT_RED = 1 - CL_LEFT_AT_RED / MOHR_CL;

/** The Mohr slider runs over log₁₀[Ag⁺]. */
export const MOHR_LOG_MIN = -9;
export const MOHR_LOG_MAX = -4;

export interface MohrState {
  ag: number;
  /** [Cl⁻] still dissolved, M. */
  cl: number;
  agcl: boolean;
  ag2cro4: boolean;
}

/** What the titration flask holds at a given free [Ag⁺]. */
export function mohrAt(ag: number): MohrState {
  const agcl = ag > AG_FOR_AGCL;
  return {
    ag,
    cl: agcl ? AGCL.ksp / ag : MOHR_CL,
    agcl,
    ag2cro4: ag > AG_FOR_AG2CRO4,
  };
}
