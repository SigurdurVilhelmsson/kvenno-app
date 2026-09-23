/**
 * Multiplies all coefficients in a chemical equation string
 * E.g., "CH₄(g) + 2O₂(g)" with multiplier 2 → "2CH₄(g) + 4O₂(g)"
 */
export function multiplyEquationCoefficients(equation: string, multiplier: number): string {
  if (multiplier === 1) return equation;

  // Split by " + " to get individual terms
  const terms = equation.split(' + ');

  const multipliedTerms = terms.map((term) => {
    term = term.trim();

    // Match coefficient at start: number, fraction (½), or nothing (implicit 1)
    // Regex: optional number or fraction at the start, followed by the formula
    const fractionMatch = term.match(/^(½|⅓|¼|⅔|¾)/);
    const numberMatch = term.match(/^(\d+)/);

    if (fractionMatch) {
      // Handle fraction coefficients
      const fractionMap: Record<string, number> = {
        '½': 0.5,
        '⅓': 1 / 3,
        '¼': 0.25,
        '⅔': 2 / 3,
        '¾': 0.75,
      };
      const fractionValue = fractionMap[fractionMatch[1]] || 0.5;
      const newCoeff = fractionValue * multiplier;
      const formula = term.slice(fractionMatch[1].length);

      // Format the new coefficient nicely
      if (Number.isInteger(newCoeff)) {
        return newCoeff === 1 ? formula : `${newCoeff}${formula}`;
      } else {
        // Convert back to fraction if possible
        const fractionStr =
          newCoeff === 0.5
            ? '½'
            : newCoeff === 1.5
              ? '³⁄₂'
              : newCoeff === 2.5
                ? '⁵⁄₂'
                : `${newCoeff}`;
        return `${fractionStr}${formula}`;
      }
    } else if (numberMatch) {
      // Handle numeric coefficients
      const oldCoeff = parseInt(numberMatch[1], 10);
      const newCoeff = oldCoeff * multiplier;
      const formula = term.slice(numberMatch[1].length);
      return `${newCoeff}${formula}`;
    } else {
      // Implicit coefficient of 1
      return `${multiplier}${term}`;
    }
  });

  return multipliedTerms.join(' + ');
}

const FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '⅓': 1 / 3,
  '¼': 0.25,
  '⅔': 2 / 3,
  '¾': 0.75,
};

/**
 * Read one side of an equation into species and coefficients:
 * `"2C(s) + 3H₂(g) + ½O₂(g)"` → `{ C(s): 2, H₂(g): 3, O₂(g): 0.5 }`.
 * Coefficients may be integers, `3/2`, or a vulgar fraction such as `½`.
 * Subscripts are Unicode, so a leading ASCII digit is always a coefficient.
 */
export function parseSide(side: string): Map<string, number> {
  const species = new Map<string, number>();
  for (const raw of side.split(' + ')) {
    const term = raw.trim();
    const match = term.match(/^(\d+\/\d+|\d+|[½⅓¼⅔¾])?(.+)$/);
    if (!match) throw new Error(`Cannot read the term "${term}"`);
    const [, coeffText, formula] = match;
    let coefficient = 1;
    if (coeffText && coeffText in FRACTIONS) coefficient = FRACTIONS[coeffText];
    else if (coeffText?.includes('/')) {
      const [num, den] = coeffText.split('/').map(Number);
      coefficient = num / den;
    } else if (coeffText) coefficient = Number(coeffText);
    species.set(formula, (species.get(formula) ?? 0) + coefficient);
  }
  return species;
}

interface EquationForNet {
  reactants: string;
  products: string;
  isReversed?: boolean;
  multiplier?: number;
}

/**
 * The net change a set of equations makes, as species → amount, products positive
 * and reactants negative. Each equation is taken as the student has set it: reversed
 * swaps its sides, the multiplier scales it. Species that cancel are dropped.
 */
export function netChange(equations: EquationForNet[]): Map<string, number> {
  const net = new Map<string, number>();
  const add = (side: string, sign: number) => {
    for (const [formula, coefficient] of parseSide(side)) {
      net.set(formula, (net.get(formula) ?? 0) + sign * coefficient);
    }
  };
  for (const eq of equations) {
    const scale = (eq.multiplier ?? 1) * (eq.isReversed ? -1 : 1);
    add(eq.products, scale);
    add(eq.reactants, -scale);
  }
  for (const [formula, amount] of net) {
    if (Math.abs(amount) < 1e-9) net.delete(formula);
  }
  return net;
}

/**
 * Whether the chosen equations, as the student has reversed and scaled them, add up to
 * the target equation — species for species, not merely to its ΔH.
 *
 * Level 2 used to compare only the summed ΔH, and on puzzle 5 that accepts a wrong
 * combination: 3 × (S + O₂ → SO₂) plus 2 × (S + 3/2O₂ → SO₃) reversed also sums to
 * −99,0 kJ, because 4 × 297 = 3 × 396, yet it is S + 2SO₃ → 3SO₂, not the target.
 */
export function reachesTarget(
  equations: EquationForNet[],
  target: { reactants: string; products: string }
): boolean {
  if (equations.length === 0) return false;
  const got = netChange(equations);
  const want = netChange([target]);
  if (got.size !== want.size) return false;
  for (const [formula, amount] of want) {
    if (Math.abs((got.get(formula) ?? 0) - amount) > 1e-9) return false;
  }
  return true;
}
