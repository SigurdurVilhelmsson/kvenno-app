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
 * Every ideal bond angle a shape has, in degrees: the angles a student may write for it.
 *
 * The stored answer names the angles Stig 2 asks for; a shape can have more. A trigonal
 * bipyramid also has 180° between its axial atoms, an octahedron and a square plane have 180°
 * across the centre, and a T-shape and a see-saw keep the bipyramid's 180° axis. Writing one
 * of those is not wrong. Writing an angle the shape does not have is (decisions item 70):
 * `90 104,5 107 109,5 120 180` used to be marked right for every molecule, because the grader
 * only asked whether the stored angles were somewhere in the answer.
 *
 * These are the ideal VSEPR angles, which is what the level teaches. Lone pairs squeeze the
 * real ones (SF₄, ClF₃), and the stored answer for H₂O and NH₃ is already the measured angle.
 */
export const SHAPE_ANGLES: Record<string, readonly number[]> = {
  linear: [180],
  bent: [104.5],
  'trigonal-planar': [120],
  'trigonal-pyramidal': [107],
  tetrahedral: [109.5],
  'trigonal-bipyramidal': [90, 120, 180],
  seesaw: [90, 120, 180],
  't-shaped': [90, 180],
  octahedral: [90, 180],
  'square-planar': [90, 180],
};

/**
 * Grade a written bond angle against the stored one (`'109,5°'`, `'90° og 120°'`).
 *
 * Every stored angle must be matched by a written one within ANGLE_TOLERANCE, and every
 * written angle must be one the shape has (`SHAPE_ANGLES`), so a list of every common angle
 * no longer passes. A bent molecule also accepts 103–106°.
 */
export function gradeBondAngle(answer: string, correct: string, geometryId: string): boolean {
  const correctNums = parseAngles(correct);
  const answerNums = parseAngles(answer);
  if (correctNums.length === 0 || answerNums.length === 0) return false;

  const shapeAngles = SHAPE_ANGLES[geometryId] ?? correctNums;
  const near = (a: number, target: number) => Math.abs(a - target) <= ANGLE_TOLERANCE;
  const bentRange = (a: number) => geometryId === 'bent' && a >= 103 && a <= 106;

  const allWritten = answerNums.every((a) => bentRange(a) || shapeAngles.some((t) => near(a, t)));
  const allStored = correctNums.every((c) => answerNums.some((a) => near(a, c) || bentRange(a)));
  return allWritten && allStored;
}
