import { describe, it, expect } from 'vitest';

import {
  countDecimalPlaces,
  countSigFigs,
  decimalPlacesAfterAdd,
  roundToSigFigs,
  sigFigsAfterMultiply,
} from '../utils/sigfigs';

/**
 * The four counting rules, each tested at the case that breaks a naive
 * implementation, plus the two arithmetic rules Stig 0 teaches.
 *
 * The cases that matter most are the ones where the written form carries
 * information a `number` does not: `1200` against `1200.`, and `0.00450`
 * against `450`.
 */

describe('countSigFigs', () => {
  it('counts every non-zero digit (rule 1)', () => {
    expect(countSigFigs('7')).toBe(1);
    expect(countSigFigs('123')).toBe(3);
    expect(countSigFigs('98765')).toBe(5);
  });

  it('counts zeros trapped between non-zeros (rule 2)', () => {
    expect(countSigFigs('101')).toBe(3);
    expect(countSigFigs('1002')).toBe(4);
    expect(countSigFigs('50.07')).toBe(4);
  });

  it('never counts leading zeros (rule 3)', () => {
    expect(countSigFigs('0.5')).toBe(1);
    expect(countSigFigs('0.00450')).toBe(3);
    expect(countSigFigs('0.0001')).toBe(1);
  });

  it('counts trailing zeros only when a decimal point is written (rule 4)', () => {
    // The case the whole topic turns on. Same quantity, different claim.
    expect(countSigFigs('1200')).toBe(2);
    expect(countSigFigs('1200.')).toBe(4);
    expect(countSigFigs('1200.0')).toBe(5);
    expect(countSigFigs('2.50')).toBe(3);
    expect(countSigFigs('250')).toBe(2);
  });

  it('reads the Icelandic decimal comma', () => {
    // The whole platform prints and accepts a comma; a dot-only parser would
    // count `2,50` as an error or, worse, as `250`.
    expect(countSigFigs('2,50')).toBe(3);
    expect(countSigFigs('0,00450')).toBe(3);
    expect(countSigFigs('1200,')).toBe(4);
  });

  it('ignores the exponent, in every form the platform writes', () => {
    // An exponent places the point; it carries no measured digits.
    expect(countSigFigs('1.20e3')).toBe(3);
    expect(countSigFigs('1,20 × 10³')).toBe(3);
    expect(countSigFigs('6,022 × 10²³')).toBe(4);
    expect(countSigFigs('1.0E-5')).toBe(2);
    expect(countSigFigs('9,1 x 10^-31')).toBe(2);
  });

  it('handles a signed value', () => {
    expect(countSigFigs('-2.50')).toBe(3);
    expect(countSigFigs('+0,040')).toBe(2);
  });

  it('treats a written zero as one figure, or as its quoted precision', () => {
    expect(countSigFigs('0')).toBe(1);
    expect(countSigFigs('0.0')).toBe(1);
    expect(countSigFigs('0.000')).toBe(3);
  });

  it('throws rather than returning 0 on input that is not a number', () => {
    // A silent 0 would read as "no significant figures", a different claim.
    expect(() => countSigFigs('')).toThrow(RangeError);
    expect(() => countSigFigs('abc')).toThrow(RangeError);
    expect(() => countSigFigs('.')).toThrow(RangeError);
  });
});

describe('countDecimalPlaces', () => {
  it('counts what is written after the point, zeros included', () => {
    expect(countDecimalPlaces('12')).toBe(0);
    expect(countDecimalPlaces('12.3')).toBe(1);
    expect(countDecimalPlaces('12,30')).toBe(2);
    expect(countDecimalPlaces('0.00450')).toBe(5);
  });
});

