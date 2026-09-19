/**
 * Reynsluformúlur — percent composition to empirical formula.
 *
 * **The method, and it is the same four columns every textbook prints:**
 *
 *  1. **Prósenta** — take 100 g of the compound, so each percentage is a mass in grams
 *  2. **Mól** — divide each mass by the element's molar mass
 *  3. **Hlutfall** — divide every mole count by the smallest of them
 *  4. **Vísitala** — multiply up until all of them are whole numbers
 *
 * Step 4 is where students lose it, and the February review named the exact
 * failure: _"Students frequently round 1.5 to 2"_
 * (`docs/FEBRUARY-DECISIONS-RECOVERED.md:372`). 1,5 is not a rounding error, it
 * is a halving — the answer is to double everything, not to round. The engine
 * therefore reports **why** it multiplied, and the game shows it.
 *
 * `deriveEmpirical` returns every intermediate column, not just the answer, so
 * the Æfa phase can grade a student column by column and say which step went
 * wrong rather than only that the formula is not the one expected.
 */

import { ATOMIC_MASSES, type ElementSymbol } from '../data/elements';

/** One row of the four-column table, for one element. */
export interface Row {
  element: ElementSymbol;
  /** Mass in grams, taking a 100 g sample — numerically the percentage. */
  percent: number;
  /** percent / atomic mass. */
  moles: number;
  /** moles / smallest moles. */
  ratio: number;
  /** ratio × multiplier, rounded — the subscript in the formula. */
  subscript: number;
}

export interface Derivation {
  rows: Row[];
  /** What every ratio had to be multiplied by to reach whole numbers. */
  multiplier: number;
  /** `Mg₃P₂O₈`-style, subscripts as Unicode, 1 elided. */
  formula: string;
  /**
   * How far the scaled ratios sit from whole numbers, as a fraction. A well
   * formed problem is far below `TOLERANCE`; anything near it is data that does
   * not describe a real compound.
   */
  worstDeviation: number;
}

/**
 * How far a scaled ratio may sit from a whole number and still be accepted.
 *
 * 2 % of a subscript. Percentages quoted to two decimals carry about that much
 * slack once divided through, and a genuine formula lands far inside it — the
 * shipped problems' worst deviation is asserted in the tests. A value that
 * cannot get inside this bound with any multiplier up to `MAX_MULTIPLIER` is
 * not a composition at all. (It is `MAX_SUBSCRIPT`, not this, that rejects the
 * old repo's `l2-10` — see the note there.)
 */
export const TOLERANCE = 0.02;

/** Ratios beyond sixths do not appear in school empirical formulas. */
export const MAX_MULTIPLIER = 6;

/**
 * Largest subscript a first-year empirical formula carries. C₆H₁₂O₆ reaches 12;
 * nothing in the course goes past it.
 *
 * **This is the bound that actually rejects the old game's `l2-10`,** and the
 * reason is worth writing down because the assessment that found that defect
 * described it slightly wrong. `ORPHANED_GAMES_ASSESSMENT.md:338` says its
 * percentages "reduce to no whole-number formula at all". They do reduce —
 * 1,667 : 1 : 4,316, multiplied by 3, gives 5 : 3 : 12,95, which is within 0,4 %
 * of Mg₅P₃O₁₃. Arithmetically fine; chemically not a substance. An engine that
 * only knows arithmetic cannot tell those apart, so the bound is what stops it,
 * and the data file's deriving percentages *from* formulas is what makes the
 * question moot in practice. The assessment's conclusion — that the stored
 * `Mg₃(PO₄)₂` was unreachable — was right either way.
 */
export const MAX_SUBSCRIPT = 12;

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUBSCRIPTS[Number(d)])
    .join('');

/** `{Mg: 3, P: 2, O: 8}` -> `Mg₃P₂O₈`. A subscript of 1 is not written. */
export function formatFormula(counts: { element: ElementSymbol; subscript: number }[]): string {
  return counts.map((c) => `${c.element}${c.subscript === 1 ? '' : sub(c.subscript)}`).join('');
}

/**
 * Derive the empirical formula from percent composition.
 *
 * Throws when the percentages do not describe a compound — a wrong answer the
 * student could never reach is worse than no question, and the old repo shipped
 * exactly that in `l2-10`.
 */
