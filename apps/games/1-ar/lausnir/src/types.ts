export interface Chemical {
  name: string;
  formula?: string;
  molarMass: number;
  displayName: string;
}

export type ProblemType =
  | 'dilution'
  | 'molarity'
  | 'molarityFromMass'
  | 'massFromMolarity'
  | 'mixing';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'competition' | 'practice';

export interface Problem {
  id: string;
  type: ProblemType;
  chemical?: Chemical;
  description: string;
  given: Record<string, any>;
  question: string;
  answer: number;
  unit: string;
  difficulty: Difficulty;
  hints: string[];
}

export interface GameState {
  currentProblem: Problem | null;
  userAnswer: string;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  isPlaying: boolean;
  gameOver: boolean;
  difficulty: Difficulty;
  showFeedback: boolean;
  lastAnswerCorrect: boolean | null;
  showHint: boolean;
  hintLevel: number;
  problemsCompleted: number;
  totalProblems: number;
  streak: number;
  bestStreak: number;
  incorrectAttempts: number;
  showSolution: boolean;
  gameMode: GameMode;
  showFormulaCard: boolean;
  showWorkspace: boolean;
  workspaceValues: Record<string, any>;
  timerMode: boolean;
  timeRemaining: number;
  soundEnabled: boolean;
  showBeakers: boolean;
  inputError: string | null;
  achievementShown: string | null;
}

export interface CalculationStep {
  type: 'section' | 'step';
  label?: string;
  content?: string;
}
