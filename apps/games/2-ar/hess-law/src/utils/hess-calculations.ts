interface EquationForSum {
  deltaH: number;
  multiplier: number;
  isReversed: boolean;
}

/**
 * Calculate the sum of delta H values for selected equations,
 * accounting for reversal (sign flip) and multiplier.
 */
export function calculateSum(equations: EquationForSum[]): number {
  return equations.reduce((sum, eq) => {
    return sum + (eq.deltaH * eq.multiplier * (eq.isReversed ? -1 : 1));
  }, 0);
}

/**
 * Standard enthalpies of formation table (kJ/mol)
 */
export const FORMATION_ENTHALPIES: Record<string, { value: number; name: string }> = {
  'H2O(l)': { value: -285.8, name: 'Vatn (fljótandi)' },
  'H2O(g)': { value: -241.8, name: 'Vatnsgufa' },
  'CO2(g)': { value: -393.5, name: 'Koltvísýringur' },
  'CO(g)': { value: -110.5, name: 'Kolsýringur' },
  'CH4(g)': { value: -74.8, name: 'Metan' },
  'C2H6(g)': { value: -84.7, name: 'Etan' },
  'C2H5OH(l)': { value: -277.7, name: 'Etanól' },
  'C6H12O6(s)': { value: -1274, name: 'Glúkósi' },
  'NH3(g)': { value: -46.1, name: 'Ammóníak' },
  'NO(g)': { value: 90.3, name: 'Nituroxíð' },
  'NO2(g)': { value: 33.2, name: 'Niturtvíoxíð' },
  'SO2(g)': { value: -296.8, name: 'Brennisteinsdíoxíð' },
  'SO3(g)': { value: -395.7, name: 'Brennisteinstrioxíð' },
  'HCl(g)': { value: -92.3, name: 'Vetni klóríð' },
  'NaCl(s)': { value: -411.2, name: 'Natríumklóríð' },
  'CaCO3(s)': { value: -1206.9, name: 'Kalsíumkarbónat' },
  'CaO(s)': { value: -635.1, name: 'Kalsíumoxíð' },
  'Fe2O3(s)': { value: -824.2, name: 'Járnoxíð' },
  'Al2O3(s)': { value: -1675.7, name: 'Áloxíð' },
  // Elements in standard state = 0
  'O2(g)': { value: 0, name: 'Súrefni' },
  'H2(g)': { value: 0, name: 'Vetni' },
  'N2(g)': { value: 0, name: 'Nitur' },
  'C(s)': { value: 0, name: 'Kolefni (grafít)' },
  'Fe(s)': { value: 0, name: 'Járn' },
  'Al(s)': { value: 0, name: 'Ál' },
  'S(s)': { value: 0, name: 'Brennisteinn' },
  'Cl2(g)': { value: 0, name: 'Klór' },
  'Na(s)': { value: 0, name: 'Natríum' },
  'Ca(s)': { value: 0, name: 'Kalsíum' },
};

interface CompoundEntry {
  formula: string;
  coefficient: number;
  deltaHf: number;
}

/**
 * Check if a user's answer is within tolerance of the correct answer.
 * Uses 2% relative tolerance.
 */
export function checkAnswer(userAnswer: number, correctAnswer: number): boolean {
  const tolerance = Math.abs(correctAnswer * 0.02); // 2% tolerance
  return Math.abs(userAnswer - correctAnswer) <= tolerance;
}

/**
 * Calculate delta H rxn from reactant and product formation enthalpies.
 * ΔH°rxn = Σ(n × ΔH°f products) - Σ(n × ΔH°f reactants)
 */
export function calculateDeltaHrxn(
  products: CompoundEntry[],
  reactants: CompoundEntry[]
): number {
  const productsSum = products.reduce(
    (sum, p) => sum + p.coefficient * p.deltaHf,
    0
  );
  const reactantsSum = reactants.reduce(
    (sum, r) => sum + r.coefficient * r.deltaHf,
    0
  );
  return productsSum - reactantsSum;
}
