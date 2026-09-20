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

/**
 * Table D.3 — solubility-product constants at 25 °C.
 *
 * Added 2026-09-20, from the page Siggi supplied. Before that this file held
 * D.1 and D.2 only, so **no Ksp value on the platform had a source at all** —
 * which is why `3-ar/leysnijafnvaegi` could not be written until it arrived.
 *
 * **The school's two books disagree here far more than they do on acids**, and
 * that is worth knowing before anyone "corrects" a number. The Icelandic
 * textbook carries its own `Leysnimargfeldi` appendix
 * (`efnafraedi-2e/02-mt-output/appendices/m68868`), and across the 33 compounds
 * both tables list, **13 differ by a factor of three or more**: Ca₃(PO₄)₂ by
 * 1538×, PbCrO₄ by 1400×, CoCO₃ by 714×, BaSO₄ by 209×. Only 12 agree within
 * 30 %. A BaSO₄ molar solubility computed from one book is 14× the other.
 *
 * Siggi's 2026-09-19 ruling settles which wins — Appendix D is authoritative —
 * and that is what this table is. But the divergence has a practical
 * consequence the acid case never had: a student checking the appendix in their
 * *Icelandic* book can find a materially different number and conclude the game
 * is broken. `leysnijafnvaegi` therefore draws its pool, wherever it can, from
 * the compounds the two tables agree on; see `AGREES_WITH_ICELANDIC_APPENDIX`.
 *
 * **The starred sulfides are not what they look like.** The table's own
 * footnote reads: *for a solubility equilibrium of the type
 * MS(s) + H₂O(l) ⇌ M²⁺(aq) + HS⁻(aq) + OH⁻(aq)*. So their constant is
 * `[M²⁺][HS⁻][OH⁻]`, a **three-species** product — not `[M²⁺][S²⁻]`. Computing
 * a molar solubility for CuS as √Ksp is simply wrong, and wrong by twenty
 * orders of magnitude. They carry `hydrolytic: true` and the games exclude
 * them; a test enforces it rather than trusting anyone to remember.
 *
 * `Hg₂I₂` is **deliberately absent**: its exponent is illegible in the source
 * page (it reads `10⁻¹·¹`, which cannot be right for mercury(I) iodide). Do not
 * guess it — ask for the row again.
 *
 * `PbI₂` is also absent, and that is the book's doing rather than an omission
 * here: Brown D.3 lists PbCO₃, PbCl₂, PbCrO₄, PbF₂, PbSO₄ and PbS, and no
 * iodide. Under the same ruling that dropped TRIS from `syrufastinn`, **PbI₂
 * cannot carry a Ksp on this platform** — which is a pity, since it is the
 * bright yellow precipitate `1-ar/utfellingarhvorf` opens with. That game is
 * qualitative and needs no constant, so the arc still joins up; only the
 * quantitative half has to pick a different anchor.
 */
