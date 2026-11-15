import { ATOMIC_MASSES } from './elements';
import { deriveEmpirical, formatFormula, type Derivation } from '../engine/empirical';

/**
 * Brunaefnagreining (combustion analysis), book ch04/m68716 — Siggi's Phase 4
 * ruling (2026-11-15) puts it here, in Beita. All the carbon in the burned
 * sample leaves as koldíoxíð and all the hydrogen as water, so their masses
 * give the masses of C and H, and the rest is the empirical table the game
 * already teaches. The book's three hydrocarbon problems; everything after the
 * measured masses is derived.
 */

export interface CombustionProblem {
  id: string;
  name: string;
  context: string;
  /** Sample and product masses as the book gives them, in `unit`. */
  unit: 'g' | 'mg';
  sample: number;
  co2: number;
  /** Absent where the book gives only CO₂: hydrogen is then the mass left over. */
  h2o?: number;
  /** A measured molar mass, where the book asks for the molecular formula too. */
  molarMass?: number;
}

export const COMBUSTION_PROBLEMS: CombustionProblem[] = [
  {
    id: 'polyetylen',
    name: 'Pólýetýlen',
    context: 'Fjölliða úr kolefni og vetni, notuð í matarpoka og sveigjanlegt plast.',
    unit: 'g',
    sample: 0.00126,
    co2: 0.00394,
    h2o: 0.00161,
  },
  {
    id: 'polystyren',
    name: 'Pólýstýren',
    context: 'Önnur fjölliða úr kolefni og vetni.',
    unit: 'g',
    sample: 0.00215,
    co2: 0.00726,
    h2o: 0.00148,
  },
  {
    id: 'naftalen',
    name: 'Naftalen',
    context: 'Aðalefnið í mölkúlum; inniheldur aðeins kolefni og vetni.',
    unit: 'mg',
    sample: 3.0,
    co2: 10.3,
    molarMass: 128.17,
  },
];

const M_C = ATOMIC_MASSES.C!;
const M_H = ATOMIC_MASSES.H!;
const M_O = ATOMIC_MASSES.O!;
export const M_CO2 = M_C + 2 * M_O;
export const M_H2O = 2 * M_H + M_O;

export interface CombustionSolution {
  massC: number;
  massH: number;
  /** True where H is the sample's mass less the carbon's. */
  hByDifference: boolean;
  derivation: Derivation;
  empirical: { C: number; H: number };
  /** n and the molecular formula, where a molar mass is given. */
  n?: number;
  molecular?: { C: number; H: number };
}

export function solveCombustion(p: CombustionProblem): CombustionSolution {
  const massC = (p.co2 * M_C) / M_CO2;
  const hByDifference = p.h2o === undefined;
  const massH = hByDifference ? p.sample - massC : (p.h2o! * 2 * M_H) / M_H2O;
  const derivation = deriveEmpirical({ C: massC, H: massH }, { grams: true });
  const sub = (el: 'C' | 'H') => derivation.rows.find((r) => r.element === el)!.subscript;
  const empirical = { C: sub('C'), H: sub('H') };
  if (p.molarMass === undefined) return { massC, massH, hByDifference, derivation, empirical };
  const n = Math.round(p.molarMass / (empirical.C * M_C + empirical.H * M_H));
  return {
    massC,
    massH,
    hByDifference,
    derivation,
    empirical,
    n,
    molecular: { C: empirical.C * n, H: empirical.H * n },
  };
}

export const formulaText = (f: { C: number; H: number }): string =>
  formatFormula([
    { element: 'C', subscript: f.C },
    { element: 'H', subscript: f.H },
  ]);
