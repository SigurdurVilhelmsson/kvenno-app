/**
 * The maths behind Jafnvægisfastinn. No React, no Icelandic.
 *
 * **Nothing is stored that can be computed.** A reaction is a list of species
 * with coefficients and phases, plus a constant read from a cited place in the
 * school's own textbook. The K expression, the Kp expression, delta-n, the
 * reaction quotient, the extent of reaction and every ICE row are derived from
 * that. The precedent is `1-ar/reynsluformulur` and `3-ar/leysnijafnvaegi`:
 * where the data is an arithmetic result rather than a fact, deriving it makes
 * a whole class of defect unwritable instead of merely absent.
 *
 * The one judgement call worth naming is the solver. The obvious approach is to
 * special-case the algebra — linear here, quadratic there — and that is what
 * every textbook does. It is also what limits a textbook to reactions whose
 * algebra is tractable by hand. Instead this solves for the **extent of
 * reaction** by bisection, which works for any stoichiometry at all, because
 * Q rises monotonically with extent. See `solveExtent`.
 */

/** Phase as written in the equation. Only g and aq appear in K. */
export type PhaseTag = 'g' | 'aq' | 'l' | 's';

export interface Species {
  formula: string;
  coefficient: number;
  phase: PhaseTag;
}

/** Where a number came from. Every constant in this game carries one. */
export interface Source {
  /** Module id in the school's textbook, e.g. 'ch13/m68798'. */
  module: string;
  /** What in that module — a worked example, a check-your-learning item. */
  where: string;
}

export interface EquilibriumConstant {
  value: number;
  /**
   * The temperature the constant belongs to — **optional, and deliberately so.**
   *
   * Unlike Ka and Ksp, which are quoted at one standard temperature, a general
   * equilibrium constant is only meaningful beside the temperature it was
   * measured at. The school's book states one for most of the values it gives
   * and not for all of them: the PCl₅ decomposition is introduced as holding
   * "under certain conditions", and the HCN example simply gives Kc.
   *
   * Where the book states none, none is recorded. Filling in a plausible 25 °C
   * would put an unsourced number on the screen, and it would do so invisibly.
   * The consequence is enforced rather than documented: `canConvertToKp`
   * returns false for such a constant, so those reactions never reach the
   * Kc-to-Kp exercise at all.
   */
  temperatureC?: number;
  /** Whether the quoted number is Kc or Kp. */
  basis: 'Kc' | 'Kp';
  source: Source;
}

export interface Reaction {
  id: string;
  /** Icelandic name of the system. */
  name: string;
  reactants: Species[];
  products: Species[];
  /** Absent where the reaction is used only to practise writing an expression. */
  constant?: EquilibriumConstant;
  source: Source;
}

/**
 * The gas constant as the school's book writes it, in L·atm/(mol·K).
 *
 * The book's own worked answer for Kp depends on this digit count: it computes
 * (0,28)[(0,0821)(1173)]^-2 and prints 3,0 x 10^-5. Using the fuller 0,082057
 * gives 3,02 x 10^-5, which still rounds the same way here but need not in the
 * next problem. Matching the book is what keeps a student's hand calculation
 * and the screen in agreement.
 */
export const R_GAS = 0.0821;

export const CELSIUS_OFFSET = 273.15;

/**
 * The threshold for "the change is small enough to ignore".
 *
 * Five per cent, which is the book's rule and is already what `3-ar/syrufastinn`
 * and `3-ar/leysnijafnvaegi` apply. Three nodes in one chain using three
 * thresholds would teach that the number is arbitrary; it is a convention, and
 * a convention only works if it is the same everywhere.
 */
export const APPROXIMATION_THRESHOLD = 0.05;

/**
 * Only gases and dissolved species appear in an equilibrium constant.
 *
 * A pure solid or a pure liquid has an activity of 1 — its "concentration" is
 * a property of the substance, not of the mixture, and does not change as the
 * reaction runs. This one predicate is the whole of heterogeneous equilibrium.
 */
export function appearsInK(species: Species): boolean {
  return species.phase === 'g' || species.phase === 'aq';
}

export function activeReactants(reaction: Reaction): Species[] {
  return reaction.reactants.filter(appearsInK);
}

