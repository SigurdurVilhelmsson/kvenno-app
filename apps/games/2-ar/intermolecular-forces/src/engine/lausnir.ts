/**
 * Samþynningareiginleikar: vapour-pressure lowering, boiling-point elevation, freezing-point
 * depression and osmotic pressure, from the book's ch. 11.4 (m68783). Each depends only on how
 * many solute particles there are, not on what they are.
 *
 * The constants are the book's table of Kb and Kf for five solvents, and R = 0,08206 L·atm/(mól·K)
 * as its osmotic-pressure example uses it.
 */

export const R_ATM = 0.08206;

export interface Solvent {
  name: string;
  boils: number;
  Kb: number;
  freezes: number;
  Kf: number;
}

/** The book's table, Suðumarkshækkunar- og frostmarkslækkunarfastar fyrir nokkra leysa. */
export const SOLVENTS = {
  vatn: { name: 'vatn', boils: 100.0, Kb: 0.512, freezes: 0.0, Kf: 1.86 },
  ísedik: { name: 'vetnisasetat (ísedik)', boils: 118.1, Kb: 3.07, freezes: 16.6, Kf: 3.9 },
  bensen: { name: 'bensen', boils: 80.1, Kb: 2.53, freezes: 5.5, Kf: 5.12 },
  klóróform: { name: 'klóróform', boils: 61.26, Kb: 3.63, freezes: -63.5, Kf: 4.68 },
  nítróbensen: { name: 'nítróbensen', boils: 210.9, Kb: 5.24, freezes: 5.67, Kf: 8.1 },
} as const satisfies Record<string, Solvent>;

export type SolventId = keyof typeof SOLVENTS;

/** Molality, mól of solute per kg of solvent. */
export const molality = (moles: number, solventGrams: number) => moles / (solventGrams / 1000);

/** Raoult's law for a nonvolatile solute: P = X(leysis) · P°. */
export const raoult = (solventMoles: number, soluteMoles: number, pure: number) =>
  (solventMoles / (solventMoles + soluteMoles)) * pure;

/** ΔTb = i·Kb·m. */
export const boilingRise = (s: SolventId, m: number, i = 1) => i * SOLVENTS[s].Kb * m;
/** ΔTf = i·Kf·m. */
export const freezingDrop = (s: SolventId, m: number, i = 1) => i * SOLVENTS[s].Kf * m;

export const boilingPoint = (s: SolventId, m: number, i = 1) =>
  SOLVENTS[s].boils + boilingRise(s, m, i);
export const freezingPoint = (s: SolventId, m: number, i = 1) =>
  SOLVENTS[s].freezes - freezingDrop(s, m, i);

/** Π = i·M·R·T, in atm, with T from °C. */
export const osmoticPressure = (M: number, celsius: number, i = 1) =>
  i * M * R_ATM * (celsius + 273.15);