export const APPENDIX_D3_KSP = {
  'BaCO₃': { ksp: 5.0e-9, cation: 1, anion: 1 },
  'BaCrO₄': { ksp: 2.1e-10, cation: 1, anion: 1 },
  'BaF₂': { ksp: 1.7e-6, cation: 1, anion: 2 },
  'BaC₂O₄': { ksp: 1.6e-6, cation: 1, anion: 1 },
  'BaSO₄': { ksp: 1.1e-10, cation: 1, anion: 1 },
  'CdCO₃': { ksp: 1.8e-14, cation: 1, anion: 1 },
  'Cd(OH)₂': { ksp: 2.5e-14, cation: 1, anion: 2 },
  CdS: { ksp: 8e-28, cation: 1, anion: 1, hydrolytic: true },
  'CaCO₃': { ksp: 4.5e-9, cation: 1, anion: 1 },
  'CaCrO₄': { ksp: 4.5e-9, cation: 1, anion: 1 },
  'CaF₂': { ksp: 3.9e-11, cation: 1, anion: 2 },
  'Ca(OH)₂': { ksp: 6.5e-6, cation: 1, anion: 2 },
  'Ca₃(PO₄)₂': { ksp: 2.0e-29, cation: 3, anion: 2 },
  'CaSO₄': { ksp: 2.4e-5, cation: 1, anion: 1 },
  'Cr(OH)₃': { ksp: 1.6e-30, cation: 1, anion: 3 },
  'CoCO₃': { ksp: 1.0e-10, cation: 1, anion: 1 },
  'Co(OH)₂': { ksp: 1.3e-15, cation: 1, anion: 2 },
  CoS: { ksp: 5e-22, cation: 1, anion: 1, hydrolytic: true },
  CuBr: { ksp: 5.3e-9, cation: 1, anion: 1 },
  'CuCO₃': { ksp: 2.3e-10, cation: 1, anion: 1 },
  'Cu(OH)₂': { ksp: 4.8e-20, cation: 1, anion: 2 },
  CuS: { ksp: 6e-37, cation: 1, anion: 1, hydrolytic: true },
  'FeCO₃': { ksp: 2.1e-11, cation: 1, anion: 1 },
  'Fe(OH)₂': { ksp: 7.9e-16, cation: 1, anion: 2 },
  'LaF₃': { ksp: 2e-19, cation: 1, anion: 3 },
  'La(IO₃)₃': { ksp: 7.4e-14, cation: 1, anion: 3 },
  'PbCO₃': { ksp: 7.4e-14, cation: 1, anion: 1 },
  'PbCl₂': { ksp: 1.7e-5, cation: 1, anion: 2 },
  'PbCrO₄': { ksp: 2.8e-13, cation: 1, anion: 1 },
  'PbF₂': { ksp: 3.6e-8, cation: 1, anion: 2 },
  'PbSO₄': { ksp: 6.3e-7, cation: 1, anion: 1 },
  PbS: { ksp: 3e-28, cation: 1, anion: 1, hydrolytic: true },
  'Mg(OH)₂': { ksp: 1.8e-11, cation: 1, anion: 2 },
  'MgCO₃': { ksp: 3.5e-8, cation: 1, anion: 1 },
  'MgC₂O₄': { ksp: 8.6e-5, cation: 1, anion: 1 },
  'MnCO₃': { ksp: 5.0e-10, cation: 1, anion: 1 },
  'Mn(OH)₂': { ksp: 1.6e-13, cation: 1, anion: 2 },
  MnS: { ksp: 2e-53, cation: 1, anion: 1, hydrolytic: true },
  'Hg₂Cl₂': { ksp: 1.2e-18, cation: 1, anion: 2 },
  HgS: { ksp: 2e-53, cation: 1, anion: 1, hydrolytic: true },
  'NiCO₃': { ksp: 1.3e-7, cation: 1, anion: 1 },
  'Ni(OH)₂': { ksp: 6.0e-16, cation: 1, anion: 2 },
  NiS: { ksp: 3e-20, cation: 1, anion: 1, hydrolytic: true },
  'AgBrO₃': { ksp: 5.5e-13, cation: 1, anion: 1 },
  AgBr: { ksp: 5.0e-13, cation: 1, anion: 1 },
  'Ag₂CO₃': { ksp: 8.1e-12, cation: 2, anion: 1 },
  AgCl: { ksp: 1.8e-10, cation: 1, anion: 1 },
  'Ag₂CrO₄': { ksp: 1.2e-12, cation: 2, anion: 1 },
  AgI: { ksp: 8.3e-17, cation: 1, anion: 1 },
  'Ag₂SO₄': { ksp: 1.5e-5, cation: 2, anion: 1 },
  'Ag₂S': { ksp: 6e-51, cation: 2, anion: 1, hydrolytic: true },
  'SrCO₃': { ksp: 9.3e-10, cation: 1, anion: 1 },
  SnS: { ksp: 1e-26, cation: 1, anion: 1, hydrolytic: true },
  'ZnCO₃': { ksp: 1.0e-10, cation: 1, anion: 1 },
  'Zn(OH)₂': { ksp: 3.0e-16, cation: 1, anion: 2 },
  'ZnC₂O₄': { ksp: 2.7e-8, cation: 1, anion: 1 },
  ZnS: { ksp: 2e-25, cation: 1, anion: 1, hydrolytic: true },
} as const;

/**
 * The compounds whose Ksp agrees within 30 % between Brown D.3 and the
 * Icelandic textbook's own appendix.
 *
 * Preferring these is not a chemistry decision — Brown wins either way, by the
 * 2026-09-19 ruling — it is so that a student who looks the number up in the
 * book they can actually read does not find the game contradicting it. Ratios
 * were computed across all 33 shared rows; these are the ones under 1.3×.
 */
export const AGREES_WITH_ICELANDIC_APPENDIX = [
  'AgBr',
  'Ag₂CO₃',
  'AgCl',
  'Ag₂SO₄',
  'CaF₂',
  'CuCO₃',
  'FeCO₃',
  'Hg₂Cl₂',
  'Mn(OH)₂',
  'NiCO₃',
  'PbCl₂',
  'PbF₂',
  'SrCO₃',
] as const;
