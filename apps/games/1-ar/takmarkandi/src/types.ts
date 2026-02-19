export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Product {
  formula: string;
  coeff: number;
  color: string;
}

export interface Reaction {
  id: string;
  equation: string;
  reactant1: {
    formula: string;
    coeff: number;
    color: string;
  };
  reactant2: {
    formula: string;
    coeff: number;
    color: string;
  };
  products: Product[];
  difficulty: Difficulty;
}

export interface GameState {
  currentReaction: Reaction | null;
  reactant1Count: number;
  reactant2Count: number;
  userAnswer: {
    limitingReactant: string;
    productsFormed: Record<string, string>;
    excessRemaining: string;
  };
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  questionsAnswered: number;
  showHint: boolean;
  difficulty: Difficulty;
  incorrectAttempts: number;
  showingSolution: boolean;
  animatingReaction: boolean;
  animationStep: number;
}

export interface Progress {
  totalGames: number;
  totalCorrect: number;
  bestStreak: number;
  reactionsMastered: string[];
  accuracyByDifficulty: {
    easy: number[];
    medium: number[];
    hard: number[];
  };
  commonMistakes: {
    limitingReactant: number;
    products: number;
    excess: number;
  };
  timeSpentMinutes: number;
}

export interface CorrectAnswer {
  limitingReactant: string;
  productsFormed: Record<string, number>;
  excessReactant: string;
  excessRemaining: number;
  timesReactionRuns: number;
  timesFromR1: number;
  timesFromR2: number;
  r1Used: number;
  r2Used: number;
}
