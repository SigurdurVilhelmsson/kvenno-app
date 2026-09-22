/**
 * Atomic masses, in g/mol — the platform's single source.
 *
 * **Three games needed these numbers and two files held them**, which is the
 * B4 defect waiting to happen: `1-ar/molmassi` once printed per-element
 * breakdowns that did not sum to their own totals, precisely because the
 * numbers lived in more than one place. `1-ar/reynsluformulur` kept a
 * transcribed copy with a test holding it to molmassi's, and its own comment
 * explained why — "reaching across into a sibling's data directory is not
 * something this repo does". That reasoning was right about game-to-game
 * imports and does not reach `packages/shared`, which every game already
 * imports and which already holds `appendix-d.ts` and `thermo.ts`.
 *
 * So the numbers live here now. `reynsluformulur` re-exports them under its
 * old name, so its imports and tests are unchanged — the same arrangement
 * `leysnijafnvaegi/src/engine/ksp.ts` has with `@shared/utils`. `molmassi`
 * keeps its richer `ELEMENTS` array, which carries a name, a period, a group
 * and a category beside the mass; the agreement test in
 * `reynsluformulur/src/__tests__/problems.test.ts` reads molmassi's source and
 * holds every symbol equal to this table, so the array cannot drift from it.
 *
 * Values are the ones molmassi has always shipped. Nothing was re-sourced
 * here: this is a move, not a revision, and a test asserts that.
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

/** Every symbol this platform can weigh. */
export type ElementSymbol = keyof typeof ATOMIC_MASSES;
