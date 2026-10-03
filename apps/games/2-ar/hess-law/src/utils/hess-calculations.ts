import { FORMATION_ENTHALPY } from '@shared/data/thermo';

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
    return sum + eq.deltaH * eq.multiplier * (eq.isReversed ? -1 : 1);
  }, 0);
}

/** `CaCO3(s)` → `CaCO₃(s)`: this game's keys write subscripts as plain digits. */
const subscripted = (key: string) => key.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]);

/**
 * ΔH°f in kJ/mol, from the shared table — the Icelandic book's appendix m68865, which
 * every game that weighs enthalpies now reads (mobile-pass decision 9, ruled (a)).
 *
 * This game kept a table of its own until 2026-10-03, from another book: CaCO₃ was
 * −1206,9 where the student's book gives −1220,0, so Level 3 marked a student who
 * looked the value up in their own book wrong by 13 kJ. Throws for a species the book
 * has no row for, rather than inventing one.
 */
export function formationEnthalpy(key: string): number {
  const value = FORMATION_ENTHALPY[subscripted(key)];
  if (value === undefined) {
    throw new RangeError(`No ΔH°f for ${key} in @shared/data/thermo.`);
  }
  return value;
}

/** The reference table Level 3 prints: the species its challenges need, and a few more. */
const REFERENCE_NAMES: [key: string, name: string][] = [
  ['H2O(l)', 'Vatn (fljótandi)'],
  ['H2O(g)', 'Vatnsgufa'],
  ['CO2(g)', 'Koldíoxíð'],
  ['CO(g)', 'Kolmónoxíð'],
  ['CH4(g)', 'Metan'],
  ['C2H6(g)', 'Etan'],
  ['C2H5OH(l)', 'Etanól'],
  ['NH3(g)', 'Ammóníak'],
  ['NO(g)', 'Nituroxíð'],
  ['NO2(g)', 'Niturdíoxíð'],
  ['SO2(g)', 'Brennisteinsdíoxíð'],
  ['SO3(g)', 'Brennisteinstríoxíð'],
  ['HCl(g)', 'Vetnisklóríð'],
  ['NaCl(s)', 'Natríumklóríð'],
  ['CaCO3(s)', 'Kalsíumkarbónat'],
  ['CaO(s)', 'Kalsíumoxíð'],
  ['Fe2O3(s)', 'Járn(III)oxíð'],
  ['Al2O3(s)', 'Áloxíð'],
  // Elements in standard state = 0
  ['O2(g)', 'Súrefni'],
  ['H2(g)', 'Vetni'],
  ['N2(g)', 'Nitur'],
  ['C(s)', 'Kolefni (grafít)'],
  ['Fe(s)', 'Járn'],
  ['Al(s)', 'Ál'],
  ['S(s)', 'Brennisteinn'],
  ['Cl2(g)', 'Klór'],
  ['Na(s)', 'Natríum'],
  ['Ca(s)', 'Kalsíum'],
];

/**
 * Standard enthalpies of formation table (kJ/mol), for display. Glucose was in it and
 * is not: the book's appendix has no row for it, and this table no longer prints a
 * value the student cannot look up.
 */
export const FORMATION_ENTHALPIES: Record<string, { value: number; name: string }> =
  Object.fromEntries(
    REFERENCE_NAMES.map(([key, name]) => [key, { value: formationEnthalpy(key), name }])
  );

interface CompoundEntry {
  formula: string;
  coefficient: number;
  deltaHf: number;
}

/** Level 3 grades on a relative tolerance: 2 % of the correct answer. */
export const ANSWER_TOLERANCE = 0.02;

/**
 * How far an answer may be from `correctAnswer` and still be marked right, in the
 * answer's own unit. The wrong-answer feedback prints this, so it quotes the rule the
 * grader applies — it used to print a fixed "±2 kJ/mol" beside a 2 % grader, which is
 * ±27 kJ/mol on the ethanol combustion.
 */
export function answerTolerance(correctAnswer: number): number {
  return Math.abs(correctAnswer * ANSWER_TOLERANCE);
}

/**
 * Check if a user's answer is within tolerance of the correct answer.
 * Uses 2% relative tolerance.
 */
export function checkAnswer(userAnswer: number, correctAnswer: number): boolean {
  return Math.abs(userAnswer - correctAnswer) <= answerTolerance(correctAnswer);
}

/**
 * Calculate delta H rxn from reactant and product formation enthalpies.
 * ΔH°rxn = Σ(n × ΔH°f products) - Σ(n × ΔH°f reactants)
 */
export function calculateDeltaHrxn(products: CompoundEntry[], reactants: CompoundEntry[]): number {
  const productsSum = products.reduce((sum, p) => sum + p.coefficient * p.deltaHf, 0);
  const reactantsSum = reactants.reduce((sum, r) => sum + r.coefficient * r.deltaHf, 0);
  return productsSum - reactantsSum;
}
