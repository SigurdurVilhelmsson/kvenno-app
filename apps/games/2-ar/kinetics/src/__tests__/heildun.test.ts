import { describe, expect, it } from 'vitest';

import {
  answerOf,
  closeTo,
  numberSlip,
  numericAnswer,
  optionsOf,
  toleranceOf,
  working,
} from '../components/HeildunScreen';
import { HEILDUN_ITEMS, type NumericItem } from '../data/heildun';
import { activationEnergy, kFromHalfLife, timeToLeave } from '../engine/rate-laws';

const numeric = HEILDUN_ITEMS.filter(
  (i): i is NumericItem => i.kind !== 'graf' && i.kind !== 'tvofalt'
);

describe('the engine', () => {
  it('reproduces the book’s worked examples', () => {
    expect(timeToLeave(0.2, 9.2e-3)).toBeCloseTo(175, 0);
    expect(kFromHalfLife(2.16e4)).toBeCloseTo(3.21e-5, 7);
    expect(activationEnergy(1.66, 650, 7.39, 700) / 1000).toBeCloseTo(113, 0);
  });

  it('gives the same Ea whichever point is first', () => {
    expect(activationEnergy(7.39, 700, 1.66, 650)).toBeCloseTo(
      activationEnergy(1.66, 650, 7.39, 700),
      6
    );
  });
});

describe('the items', () => {
  it.each(numeric.map((i) => [i.id, i] as const))(
    '%s agrees with the book and refuses 0, its negative, double and half',
    (_, item) => {
      const key = numericAnswer(item);
      if (item.bookAnswer !== undefined) {
        expect(
          closeTo(item.bookAnswer, key, toleranceOf(item)),
          `${item.bookAnswer} vs ${key}`
        ).toBe(true);
      }
      for (const wrong of [0, -key, 2 * key, key / 2]) {
        expect(closeTo(wrong, key, toleranceOf(item)), `${wrong}`).toBe(false);
      }
      expect(working(item).length).toBeGreaterThan(0);
    }
  );

  it('offers every choice item’s key once', () => {
    for (const item of HEILDUN_ITEMS) {
      if (item.kind !== 'graf' && item.kind !== 'tvofalt') continue;
      expect(optionsOf(item).filter((o) => o === answerOf(item))).toHaveLength(1);
    }
    expect(HEILDUN_ITEMS.filter((i) => i.kind === 'graf').map(answerOf)).toEqual([
      '1/[A] á móti t',
    ]);
    expect(HEILDUN_ITEMS.filter((i) => i.kind === 'tvofalt').map(answerOf)).toEqual([
      'Helst óbreyttur',
    ]);
  });

  it('names the slips it can tell', () => {
    const by = (id: string) => numeric.find((i) => i.id === id)!;
    expect(numberSlip(by('timi-syklobutan'), timeToLeave(0.8, 9.2e-3))).toMatch(/Eftir eru 20 %/);
    expect(numberSlip(by('helmingun-butadien'), Math.LN2 / 5.76e-2)).toMatch(/fyrsta stigs/);
    expect(numberSlip(by('eftir-syklopropan'), 80)).toMatch(/hvarfast/);
    const ea = numericAnswer(by('virkjun-n2o5'));
    expect(numberSlip(by('virkjun-n2o5'), ea * 1000)).toMatch(/J\/mól/);
    expect(numberSlip(by('virkjun-n2o5'), ea / Math.LN10)).toMatch(/ln/);
  });

  it('cites the book on every item', () => {
    for (const item of HEILDUN_ITEMS)
      expect(item.source).toMatch(/kafli 12, „(Heilduð hraðalögmál|Árekstrakenningin)“.*m6879[13]/);
  });
});
