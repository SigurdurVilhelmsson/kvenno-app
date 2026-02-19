import { ConversionFactor } from '../data/conversionFactors';

/**
 * Parsed unit representation
 */
export interface ParsedUnit {
  numerator: string;
  denominator: string | null;
}

/**
 * Parse a unit string into numerator and denominator components
 * @example
 * parseUnit('km/klst') // => { numerator: 'km', denominator: 'klst' }
 * parseUnit('g') // => { numerator: 'g', denominator: null }
 */
export const parseUnit = (unitString: string): ParsedUnit => {
  if (unitString.includes('/')) {
    const [num, den] = unitString.split('/');
    return { numerator: num.trim(), denominator: den.trim() };
  }
  return { numerator: unitString.trim(), denominator: null };
};

/**
 * Predict the resulting unit after applying a conversion factor
 * Handles unit cancellation and compound unit formation
 *
 * @param currentUnit - The current unit (e.g., 'km' or 'km/klst')
 * @param factor - The conversion factor to apply
 * @returns The resulting unit string
 *
 * @example
 * predictResultingUnit('km', { num: '1000 m', den: '1 km', units: ['m', 'km'] })
 * // => 'm' (km cancels, m remains)
 */
export const predictResultingUnit = (currentUnit: string, factor: ConversionFactor): string => {
  const current = parseUnit(currentUnit);
  const factorParsed = {
    numerator: factor.num.split(' ')[1],
    denominator: factor.den.split(' ')[1]
  };

  if (!current.denominator) {
    // Simple unit: current is just numerator
    if (current.numerator === factorParsed.denominator) {
      // Cancellation happens
      return factorParsed.numerator;
    } else {
      // No cancellation - creates compound unit
      return `${current.numerator}·${factorParsed.numerator}/${factorParsed.denominator}`;
    }
  } else {
    // Compound unit: current has both numerator and denominator
    let newNum = current.numerator;
    let newDen = current.denominator;

    // Check if factor denominator cancels with current numerator
    if (current.numerator === factorParsed.denominator) {
      newNum = factorParsed.numerator;
    } else {
      // No cancellation in numerator - they multiply
      newNum = `${current.numerator}·${factorParsed.numerator}`;
    }

    // Check if factor numerator cancels with current denominator
    if (current.denominator === factorParsed.numerator) {
      // Factor numerator cancels with current denominator
      // Check if we just have numerator left
      if (factorParsed.denominator === '1' || !factorParsed.denominator) {
        return newNum; // Simple unit result
      }
      newDen = factorParsed.denominator;
    } else if (current.denominator === factorParsed.denominator) {
      // Both denominators are the same - they cancel out
      return newNum;
    } else {
      // No cancellation in denominator - they multiply
      newDen = `${current.denominator}·${factorParsed.denominator}`;
    }

    // Simplify if numerator is just 1
    if (newNum === '1') {
      return `1/${newDen}`;
    }

    return `${newNum}/${newDen}`;
  }
};
