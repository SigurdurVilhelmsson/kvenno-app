export interface Progress {
  level1Completed: boolean;
  level1Score: number;
  level2Completed: boolean;
  level2Score: number;
  level3Completed: boolean;
  level3Score: number;
  totalGamesPlayed: number;
}

export const allLevelsDone = (p: Progress) =>
  p.level1Completed && p.level2Completed && p.level3Completed;

/**
 * Where a student goes after finishing a level. The summary screen opens with
 * "Þú hefur lokið öllum stigum!", so it may only open when that is true: levels
 * are not gated (2026-08-29), and a student who started with Stig 3 was told
 * they had finished everything beside two scores of 0. It still follows Stig 3
 * whenever all three are done, as it always has, and now also follows whichever
 * level completes the set.
 */
export function screenAfterLevel(
  level: 1 | 2 | 3,
  before: Progress,
  after: Progress
): 'menu' | 'complete' {
  if (!allLevelsDone(after)) return 'menu';
  return level === 3 || !allLevelsDone(before) ? 'complete' : 'menu';
}
