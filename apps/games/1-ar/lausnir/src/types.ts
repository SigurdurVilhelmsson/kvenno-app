export interface Chemical {
  name: string;
  formula?: string;
  molarMass: number;
  displayName: string;
  /**
   * Highest molarity an aqueous solution of this substance can actually reach at
   * room temperature. Generators clamp to it: without a ceiling the game asked
   * students to compute the concentration of solutions that cannot exist, up to
   * 54 M HCl against a real limit of 12 M.
   *
   * For substances that are miscible with water rather than merely soluble
   * (ethanol, acetic acid, hydrogen peroxide) this is the molarity of the pure
   * liquid; for the concentrated mineral acids it is the ordinary reagent
   * strength, not a hypothetical.
   */
  maxMolarity: number;
}

export type ProblemType =
  'dilution' | 'molarity' | 'molarityFromMass' | 'massFromMolarity' | 'mixing';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'competition' | 'practice';

export interface Problem {
  id: string;
  type: ProblemType;
  chemical?: Chemical;
  description: string;
  given: Record<string, number>;
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
  workspaceValues: Record<string, string | number>;
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
