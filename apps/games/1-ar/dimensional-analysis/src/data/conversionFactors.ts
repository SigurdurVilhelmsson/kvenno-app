/**
 * Conversion factors for dimensional analysis
 * Each factor represents a relationship between two units
 */

export interface ConversionFactor {
  num: string;  // Numerator (e.g., "1 kg")
  den: string;  // Denominator (e.g., "1000 g")
  units: string[];  // Units involved in the conversion
}

export const conversionFactors: ConversionFactor[] = [
  // Mass conversions
  { num: '1 kg', den: '1000 g', units: ['kg', 'g'] },
  { num: '1000 g', den: '1 kg', units: ['g', 'kg'] },
  { num: '1 g', den: '1000 mg', units: ['g', 'mg'] },
  { num: '1000 mg', den: '1 g', units: ['mg', 'g'] },

  // Volume conversions
  { num: '1 L', den: '1000 mL', units: ['L', 'mL'] },
  { num: '1000 mL', den: '1 L', units: ['mL', 'L'] },

  // Length conversions
  { num: '1 km', den: '1000 m', units: ['km', 'm'] },
  { num: '1000 m', den: '1 km', units: ['m', 'km'] },
  { num: '1 m', den: '100 cm', units: ['m', 'cm'] },
  { num: '100 cm', den: '1 m', units: ['cm', 'm'] },
  { num: '1 m', den: '1000 mm', units: ['m', 'mm'] },
  { num: '1000 mm', den: '1 m', units: ['mm', 'm'] },

  // Time conversions
  { num: '1 klst', den: '3600 s', units: ['klst', 's'] },
  { num: '3600 s', den: '1 klst', units: ['s', 'klst'] },
  { num: '1 klst', den: '60 mín', units: ['klst', 'mín'] },
  { num: '60 mín', den: '1 klst', units: ['mín', 'klst'] },
  { num: '1 mín', den: '60 s', units: ['mín', 's'] },
  { num: '60 s', den: '1 mín', units: ['s', 'mín'] }
];
