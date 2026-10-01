import { describe, expect, it } from 'vitest';

import { gradeBondAngle, parseAngles, SHAPE_ANGLES } from '../utils/bondAngles';

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

/**
 * The grader asked only whether the stored angles were somewhere in the answer, so
 * `90 104,5 107 109,5 120 180` was right for every molecule (decisions item 70). Every
 * written angle must now be one the shape has.
 */
describe('gradeBondAngle against a list of every angle', () => {
  const STORED: [string, string][] = [
    ['bent', '104,5°'],
    ['trigonal-pyramidal', '107°'],
    ['tetrahedral', '109,5°'],
    ['linear', '180°'],
    ['trigonal-planar', '120°'],
    ['trigonal-bipyramidal', '90° og 120°'],
    ['seesaw', '90° og 120°'],
    ['octahedral', '90°'],
    ['square-planar', '90°'],
    ['t-shaped', '90°'],
  ];

  it.each(STORED)('rejects the shotgun list for %s', (id, correct) => {
    expect(gradeBondAngle('90 104,5 107 109,5 120 180', correct, id)).toBe(false);
  });

  it.each(STORED)('rejects the right angle with one wrong one beside it, for %s', (id, correct) => {
    const extra = SHAPE_ANGLES[id].includes(109.5) ? '60' : '109,5';
    expect(gradeBondAngle(`${correct} og ${extra}`, correct, id)).toBe(false);
  });

  it.each(STORED)('accepts every angle %s really has', (id, correct) => {
    const all = SHAPE_ANGLES[id].map((a) => String(a).replace('.', ',')).join(' og ');
    expect(gradeBondAngle(all, correct, id)).toBe(true);
  });

  it('accepts the 180° a shape has beside the asked-for angle', () => {
    expect(gradeBondAngle('90 og 180', '90°', 'octahedral')).toBe(true);
    expect(gradeBondAngle('90, 120 og 180', '90° og 120°', 'trigonal-bipyramidal')).toBe(true);
    expect(gradeBondAngle('180', '90°', 'octahedral')).toBe(false);
  });

  it.each(STORED)('stores every asked-for angle of %s in its set', (id, correct) => {
    for (const angle of parseAngles(correct)) expect(SHAPE_ANGLES[id]).toContain(angle);
  });
});
