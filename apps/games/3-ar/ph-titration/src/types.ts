/**
 * Types for pH Titration Master Game
 */

export type TitrationType = 'strong-strong' | 'weak-strong' | 'strong-weak';

export type DifficultyLevel = 'Byrjandi' | 'Miðlungs' | 'Háþróað' | 'Sérfræðingur';

export type IndicatorType =
  'methyl-orange' | 'methyl-red' | 'bromothymol-blue' | 'phenolphthalein' | 'thymol-blue';

export interface ChemicalSpecies {
  formula: string;
  name: string;
  volume?: number; // For analyte only
  molarity: number;
}

export interface MonoproticTitration {
  id: number;
  type: 'strong-strong' | 'weak-strong' | 'strong-weak';
  name: string;
  analyte: ChemicalSpecies & { volume: number };
  titrant: ChemicalSpecies;
  equivalenceVolume: number;
  equivalencePH: number;
  initialPH: number;
  halfEquivalencePH?: number; // For weak acid/base titrations
  bestIndicator: IndicatorType;
  difficulty: DifficultyLevel;
  Ka?: number | null;
  Kb?: number | null;
  pKa?: number | null;
  pKb?: number | null;
}

/**
 * Every titration is monoprotic. The polyprotic type, its data and its pH
 * maths were deleted on 2026-10-23 (mobile-pass decision 115 (a)): nothing
 * rendered them, and the maths fell to −∞ or NaN on some branches.
 */
export type Titration = MonoproticTitration;

export interface Indicator {
  id: IndicatorType;
  name: string;
  pHRange: [number, number];
  colorAcidic: string;
  colorBasic: string;
  description: string;
}
