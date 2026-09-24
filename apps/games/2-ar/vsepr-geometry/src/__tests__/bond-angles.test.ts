import { describe, expect, it } from 'vitest';

import { gradeBondAngle, parseAngles } from '../utils/bondAngles';

describe('parseAngles', () => {
  it('reads the decimal comma, and the point, as one angle', () => {
    expect(parseAngles('109,5')).toEqual([109.5]);
    expect(parseAngles('109,5°')).toEqual([109.5]);
    expect(parseAngles('109.5°')).toEqual([109.5]);
    expect(parseAngles('104,50 gráður')).toEqual([104.5]);
  });

  it('separates angles by words, spaces and list commas', () => {
    expect(parseAngles('90° og 120°')).toEqual([90, 120]);
    expect(parseAngles('90 120')).toEqual([90, 120]);
    expect(parseAngles('90, 120')).toEqual([90, 120]);
    // Three digits after a comma is not a decimal an angle is written with.
    expect(parseAngles('90,120')).toEqual([90, 120]);
  });

  it('finds nothing in an answer with no digits', () => {
    expect(parseAngles('')).toEqual([]);
    expect(parseAngles('NaN')).toEqual([]);
    expect(parseAngles('beygð')).toEqual([]);
  });
});

describe('gradeBondAngle', () => {
  it('accepts the stored angle however it is written', () => {
    for (const answer of ['109,5', '109,5°', '109.5', '109', '110', '~109,5 gráður']) {
      expect(gradeBondAngle(answer, '109,5°', 'tetrahedral'), answer).toBe(true);
    }
  });

  it('holds the ±2° tolerance on both sides, whichever separator is used', () => {
    expect(gradeBondAngle('107,6', '109,5°', 'tetrahedral')).toBe(true);
    expect(gradeBondAngle('107.6', '109,5°', 'tetrahedral')).toBe(true);
    expect(gradeBondAngle('107,4', '109,5°', 'tetrahedral')).toBe(false);
    expect(gradeBondAngle('111,4', '109,5°', 'tetrahedral')).toBe(true);
    expect(gradeBondAngle('111,6', '109,5°', 'tetrahedral')).toBe(false);
  });

  it('rejects 0, double, half and NaN', () => {
    for (const [correct, value, id] of [
      ['109,5°', 109.5, 'tetrahedral'],
      ['107°', 107, 'trigonal-pyramidal'],
      ['104,5°', 104.5, 'bent'],
      ['180°', 180, 'linear'],
      ['120°', 120, 'trigonal-planar'],
      ['90°', 90, 'octahedral'],
    ] as const) {
      for (const wrong of ['0', String(value * 2), String(value / 2).replace('.', ','), 'NaN']) {
        expect(gradeBondAngle(wrong, correct, id), `${wrong} for ${correct}`).toBe(false);
      }
    }
  });

  it('needs every angle of a two-angle shape', () => {
    expect(gradeBondAngle('90° og 120°', '90° og 120°', 'trigonal-bipyramidal')).toBe(true);
    expect(gradeBondAngle('90 120', '90° og 120°', 'trigonal-bipyramidal')).toBe(true);
    expect(gradeBondAngle('90', '90° og 120°', 'trigonal-bipyramidal')).toBe(false);
    expect(gradeBondAngle('120', '90° og 120°', 'trigonal-bipyramidal')).toBe(false);
    expect(gradeBondAngle('90 og 109,5', '90° og 120°', 'trigonal-bipyramidal')).toBe(false);
  });

  it('keeps the bent special case', () => {
    expect(gradeBondAngle('105', '104,5°', 'bent')).toBe(true);
    expect(gradeBondAngle('103', '104,5°', 'bent')).toBe(true);
    expect(gradeBondAngle('102', '104,5°', 'bent')).toBe(false);
  });
});
