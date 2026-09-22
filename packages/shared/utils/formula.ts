import { ATOMIC_MASSES, type ElementSymbol } from '../data/elements';

/**
 * Reading a chemical formula, and weighing it.
 *
 * **Formulas on this platform are written for a student to read, not for code
 * to parse**: `Fe₂O₃` carries Unicode subscripts because that is what belongs
 * on screen. So a parser has to accept those, and it must not quietly accept
 * anything else — a typo in a formula that silently weighs as something else
 * is the `1-ar/molmassi` B4 defect in a new costume.
 */

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';

/** `Fe₂O₃` → `Fe2O3`, leaving an ASCII-digit formula untouched. */
export function normaliseSubscripts(formula: string): string {
  return formula.replace(/[₀-₉]/g, (c) => String(SUBSCRIPTS.indexOf(c)));
}

export interface ElementCount {
  symbol: ElementSymbol;
  count: number;
}

/**
 * Split a formula into its elements and their counts.
 *
 * Throws on anything it cannot read, rather than returning a partial answer:
 * an unknown symbol, a stray character, or an empty formula. A parser that
 * skips what it does not understand turns `Cu(NO₃)₂` into copper.
 *
 * **Parentheses are deliberately not supported, and that is enforced rather
 * than documented.** No formula in the games that weigh things uses them; a
 * silent wrong answer on `Ca(OH)₂` would be far worse than a refusal.
 */
export function parseFormula(formula: string): ElementCount[] {
  const flat = normaliseSubscripts(formula.trim());
  if (flat.length === 0) throw new RangeError('Empty formula');
  if (flat.includes('(') || flat.includes(')')) {
    throw new RangeError(
      `${formula}: parentheses are not supported. Write the formula out, or extend parseFormula.`
    );
  }

  const counts: ElementCount[] = [];
  const token = /([A-Z][a-z]?)(\d*)/y;
  let at = 0;
  while (at < flat.length) {
    token.lastIndex = at;
    const match = token.exec(flat);
    if (!match || match[0].length === 0) {
      throw new RangeError(`${formula}: cannot read "${flat.slice(at)}"`);
    }
    const symbol = match[1];
    if (!(symbol in ATOMIC_MASSES)) {
      throw new RangeError(`${formula}: no atomic mass for "${symbol}"`);
    }
    const count = match[2] === '' ? 1 : Number(match[2]);
    if (count === 0) throw new RangeError(`${formula}: "${symbol}" has a subscript of zero`);
    const seen = counts.find((c) => c.symbol === symbol);
    if (seen) seen.count += count;
    else counts.push({ symbol: symbol as ElementSymbol, count });
    at = token.lastIndex;
  }
  return counts;
}

/** Molar mass in g/mol, derived from the formula. Never stored anywhere. */
export function molarMassOf(formula: string): number {
  return parseFormula(formula).reduce((sum, e) => sum + ATOMIC_MASSES[e.symbol] * e.count, 0);
}
