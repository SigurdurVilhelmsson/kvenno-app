/**
 * Scientific notation, printed for a student and graded back from one.
 *
 * **Shared because two games need exactly this and must not disagree.**
 * `3-ar/leysnijafnvaegi` wrote it first for Ksp; `3-ar/jafnvaegisfasti` needs
 * the same thing for Kc, and a second copy is how the platform ends up with
 * two graders that round differently. The scientific-notation defect this
 * whole family of code exists to prevent — `molmassi` printing `× 10²³` at
 * students while neither level could parse a superscript back — was itself a
 * printing half and a reading half that had never been checked against each
 * other.
 */

import { normaliseMinus } from './numbers';

const SUPERSCRIPTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/**
 * How a constant is written for a student: `1,8 × 10⁻¹⁰`, Icelandic decimal comma.
 *
 * The platform's standing rule, from the `molmassi` superscript defect: if a
 * number is *printed* in scientific notation it has to be *readable back* in
 * it. This is the printing half; `parseStudentNumber` in `@shared/utils` is the
 * reading half.
 */
export function formatScientific(value: number, figures = 2): string {
  if (value === 0) return '0';
  let exponent = Math.floor(Math.log10(Math.abs(value)));
  let mantissa = value / Math.pow(10, exponent);
  // Rounding can carry the mantissa up to 10: 9,96 × 10⁻⁵ to two figures is
  // 10,0 × 10⁻⁵, which is not scientific notation and claims a third figure.
  // It belongs in the next power, as 1,0 × 10⁻⁴. `2-ar/kinetics` met exactly
  // this in its catalyst demo and rounded before calling here to avoid it.
  if (Math.abs(Number(mantissa.toFixed(figures - 1))) >= 10) {
    exponent += 1;
    mantissa = value / Math.pow(10, exponent);
  }
  // toFixed rather than String(Number(...)): a trailing zero is a significant
  // figure, so 1,0 × 10⁻⁸ and 1 × 10⁻⁸ are different claims about precision.
  // This is the same rule `1-ar/dimensional-analysis`'s Stig 0 teaches.
  const text = mantissa.toFixed(figures - 1).replace('.', ',');
  return `${text} × 10${exponentGlyphs(exponent)}`;
}

const MINUS = '⁻';
function exponentGlyphs(n: number): string {
  const digits = Math.abs(n)
    .toString()
    .split('')
    .map((d) => SUPERSCRIPTS[Number(d)])
    .join('');
  return n < 0 ? MINUS + digits : digits;
}

/** A student's answer in scientific notation, as two fields. */
export interface ScientificEntry {
  /** What they typed for the mantissa, Icelandic comma allowed. */
  mantissa: string;
  /** What they typed for the power of ten, e.g. `-5`. */
  exponent: string;
}

export type GradeOutcome = 'rett' | 'veldisvisir' | 'tolustafir' | 'baedi' | 'ogilt';

/**
 * The mantissa field takes a written number and nothing else: digits, at most
 * one decimal comma or point, and a sign. No `×`, no `e`, no superscript — the
 * power of ten has a field of its own.
 */
const PLAIN_MANTISSA = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/;

/** The exponent field takes a whole number, signed or not. */
const INTEGER_EXPONENT = /^[+-]?\d+$/;

/**
 * Read both fields, or `null` if either holds something other than what it
 * asks for.
 *
 * **Strict, because `parseFloat` and `parseInt` are not.** Both read the
 * longest prefix they can and ignore the rest, so the old reader half-read
 * whatever did not fit: `8,3 × 10²` in the mantissa field read as `8,3`, and
 * with `-17` beside it graded `rett` against 8,3 × 10⁻¹⁷, though the student
 * had written a hundred times that. An exponent of `1,5` read as `1`. A field that
 * holds a fragment of an answer is not an answer, so it grades `ogilt` and the
 * caller asks again, the same rule `1-ar/dimensional-analysis`'s `readWritten`
 * applies to its own two fields.
 */
