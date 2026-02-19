/**
 * Types for Equilibrium Shifter Game
 * Based on Le Chatelier's Principle
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type GameMode = 'learning' | 'challenge';

export type ShiftDirection = 'left' | 'right' | 'none';

export type StressType =
  | 'add-reactant'
  | 'add-product'
  | 'remove-reactant'
  | 'remove-product'
  | 'increase-temp'
  | 'decrease-temp'
  | 'increase-pressure'
  | 'decrease-pressure'
  | 'add-catalyst';

export type Phase = 'g' | 'l' | 's' | 'aq';

export interface Molecule {
  formula: string;
  coefficient: number;
  phase: Phase;
  display: string; // Emoji representation
}

export interface Thermodynamics {
  deltaH: number; // kJ/mol (positive = endothermic, negative = exothermic)
  type: 'endothermic' | 'exothermic';
}

export interface GasMoles {
  reactants: number;
  products: number;
}

export interface Stress {
  type: StressType;
  target: string | null; // Molecule formula (null for temperature, pressure, catalyst)
}

export interface Equilibrium {
  id: number;
  equation: string;
  name: string;
  nameIs: string; // Icelandic name
  difficulty: DifficultyLevel;

  reactants: Molecule[];
  products: Molecule[];

  thermodynamics: Thermodynamics;
  gasMoles: GasMoles;

  description: string; // English description
  descriptionIs: string; // Icelandic description

  possibleStresses: Stress[];
}

export interface ShiftResult {
  direction: ShiftDirection;
  explanation: string; // English explanation
  explanationIs: string; // Icelandic explanation
  reasoning: string[]; // Step-by-step reasoning
  molecularView: string; // Description of molecular changes
}

export interface GameStats {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
  bestStreak: number;
  hintsUsed: number;
  totalTime: number; // in seconds
  correctByDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface GameState {
  mode: GameMode;
  screen: 'menu' | 'mode-select' | 'game' | 'feedback' | 'results';
  currentEquilibrium: Equilibrium | null;
  equilibriumIndex: number;
  appliedStress: Stress | null;
  userPrediction: ShiftDirection | null;
  correctShift: ShiftResult | null;
  showHint: boolean;
  showExplanation: boolean;
  stats: GameStats;
  timeRemaining: number | null; // For challenge mode (seconds)
  questionNumber: number; // Current question in challenge mode (1-10)
  totalQuestions: number; // Total questions in challenge mode (10)
}

export interface QuestionFeedback {
  isCorrect: boolean;
  userPrediction: ShiftDirection;
  correctShift: ShiftResult;
  pointsEarned: number;
  streakBonus: number;
  timeBonus: number;
  totalPoints: number;
}

// Translation keys
export interface I18nKeys {
  // Game modes
  learningMode: string;
  challengeMode: string;

  // Game elements
  equilibrium: string;
  stress: string;
  predict: string;

  // Shift directions
  shiftLeft: string;
  shiftRight: string;
  noShift: string;

  // Stresses
  addReactant: string;
  addProduct: string;
  removeReactant: string;
  removeProduct: string;
  heat: string;
  cool: string;
  increasePressure: string;
  decreasePressure: string;
  addCatalyst: string;

  // Feedback
  correct: string;
  incorrect: string;
  explanation: string;

  // Thermodynamics
  exothermic: string;
  endothermic: string;
}
