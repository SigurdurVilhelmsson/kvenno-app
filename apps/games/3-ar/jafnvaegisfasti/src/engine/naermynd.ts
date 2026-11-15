import {
  amountsAtExtent,
  reactionQuotient,
  solveExtent,
  type Amounts,
} from '@shared/engine/equilibrium';

import { reactionBy } from '../data/reactions';

/**
 * The chemistry behind this game's Nærmynd: the water-gas shift at 800 °C,
 * K = 0,64, started once from reactants only and once from products only.
 *
 * Where each flask ends comes from `solveExtent` and nowhere else. How fast it
 * gets there is not in the book, so the path is drawn with mass-action rates
 * whose ratio is K (kf/kr = K), on a time axis with no units; the screen says
 * so. Mass action with that ratio settles at exactly the root `solveExtent`
 * finds, and a test holds the two together.
 *
 * Both flasks hold the same atoms (one C, two O and two H per pair of
 * molecules), so they end in the same mixture: 11 CO, 11 H₂O, 9 CO₂ and 9 H₂
 * of 20 pairs.
 */

export const REACTION = reactionBy('vatnsgas');
export const K = REACTION.constant!.value;

/** Starting concentration of each species present, M. */
export const C0 = 0.02;
/** Particles per mol/L: 20 particles for 0,020 M. */
export const PARTICLES_PER_M = 1000;
/** The length of the time axis, in the scene's own units. */
export const T_MAX = 10;
/** The forward rate constant, chosen so most of the change happens in the first third. */
export const K_FORWARD = 12;
export const K_REVERSE = K_FORWARD / K;

export type FlaskId = 'hvarfefni' | 'myndefni';

export const START: Record<FlaskId, Amounts> = {
  hvarfefni: { CO: C0, 'H₂O': C0, 'CO₂': 0, 'H₂': 0 },
  myndefni: { CO: 0, 'H₂O': 0, 'CO₂': C0, 'H₂': C0 },
};

export const SPECIES = ['CO', 'H₂O', 'CO₂', 'H₂'] as const;

/** The extent each flask settles at, mol/L, positive forward. */
export function equilibriumExtent(flask: FlaskId): number {
  return solveExtent(REACTION, START[flask], K);
}

const STEPS = 400;
const DT = T_MAX / STEPS;

function rate(start: Amounts, x: number): number {
  const a = amountsAtExtent(REACTION, start, x);
  return K_FORWARD * a.CO * a['H₂O'] - K_REVERSE * a['CO₂'] * a['H₂'];
}

/** The extent at each step, by fourth-order Runge–Kutta; the last is snapped to the root. */
function path(flask: FlaskId): number[] {
  const start = START[flask];
  const xs = [0];
  let x = 0;
  for (let i = 0; i < STEPS; i++) {
    const k1 = rate(start, x);
    const k2 = rate(start, x + (DT * k1) / 2);
    const k3 = rate(start, x + (DT * k2) / 2);
    const k4 = rate(start, x + DT * k3);
    x += (DT * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
    xs.push(x);
  }
  return xs;
}

const PATHS: Record<FlaskId, number[]> = {
  hvarfefni: path('hvarfefni'),
  myndefni: path('myndefni'),
};

/** How far the integrated path got by `T_MAX`, before snapping; for the test. */
export function unsnappedEnd(flask: FlaskId): number {
  return PATHS[flask][STEPS];
}

/** Extent at time t, interpolated; at `T_MAX` exactly `solveExtent`'s root. */
export function extentAt(flask: FlaskId, t: number): number {
  if (t >= T_MAX) return equilibriumExtent(flask);
  const pos = Math.max(0, t) / DT;
  const i = Math.floor(pos);
  const f = pos - i;
  const xs = PATHS[flask];
  return xs[i] * (1 - f) + xs[i + 1] * f;
}

export function amountsAt(flask: FlaskId, t: number): Amounts {
  return amountsAtExtent(REACTION, START[flask], extentAt(flask, t));
}

/** Q of the flask at time t: 0 or ∞ at the start, K at the end. */
export function qAt(flask: FlaskId, t: number): number {
  return reactionQuotient(REACTION, amountsAt(flask, t));
}

export function countsAt(flask: FlaskId, t: number): Record<string, number> {
  const a = amountsAt(flask, t);
  return Object.fromEntries(SPECIES.map((s) => [s, Math.round(a[s] * PARTICLES_PER_M)]));
}

/** The first time a flask's rounded counts equal its final ones. */
export function settledTime(flask: FlaskId): number {
  const end = countsAt(flask, T_MAX);
  for (let i = 0; i <= STEPS; i++) {
    const c = countsAt(flask, i * DT);
    if (SPECIES.every((s) => c[s] === end[s])) return i * DT;
  }
  return T_MAX;
}
