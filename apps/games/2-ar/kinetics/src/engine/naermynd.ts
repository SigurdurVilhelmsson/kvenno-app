/**
 * Nærmynd: half-life at first order against zero order (docs/particle-view-template.md).
 *
 * The first-order flask is the book's decomposition of hydrogen peroxide (ch12/m68791):
 * 1,000 M at the start, and the concentration halves every 6,00 klst. The zero-order flask
 * is a reaction made up for the comparison and labelled so on screen: the same starting
 * concentration and the same FIRST half-life, so the two agree at 6 klst. and part after.
 * Every number comes from `rate-laws.ts`, the functions `ConcentrationTimeGraph` draws.
 */
import { concentrationAt, halfLife, type Order } from './rate-laws';

export const A0 = 1.0;
/** The book's half-life for H₂O₂, in klst. */
export const T_HALF = 6.0;
/** First-order k = ln 2 / t½, per klst. */
export const K_FIRST = Math.LN2 / T_HALF;
/** Zero-order k chosen so its first half-life is also T_HALF: [A]₀ / (2 t½), M per klst. */
export const K_ZERO = A0 / (2 * T_HALF);
/** Particles at the start; 32 halves cleanly five times. */
export const PARTICLES = 32;
/** The slider's range, klst. */
export const T_MAX = 30;

export interface FlaskState {
  /** [A] in M. */
  concentration: number;
  /** Particles left, rounded. */
  count: number;
  /** Time for what is left to halve, from now, in klst.; 0 once nothing is left. */
  halfLifeNow: number;
}

function state(t: number, k: number, order: Order): FlaskState {
  const c = concentrationAt(t, A0, k, order);
  return {
    concentration: c,
    count: Math.round((c / A0) * PARTICLES),
    halfLifeNow: halfLife(c, k, order),
  };
}

export const firstOrderAt = (t: number) => state(t, K_FIRST, 1);
export const zeroOrderAt = (t: number) => state(t, K_ZERO, 0);

/** When the zero-order flask is empty: [A]₀ / k, which is two of its first half-lives. */
export const ZERO_EMPTY_AT = A0 / K_ZERO;
