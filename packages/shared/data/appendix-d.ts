/**
 * Dissociation constants at 25 °C from Brown et al., *Chemistry: The Central
 * Science*, Appendix D — Tables D.1 (acids) and D.2 (bases).
 *
 * **Why this file exists.** Siggi's ruling, 2026-09-19: Appendix D is
 * authoritative where shipped data disagrees with it, and a problem whose
 * constant is not in Appendix D does not ship. Before this, three Y3 games
 * computed with Ka and pKa values that nobody had ever checked against a
 * source, and four of them were a different book's numbers — most consequentially
 * `buffer-recipe-creator`'s bicarbonate pKa 10.33, where Appendix D's carbonic
 * Ka₂ of 5.6 × 10⁻¹¹ gives 10.25. At that problem's target pH of 9.8 the two
 * differ by 19.7 % in the required base:acid ratio, so a student working from
 * the school's own textbook got a materially different answer from the game's.
 *
 * Only the rows the platform actually uses are transcribed. Add a row when a
 * game needs it; do not add a constant that is not in the book.
 *
 * Polyprotic acids list every step, because the step matters: a bicarbonate
 * buffer is carbonic Ka₂, not Ka₁, and a dihydrogen-phosphate buffer is
 * phosphoric Ka₂.
 */

/** Table D.1 — acid dissociation constants. Arrays are Ka₁, Ka₂, Ka₃. */
export const APPENDIX_D1_ACIDS = {
  acetic: { formula: 'CH₃COOH', ka: [1.8e-5] },
  benzoic: { formula: 'C₆H₅COOH', ka: [6.3e-5] },
  carbonic: { formula: 'H₂CO₃', ka: [4.3e-7, 5.6e-11] },
  citric: { formula: 'H₃C₆H₅O₇', ka: [7.4e-4, 1.7e-5, 4.0e-7] },
  formic: { formula: 'HCOOH', ka: [1.8e-4] },
  hydrocyanic: { formula: 'HCN', ka: [4.9e-10] },
  hydrofluoric: { formula: 'HF', ka: [6.8e-4] },
  nitrous: { formula: 'HNO₂', ka: [4.5e-4] },
  oxalic: { formula: 'H₂C₂O₄', ka: [5.9e-2, 6.4e-5] },
  phenol: { formula: 'C₆H₅OH', ka: [1.3e-10] },
  phosphoric: { formula: 'H₃PO₄', ka: [7.5e-3, 6.2e-8, 4.2e-13] },
  propionic: { formula: 'C₂H₅COOH', ka: [1.3e-5] },
} as const;

/** Table D.2 — base dissociation constants. */
export const APPENDIX_D2_BASES = {
  ammonia: { formula: 'NH₃', kb: 1.8e-5 },
  methylamine: { formula: 'CH₃NH₂', kb: 4.4e-4 },
} as const;

/** Ion product of water at 25 °C, used to cross the Kb → pKa(conjugate) bridge. */
export const PKW = 14;

export const pKa = (ka: number): number => -Math.log10(ka);

/**
 * pKa of a base's conjugate acid — what a buffer made from, say, NH₄Cl is
 * quoted at. NH₃'s Kb of 1.8 × 10⁻⁵ gives 9.2553, so the value to two decimals
 * is **9.26**; the platform shipped both 9.25 and 9.26 for the same ion before
 * this was checked.
 */
export const pKaOfConjugateAcid = (kb: number): number => PKW + Math.log10(kb);
