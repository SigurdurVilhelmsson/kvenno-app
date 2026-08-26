/**
 * The pool of equivalences a student can draw on.
 *
 * Every entry is an *equivalence*, not a fraction — the student chooses which way
 * up to turn it. Both sides of an equivalence are either tagged with a species or
 * neither is; the data-integrity test enforces that, because the species
 * inference in `engine/units.ts` relies on it.
 *
 * Molar masses are computed from IUPAC 2021 standard atomic weights and rounded
 * to four significant figures. NaCl is 58,44 here, matching `1-ar/molmassi`;
 * `lausnir` and the older `dimensional-analysis` use 58,5, which is a known
 * platform inconsistency (CURRICULUM_REVIEW.md:192) and not one to propagate.
 */

import type { Equivalence } from '../engine/units';

/** Metric prefixes. Untagged: 1 L is 1000 mL whatever is in the beaker. */
export const metricRatios: Equivalence[] = [
  {
    id: 'metric-mL-L',
    left: { value: 1000, unit: 'mL' },
    right: { value: 1, unit: 'L' },
    kind: 'metric',
  },
  {
    id: 'metric-mg-g',
    left: { value: 1000, unit: 'mg' },
    right: { value: 1, unit: 'g' },
    kind: 'metric',
  },
  {
    id: 'metric-g-kg',
    left: { value: 1000, unit: 'g' },
    right: { value: 1, unit: 'kg' },
    kind: 'metric',
  },
];

/** Molar masses. Mg 24,305 + O 15,999 = 40,304 for MgO, and so on. */
export const molarMassRatios: Equivalence[] = [
  {
    id: 'mm-Mg',
    left: { value: 24.31, unit: 'g', species: 'Mg' },
    right: { value: 1, unit: 'mol', species: 'Mg' },
    kind: 'molmassi',
  },
  {
    id: 'mm-MgO',
    left: { value: 40.3, unit: 'g', species: 'MgO' },
    right: { value: 1, unit: 'mol', species: 'MgO' },
    kind: 'molmassi',
  },
  {
    id: 'mm-O2',
    left: { value: 32.0, unit: 'g', species: 'O₂' },
    right: { value: 1, unit: 'mol', species: 'O₂' },
    kind: 'molmassi',
  },
  {
    id: 'mm-NaCl',
    left: { value: 58.44, unit: 'g', species: 'NaCl' },
    right: { value: 1, unit: 'mol', species: 'NaCl' },
    kind: 'molmassi',
  },
  {
    id: 'mm-H2O',
    left: { value: 18.02, unit: 'g', species: 'H₂O' },
    right: { value: 1, unit: 'mol', species: 'H₂O' },
    kind: 'molmassi',
  },
  {
    id: 'mm-etanol',
    left: { value: 46.07, unit: 'g', species: 'C₂H₅OH' },
    right: { value: 1, unit: 'mol', species: 'C₂H₅OH' },
    kind: 'molmassi',
  },
  {
    id: 'mm-NaHCO3',
    left: { value: 84.01, unit: 'g', species: 'NaHCO₃' },
    right: { value: 1, unit: 'mol', species: 'NaHCO₃' },
    kind: 'molmassi',
  },
  {
    id: 'mm-Na2CO3',
    left: { value: 105.99, unit: 'g', species: 'Na₂CO₃' },
    right: { value: 1, unit: 'mol', species: 'Na₂CO₃' },
    kind: 'molmassi',
  },
  {
    id: 'mm-CO2',
    left: { value: 44.01, unit: 'g', species: 'CO₂' },
    right: { value: 1, unit: 'mol', species: 'CO₂' },
    kind: 'molmassi',
  },
  {
    id: 'mm-CaCO3',
    left: { value: 100.09, unit: 'g', species: 'CaCO₃' },
    right: { value: 1, unit: 'mol', species: 'CaCO₃' },
    kind: 'molmassi',
  },
  {
    id: 'mm-Fe',
    left: { value: 55.85, unit: 'g', species: 'Fe' },
    right: { value: 1, unit: 'mol', species: 'Fe' },
    kind: 'molmassi',
  },
  {
    id: 'mm-Fe2O3',
    left: { value: 159.69, unit: 'g', species: 'Fe₂O₃' },
    right: { value: 1, unit: 'mol', species: 'Fe₂O₃' },
    kind: 'molmassi',
  },
  {
    id: 'mm-NaOH',
    left: { value: 40.0, unit: 'g', species: 'NaOH' },
    right: { value: 1, unit: 'mol', species: 'NaOH' },
    kind: 'molmassi',
  },
  {
    id: 'mm-HCl',
    left: { value: 36.46, unit: 'g', species: 'HCl' },
    right: { value: 1, unit: 'mol', species: 'HCl' },
    kind: 'molmassi',
  },
];

