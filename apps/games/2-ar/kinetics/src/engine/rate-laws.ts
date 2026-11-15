/**
 * The integrated rate laws, in one place. `ConcentrationTimeGraph` draws them and the
 * Nærmynd counts particles from them, so the curve and the flask cannot disagree.
 */

export type Order = 0 | 1 | 2;

/** [A] at time t: [A]₀ − kt, [A]₀·e^(−kt) or [A]₀ / (1 + kt[A]₀). Never below zero. */
export function concentrationAt(t: number, A0: number, k: number, order: Order): number {
  switch (order) {
    case 0:
      return Math.max(0, A0 - k * t);
    case 1:
      return A0 * Math.exp(-k * t);
    case 2:
      return A0 / (1 + k * t * A0);
  }
}

/** Time for [A] to fall from A0 to half of it: A0/(2k), ln 2 / k or 1/(k·A0). */
export function halfLife(A0: number, k: number, order: Order): number {
  if (k <= 0 || A0 <= 0) return 0;
  switch (order) {
    case 0:
      return A0 / (2 * k);
    case 1:
      return Math.log(2) / k;
    case 2:
      return 1 / (k * A0);
  }
}

/** The gas constant in J/(mól·K), as the book gives it (m68793). */
export const R = 8.314;

/** Time for a first-order reaction to leave the fraction `left` of its reactant: −ln(left)/k. */
export function timeToLeave(left: number, k: number): number {
  if (left <= 0 || left >= 1 || k <= 0) throw new Error('need 0 < left < 1 and k > 0');
  return -Math.log(left) / k;
}

/** First-order k from a half-life: ln 2 / t½. */
export const kFromHalfLife = (tHalf: number) => Math.log(2) / tHalf;

/**
 * Activation energy in J/mól from k at two temperatures in kelvin, the book's two-point form of
 * the Arrhenius equation (m68793): Ea = R·ln(k₂/k₁) / (1/T₁ − 1/T₂).
 */
export function activationEnergy(k1: number, T1: number, k2: number, T2: number): number {
  if (T1 === T2) throw new Error('two different temperatures are needed');
  return (R * Math.log(k2 / k1)) / (1 / T1 - 1 / T2);
}