export function activeProducts(reaction: Reaction): Species[] {
  return reaction.products.filter(appearsInK);
}

export function allSpecies(reaction: Reaction): Species[] {
  return [...reaction.reactants, ...reaction.products];
}

/** True when every species is in the same phase. */
export function isHomogeneous(reaction: Reaction): boolean {
  const phases = new Set(allSpecies(reaction).map((s) => s.phase));
  return phases.size === 1;
}

/** Species that are left out of K, i.e. every pure solid and pure liquid. */
export function omittedFromK(reaction: Reaction): Species[] {
  return allSpecies(reaction).filter((s) => !appearsInK(s));
}

/**
 * Change in moles of **gas**, products minus reactants.
 *
 * Gas only, because this is the exponent in Kp = Kc(RT)^dn and the derivation
 * runs through the ideal gas law. A dissolved species counts in K but not here.
 */
export function deltaNGas(reaction: Reaction): number {
  const sum = (list: Species[]) =>
    list.filter((s) => s.phase === 'g').reduce((t, s) => t + s.coefficient, 0);
  return sum(reaction.products) - sum(reaction.reactants);
}

function superscript(n: number): string {
  if (n === 1) return '';
  const digits = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return String(n)
    .split('')
    .map((d) => digits[Number(d)])
    .join('');
}

function bracketTerm(s: Species): string {
  return `[${s.formula}]${superscript(s.coefficient)}`;
}

function pressureTerm(s: Species): string {
  const base = `P(${s.formula})`;
  return s.coefficient === 1 ? base : `${base}${superscript(s.coefficient)}`;
}

function joinTerms(terms: string[]): string {
  if (terms.length === 0) return '1';
  return terms.join('·');
}

/** `Kc = [NH₃]² / ([N₂]·[H₂]³)`, with solids and pure liquids left out. */
export function kcExpression(reaction: Reaction): string {
  const top = joinTerms(activeProducts(reaction).map(bracketTerm));
  const bottom = joinTerms(activeReactants(reaction).map(bracketTerm));
  return `Kc = ${top} / ${bottom}`;
}

/**
 * The Kp expression, or `null` where one cannot be written.
 *
 * A dissolved species has a concentration and no partial pressure, so a
 * reaction with an aqueous term in K has a Kc and no Kp. The book makes the
 * same point by writing Kp for only two of its four heterogeneous examples.
 */
export function kpExpression(reaction: Reaction): string | null {
  const active = [...activeReactants(reaction), ...activeProducts(reaction)];
  if (active.length === 0 || active.some((s) => s.phase !== 'g')) return null;
  const top = joinTerms(activeProducts(reaction).map(pressureTerm));
  const bottom = joinTerms(activeReactants(reaction).map(pressureTerm));
  return `Kp = ${top} / ${bottom}`;
}

/** `N₂(g) + 3H₂(g) ⇌ 2NH₃(g)` */
export function equationOf(reaction: Reaction): string {
  const side = (list: Species[]) =>
    list
      .map((s) => `${s.coefficient === 1 ? '' : s.coefficient}${s.formula}(${s.phase})`)
      .join(' + ');
  return `${side(reaction.reactants)} ⇌ ${side(reaction.products)}`;
}

/**
 * Whether Kc can be turned into Kp for this reaction.
 *
 * Two conditions, and both are chemistry rather than bookkeeping. The constant
 * must carry a temperature, because `(RT)^Δn` needs one. And a Kp expression
 * must exist at all, which rules out anything with a dissolved species in K.
 */
export function canConvertToKp(reaction: Reaction): boolean {
  return (
    reaction.constant?.temperatureC !== undefined &&
    reaction.constant.basis === 'Kc' &&
    kpExpression(reaction) !== null
  );
}

export function kcToKp(kc: number, deltaN: number, temperatureC: number): number {
  const t = temperatureC + CELSIUS_OFFSET;
  if (t <= 0)
    throw new RangeError(`Temperature must be above absolute zero, got ${temperatureC} °C`);
  return kc * Math.pow(R_GAS * t, deltaN);
}

export function kpToKc(kp: number, deltaN: number, temperatureC: number): number {
  return kcToKp(kp, -deltaN, temperatureC);
}

export type Amounts = Record<string, number>;

