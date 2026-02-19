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
  return deltaH - (temp * deltaSinKJ);
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
