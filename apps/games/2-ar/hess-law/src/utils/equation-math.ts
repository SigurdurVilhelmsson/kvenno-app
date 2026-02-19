/**
 * Multiplies all coefficients in a chemical equation string
 * E.g., "CH₄(g) + 2O₂(g)" with multiplier 2 → "2CH₄(g) + 4O₂(g)"
 */
export function multiplyEquationCoefficients(equation: string, multiplier: number): string {
  if (multiplier === 1) return equation;

  // Split by " + " to get individual terms
  const terms = equation.split(' + ');

  const multipliedTerms = terms.map(term => {
    term = term.trim();

    // Match coefficient at start: number, fraction (½), or nothing (implicit 1)
    // Regex: optional number or fraction at the start, followed by the formula
    const fractionMatch = term.match(/^(½|⅓|¼|⅔|¾)/);
    const numberMatch = term.match(/^(\d+)/);

    if (fractionMatch) {
      // Handle fraction coefficients
      const fractionMap: Record<string, number> = {
        '½': 0.5, '⅓': 1/3, '¼': 0.25, '⅔': 2/3, '¾': 0.75
      };
      const fractionValue = fractionMap[fractionMatch[1]] || 0.5;
      const newCoeff = fractionValue * multiplier;
      const formula = term.slice(fractionMatch[1].length);

      // Format the new coefficient nicely
      if (Number.isInteger(newCoeff)) {
        return newCoeff === 1 ? formula : `${newCoeff}${formula}`;
      } else {
        // Convert back to fraction if possible
        const fractionStr = newCoeff === 0.5 ? '½' :
                           newCoeff === 1.5 ? '³⁄₂' :
                           newCoeff === 2.5 ? '⁵⁄₂' :
                           `${newCoeff}`;
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
