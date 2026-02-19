/**
 * Core game type definitions shared across all Kvennaskólinn Chemistry Games
 */

export type GameLevel = 0 | 1 | 2 | 3;

export type ScaffoldingLevel = 0 | 1 | 2 | 3;

export interface BaseProgress {
  currentLevel: GameLevel;
  problemsCompleted: number;
  lastPlayedDate: string;
  totalTimeSpent: number; // in seconds
}

export interface LevelProgress {
  level1?: Level1Progress;
  level2?: Level2Progress;
  level3?: Level3Progress;
}

export interface Level1Progress {
  questionsAnswered: number;
  questionsCorrect: number;
  explanationsProvided: number;
  explanationScores: number[];
  mastered: boolean;
}

export interface Level2Progress {
  problemsCompleted: number;
  predictionsMade: number;
  predictionsCorrect: number;
  finalAnswersCorrect: number;
  mastered: boolean;
}

export interface Level3Progress {
  problemsCompleted: number;
  compositeScores: number[];
  achievements: string[];
  mastered: boolean;
  hintsUsed: number;
}

export interface GameProgress extends BaseProgress {
  levelProgress: LevelProgress;
}

export interface ExportData {
  exportTimestamp: string;
  gameName: string;
  gameVersion: string;
  studentProgress: GameProgress;
  summary: Record<string, any>;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  textSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  keyboardShortcutsEnabled: boolean;
}

export interface GameSettings {
  language: string;
  soundEnabled: boolean;
  accessibility: AccessibilitySettings;
}

export type QuestionType =
  | 'equivalence'
  | 'cancellation_prediction'
  | 'multi_step'
  | 'reverse'
  | 'synthesis'
  | 'derivation';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface FeedbackMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

export interface HintConfig {
  enabled: boolean;
  cost?: number; // percentage penalty
  maxHints?: number;
  requiresFailedAttempt?: boolean;
}

export interface ScoringConfig {
  answerWeight: number;
  methodWeight: number;
  explanationWeight: number;
  efficiencyWeight: number;
  passingThreshold: number;
}
