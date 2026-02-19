/**
 * Types for Gas Law Challenge Game
 * Based on Ideal Gas Law: PV = nRT
 */

export type Variable = 'P' | 'V' | 'T' | 'n';

export type DifficultyLevel = 'Auðvelt' | 'Miðlungs' | 'Erfitt';

/**
 * Gas laws available in the game
 * - ideal: PV = nRT (all four variables)
 * - boyles: P₁V₁ = P₂V₂ (constant T, n)
 * - charles: V₁/T₁ = V₂/T₂ (constant P, n)
 * - gay-lussac: P₁/T₁ = P₂/T₂ (constant V, n)
 * - combined: P₁V₁/T₁ = P₂V₂/T₂ (constant n)
 * - avogadro: V₁/n₁ = V₂/n₂ (constant P, T)
 */
export type GasLaw = 'ideal' | 'boyles' | 'charles' | 'gay-lussac' | 'combined' | 'avogadro';

export interface GasLawInfo {
  id: GasLaw;
  nameIs: string;
  nameEn: string;
  formula: string;
  description: string;
  constants: string;
}

export const GAS_LAW_INFO: Record<GasLaw, GasLawInfo> = {
  ideal: {
    id: 'ideal',
    nameIs: 'Tilvalin lofttegundalögmál',
    nameEn: 'Ideal Gas Law',
    formula: 'PV = nRT',
    description: 'Tengir þrýsting, rúmmál, mól og hitastig',
    constants: 'R = 0.08206 L·atm/(mol·K)'
  },
  boyles: {
    id: 'boyles',
    nameIs: 'Lögmál Boyles',
    nameEn: "Boyle's Law",
    formula: 'P₁V₁ = P₂V₂',
    description: 'Þrýstingur og rúmmál eru í andhverfu hlutfalli',
    constants: 'T og n eru fastar'
  },
  charles: {
    id: 'charles',
    nameIs: 'Lögmál Charles',
    nameEn: "Charles's Law",
    formula: 'V₁/T₁ = V₂/T₂',
    description: 'Rúmmál og hitastig eru í beinu hlutfalli',
    constants: 'P og n eru fastar'
  },
  'gay-lussac': {
    id: 'gay-lussac',
    nameIs: 'Lögmál Gay-Lussac',
    nameEn: "Gay-Lussac's Law",
    formula: 'P₁/T₁ = P₂/T₂',
    description: 'Þrýstingur og hitastig eru í beinu hlutfalli',
    constants: 'V og n eru fastar'
  },
  combined: {
    id: 'combined',
    nameIs: 'Sameinuð gaslögmál',
    nameEn: 'Combined Gas Law',
    formula: 'P₁V₁/T₁ = P₂V₂/T₂',
    description: 'Sameinar Boyles, Charles og Gay-Lussac',
    constants: 'n er fast'
  },
  avogadro: {
    id: 'avogadro',
    nameIs: 'Lögmál Avogadros',
    nameEn: "Avogadro's Law",
    formula: 'V₁/n₁ = V₂/n₂',
    description: 'Rúmmál og mólfjöldi eru í beinu hlutfalli',
    constants: 'P og T eru fastar'
  }
};

export type GameMode = 'practice' | 'challenge';

export interface GasValue {
  value: number;
  unit: string;
}

export interface GasLawQuestion {
  id: number;
  scenario_is: string; // Icelandic scenario
  scenario_en: string; // English scenario
  emoji: string;
  difficulty: DifficultyLevel;
  gasLaw: GasLaw; // Which gas law applies to this question
  given: {
    P?: GasValue; // Pressure (atm)
    V?: GasValue; // Volume (L)
    T?: GasValue; // Temperature (K)
    n?: GasValue; // Moles (mol)
  };
  find: Variable; // Which variable to solve for
  answer: number; // Correct answer
  tolerance: number; // ±tolerance for correct answer
  hints: string[]; // Progressive hints
  solution: {
    formula: string;
    substitution: string;
    calculation: string;
    steps: string[];
  };
}

export interface GameStats {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
  bestStreak: number;
  hintsUsed: number;
  totalTime: number; // in seconds
}

export interface GameState {
  mode: GameMode;
  currentQuestion: GasLawQuestion | null;
  questionIndex: number;
  userAnswer: string;
  showHint: number; // Current hint level (0-4)
  showSolution: boolean;
  feedback: QuestionFeedback | null;
  stats: GameStats;
  timeRemaining: number | null; // For challenge mode
}

export interface QuestionFeedback {
  isCorrect: boolean;
  message: string;
  points: number;
  userAnswer: number;
  correctAnswer: number;
  difference: number;
  explanation: string;
}

// Gas constant
export const R = 0.08206; // L·atm/(mol·K)
