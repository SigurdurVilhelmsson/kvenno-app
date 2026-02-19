/**
 * Tiered Hint System Types
 *
 * 4-tier progressive hint system that guides students from
 * general reminders to full worked solutions.
 */

/**
 * The 4 tiers of hints, from least to most specific
 */
export interface TieredHints {
  /** Tier 1: Topic reminder - General concept area */
  topic: string;
  /** Tier 2: Strategy hint - Approach to solve */
  strategy: string;
  /** Tier 3: Formula/method - Specific technique */
  method: string;
  /** Tier 4: Worked example - Full solution */
  solution: string;
}

/**
 * Current state of hint usage for a question
 */
export interface HintState {
  /** Highest tier revealed (0 = none) */
  currentTier: 0 | 1 | 2 | 3 | 4;
  /** Score multiplier based on hints used */
  pointMultiplier: number;
  /** Array of tier numbers that have been revealed */
  revealedTiers: number[];
}

/**
 * Tier keys for iteration
 */
export type HintTierKey = keyof TieredHints;

/**
 * Score multipliers for each hint tier
 * - No hints: 100%
 * - Tier 1: 80%
 * - Tier 2: 60%
 * - Tier 3+: 40%
 */
export const HINT_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  1: 0.8,
  2: 0.6,
  3: 0.4,
  4: 0.4,
};

/**
 * Icelandic labels for each tier
 */
export const HINT_TIER_LABELS: Record<HintTierKey, string> = {
  topic: 'Efni',
  strategy: 'Aðferð',
  method: 'Formúla',
  solution: 'Lausn',
};

/**
 * Icons for each tier (progressive warmth)
 */
export const HINT_TIER_ICONS: Record<HintTierKey, string> = {
  topic: '📌',
  strategy: '🎯',
  method: '🔧',
  solution: '✅',
};

/**
 * Ordered array of tier keys for iteration
 */
export const HINT_TIER_ORDER: HintTierKey[] = ['topic', 'strategy', 'method', 'solution'];

/**
 * Get the multiplier for a given tier
 */
export function getHintMultiplier(tier: number): number {
  return HINT_MULTIPLIERS[tier] ?? HINT_MULTIPLIERS[4];
}

/**
 * Create initial hint state
 */
export function createInitialHintState(): HintState {
  return {
    currentTier: 0,
    pointMultiplier: 1.0,
    revealedTiers: [],
  };
}