function readEntry(entry: ScientificEntry): { mantissa: number; exponent: number } | null {
  const mantissa = normaliseMinus(entry.mantissa.replace(/\s/g, ''));
  const exponent = normaliseMinus(entry.exponent.replace(/\s/g, ''));
  if (mantissa === null || exponent === null) return null;
  if (!PLAIN_MANTISSA.test(mantissa) || !INTEGER_EXPONENT.test(exponent)) return null;
  return { mantissa: Number(mantissa.replace(',', '.')), exponent: Number(exponent) };
}

/**
 * Grade an answer given as mantissa and exponent.
 *
 * **Two fields, not one, and that is the whole design.** In `leysnijafnvaegi` every answer lives
 * between 10⁻⁵ and 10⁻¹⁷, where a single decimal box is unusable:
 * nobody types 0,0000000083, and `parseStudentNumber` stops at the `×` in
 * `8,3 × 10⁻¹⁷`, so a pasted scientific answer would grade as 8,3. That is the
 * `molmassi` superscript defect, and the old `solubility-equilibrium` had a
 * worse version — `Level2.tsx:48` did `.replace(/10/g, 'e')`, so the very
 * format the game advertised parsed to the mantissa alone, the plain-decimal
 * form parsed to 0, and an Icelandic comma parsed to 1
 * (`ORPHANED_GAMES_ASSESSMENT.md`).
 *
 * Splitting the field also buys a diagnosis a single merged box cannot make:
 * right digits with the power of ten wrong (`veldisvisir`) against wrong
 * digits (`tolustafir`). Only a mistake that multiplies the answer by a power
 * of ten and by nothing else lands on `veldisvisir`: a mantissa normalised
 * without moving the power with it (13,4 × 10⁻⁶ written as 1,34 × 10⁻⁶), a
 * dropped minus sign on the power, a unit slip of a thousand (mL for L).
 *
 * **Forgetting the `4` in `4s³` is not one of them** — this comment used to say
 * it was. It multiplies s by ∛4 ≈ 1,59, which is no power of ten, so it always
 * changes the digits and lands on `tolustafir` or `baedi`. **Nor, as a rule, is
 * taking a square root where a cube root belonged**, which this comment also
 * named. That factor depends on Ksp, so it is a power of ten only by
 * coincidence — √Ksp against ∛(Ksp / 4) at a Ksp near 6,25 × 10⁻¹⁴ — and no
 * salt in `3-ar/leysnijafnvaegi`'s pool comes near one. A caller's
 * `veldisvisir` message should name the power, not the chemistry.
 */
export function gradeScientific(
  entry: ScientificEntry,
  expected: number,
  tolerance = 0.02
): { outcome: GradeOutcome; value: number } {
  const read = readEntry(entry);
  if (read === null) return { outcome: 'ogilt', value: Number.NaN };
  const { mantissa, exponent } = read;

  const value = mantissa * Math.pow(10, exponent);
  if (value <= 0) return { outcome: 'ogilt', value };

  const expectedExponent = Math.floor(Math.log10(expected));
  const expectedMantissa = expected / Math.pow(10, expectedExponent);

  const within = (a: number, b: number) => Math.abs(a - b) / b <= tolerance;

  if (within(value, expected)) return { outcome: 'rett', value };

  // A normalised mantissa lets "right digits, wrong power" be told apart from
  // "wrong digits". 8,3 against 8,3 with the exponent adrift is a different
  // mistake from 2,9 against 8,3, and deserves a different sentence.
  const mantissaRight = within(mantissa, expectedMantissa);
  const exponentRight = exponent === expectedExponent;

  if (mantissaRight && !exponentRight) return { outcome: 'veldisvisir', value };
  if (!mantissaRight && exponentRight) return { outcome: 'tolustafir', value };
  return { outcome: 'baedi', value };
}
