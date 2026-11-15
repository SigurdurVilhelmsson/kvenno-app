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
