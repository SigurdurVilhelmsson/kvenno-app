/**
 * Leysnijafnvægi — the quantitative half of "will it precipitate?".
 *
 * `1-ar/utfellingarhvorf` answers that question **by rule**: look the ions up in
 * the solubility table and say yes or no. This one answers it **by number**, and
 * the two share their anchor compounds deliberately. A Year-1 student learns
 * that AgCl is insoluble; a Year-3 student learns that "insoluble" means
 * 1,3 × 10⁻⁵ M, which is not zero, and that whether a precipitate actually forms
 * depends on the concentrations you mixed.
 *
 * **Everything is derived from one number per compound — its Ksp.** Molar
 * solubility, the Ksp expression, the common-ion result and the Q comparison
 * are all computed. The old `solubility-equilibrium` stored molar solubilities
 * beside the Ksp values they came from, which is the same
 * two-copies-of-one-fact shape that produced B4 in `molmassi` and the
 * buffer Level-2 defect — and it had already drifted: PbI₂ carried
 * 9,8 × 10⁻⁹ in its table while a problem derived 8,8 × 10⁻⁹ from it
 * (`ORPHANED_GAMES_ASSESSMENT.md:474`).
 */

import { APPENDIX_D3_KSP } from '@shared/data/appendix-d';

export type CompoundFormula = keyof typeof APPENDIX_D3_KSP;

/** A salt as this game needs it: the constant, and the stoichiometry it implies. */
export interface Salt {
  formula: CompoundFormula;
  /** Icelandic name. */
  name: string;
  ksp: number;
  /** Subscript on the cation — the `x` in AₓB_y. */
  x: number;
  /** Subscript on the anion — the `y`. */
  y: number;
  cation: string;
  anion: string;
  /** What the solid looks like, where the book or a lab gives a colour. */
  colour?: string;
}

/**
 * Molar solubility from Ksp, for the general AₓB_y.
 *
 * For `AₓB_y(s) ⇌ xAʸ⁺ + yBˣ⁻` with molar solubility `s`, the ion
 * concentrations are `xs` and `ys`, so
 *
 * ```
 *   Ksp = (xs)ˣ (ys)ʸ = xˣ yʸ s^(x+y)
 *   s   = (Ksp / (xˣ yʸ))^(1/(x+y))
 * ```
 *
 * The general form matters and is not decoration: for AgCl it collapses to
 * `√Ksp`, which is the only case a student who memorised one formula can do,
 * and the whole point of Ag₂CrO₄ and CaF₂ is that it does not collapse. The old
 * game got this right (`compounds.ts:327-333`) and it is worth keeping.
 */
export function molarSolubility(salt: Pick<Salt, 'ksp' | 'x' | 'y'>): number {
  const { ksp, x, y } = salt;
  if (ksp <= 0) throw new RangeError(`Ksp must be positive, got ${ksp}`);
  return Math.pow(ksp / (Math.pow(x, x) * Math.pow(y, y)), 1 / (x + y));
}

/** The inverse: Ksp from a measured molar solubility. */
export function kspFromSolubility(s: number, x: number, y: number): number {
  if (s <= 0) throw new RangeError(`Molar solubility must be positive, got ${s}`);
  return Math.pow(x * s, x) * Math.pow(y * s, y);
}

/** `Ksp = [Ag⁺]²[CrO₄²⁻]` — the expression, rendered. */
export function kspExpression(salt: Salt): string {
  const term = (ion: string, n: number) => `[${ion}]${n === 1 ? '' : superscript(n)}`;
  return `Ksp = ${term(salt.cation, salt.x)}${term(salt.anion, salt.y)}`;
}

/** `AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)` — the dissolution equilibrium, rendered. */
export function dissolutionEquation(salt: Salt): string {
  const side = (ion: string, n: number) => `${n === 1 ? '' : n}${ion}(aq)`;
  return `${salt.formula}(s) ⇌ ${side(salt.cation, salt.x)} + ${side(salt.anion, salt.y)}`;
}

const SUPERSCRIPTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const superscript = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUPERSCRIPTS[Number(d)])
    .join('');

