const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';

/**
 * Print a formula the way the rest of the game writes it: `CO2(g)` → `CO₂(g)`.
 *
 * Level 3's ΔH°f table is keyed by ASCII formulas, and its table and worked sums
 * printed those keys as they were — `CO2(g)`, `C2H5OH(l)` — directly under an
 * equation written `CO₂(g)`. A digit that follows an element symbol or a closing
 * bracket is a subscript; one at the start of the string is a coefficient and is
 * left alone.
 */
export function toSubscripts(formula: string): string {
  // Captures the preceding character rather than using a lookbehind, which Safari
  // before 16.4 cannot parse; no other shipped regex on the platform uses one.
  return formula.replace(
    /([A-Za-z)])(\d+)/g,
    (_match, before: string, digits: string) =>
      before + [...digits].map((d) => SUBSCRIPTS[Number(d)]).join('')
  );
}
