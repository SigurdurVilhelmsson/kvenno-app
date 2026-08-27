/**
 * Reading the notation the game itself prints.
 *
 * Both levels ask for Avogadro-scale answers and both showed the student
 * `× 10²³` — Level 2 inside the question, Level 3 inside every worked
 * solution — and then could not read it back:
 *
 * - Level 2 matched only an ASCII `10^23`, so `3,5 × 10²³` fell through to
 *   `parseFloat` and graded as **3.5**.
 * - Level 3 called `parseFloat` before its scientific-notation regex.
 *   `parseFloat` never returns `NaN` for a string starting with a digit, so
 *   the regex was unreachable and `3.34×10^22` graded as **3.34** — on
 *   `mass-to-particles` problems, whose every key is that size.
 *
 * Every case below that involves a superscript, and every `×10^` case in
 *   Level 3, fails against the parsers this replaced.
 */

import { describe, it, expect } from 'vitest';

import { parseScientificAnswer } from '../utils/parseAnswer';

describe('parseScientificAnswer', () => {
  const reads: [string, number][] = [
    // Plain numbers, Icelandic and English decimal separators alike.
    ['4', 4],
    ['0.25', 0.25],
    ['0,25', 0.25],
    ['-1,5', -1.5],
    ['  2,5  ', 2.5],

    // `e` notation, which both old parsers already handled.
    ['6.022e23', 6.022e23],
    ['6,022e23', 6.022e23],
    ['1e-3', 1e-3],

    // ASCII carets. Level 2 read these; Level 3 could not.
    ['3.5*10^23', 3.5e23],
    ['3,5 × 10^23', 3.5e23],
    ['3.5x10^23', 3.5e23],
    ['2·10^23', 2e23],

    // Superscripts — the notation the game prints. Neither parser read these.
    ['3,5 × 10²³', 3.5e23],
    ['6,022 × 10²³', 6.022e23],
    ['1,2 × 10²⁴', 1.2e24],
    ['4 × 10⁻³', 4e-3],
    ['10²³', 1e23],

    // A student who writes the unit has not made a mistake.
    ['3,5 mól', 3.5],
    ['18,02 g', 18.02],
  ];

  it.each(reads)('reads %s', (input, expected) => {
    const parsed = parseScientificAnswer(input);
    expect(parsed).not.toBeNull();
    // Relative comparison: these span 10⁻³ to 10²⁴.
    expect(Math.abs((parsed as number) - expected) / Math.abs(expected || 1)).toBeLessThan(1e-9);
  });

  const refuses = [
    '',
    '   ',
    'mól',
    'ekki tala',
    // Half-understood numbers are the whole point: silently returning the
    // mantissa is what marked a correct answer wrong.
    '3.5 x 10 23',
    '3,5 × 10 upphafið í 23',
  ];

  it.each(refuses)('refuses %s rather than guessing', (input) => {
    expect(parseScientificAnswer(input)).toBeNull();
  });

  it('does not read a mantissa out of a number it only half understands', () => {
    // The regression in one line: this used to be 3.5, which is 10²³ times
    // smaller than what the student meant.
    expect(parseScientificAnswer('3,5 × 10²³')).toBeGreaterThan(1e23);
  });
});
