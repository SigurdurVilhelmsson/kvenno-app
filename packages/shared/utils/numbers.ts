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
 * Turn the minus signs a student can bring to a field into the ASCII hyphen
 * `parseFloat` reads, or return `null` for a dash that is not a sign.
 *
 * **U+2212 is always a minus.** It is what the games themselves print
 * (`ΔH = −100`) and what the textbook prints in most places, so a
 * student who copies a number off the screen brings one with it. `parseFloat`
 * stops at it: `−8,9` read as nothing at all, and `1,84e−5` read as `1,84` — a
 * number 10⁵ times too big, graded as if the student had typed it.
 *
 * **An en dash (U+2013) is a minus only where a sign can stand** — first, or
 * straight after the `e` of an exponent. The textbook uses it both ways: as a
 * minus (`–196 °C`, the oxidation number `–2`, superscript powers of ten) and
 * for a range (`30.000–50.000 ára`, `0,8–1,0 M`). A dash at the front cannot be
 * a range, since a range needs a first number. Between two digits it is one,
 * and a range is not an answer: this returns `null` rather than let
 * `parseFloat` read it as its lower bound.
 */
export function normaliseMinus(text: string): string | null {
  const signed = text.replace(/\u2212/g, '-').replace(/(^|[eE])\u2013/g, '$1-');
  return signed.includes('\u2013') ? null : signed;
}

/**
 * Read a number a student typed.
 *
 * Accepts the Icelandic decimal comma and a thousands space (`1 234,5`),
 * including the non-breaking and narrow no-break spaces a paste from a document
 * carries, and the typographic minus signs `normaliseMinus` describes. Returns
 * `NaN` for anything unparseable, including an empty or whitespace-only string
 * — which `parseFloat` also does, but `Number('')` does not.
 *
 * A full stop is read as a decimal point, not as the thousands separator the
 * textbook writes (`1.300 grömm`), because a phone's decimal keypad set to an
 * English region offers only the full stop. Which reading `1.300` should get is
 * an open question for a ruling, not something this function settles.
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
  const signed = normaliseMinus(withoutSpaces);
  if (signed === null) return Number.NaN;
  return Number.parseFloat(signed.replace(',', '.'));
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

/**
 * Print a number the way an Icelandic student reads one — the other half of
 * `parseStudentNumber`.
 *
 * `toFixed` and plain interpolation both write a full stop, so a worked
 * solution printed `4.64 g` beside an answer field that teaches `4,64`. With
 * `decimals` it rounds like `toFixed`; without, it prints the value as written.
 * The minus stays an ASCII hyphen, so a student who copies a negative number
 * back into a field still gets it parsed.
 *
 * **A value that rounds to zero prints as zero, never `-0`.** `toFixed` keeps
 * the sign of what it rounded away, so `(-0.3).toFixed(0)` is `'-0'`: water's
 * crossover at 272,7 K printed as `-0 °C`, and a ΔG° a few hundredths below
 * zero as `-0 kJ` (`3-ar/thermodynamics-predictor`, which wrapped this function
 * to get round it). Zero has no sign to show.
 */
export function formatDecimal(value: number, decimals?: number): string {
  const text = decimals === undefined ? String(value) : value.toFixed(decimals);
  const unsigned = /^-0(\.0*)?$/.test(text) ? text.slice(1) : text;
  return unsigned.replace('.', ',');
}