/**
 * The reaction quotient for a given mixture.
 *
 * Zero is handled explicitly rather than left to floating point. With no
 * product present Q is 0; with a reactant used up Q is infinite. Both are the
 * physically right answer and both are the states a student meets first, since
 * "nothing has reacted yet" is where every problem starts.
 */
export function reactionQuotient(reaction: Reaction, amounts: Amounts): number {
  const value = (s: Species): number => {
    const a = amounts[s.formula];
    if (a === undefined) throw new RangeError(`No amount given for ${s.formula}`);
    if (a < 0) throw new RangeError(`Negative amount for ${s.formula}: ${a}`);
    return a;
  };
  const top = activeProducts(reaction).reduce((t, s) => t * Math.pow(value(s), s.coefficient), 1);
  const bottom = activeReactants(reaction).reduce(
    (t, s) => t * Math.pow(value(s), s.coefficient),
    1
  );
  if (bottom === 0) return top === 0 ? Number.NaN : Number.POSITIVE_INFINITY;
  return top / bottom;
}

export type Direction = 'afram' | 'afturabak' | 'jafnvaegi';

/**
 * Which way the reaction runs, from Q against K.
 *
 * `tolerance` is relative, because Q and K in this topic range over twenty
 * orders of magnitude and an absolute one would call everything below 10⁻⁶
 * an equilibrium.
 */
export function directionFromQ(q: number, k: number, tolerance = 1e-9): Direction {
  if (!Number.isFinite(q)) return 'afturabak';
  if (Math.abs(q - k) <= tolerance * Math.max(Math.abs(k), Number.MIN_VALUE)) return 'jafnvaegi';
  return q < k ? 'afram' : 'afturabak';
}

/** Concentrations after the reaction has run forward by `extent`. */
export function amountsAtExtent(reaction: Reaction, initial: Amounts, extent: number): Amounts {
  const out: Amounts = {};
  for (const s of reaction.reactants) out[s.formula] = initial[s.formula] - s.coefficient * extent;
  for (const s of reaction.products) out[s.formula] = initial[s.formula] + s.coefficient * extent;
  return out;
}

/**
 * How far the reaction can run before something runs out, in both directions.
 *
 * Only species that appear in K bound the range. A solid is consumed too, but
 * how much of it there is is a separate question from where the equilibrium
 * sits, and the book's problems never give an amount for one.
 */
export function extentRange(reaction: Reaction, initial: Amounts): { min: number; max: number } {
  const limit = (list: Species[]) =>
    list
      .filter(appearsInK)
      .reduce((m, s) => Math.min(m, initial[s.formula] / s.coefficient), Number.POSITIVE_INFINITY);
  const max = limit(reaction.reactants);
  const min = -limit(reaction.products);
  return { min, max };
}

/**
 * Solve for the extent of reaction that makes Q equal K.
 *
 * **Why bisection rather than algebra.** Q as a function of extent is strictly
 * increasing wherever it is defined: running forward consumes the denominator
 * and builds the numerator, and both push Q up. It goes to 0 at the extent
 * where the last product disappears and to infinity at the extent where the
 * first reactant does. So for any positive K there is exactly one root, and
 * bisection finds it for any stoichiometry — including the ones a hand
 * calculation cannot reach, such as N₂ + 3H₂ ⇌ 2NH₃, whose ICE algebra is a
 * quartic.
 *
 * The midpoint is always strictly inside the bracket, so no concentration is
 * ever evaluated at zero and the endpoints are never touched.
 *
 * Heterogeneous reactions are refused rather than approximated. A solid's
 * amount does not enter K, so an ICE table over one would have a row that
 * changes and never affects the answer — which is the misconception this
 * topic exists to remove, not one to encode.
 */