/**
 * Molar solubility in the presence of a common ion, solved rather than
 * approximated.
 *
 * `samjónahrif` is the one result in this topic that students find genuinely
 * surprising, so the number has to be right. With an existing concentration `c`
 * of the common ion, the equilibrium is
 *
 * ```
 *   Ksp = (xs + c)ˣ (ys)ʸ        when the common ion is the cation
 *   Ksp = (xs)ˣ (ys + c)ʸ        when it is the anion
 * ```
 *
 * The usual textbook move is to assume `c` swamps the contribution from the
 * solid and drop the `s` inside that bracket. That approximation is excellent
 * here — typically to eight significant figures — but it is an approximation,
 * and `syrufastinn` is the precedent for what happens when a game grades one
 * approximation and a student uses another. So this **bisects the exact
 * equation** and the approximate answer is accepted separately, with the game
 * saying which it is.
 *
 * Bisection rather than Newton because the function is monotonic in `s` on
 * `(0, s₀]` and bisection cannot be thrown by the very flat region near zero
 * that a 10⁻⁵⁰ Ksp produces.
 */
export function solubilityWithCommonIon(
  salt: Pick<Salt, 'ksp' | 'x' | 'y'>,
  commonIon: 'cation' | 'anion',
  concentration: number
): { exact: number; approximate: number } {
  const { ksp, x, y } = salt;
  if (concentration < 0) throw new RangeError('A common-ion concentration cannot be negative');

  const product = (s: number) =>
    Math.pow(x * s + (commonIon === 'cation' ? concentration : 0), x) *
    Math.pow(y * s + (commonIon === 'anion' ? concentration : 0), y);

  // The common ion can only suppress solubility, so the answer lies below the
  // pure-water value.
  let low = 0;
  let high = molarSolubility(salt);
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    if (product(mid) < ksp) low = mid;
    else high = mid;
  }
  const exact = (low + high) / 2;

  // The textbook approximation: the common ion's own concentration is taken as
  // the whole of that ion, and the salt supplies only the other one.
  const approximate =
    commonIon === 'cation'
      ? Math.pow(ksp / Math.pow(concentration, x), 1 / y) / y
      : Math.pow(ksp / Math.pow(concentration, y), 1 / x) / x;

  return { exact, approximate };
}

export interface QVerdict {
  /** The reaction quotient, on the same expression as Ksp. */
  q: number;
  ksp: number;
  /** `q > ksp` — a precipitate forms. */
  precipitates: boolean;
  /** `q === ksp` to within rounding: exactly saturated, nothing happens. */
  saturated: boolean;
  /** How many times Ksp the quotient is. */
  ratio: number;
}

/**
 * Mix two solutions and decide whether a precipitate forms.
 *
 * **The dilution is the step students get wrong, and it is done here rather
 * than handed over.** Mixing 50 mL of one solution with 50 mL of another halves
 * both concentrations before anything else happens. The old game pre-computed
 * this on all six of its items and left the student a binary button
 * (`ORPHANED_GAMES_ASSESSMENT.md:470`), which removed the only part worth
 * asking about.
 */
export function mixAndCompare(
  salt: Pick<Salt, 'ksp' | 'x' | 'y'>,
  cationSolution: { concentration: number; volume: number },
  anionSolution: { concentration: number; volume: number }
): QVerdict & { diluted: { cation: number; anion: number }; totalVolume: number } {
  const totalVolume = cationSolution.volume + anionSolution.volume;
  if (totalVolume <= 0) throw new RangeError('Total volume must be positive');

  const cation = (cationSolution.concentration * cationSolution.volume) / totalVolume;
  const anion = (anionSolution.concentration * anionSolution.volume) / totalVolume;

  const q = Math.pow(cation, salt.x) * Math.pow(anion, salt.y);
  const ratio = q / salt.ksp;

  return {
    q,
    ksp: salt.ksp,
    precipitates: ratio > 1,
    saturated: Math.abs(ratio - 1) < 1e-9,
    ratio,
    diluted: { cation, anion },
    totalVolume,
  };
}