/** Avogadro's number, tagged per substance so it cannot bridge two species. */
export const avogadroRatios: Equivalence[] = [
  {
    id: 'avo-Mg',
    left: { value: 6.022e23, unit: 'atóm', species: 'Mg' },
    right: { value: 1, unit: 'mol', species: 'Mg' },
    kind: 'avogadro',
    source: 'Avogadro-tala',
  },
  {
    id: 'avo-NaCl',
    left: { value: 6.022e23, unit: 'formúlueiningar', species: 'NaCl' },
    right: { value: 1, unit: 'mol', species: 'NaCl' },
    kind: 'avogadro',
    source: 'Avogadro-tala',
  },
];

/**
 * Molarity.
 *
 * The volume is tagged with the *solution* — `L NaOH(aq)`, not a bare `L` — so
 * that reaching for the molarity of the wrong solution fails to cancel instead of
 * quietly producing a plausible wrong number.
 */
export const molarityRatios: Equivalence[] = [
  {
    id: 'molstyrkur-NaOH-0100',
    left: { value: 0.1, unit: 'mol', species: 'NaOH' },
    right: { value: 1, unit: 'L', species: 'NaOH(aq)' },
    kind: 'molstyrkur',
    source: '0,100 M NaOH',
  },
  {
    id: 'molstyrkur-HCl-0100',
    left: { value: 0.1, unit: 'mol', species: 'HCl' },
    right: { value: 1, unit: 'L', species: 'HCl(aq)' },
    kind: 'molstyrkur',
    source: '0,100 M HCl',
  },
];

/** Densities at room temperature. */
export const densityRatios: Equivalence[] = [
  {
    id: 'edlismassi-etanol',
    left: { value: 0.789, unit: 'g', species: 'C₂H₅OH' },
    right: { value: 1, unit: 'mL', species: 'C₂H₅OH' },
    kind: 'edlismassi',
    source: 'Eðlismassi etanóls',
  },
  {
    id: 'edlismassi-vatn',
    left: { value: 1.0, unit: 'g', species: 'H₂O' },
    right: { value: 1, unit: 'mL', species: 'H₂O' },
    kind: 'edlismassi',
    source: 'Eðlismassi vatns',
  },
];

/**
 * Mole ratios read straight off a balanced equation.
 *
 * Coefficients are kept exactly as they appear in the equation — 2 mol Mg to
 * 2 mol MgO, not reduced to 1:1 — because reading them off the equation is the
 * skill being practised.
 */
