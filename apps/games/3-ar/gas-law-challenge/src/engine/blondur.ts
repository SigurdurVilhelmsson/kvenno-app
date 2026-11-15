/**
 * Gas mixtures and gas stoichiometry: Dalton's law, mole fractions, gas collected over water
 * and volumes in reactions. The book teaches all four in one module, ch. 9, m68752
 * ("Hlutfallaefnafræði loftkenndra efna, blanda og efnahvarfa").
 *
 * Pure functions. Every number the screen prints, given or answer, comes from here, so a
 * problem cannot state one value and grade another.
 */

import { R } from '../types';

/** °C to K by the game's own rule, printed on its menu: K = °C + 273. */
export function kelvin(celsius: number): number {
  return celsius + 273;
}

/** torr per atm and kPa per atm, as the book gives them. */
export const TORR_PER_ATM = 760;
export const KPA_PER_ATM = 101.325;

/** P = nRT/V, in atm, for n mol in V L at T K. */
export function pressureOf(n: number, volume: number, temp: number): number {
  return (n * R * temp) / volume;
}

/** V = nRT/P, in L, for n mol at T K and P atm. */
export function volumeOf(n: number, temp: number, pressure: number): number {
  return (n * R * temp) / pressure;
}

/** Each gas's mole fraction X = n / n(heild). */
export function moleFractions(moles: readonly number[]): number[] {
  const total = moles.reduce((a, b) => a + b, 0);
  return moles.map((n) => (total > 0 ? n / total : 0));
}

/**
 * Water's vapour pressure in torr at 18–30 °C, from the book's table of water's vapour pressure
 * in m68752, the rows a collecting bottle in a classroom meets. A temperature outside them throws rather than guessing.
 */
export const WATER_VAPOUR_TORR: Readonly<Record<number, number>> = {
  18: 15.5,
  19: 16.5,
  20: 17.5,
  21: 18.7,
  22: 19.8,
  23: 21.1,
  24: 22.4,
  25: 23.8,
  26: 25.2,
  27: 26.7,
  28: 28.3,
  29: 30.0,
  30: 31.8,
};

export function waterVapourTorr(celsius: number): number {
  const p = WATER_VAPOUR_TORR[celsius];
  if (p === undefined) throw new Error(`No vapour pressure for water at ${celsius} °C`);
  return p;
}

/** The answer tolerance: 1 % of the answer, which every answer here is given to 3 figures. */
export const BLONDUR_TOLERANCE = 0.01;

/** Whether `value` is within the relative tolerance of `target`. Rejects 0, double and half. */
export function within(value: number, target: number, tolerance = BLONDUR_TOLERANCE): boolean {
  if (!Number.isFinite(value) || !Number.isFinite(target)) return false;
  return Math.abs(value - target) <= tolerance * Math.abs(target);
}
