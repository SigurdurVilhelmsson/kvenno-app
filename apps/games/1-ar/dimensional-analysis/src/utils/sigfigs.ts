/**
 * Significant figures — `markverðir stafir`.
 *
 * **Why this file exists.** Siggi's ruling, 2026-09-19: significant figures get
 * a Stig 0 inside Einingagreining rather than a game of their own. The gap it
 * closes is specific and was recorded in the roadmap: **this game already
 * checks significant figures without ever teaching them.** `Level3.tsx:167-169`
 * counts them on every `synthesis` problem and shows a red or green panel for
 * it, and `challenges.ts` asks for "3 markverðum stöfum" in the problem text —
 * so a student meets the rule first as a mark against them.
 *
 * (That check is feedback-only: `calculateCompositeScore` takes four scores and
 * the significant-figure result is not one of them. **Levels 1 and 2 do not
 * mention significant figures at all** — the roadmap flagged this as unmeasured,
 * and a grep of the whole game settles it: every occurrence is in `Level3.tsx`
 * or in the challenge data it reads.)
 *
 * **Everything here works on the written form, not on a `number`.** That is not
 * fussiness, it is the whole subject: `1200`, `1200.` and `1,200 × 10³` are the
 * same quantity written to two, four and four significant figures, and a
 * JavaScript `number` cannot tell them apart. Parsing to a float first would
 * throw away the thing the student is being asked about.
 *
 * The rules, as the school's course states them:
 *
 *  1. every non-zero digit is significant
 *  2. zeros between non-zero digits are significant
 *  3. leading zeros are never significant — they only place the decimal point
 *  4. trailing zeros are significant **only** when a decimal point is written
 */

/** The Icelandic decimal comma is what students type and what the games print. */
const toDot = (literal: string) => literal.trim().replace(',', '.');

/**
 * Split a written number into its mantissa and whether it carried an exponent.
 *
 * Accepts `1.20e3`, `1.20E3`, `1,20 × 10³` and `1,20 x 10^3` — the games print
 * the middle form and students type the others.
 */
const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁻': '-',
};

function mantissaOf(literal: string): string {
  const s = toDot(literal)
    .replace(/\s/g, '')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (c) => SUPERSCRIPT_DIGITS[c] ?? c);
  // `1.20e3`, `1.20×10^3`, `1.20*10^3` — everything from the multiplication
  // sign or the `e` onwards is the exponent, which carries no significant digits.
  const cut = s.search(/[eE]|[×x*]10/);
  return cut === -1 ? s : s.slice(0, cut);
}

/**
 * How many significant figures the number is *written* to.
 *
 * Throws on input that is not a number at all, rather than returning 0 — a
 * silent 0 would read as "no significant figures", which is a different claim.
 */
export function countSigFigs(literal: string): number {
  const m = mantissaOf(literal).replace(/^[+-]/, '');
  if (!/^\d*\.?\d*$/.test(m) || !/\d/.test(m)) {
    throw new RangeError(`Not a written number: ${JSON.stringify(literal)}`);
  }

  const hasPoint = m.includes('.');
  const digits = m.replace('.', '');

  // Rule 3: leading zeros only place the point. `0.00450` -> `450`.
  const withoutLeading = digits.replace(/^0+/, '');

  // A written zero — `0`, `0.0`, `0.000` — has no significant digits by rules
  // 1-3, and the convention the course uses is that `0.0` is quoted to one.
  // Counting the trailing zeros after the point gives exactly that.
  if (withoutLeading === '') return hasPoint ? Math.max(digits.length - 1, 1) : 1;

  // Rule 4: trailing zeros count only when a decimal point is written.
  return hasPoint ? withoutLeading.length : withoutLeading.replace(/0+$/, '').length;
}

/** Decimal places as written — what the +/- rule compares. */
export function countDecimalPlaces(literal: string): number {
  const m = mantissaOf(literal).replace(/^[+-]/, '');
  if (!/^\d*\.?\d*$/.test(m) || !/\d/.test(m)) {
    throw new RangeError(`Not a written number: ${JSON.stringify(literal)}`);
  }
  const i = m.indexOf('.');
  return i === -1 ? 0 : m.length - i - 1;
}

/** `1.20e+3` -> `1,20 × 10³`, the form the course writes. */
function toScientific(exponential: string): string {
  const [mant, exp] = exponential.split('e');
  const sup = exp
    .replace('+', '')
    .split('')
    .map((c) => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]))
    .join('');
  return `${mant.replace('.', ',')} × 10${sup}`;
}

/**
 * Round to `figures` significant figures and render it so that **reading the
 * result back gives `figures` again**. `roundTripsToSigFigs` in the tests
 * asserts exactly that, over the range this game uses.
 *
 * `toPrecision` is the right primitive but not a sufficient renderer, for two
 * reasons and one of them is a teaching point:
 *
 *  - it writes a dot where Icelandic writes a comma, and `1.20e+3` where the
 *    course writes `1,20 × 10³`;
 *  - **some values cannot be written to the asked-for precision in plain
 *    decimal at all.** 60,221 to two significant figures is `60` — and by rule 4
 *    a written `60` claims *one* figure, because its trailing zero has no
 *    decimal point to make it count. The only honest way to write it is
 *    `6,0 × 10¹`. That is not a rendering quirk to paper over; it is why
 *    scientific notation exists, and Stig 0 says so.
 *
 * So the result is verified before it is returned, and falls back to scientific
 * notation whenever plain decimal would misstate the precision.
 */
export function roundToSigFigs(value: number, figures: number): string {
  if (!Number.isFinite(value)) throw new RangeError(`Not a finite value: ${value}`);
  if (!Number.isInteger(figures) || figures < 1) {
    throw new RangeError(`Significant figures must be a positive integer, got ${figures}`);
  }
  if (value === 0) return figures === 1 ? '0' : `0,${'0'.repeat(figures - 1)}`;

  const rounded = Number(value.toPrecision(figures));
  // Decimal places needed to show exactly `figures` digits. Negative when the
  // value is a round integer wider than its precision — 1234 to 2 needs -2.
  const places = figures - 1 - Math.floor(Math.log10(Math.abs(rounded)));
  const plain = rounded.toFixed(Math.max(places, 0)).replace('.', ',');

  // Prefer plain decimal, but only where reading it back gives the precision
  // claimed. `1200` does (rule 4 makes it two figures); `60` does not.
  if (countSigFigs(plain) === figures) return plain;
  return toScientific(rounded.toExponential(figures - 1));
}

/**
 * Significant figures the answer to a product or quotient may carry: **the
 * fewest any input was measured to.** A chain of conversions cannot be more
 * precise than its least precise measurement, which is the reason this belongs
 * in Einingagreining rather than beside it.
 *
 * Exact conversion factors — 1000 mL in a litre, 12 in a dozen — are definitions
 * rather than measurements and carry unlimited significant figures, so they are
 * passed as `null` and ignored.
 */
export function sigFigsAfterMultiply(inputs: (string | null)[]): number {
  const measured = inputs.filter((x): x is string => x !== null).map(countSigFigs);
  if (measured.length === 0) {
    throw new RangeError('A product of only exact factors has no measured precision to limit it');
  }
  return Math.min(...measured);
}

/**
 * Decimal places the answer to a sum or difference may carry: **the fewest any
 * input was written to.** Note this is decimal places, not significant figures —
 * the commonest mistake in the topic, and the reason the two rules are taught
 * side by side.
 */
export function decimalPlacesAfterAdd(inputs: string[]): number {
  if (inputs.length === 0) throw new RangeError('Nothing to add');
  return Math.min(...inputs.map(countDecimalPlaces));
}