export const equationRatios: Equivalence[] = [
  {
    id: 'jafna-Mg-MgO',
    left: { value: 2, unit: 'mol', species: 'Mg' },
    right: { value: 2, unit: 'mol', species: 'MgO' },
    kind: 'jafna',
    source: '2 Mg + O₂ → 2 MgO',
  },
  {
    id: 'jafna-Mg-O2',
    left: { value: 2, unit: 'mol', species: 'Mg' },
    right: { value: 1, unit: 'mol', species: 'O₂' },
    kind: 'jafna',
    source: '2 Mg + O₂ → 2 MgO',
  },
  {
    id: 'jafna-NaHCO3-CO2',
    left: { value: 2, unit: 'mol', species: 'NaHCO₃' },
    right: { value: 1, unit: 'mol', species: 'CO₂' },
    kind: 'jafna',
    source: '2 NaHCO₃ → Na₂CO₃ + H₂O + CO₂',
  },
  {
    id: 'jafna-NaHCO3-Na2CO3',
    left: { value: 2, unit: 'mol', species: 'NaHCO₃' },
    right: { value: 1, unit: 'mol', species: 'Na₂CO₃' },
    kind: 'jafna',
    source: '2 NaHCO₃ → Na₂CO₃ + H₂O + CO₂',
  },
  {
    id: 'jafna-CaCO3-HCl',
    left: { value: 1, unit: 'mol', species: 'CaCO₃' },
    right: { value: 2, unit: 'mol', species: 'HCl' },
    kind: 'jafna',
    source: 'CaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂',
  },
  {
    id: 'jafna-CaCO3-CO2',
    left: { value: 1, unit: 'mol', species: 'CaCO₃' },
    right: { value: 1, unit: 'mol', species: 'CO₂' },
    kind: 'jafna',
    source: 'CaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂',
  },
  {
    id: 'jafna-etanol-CO2',
    left: { value: 1, unit: 'mol', species: 'C₂H₅OH' },
    right: { value: 2, unit: 'mol', species: 'CO₂' },
    kind: 'jafna',
    source: 'C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O',
  },
  {
    id: 'jafna-etanol-O2',
    left: { value: 1, unit: 'mol', species: 'C₂H₅OH' },
    right: { value: 3, unit: 'mol', species: 'O₂' },
    kind: 'jafna',
    source: 'C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O',
  },
  {
    id: 'jafna-Fe-Fe2O3',
    left: { value: 4, unit: 'mol', species: 'Fe' },
    right: { value: 2, unit: 'mol', species: 'Fe₂O₃' },
    kind: 'jafna',
    source: '4 Fe + 3 O₂ → 2 Fe₂O₃',
  },
  {
    id: 'jafna-Fe-O2',
    left: { value: 4, unit: 'mol', species: 'Fe' },
    right: { value: 3, unit: 'mol', species: 'O₂' },
    kind: 'jafna',
    source: '4 Fe + 3 O₂ → 2 Fe₂O₃',
  },
];

export const allRatios: Equivalence[] = [
  ...metricRatios,
  ...molarMassRatios,
  ...avogadroRatios,
  ...molarityRatios,
  ...densityRatios,
  ...equationRatios,
];

export const ratioById = (id: string): Equivalence => {
  const found = allRatios.find((r) => r.id === id);
  if (!found) throw new Error(`Óþekkt hlutfall: ${id}`);
  return found;
};

/** Human-readable label for each kind, used on the cards and in the legend. */
export const KIND_LABELS: Record<Equivalence['kind'], string> = {
  metric: 'Forskeyti',
  molmassi: 'Mólmassi',
  avogadro: 'Avogadro',
  molstyrkur: 'Mólstyrkur',
  edlismassi: 'Eðlismassi',
  jafna: 'Úr efnajöfnu',
};

/** Tailwind classes per kind. Colour carries the *source* of a ratio, not correctness. */
export const KIND_STYLES: Record<Equivalence['kind'], string> = {
  metric: 'border-slate-300 bg-slate-50 text-slate-800',
  molmassi: 'border-orange-300 bg-orange-50 text-orange-900',
  avogadro: 'border-purple-300 bg-purple-50 text-purple-900',
  molstyrkur: 'border-sky-300 bg-sky-50 text-sky-900',
  edlismassi: 'border-teal-300 bg-teal-50 text-teal-900',
  jafna: 'border-amber-300 bg-amber-50 text-amber-900',
};
