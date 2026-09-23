import { describe, it, expect } from 'vitest';

import { parseStudentNumber, formatDecimal, normaliseMinus, DECIMAL_INPUT_PROPS } from '../numbers';

describe('parseStudentNumber', () => {
  it('reads the Icelandic decimal comma', () => {
    // parseFloat('0,5') is 0 — the defect this exists to fix.
    expect(parseStudentNumber('0,5')).toBe(0.5);
    expect(parseStudentNumber('18,02')).toBe(18.02);
    expect(parseStudentNumber('-33,5')).toBe(-33.5);
  });

  it('still reads a full stop, for a student on a different keyboard', () => {
    expect(parseStudentNumber('0.5')).toBe(0.5);
    expect(parseStudentNumber('18.02')).toBe(18.02);
  });

  it('reads whole numbers and scientific notation', () => {
    expect(parseStudentNumber('12')).toBe(12);
    expect(parseStudentNumber('4.2e5')).toBe(420000);
    expect(parseStudentNumber('6,022e23')).toBe(6.022e23);
  });

  it('reads a thousands space, including the ones a paste carries', () => {
    expect(parseStudentNumber('1 234,5')).toBe(1234.5);
    expect(parseStudentNumber('1 234,5')).toBe(1234.5);
    expect(parseStudentNumber('1 234,5')).toBe(1234.5);
    expect(parseStudentNumber('  7,5  ')).toBe(7.5);
  });

  it('returns NaN for nothing, rather than zero', () => {
    // Number('') is 0, which would grade an empty box as a correct zero.
    expect(parseStudentNumber('')).toBeNaN();
    expect(parseStudentNumber('   ')).toBeNaN();
    expect(parseStudentNumber('svar')).toBeNaN();
  });

  it('reads the typographic minus the screens print', () => {
    // parseFloat stops at U+2212: a pasted −8,9 read as nothing, and 1,84e−5
    // read as 1,84 — a number 10⁵ times too big, graded as if typed.
    expect(parseStudentNumber('\u22128,9')).toBe(-8.9);
    expect(parseStudentNumber('\u2212 8,9')).toBe(-8.9);
    expect(parseStudentNumber('1,84e\u22125')).toBe(1.84e-5);
  });

  it('reads an en dash as a minus only where a sign can stand', () => {
    // The textbook writes –196 °C and oxunartöluna –2 with an en dash.
    expect(parseStudentNumber('\u2013196')).toBe(-196);
    expect(parseStudentNumber('1,8e\u20135')).toBe(1.8e-5);
  });

  it('refuses a range rather than grading its lower bound', () => {
    // The textbook also writes ranges with an en dash (0,8–1,0 M), and
    // parseFloat read one as its first number.
    expect(parseStudentNumber('0,8\u20131,0')).toBeNaN();
    expect(parseStudentNumber('2\u20133')).toBeNaN();
    expect(parseStudentNumber('\u20132\u20133')).toBeNaN();
  });

  it('leaves the hyphen minus exactly as it was', () => {
    expect(parseStudentNumber('-8,9')).toBe(-8.9);
    expect(parseStudentNumber('1,84e-5')).toBe(1.84e-5);
    expect(parseStudentNumber('-')).toBeNaN();
  });

  it('offers text + decimal input, never type=number', () => {
    // type="number" discards the comma before any code sees it, so no amount
    // of normalising downstream can recover it.
    expect(DECIMAL_INPUT_PROPS.type).toBe('text');
    expect(DECIMAL_INPUT_PROPS.inputMode).toBe('decimal');
  });
});

describe('formatDecimal', () => {
  it('writes the Icelandic decimal comma', () => {
    expect(formatDecimal(4.6421, 2)).toBe('4,64');
    expect(formatDecimal(0.1, 3)).toBe('0,100');
    expect(formatDecimal(-0.2, 2)).toBe('-0,20');
  });

  it('never prints a negative zero', () => {
    // toFixed keeps the sign of what it rounds away: (-0.3).toFixed(0) is '-0'.
    expect(formatDecimal(-0.3, 0)).toBe('0');
    expect(formatDecimal(-0.04, 1)).toBe('0,0');
    expect(formatDecimal(-0.004, 2)).toBe('0,00');
    expect(formatDecimal(-1e-9, 3)).toBe('0,000');
    expect(formatDecimal(-0)).toBe('0');
    expect(formatDecimal(-0, 2)).toBe('0,00');
    for (let i = 1; i < 500; i += 1) {
      const value = -i / 10000;
      for (const decimals of [0, 1, 2, 3]) {
        expect(formatDecimal(value, decimals), `${value} to ${decimals}`).not.toMatch(/^-0(,0*)?$/);
      }
    }
  });

  it('keeps the sign of a negative value that does not round to zero', () => {
    expect(formatDecimal(-0.3, 1)).toBe('-0,3');
    expect(formatDecimal(-0.006, 2)).toBe('-0,01');
    expect(formatDecimal(-0.6, 0)).toBe('-1');
    expect(formatDecimal(-33.5)).toBe('-33,5');
  });

  it('prints the value as written when no precision is given', () => {
    expect(formatDecimal(7.4)).toBe('7,4');
    expect(formatDecimal(200)).toBe('200');
  });

  it('round-trips through parseStudentNumber', () => {
    for (const x of [0.0355, 1.82, -0.26, 119.98, 9.26]) {
      expect(parseStudentNumber(formatDecimal(x, 4))).toBeCloseTo(x, 4);
    }
  });
});

describe('normaliseMinus', () => {
  it('turns U+2212 into a hyphen wherever it stands', () => {
    expect(normaliseMinus('\u22125')).toBe('-5');
    expect(normaliseMinus('1e\u22125')).toBe('1e-5');
  });

  it('turns an en dash into a hyphen only at the front or after e', () => {
    expect(normaliseMinus('\u20135')).toBe('-5');
    expect(normaliseMinus('1E\u20135')).toBe('1E-5');
    expect(normaliseMinus('1\u20135')).toBeNull();
  });

  it('leaves everything else alone', () => {
    expect(normaliseMinus('-5')).toBe('-5');
    expect(normaliseMinus('8,3')).toBe('8,3');
    expect(normaliseMinus('')).toBe('');
  });
});
