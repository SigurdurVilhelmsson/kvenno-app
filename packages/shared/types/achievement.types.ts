/**
 * Achievement system type definitions for Kvennaskólinn Chemistry Games
 */

/**
 * Categories of achievements
 */
export type AchievementCategory =
  | 'performance'    // Score-based achievements
  | 'streak'         // Consecutive correct answers
  | 'speed'          // Time-based achievements
  | 'mastery'        // Level/game completion
  | 'dedication'     // Playing regularly
  | 'special';       // Unique achievements

/**
 * Rarity levels for achievements
 */
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Criteria types for unlocking achievements
 */
export interface AchievementCriteria {
  type:
    | 'perfect_score'        // 100% on a level
    | 'streak'               // N correct answers in a row
    | 'speed'                // Complete in under X seconds
    | 'first_try'            // Correct on first attempt
    | 'level_complete'       // Complete a specific level
    | 'game_complete'        // Complete all levels
    | 'total_problems'       // Solve N total problems
    | 'total_games'          // Play N total games
    | 'no_hints'             // Complete without using hints
    | 'daily_play'           // Play on N different days
    | 'high_score';          // Achieve score >= N

  /** Target value for the criteria */
  target: number;

  /** Optional: specific level this applies to */
  level?: 1 | 2 | 3;

  /** Optional: specific game this applies to */
  gameId?: string;
}

/**
 * Definition of an achievement
 */
export interface Achievement {
  /** Unique identifier */
  id: string;

  /** Display name in Icelandic */
  name: string;

  /** Description of how to earn it */
  description: string;

  /** Icon/emoji to display */
  icon: string;

  /** Category for grouping */
  category: AchievementCategory;

  /** Rarity determines visual styling */
  rarity: AchievementRarity;

  /** Criteria to unlock */
  criteria: AchievementCriteria;

  /** Points awarded for unlocking */
  points: number;

  /** Whether this achievement is hidden until unlocked */
  secret?: boolean;
}

/**
 * Progress tracking for an achievement
 */
export interface AchievementProgress {
  /** Achievement ID */
  achievementId: string;

  /** Current progress value (e.g., 5/10 streak) */
  currentValue: number;

  /** Target value to unlock */
  targetValue: number;

  /** Whether the achievement is unlocked */
  unlocked: boolean;

  /** Timestamp when unlocked */
  unlockedAt?: string;
}

/**
 * Player's complete achievement state
 */
export interface PlayerAchievements {
  /** List of unlocked achievement IDs */
  unlocked: string[];

  /** Progress tracking for in-progress achievements */
  progress: Record<string, AchievementProgress>;

  /** Total achievement points earned */
  totalPoints: number;

  /** Current streak count (consecutive correct answers) */
  currentStreak: number;

  /** Best streak ever achieved */
  bestStreak: number;

  /** Days played (for daily_play achievements) */
  daysPlayed: string[];

  /** Total problems solved across all games */
  totalProblemsSolved: number;

  /** Total games completed */
  totalGamesCompleted: number;

  /** Last updated timestamp */
  lastUpdated: string;
}

/**
 * Event data for achievement checks
 */
export interface AchievementEvent {
  type:
    | 'answer_correct'
    | 'answer_incorrect'
    | 'level_complete'
    | 'game_complete'
    | 'hint_used'
    | 'game_start';

  /** Current game ID */
  gameId: string;

  /** Current level (1, 2, or 3) */
  level?: 1 | 2 | 3;

  /** Score achieved (if applicable) */
  score?: number;

  /** Max possible score (if applicable) */
  maxScore?: number;

  /** Time taken in seconds (if applicable) */
  timeTaken?: number;

  /** Whether hints were used */
  hintsUsed?: number;

  /** Whether it was the first attempt */
  firstAttempt?: boolean;
}

/**
 * Notification for newly unlocked achievement
 */
export interface AchievementNotification {
  achievement: Achievement;
  unlockedAt: string;
  isNew: boolean;
}

/**
 * Colors associated with achievement rarity
 */
export const RARITY_COLORS: Record<AchievementRarity, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  uncommon: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
  rare: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  epic: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
  legendary: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' },
};

/**
 * Rarity labels in Icelandic
 */
export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: 'Almennur',
  uncommon: 'Óvenjulegur',
  rare: 'Sjaldgæfur',
  epic: 'Epískur',
  legendary: 'Goðsagnakenndur',
};
