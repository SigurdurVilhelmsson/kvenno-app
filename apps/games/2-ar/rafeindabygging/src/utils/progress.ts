/**
 * What the game remembers: which levels are done, and the best count of right
 * answers in each. There is no score — points were dropped from every level
 * (mobile-pass decision 1 (b)).
 *
 * Progress saved before that change carries `levelNScore` and no
 * `levelNCorrect`; those levels show as done with no count, rather than
 * reading old points as a number of right answers.
 */
export interface Progress {
  level1Completed: boolean;
  level1Correct?: number;
  level1Total?: number;
  level2Completed: boolean;
  level2Correct?: number;
  level2Total?: number;
  level3Completed: boolean;
  level3Correct?: number;
  level3Total?: number;
}

/** "6 af 8 rétt", or "Lokið" for a level finished before counts were kept. */
export function resultLabel(progress: Progress, level: 1 | 2 | 3): string {
  const correct = progress[`level${level}Correct`];
  const total = progress[`level${level}Total`];
  return correct === undefined || total === undefined ? 'Lokið' : `${correct} af ${total} rétt`;
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
