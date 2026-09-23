import { parseStudentNumber } from '@shared/utils';

/** How far, in degrees, a written angle may sit from the stored one. */
export const ANGLE_TOLERANCE = 2;

/**
 * Every angle written in a student's answer, in the order written.
 *
 * A comma followed by one or two digits is the Icelandic decimal comma, so
 * `109,5` is one angle. Any other comma separates angles, as do spaces and
 * words: `90, 120`, `90,120`, `90 120` and `90° og 120°` all read as 90 and
 * 120. The old reading took `109,5` as the two angles 109 and 5, and glued
 * `90 120` into the single number 90120.
 */
export function parseAngles(text: string): number[] {
  const matches = text.match(/\d+(?:[.,]\d{1,2}(?!\d))?/g) ?? [];
  return matches.map(parseStudentNumber).filter((n) => Number.isFinite(n));
}

/**
 * Grade a written bond angle against the stored one (`'109,5°'`, `'90° og 120°'`).
 *
 * The rule is unchanged from the level's own: a single stored angle is matched
 * by any written angle within ANGLE_TOLERANCE, several stored angles must each
 * be matched, and a bent molecule also accepts 103–106°. Only the reading of
 * the numbers is new.
 */
export function gradeBondAngle(answer: string, correct: string, geometryId: string): boolean {
  const correctNums = parseAngles(correct);
  const answerNums = parseAngles(answer);
  let isCorrect: boolean;

  if (correctNums.length === 1 && answerNums.length >= 1) {
    isCorrect = answerNums.some((a) => Math.abs(a - correctNums[0]) <= ANGLE_TOLERANCE);
  } else if (correctNums.length >= 2 && answerNums.length >= 2) {
    isCorrect = correctNums.every((c) =>
      answerNums.some((a) => Math.abs(a - c) <= ANGLE_TOLERANCE)
    );
  } else {
    // Fallback to string matching
    const normalizedAnswer = answer.replace(/\s/g, '').toLowerCase();
    const normalizedCorrect = correct.replace(/\s/g, '').toLowerCase();
    isCorrect =
      normalizedAnswer === normalizedCorrect ||
      normalizedAnswer.includes(normalizedCorrect.replace('°', ''));
  }

  // Special case: bent geometry accepts ~104-105°
  if (!isCorrect && geometryId === 'bent') {
    isCorrect = answerNums.some((a) => a >= 103 && a <= 106);
  }

  return isCorrect;
}
