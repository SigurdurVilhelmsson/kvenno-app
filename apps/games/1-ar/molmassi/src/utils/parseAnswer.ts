/**
 * Reading a number a student typed, including the one this game prints at them.
 *
 * Both levels asked for Avogadro-scale answers and neither could read the
 * notation their own question text uses. Level 2 asks
 * `Hversu mörg mól eru 3.5 × 10²³ sameindir?` and Level 3 prints
 * `6,022 × 10²³` inside every worked solution — and the parsers went:
 *
 * - **Level 2** matched `10^23` with an ASCII caret and ASCII digits. The
 *   superscripts `²³` are neither, so `3,5 × 10²³` fell through to
 *   `parseFloat`, which stops at the first character it cannot read and
 *   returns **3.5**. A student copying the format they had just been shown
 *   submitted an answer 10²³ times too small and was marked wrong.
 * - **Level 3** was worse: it ran `parseFloat` *first* and only tried its
 *   scientific-notation regex if that returned `NaN`. `parseFloat` never
 *   returns `NaN` for a string starting with a digit, so the regex was
 *   unreachable and `3.34×10^22` graded as **3.34** — with `mass-to-particles`
 *   problems, whose keys are all of that magnitude.
 *
 * The superscript handling is the piece harvested from the frozen repo's
 * `avogadro.ts` (`parseScientificInput`); the rest is written to be strict
 * where the old parsers were silently lenient.
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
  '⁺': '+',
};

/**
 * Parse an answer, or return `null` if it cannot be read.
 *
 * Accepts, in any combination: an Icelandic decimal comma, `e` notation, a
 * `×`/`x`/`*`/`·` times sign, an ASCII `10^23`, and superscript `10²³`. A
 * trailing unit is tolerated (`3,5 mól`) because a student who writes the unit
 * has not made a mistake — but only when it carries no digits of its own, so a
 * half-read `10²³` can never be mistaken for a bare mantissa.
 */
export function parseScientificAnswer(raw: string): number | null {
  if (typeof raw !== 'string') return null;

  let s = raw.trim();
  if (s === '') return null;

  // Superscripts first: a run of them is an exponent, so `10²³` becomes `10^23`.
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (run) =>
    '^'.concat([...run].map((character) => SUPERSCRIPT_DIGITS[character]).join(''))
  );

  s = s.replace(/,/g, '.').replace(/\s+/g, '');

  // `×10^23`, `x10^23`, `*10^23`, `·10^23` and a bare `10^23` all become `e23`.
  s = s.replace(/[×x*·]?10\^([+-]?\d+)/gi, 'e$1');

  // A bare power of ten — the student typed `10²³` and nothing else.
  if (/^e[+-]?\d+$/i.test(s)) s = '1'.concat(s);

  const match = s.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(e[+-]?\d+)?/i);
  if (!match) return null;

  // Anything left over may be a unit, but it may not contain digits: that would
  // mean part of the number was not understood.
  const remainder = s.slice(match[0].length);
  if (/\d/.test(remainder)) return null;

  const value = Number.parseFloat(match[0]);
  return Number.isFinite(value) ? value : null;
}
