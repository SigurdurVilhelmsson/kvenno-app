/**
 * Types for pH Titration Master Game
 */

export type TitrationType =
  | 'strong-strong'
  | 'weak-strong'
  | 'strong-weak'
  | 'polyprotic-diprotic'
  | 'polyprotic-triprotic';

export type DifficultyLevel = 'Byrjandi' | 'Miðlungs' | 'Háþróað' | 'Sérfræðingur';

export type IndicatorType =
  | 'methyl-orange'
  | 'methyl-red'
  | 'bromothymol-blue'
  | 'phenolphthalein'
  | 'thymol-blue';

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

export interface PolyproticTitration {
  id: number;
  type: 'polyprotic-diprotic' | 'polyprotic-triprotic';
  name: string;
  analyte: ChemicalSpecies & { volume: number };
  titrant: ChemicalSpecies;
  equivalenceVolumes: number[];
  equivalencePHs: number[];
  initialPH: number;
  halfEquivalencePHs: number[];
  bestIndicator: IndicatorType;
  difficulty: DifficultyLevel;
  Ka1: number;
  Ka2: number;
  Ka3?: number;
  pKa1: number;
  pKa2: number;
  pKa3?: number;
}

export type Titration = MonoproticTitration | PolyproticTitration;

export interface Indicator {
  id: IndicatorType;
  name: string;
  pHRange: [number, number];
  colorAcidic: string;
  colorBasic: string;
  description: string;
}

export interface GameStats {
  score: number;
  titrationsCompleted: number;
  accuracy: number; // Average accuracy in mL
  correctIndicators: number;
  totalIndicators: number;
  totalTime: number; // in seconds
}

export interface TitrationResult {
  volumeUsed: number;
  selectedIndicator: IndicatorType | null;
  accuracy: number; // Difference from equivalence volume in mL
  indicatorCorrect: boolean;
  points: number;
  timeBonus: number;
  accuracyBonus: number;
  indicatorBonus: number;
}

export type GameMode = 'practice' | 'challenge';

export interface GameState {
  mode: GameMode;
  currentTitration: Titration | null;
  volumeAdded: number;
  currentPH: number;
  selectedIndicator: IndicatorType | null;
  isComplete: boolean;
  result: TitrationResult | null;
  stats: GameStats;
  phCurveData: Array<{ volume: number; pH: number }>;
}