export function deriveEmpirical(percentages: Partial<Record<ElementSymbol, number>>): Derivation {
  const entries = Object.entries(percentages) as [ElementSymbol, number][];
  if (entries.length < 2) throw new RangeError('An empirical formula needs at least two elements');

  const total = entries.reduce((s, [, p]) => s + p, 0);
  if (Math.abs(total - 100) > 0.5) {
    throw new RangeError(`Percentages sum to ${total.toFixed(2)}, not 100`);
  }

  const moles = entries.map(([element, percent]) => {
    const mass = ATOMIC_MASSES[element];
    if (mass === undefined) throw new RangeError(`No atomic mass for ${element}`);
    return { element, percent, moles: percent / mass };
  });

  const smallest = Math.min(...moles.map((m) => m.moles));
  const ratios = moles.map((m) => ({ ...m, ratio: m.moles / smallest }));

  // The smallest multiplier that brings every ratio within TOLERANCE of a whole
  // number. Trying them in order is what makes 1,5 come out as x2 rather than
  // as a rounding.
  let multiplier = 0;
  let worstDeviation = Number.POSITIVE_INFINITY;
  for (let m = 1; m <= MAX_MULTIPLIER; m++) {
    const worst = Math.max(
      ...ratios.map((r) => {
        const scaled = r.ratio * m;
        return Math.abs(scaled - Math.round(scaled)) / Math.round(scaled);
      })
    );
    if (worst <= TOLERANCE) {
      multiplier = m;
      worstDeviation = worst;
      break;
    }
  }
  if (multiplier === 0) {
    throw new RangeError(
      `These percentages reduce to no whole-number formula with a multiplier up to ${MAX_MULTIPLIER}. ` +
        `Ratios: ${ratios.map((r) => `${r.element} ${r.ratio.toFixed(3)}`).join(', ')}`
    );
  }

  const subscripts = ratios.map((r) => Math.round(r.ratio * multiplier));
  if (Math.max(...subscripts) > MAX_SUBSCRIPT) {
    throw new RangeError(
      `These percentages give subscripts up to ${Math.max(...subscripts)}, beyond the ${MAX_SUBSCRIPT} a school ` +
        `empirical formula carries — they do not describe a compound. ` +
        `Ratios: ${ratios.map((r) => `${r.element} ${r.ratio.toFixed(3)}`).join(', ')}`
    );
  }

  const rows: Row[] = ratios.map((r) => ({
    element: r.element,
    percent: r.percent,
    moles: r.moles,
    ratio: r.ratio,
    subscript: Math.round(r.ratio * multiplier),
  }));

  return { rows, multiplier, formula: formatFormula(rows), worstDeviation };
}

/**
 * The molecular formula, from the empirical one and a measured molar mass.
 *
 * `n = molar mass / empirical formula mass`, rounded — and the rounding is safe
 * here in a way step 4's is not, because `n` is a whole number of empirical
 * units by definition.
 */
export function deriveMolecular(
  empirical: { element: ElementSymbol; subscript: number }[],
  molarMass: number
): { n: number; formula: string; empiricalMass: number } {
  const empiricalMass = empirical.reduce((s, e) => s + ATOMIC_MASSES[e.element] * e.subscript, 0);
  const exact = molarMass / empiricalMass;
  const n = Math.round(exact);
  if (n < 1)
    throw new RangeError(`Molar mass ${molarMass} is below the empirical mass ${empiricalMass}`);
  if (Math.abs(exact - n) / n > TOLERANCE) {
    throw new RangeError(
      `Molar mass ${molarMass} is not a whole multiple of the empirical mass ${empiricalMass.toFixed(2)} (n = ${exact.toFixed(3)})`
    );
  }
  return {
    n,
    empiricalMass,
    formula: formatFormula(empirical.map((e) => ({ ...e, subscript: e.subscript * n }))),
  };
}

/** Percent composition of a known formula — the inverse, for the Kanna phase. */
export function percentComposition(
  counts: { element: ElementSymbol; subscript: number }[]
): { element: ElementSymbol; percent: number }[] {
  const total = counts.reduce((s, c) => s + ATOMIC_MASSES[c.element] * c.subscript, 0);
  return counts.map((c) => ({
    element: c.element,
    percent: (ATOMIC_MASSES[c.element] * c.subscript * 100) / total,
  }));
}
