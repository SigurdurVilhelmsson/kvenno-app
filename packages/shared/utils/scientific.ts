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
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
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
 * Splitting the field also buys the diagnosis that matters. The commonest real
 * error here is a right mantissa with the power of ten out by one — from
 * forgetting the `4` in `4s³`, or taking a square root where a cube root
 * belonged. `veldisvisir` says exactly that, where a single merged box could
 * only say "wrong".
 */
export function gradeScientific(
  entry: ScientificEntry,
  expected: number,
  tolerance = 0.02
): { outcome: GradeOutcome; value: number } {
  const mantissa = Number.parseFloat(entry.mantissa.replace(/\s/g, '').replace(',', '.'));
  const exponent = Number.parseInt(entry.exponent.replace(/\s/g, '').replace('−', '-'), 10);

  if (!Number.isFinite(mantissa) || !Number.isInteger(exponent)) {
    return { outcome: 'ogilt', value: Number.NaN };
  }

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
