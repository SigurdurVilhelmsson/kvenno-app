import { describe, it, expect } from 'vitest';

import { parseStudentNumber, formatDecimal, DECIMAL_INPUT_PROPS } from '../numbers';

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
