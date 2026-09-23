import { parseStudentNumber } from '@shared/utils';

import type { Spontaneity } from '../types';

/**
 * Calculate Gibbs free energy (ΔG) using the equation ΔG = ΔH - TΔS.
 *
 * @param deltaH - Enthalpy change in kJ/mol
 * @param deltaS - Entropy change in J/(mol·K) (will be converted to kJ internally)
 * @param temp - Temperature in Kelvin
 * @returns ΔG in kJ/mol
 */
export function calculateDeltaG(deltaH: number, deltaS: number, temp: number): number {
  const deltaSinKJ = deltaS / 1000; // Convert J/(mol·K) to kJ/(mol·K)
  return deltaH - temp * deltaSinKJ;
}

/**
 * Determine the spontaneity of a reaction based on its ΔG value.
 *
 * @param deltaG - Gibbs free energy in kJ/mol
 * @returns 'spontaneous' if ΔG < -1, 'non-spontaneous' if ΔG > 1, 'equilibrium' if |ΔG| < 1
 */
export function getSpontaneity(deltaG: number): Spontaneity {
  if (Math.abs(deltaG) < 1) return 'equilibrium';
  return deltaG < 0 ? 'spontaneous' : 'non-spontaneous';
}

/**
 * The temperature (K) at which ΔG° = 0, or `null` where there is none.
 *
 * T = ΔH° / ΔS° is a temperature only when ΔH° and ΔS° share a sign (scenarios 3 and 4).
 * Where they do not, ΔG° keeps one sign at every temperature and the quotient is negative.
 * Taking its absolute value, as the game did, invented a crossover for Demant → Grafít at
 * 576 K and drew a "ΔG = 0" point there, 3,8 kJ/mol off its own line.
 */
export function crossoverTemperature(deltaH: number, deltaS: number): number | null {
  if (deltaS === 0) return null;
  const temp = deltaH / (deltaS / 1000);
  return temp > 0 ? temp : null;
}

/** The ±tolerance on ΔG° never exceeds this (kJ/mol): the rule the game has always stated. */
export const DELTA_G_TOLERANCE_MAX = 3;

/**
 * How far (kJ/mol) a typed ΔG° may sit from the true value and still be right.
 *
 * ±3 kJ/mol, as the game has always graded — but never more than a quarter of |ΔG°|,
 * because a fixed ±3 swallows small answers whole: Demant → Grafít has ΔG° = −2,9 kJ/mól at
 * 298 K, so a flat ±3 marked `0`, half the answer and double it all right. A quarter keeps
 * every such guess out (half is off by a half, `0` by the whole), while an answer rounded to
 * a whole number still passes wherever |ΔG°| ≥ 2. The 0,1 floor is for answers at
 * equilibrium, where ΔG° is itself about 0 and a quarter of it would demand digits nobody
 * writes.
 */
export function deltaGTolerance(correctDeltaG: number): number {
  return Math.max(0.1, Math.min(DELTA_G_TOLERANCE_MAX, Math.abs(correctDeltaG) / 4));
}

/** Grade a typed ΔG°, read with the decimal comma, against the true value (both kJ/mol). */
export function isDeltaGCorrect(answer: string, correctDeltaG: number): boolean {
  const typed = parseStudentNumber(answer);
  if (!Number.isFinite(typed)) return false;
  return Math.abs(typed - correctDeltaG) <= deltaGTolerance(correctDeltaG);
}

/**
 * Half the height of the ΔG°-against-T graph's y-axis, in kJ/mol: ±500, or the next of
 * ±1000, ±2000, ±5000 … that holds the whole line over [tMin, tMax]. A fixed ±500 left the
 * graph empty for methane combustion (ΔG° ≈ −800) and photosynthesis (ΔG° ≈ +2870).
 * ΔG° is linear in T, so the two ends bound it.
 */
export function deltaGAxisHalfRange(
  deltaH: number,
  deltaS: number,
  tMin: number,
  tMax: number
): number {
  const extreme = Math.max(
    Math.abs(calculateDeltaG(deltaH, deltaS, tMin)),
    Math.abs(calculateDeltaG(deltaH, deltaS, tMax))
  );
  for (let decade = 100; ; decade *= 10) {
    for (const step of [5, 10, 20]) {
      if (step * decade >= extreme) return step * decade;
    }
  }
}
