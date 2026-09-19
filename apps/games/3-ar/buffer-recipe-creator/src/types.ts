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
  contextEn?: string;
  contextPl?: string;
  // No correctAcidMass / correctBaseMass / correctAcidMoles / correctBaseMoles /
  // ratio here on purpose. They were stored until Sep 2026 and 13 of 29 problems
  // had at least one that disagreed with the others; derive them with
  // `solveBuffer` from `engine/buffer.ts` instead.
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