export function solveExtent(reaction: Reaction, initial: Amounts, k: number): number {
  if (k <= 0 || !Number.isFinite(k))
    throw new RangeError(`K must be finite and positive, got ${k}`);
  if (!isHomogeneous(reaction)) {
    throw new RangeError(
      `${reaction.id} is not homogeneous. A pure solid or liquid does not appear in K, so ` +
        `solving for an extent over one would report a change that cannot affect the answer.`
    );
  }
  const { min, max } = extentRange(reaction, initial);
  if (!(max > min)) {
    throw new RangeError(
      `${reaction.id} has no room to react from the given mixture: extent range is empty.`
    );
  }
  let lo = min;
  let hi = max;
  // 100 halvings take a double-precision bracket below its own resolution.
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2;
    if (mid <= lo || mid >= hi) break;
    if (reactionQuotient(reaction, amountsAtExtent(reaction, initial, mid)) < k) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * The textbook shortcut: assume the reactant concentrations do not move.
 *
 * Only defined where every product starts at zero, which is the case the
 * shortcut is taught for. Elsewhere it returns `null` and the caller uses the
 * exact root — better than returning a number whose assumption nobody stated.
 */
export function approximateExtent(reaction: Reaction, initial: Amounts, k: number): number | null {
  const products = activeProducts(reaction);
  const reactants = activeReactants(reaction);
  if (products.length === 0 || reactants.length === 0) return null;
  if (products.some((s) => initial[s.formula] !== 0)) return null;

  const denominator = reactants.reduce(
    (t, s) => t * Math.pow(initial[s.formula], s.coefficient),
    1
  );
  const coefficientProduct = products.reduce(
    (t, s) => t * Math.pow(s.coefficient, s.coefficient),
    1
  );
  const totalProductOrder = products.reduce((t, s) => t + s.coefficient, 0);
  return Math.pow((k * denominator) / coefficientProduct, 1 / totalProductOrder);
}

/**
 * The largest fractional change the extent imposes on any reactant.
 *
 * This is the quantity the five per cent rule tests. It is taken over every
 * reactant rather than the smallest one alone, because it is the reactant that
 * runs down fastest in proportion — not the one present in the smallest
 * amount — that breaks the assumption.
 */
export function largestRelativeChange(
  reaction: Reaction,
  initial: Amounts,
  extent: number
): number {
  return activeReactants(reaction).reduce((worst, s) => {
    const start = initial[s.formula];
    if (start === 0) return Number.POSITIVE_INFINITY;
    return Math.max(worst, Math.abs(s.coefficient * extent) / start);
  }, 0);
}

export function approximationIsSafe(reaction: Reaction, initial: Amounts, extent: number): boolean {
  return largestRelativeChange(reaction, initial, extent) < APPROXIMATION_THRESHOLD;
}

export interface IceRow {
  formula: string;
  side: 'hvarfefni' | 'myndefni';
  coefficient: number;
  initial: number;
  change: number;
  equilibrium: number;
}

export interface IceResult {
  rows: IceRow[];
  /** Exact root of Q(x) = K. */
  extent: number;
  /** The shortcut's answer, where the shortcut applies at all. */
  approximateExtent: number | null;
  /** Whether the five per cent rule licenses the shortcut here. */
  approximationSafe: boolean;
  /** Worst fractional change imposed on a reactant, as a fraction not a percent. */
  relativeChange: number;
  /** Q of the starting mixture, so the table can say which way it will run. */
  initialQuotient: number;
  direction: Direction;
}

/** The whole ICE table, derived. Nothing here is written down anywhere. */
export function iceTable(reaction: Reaction, initial: Amounts, k: number): IceResult {
  const extent = solveExtent(reaction, initial, k);
  const final = amountsAtExtent(reaction, initial, extent);
  const rows: IceRow[] = [
    ...reaction.reactants.map((s) => ({
      formula: s.formula,
      side: 'hvarfefni' as const,
      coefficient: s.coefficient,
      initial: initial[s.formula],
      change: -s.coefficient * extent,
      equilibrium: final[s.formula],
    })),
    ...reaction.products.map((s) => ({
      formula: s.formula,
      side: 'myndefni' as const,
      coefficient: s.coefficient,
      initial: initial[s.formula],
      change: s.coefficient * extent,
      equilibrium: final[s.formula],
    })),
  ];
  const approx = approximateExtent(reaction, initial, k);
  return {
    rows,
    extent,
    approximateExtent: approx,
    approximationSafe: approximationIsSafe(reaction, initial, approx ?? extent),
    relativeChange: largestRelativeChange(reaction, initial, extent),
    initialQuotient: reactionQuotient(reaction, initial),
    direction: directionFromQ(reactionQuotient(reaction, initial), k),
  };
}
