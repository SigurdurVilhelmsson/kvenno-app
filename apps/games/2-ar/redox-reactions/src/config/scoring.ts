/** Level 1: Oxidation Numbers — attempt-based scoring */
export const L1_SCORING = {
  FIRST_TRY: 10,
  SECOND_TRY: 5,
  THIRD_PLUS_TRY: 2,
  MAX_PER_PROBLEM: 10,
} as const;

/** Level 2: Redox Analysis — flat per-question scoring */
export const L2_SCORING = {
  POINTS_PER_QUESTION: 10,
} as const;

/** Level 3: Balancing Half-Reactions — task-based scoring */
export const L3_SCORING = {
  IDENTIFY: 15,
  BALANCE: 20,
  OXIDATION_HALF: 10,
  REDUCTION_HALF: 10,
  /** Total per problem (15 + 20 + 10 + 10) */
  MAX_PER_PROBLEM: 55,
} as const;
