// Buffer Recipe Creator Types

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface BufferProblem {
  id: number;
  difficulty: Difficulty;
  system: string;
  acidName: string;
  baseName: string;
  pKa: number;
  targetPH: number;
  volume: number;
  totalConcentration: number;
  acidMolarMass: number;
  baseMolarMass: number;
  context: string;
  correctAcidMass: number;
  correctBaseMass: number;
  correctAcidMoles: number;
  correctBaseMoles: number;
  ratio: number;
  stockSolution?: boolean;
  acidVolume?: number;
  baseVolume?: number;
  phAdjustment?: boolean;
  rangeQuestion?: boolean;
  effectiveRange?: string;
  temperature?: number;
}

export interface HendersonHasselbalchResult {
  ratio: number;
  acidConc: number;
  baseConc: number;
  acidMoles: number;
  baseMoles: number;
  acidMass: number;
  baseMass: number;
}

export interface Feedback {
  correct: boolean;
  message: string;
}
