/**
 * Reading a number the way an Icelandic student writes one.
 *
 * B9/B10. Icelandic uses the comma as its decimal separator, and the games
 * teach it: worked examples across the library print `0,5 g` and `18,02 g/mól`.
 * A student copying the format they were just shown was then marked wrong,
 * through two separate mechanisms that need different fixes:
 *
 * **B9 — `parseFloat` stops at the comma.** `parseFloat('0,5')` is `0`, not
 * `0.5`, so the answer graded as a tenth of itself.
 *
 * **B10 — `type="number"` eats the comma before any of your code runs.** The
 * browser will not put a comma into `value` under an `en-US`-ish locale, so
 * `0,5` arrives as `05` or `5` — a silent 10× error that normalising afterwards
 * cannot undo, because the comma is already gone. Any field whose answer can be
 * non-integer therefore has to be `type="text"` with `inputMode="decimal"`,
 * which still raises the numeric keypad on a phone. Fields that take a count —
 * protons, electrons, molecules, coefficients — are unaffected and keep
 * `type="number"`.
 *
 * Both halves are needed. Only `1-ar/molmassi` had normalised at all before this
 * pass, and on a `type="number"` field it was dead code.
 */

/**
 * Read a number a student typed.
 *
 * Accepts the Icelandic decimal comma and a thousands space (`1 234,5`), which
 * is how Icelandic writes large numbers, including the non-breaking and narrow
 * no-break spaces a paste from a document carries. Returns `NaN` for anything
 * unparseable, including an empty or whitespace-only string — which
 * `parseFloat` also does, but `Number('')` does not.
 *
 * Deliberately not `Intl.NumberFormat`-based: the games also accept scientific
 * notation (`4.2e5`), which a locale parser rejects, and a student switching
 * keyboards may well type a full stop.
 */
export function parseStudentNumber(input: string): number {
  // `\s` already covers the non-breaking and narrow no-break spaces a paste
  // from a document carries, so this strips those too.
  const withoutSpaces = input.replace(/\s/g, '');
  if (withoutSpaces === '') return Number.NaN;
  return Number.parseFloat(withoutSpaces.replace(',', '.'));
}

/**
 * Props for a field whose answer can be non-integer.
 *
 * Spread onto the `<input>` instead of writing `type="number"`, so the reason
 * travels with the code: `type="text"` keeps the comma, `inputMode="decimal"`
 * keeps the numeric keypad on a phone.
 */
export const DECIMAL_INPUT_PROPS = {
  type: 'text',
  inputMode: 'decimal',
} as const;