/**
 * Which of two salts sharing an ion precipitates first as that ion is added.
 *
 * `hlutfelling` — fractional precipitation. The one needing the **lowest
 * concentration of the shared ion** comes down first, and that is emphatically
 * not the one with the lower Ksp unless the two happen to share a
 * stoichiometry. The canonical case is the Mohr titration: with 0,010 M each of
 * chloride and chromate, AgCl needs [Ag⁺] = 1,8 × 10⁻⁸ and Ag₂CrO₄ needs
 * 1,1 × 10⁻⁵, so **AgCl precipitates first even though its Ksp is 150 times
 * larger.** That is why the indicator works.
 *
 * Comparing Ksp directly is the mistake this function exists to make
 * impossible, which is also what the old game's version of this task failed at:
 * it printed both Ksp values on cards whose stoichiometries happened to match,
 * so "lowest Ksp first" was the whole answer and the real rule was never tested
 * (`ORPHANED_GAMES_ASSESSMENT.md:470`).
 *
 * **`sharedIon` is required and is not a convenience.** An earlier draft of
 * this function inferred nothing and used `x` where `y` belonged. For 1:1 salts
 * the two are equal and it looked right; for Ag₂CrO₄ it returned 1,2 × 10⁻⁸
 * instead of 1,1 × 10⁻⁵ and duly reported the chromate precipitating first —
 * inverting the one result the whole task is about.
 */
export function precipitationOrder(
  sharedIon: 'cation' | 'anion',
  salts: { salt: Salt; otherIonConcentration: number }[]
): { salt: Salt; threshold: number }[] {
  const thresholds = salts.map(({ salt, otherIonConcentration }) => {
    if (otherIonConcentration <= 0) throw new RangeError('Concentration must be positive');
    // Ksp = [cation]ˣ [anion]ʸ. Solve for whichever one is being added.
    const [own, other] = sharedIon === 'cation' ? [salt.x, salt.y] : [salt.y, salt.x];
    const threshold = Math.pow(salt.ksp / Math.pow(otherIonConcentration, other), 1 / own);
    return { salt, threshold };
  });
  return [...thresholds].sort((a, b) => a.threshold - b.threshold);
}

/**
 * `formatScientific`, `gradeScientific` and `ScientificEntry` used to live here
 * and now live in `@shared/utils`, re-exported below so this game's imports and
 * tests are unchanged. `3-ar/jafnvaegisfasti` needs the identical printer and
 * grader, and keeping two copies is how two games come to round differently.
 */
export {
  formatScientific,
  gradeScientific,
  type GradeOutcome,
  type ScientificEntry,
} from '@shared/utils';

/**
 * Whether the textbook common-ion approximation is safe for this case.
 *
 * The approximation drops the salt's own contribution `xs` next to the common
 * ion already present, `c`. That is fine when the salt is much less soluble
 * than the solution is concentrated, and **it is not always fine here**:
 * PbCl₂ has a molar solubility of 1,6 × 10⁻² M, so in 0,010 M Pb²⁺ the salt
 * supplies *more* of the common ion than the solution does and the
 * approximation is out by 53 %.
 *
 * This is the same shape as `3-ar/syrufastinn`'s 5 % rule and takes the same
 * threshold, so a student meets one convention and not two: the approximation
 * is called safe when the dropped term is at most 5 % of the term it is
 * dropped next to.
 *
 * The Æfa phase draws only from the safe cases; Beita is where a rule-breaker
 * would belong if one is ever wanted. A test asserts that split rather than
 * trusting whoever adds the next problem to notice.
 */
export function commonIonApproximationIsSafe(
  salt: Pick<Salt, 'ksp' | 'x' | 'y'>,
  commonIon: 'cation' | 'anion',
  concentration: number
): { safe: boolean; fraction: number } {
  if (concentration <= 0) return { safe: false, fraction: Number.POSITIVE_INFINITY };
  const { exact } = solubilityWithCommonIon(salt, commonIon, concentration);
  const own = (commonIon === 'cation' ? salt.x : salt.y) * exact;
  const fraction = own / concentration;
  return { safe: fraction <= 0.05, fraction };
}
