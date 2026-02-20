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
    // Compound unit: (current_num / current_den) × (factor_num / factor_den)
    // Collect all units, then cancel matching pairs between numerator and denominator
    const numUnits = [current.numerator, factorParsed.numerator];
    const denUnits = [current.denominator, factorParsed.denominator];

    const cancelledNum = new Set<number>();
    const cancelledDen = new Set<number>();

    for (let i = 0; i < numUnits.length; i++) {
      if (cancelledNum.has(i)) continue;
      for (let j = 0; j < denUnits.length; j++) {
        if (cancelledDen.has(j)) continue;
        if (numUnits[i] === denUnits[j]) {
          cancelledNum.add(i);
          cancelledDen.add(j);
          break;
        }
      }
    }

    const remainingNum = numUnits.filter((_, i) => !cancelledNum.has(i));
    const remainingDen = denUnits.filter((_, i) => !cancelledDen.has(i));

    const numStr = remainingNum.length > 0 ? remainingNum.join('·') : '1';
    const denStr = remainingDen.length > 0 ? remainingDen.join('·') : null;

    if (!denStr) {
      return numStr;
    }

    if (numStr === '1') {
      return `1/${denStr}`;
    }

    return `${numStr}/${denStr}`;
  }
};
