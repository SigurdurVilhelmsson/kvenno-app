import { R } from '../types';

/**
 * The numbers behind this game's Agnasýn: one cylinder of ideal gas with a
 * movable stimpill, and four scenes that each hold two quantities fixed and let
 * the student move a third (docs/particle-view-template.md).
 *
 * Every number printed is computed here from PV = nRT with the game's own R.
 * The particles are drawn on a fixed scale, one circle per `MOL_PER_PARTICLE`,
 * rounded, and the screen says so.
 */

/** The starting state every scene leaves from: 1,00 mól at 300 K and 1,00 atm. */
export const N0 = 1;
export const T0 = 300;
export const P0 = 1;
export const V0 = (N0 * R * T0) / P0;

/** One circle on screen stands for this many mól (3,0 × 10²² molecules). */
export const MOL_PER_PARTICLE = 0.05;

/** The volume the cylinder is drawn to: every scene stays under it. */
export const V_DRAW_MAX = 50;
/** The gauge's full scale, atm: every scene stays under it, so the needle never pins. */
export const P_GAUGE_MAX = 2.5;

export type SceneKind = 'boyle' | 'charles' | 'gayLussac' | 'avogadro';
export type GasVariable = 'P' | 'V' | 'T' | 'n';

export interface Control {
  variable: Exclude<GasVariable, 'P'>;
  min: number;
  max: number;
  step: number;
  start: number;
}

/** What each scene lets the student move, and its range. */
export const CONTROLS: Record<SceneKind, Control> = {
  boyle: { variable: 'V', min: 12, max: 48, step: 0.1, start: Math.round(V0 * 10) / 10 },
  charles: { variable: 'T', min: 150, max: 600, step: 10, start: T0 },
  gayLussac: { variable: 'T', min: 150, max: 600, step: 10, start: T0 },
  avogadro: { variable: 'n', min: 0.5, max: 2, step: MOL_PER_PARTICLE, start: N0 },
};

/** The quantities each scene holds fixed. */
export const FIXED: Record<SceneKind, GasVariable[]> = {
  boyle: ['T', 'n'],
  charles: ['P', 'n'],
  gayLussac: ['V', 'n'],
  avogadro: ['P', 'T'],
};

export interface GasState {
  P: number;
  V: number;
  T: number;
  n: number;
}

/** The cylinder's state when the scene's control stands at `x`. */
export function stateAt(kind: SceneKind, x: number): GasState {
  switch (kind) {
    case 'boyle':
      return { V: x, T: T0, n: N0, P: (N0 * R * T0) / x };
    case 'charles':
      return { T: x, P: P0, n: N0, V: (N0 * R * x) / P0 };
    case 'gayLussac':
      return { T: x, V: V0, n: N0, P: (N0 * R * x) / V0 };
    case 'avogadro':
      return { n: x, T: T0, P: P0, V: (x * R * T0) / P0 };
  }
}

/** Circles drawn for `n` mól, on the fixed scale. */
export function particleCount(n: number): number {
  return Math.round(n / MOL_PER_PARTICLE);
}

/**
 * Pressure from the kinetic model, against the starting state.
 *
 * Hits on the stimpill per second go as (number of molecules) × (speed) ÷
 * (volume), since the stimpill's area is fixed; each hit pushes in proportion
 * to the speed; and the speed goes as √T. Their product is P/P₀ exactly, which
 * a test holds, so the two bars on screen multiply to the gauge.
 */
export function kinetic(s: GasState) {
  const speed = Math.sqrt(s.T / T0);
  const hits = (s.n / N0) * speed * (V0 / s.V);
  return { speed, hits, push: speed, pressureRatio: hits * speed };
}

/** °C from K, with 273,15 as the book gives it. */
export const celsius = (t: number) => t - 273.15;
