/**
 * Atomic masses for Reynsluformúlur.
 *
 * **Transcribed from `1-ar/molmassi/src/data/elements.ts`, and held to it by a
 * test.** A separate copy exists because each game is its own Vite build and
 * reaching across into a sibling's data directory is not something this repo
 * does; `elements-agree.test.ts` compares every symbol here against molmassi's
 * and fails on any disagreement, so the copy cannot drift.
 *
 * The reason to care is B4: `molmassi` once printed per-element breakdowns that
 * did not sum to their own totals, because two places held the numbers. Two
 * places still hold them here — the test is what stops that being a defect.
 */

export const ATOMIC_MASSES = {
  H: 1.008,
  He: 4.003,
  Li: 6.941,
  Be: 9.012,
  B: 10.81,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  Ne: 20.18,
  Na: 22.99,
  Mg: 24.305,
  Al: 26.982,
  Si: 28.086,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  Ar: 39.948,
  K: 39.098,
  Ca: 40.078,
  Sc: 44.956,
  Ti: 47.867,
  V: 50.942,
  Cr: 51.996,
  Mn: 54.938,
  Fe: 55.845,
  Co: 58.933,
  Ni: 58.693,
  Cu: 63.546,
  Zn: 65.38,
  Ga: 69.723,
  Ge: 72.63,
  As: 74.922,
  Se: 78.971,
  Br: 79.904,
  Kr: 83.798,
  Ag: 107.868,
  I: 126.904,
  Ba: 137.327,
  Au: 196.967,
  Hg: 200.592,
  Pb: 207.2,
} as const;

export type ElementSymbol = keyof typeof ATOMIC_MASSES;