describe('roundToSigFigs', () => {
  it('rounds and prints with the Icelandic comma', () => {
    expect(roundToSigFigs(1234, 2)).toBe('1200');
    expect(roundToSigFigs(0.0045678, 3)).toBe('0,00457');
    expect(roundToSigFigs(2.5049, 3)).toBe('2,50');
  });

  it('keeps the trailing zeros that carry the claim', () => {
    // 2.5 to three figures is `2,50` — dropping the zero would understate it.
    expect(roundToSigFigs(2.5, 3)).toBe('2,50');
    expect(countSigFigs(roundToSigFigs(2.5, 3))).toBe(3);
  });

  it('round-trips: what it prints counts back to what was asked for', () => {
    // The property that matters, over the range this game actually uses.
    for (const value of [1234, 0.0045678, 2.5, 98765, 0.5, 60.221, 1.00794]) {
      for (const figures of [1, 2, 3, 4]) {
        expect(countSigFigs(roundToSigFigs(value, figures)), `${value} to ${figures}`).toBe(
          figures
        );
      }
    }
  });

  it('round-trips across the whole range the game uses, not just a handful', () => {
    // The handful above is illustrative; this is the property. Deterministic
    // values so a failure is reproducible.
    let checked = 0;
    for (let e = -6; e <= 6; e++) {
      for (const mant of [1, 1.005, 2.5, 3.14159, 6.022, 8.999, 9.95]) {
        const value = mant * 10 ** e;
        for (let figures = 1; figures <= 5; figures++) {
          const printed = roundToSigFigs(value, figures);
          expect(countSigFigs(printed), `${value} to ${figures} printed ${printed}`).toBe(figures);
          checked++;
        }
      }
    }
    expect(checked).toBe(13 * 7 * 5);
  });

  it('prefers plain decimal, and only goes scientific when plain would lie', () => {
    // 1234 to two figures is `1200`, which rule 4 already reads as two — plain
    // is fine and is what a student writes. 60,221 to two cannot be written
    // plainly at all: `60` claims one figure.
    expect(roundToSigFigs(1234, 2)).toBe('1200');
    expect(roundToSigFigs(60.221, 2)).toBe('6,0 × 10¹');
  });

  it('refuses nonsense rather than printing it', () => {
    expect(() => roundToSigFigs(Number.NaN, 3)).toThrow(RangeError);
    expect(() => roundToSigFigs(1, 0)).toThrow(RangeError);
    expect(() => roundToSigFigs(1, 1.5)).toThrow(RangeError);
  });
});

describe('the two arithmetic rules', () => {
  it('multiply and divide: the answer takes the fewest significant figures', () => {
    expect(sigFigsAfterMultiply(['2.50', '1.1'])).toBe(2);
    expect(sigFigsAfterMultiply(['50.0', '2.50'])).toBe(3);
  });

  it('exact conversion factors do not limit anything', () => {
    // 1000 mL in a litre is a definition, not a measurement. Passing it as a
    // measured `1000` would wrongly cap the answer at 1 significant figure.
    expect(sigFigsAfterMultiply(['2.50', null])).toBe(3);
    expect(sigFigsAfterMultiply([null, '0.00450', null])).toBe(3);
    expect(() => sigFigsAfterMultiply([null, null])).toThrow(RangeError);
  });

  it('add and subtract: the answer takes the fewest DECIMAL PLACES', () => {
    // Not significant figures — the commonest mistake in the topic.
    expect(decimalPlacesAfterAdd(['12.11', '0.3'])).toBe(1);
    expect(decimalPlacesAfterAdd(['100', '1.234'])).toBe(0);
  });

  it('the two rules genuinely disagree, which is why both are taught', () => {
    // 100 + 1.234: by decimal places the answer is 101; by significant figures
    // it would be 101.234 rounded to one figure, or 100. A student who applies
    // the multiplication rule to a sum gets a visibly different answer.
    const inputs = ['100', '1.234'];
    expect(decimalPlacesAfterAdd(inputs)).toBe(0);
    expect(sigFigsAfterMultiply(inputs)).toBe(1);
  });
});
