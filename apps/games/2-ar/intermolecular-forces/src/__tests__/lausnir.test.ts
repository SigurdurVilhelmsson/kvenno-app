import { describe, expect, it } from 'vitest';

import {
  answerOf,
  isRight,
  molalityOf,
  numberSlip,
  numericAnswer,
  working,
} from '../components/LausnirScreen';
import { LAUSNIR_ITEMS, type NumericItem, type PointItem } from '../data/lausnir';
import { SOLVENTS, boilingPoint, freezingPoint } from '../engine/lausnir';

const numeric = LAUSNIR_ITEMS.filter((i): i is NumericItem => i.kind !== 'val');
const byId = <T extends NumericItem>(id: string) => numeric.find((i) => i.id === id) as T;

describe('the engine', () => {
  it('reproduces the book’s worked steps for chloroform and sea water', () => {
    expect(boilingPoint('klóróform', 0.4536)).toBeCloseTo(62.91, 2);
    expect(freezingPoint('vatn', 1.15, 2)).toBeCloseTo(-4.28, 2);
  });

  it('holds the book’s table of constants', () => {
    expect(SOLVENTS.vatn).toMatchObject({ Kb: 0.512, Kf: 1.86 });
    expect(SOLVENTS.bensen).toMatchObject({ boils: 80.1, Kb: 2.53, freezes: 5.5, Kf: 5.12 });
  });
});

describe('the items', () => {
  it('asks ten, eight of them numbers', () => {
    expect(LAUSNIR_ITEMS).toHaveLength(10);
    expect(numeric).toHaveLength(8);
  });

  it.each(numeric.map((i) => [i.id, i] as const))(
    '%s agrees with the book and refuses 0, its negative, double and half',
    (_, item) => {
      const key = numericAnswer(item);
      expect(isRight(item, item.bookAnswer), `${item.bookAnswer} against ${key}`).toBe(true);
      for (const wrong of [0, -key, 2 * key, key / 2]) expect(isRight(item, wrong)).toBe(false);
    }
  );

  it('refuses the pure solvent’s own boiling, freezing point or vapour pressure', () => {
    for (const item of numeric) {
      if (item.kind === 'sudumark') expect(isRight(item, SOLVENTS[item.solvent].boils)).toBe(false);
      if (item.kind === 'frostmark')
        expect(isRight(item, SOLVENTS[item.solvent].freezes)).toBe(false);
      if (item.kind === 'raoult') expect(isRight(item, item.pure)).toBe(false);
    }
  });

  it('works out the molality from the masses where the book gives masses', () => {
    expect(molalityOf(byId<PointItem>('sudumark-jod'))).toBeCloseTo(0.4536, 3);
    expect(molalityOf(byId<PointItem>('frostmark-sjor'))).toBeCloseTo(0.575, 3);
  });

  it('names the change given as the point, a forgotten i, the drop and the kelvin', () => {
    expect(numberSlip(byId('sudumark-bensen'), 0.835)).toMatch(/hækkunin/);
    expect(numberSlip(byId('frostmark-sjor'), -1.07)).toMatch(/i = 2/);
    expect(numberSlip(byId('frostmark-cacl2'), 0.208)).toMatch(/lækkunin/);
    expect(numberSlip(byId('raoult-thvagefni'), 0.35)).toMatch(/lækkun gufunar/);
    expect(numberSlip(byId('osmosa-glukosi'), 0.3 * 0.08206 * 37)).toMatch(/kelvin/);
  });

  it('keeps one right option per choice item, each wrong one with its slip', () => {
    for (const item of LAUSNIR_ITEMS) {
      if (item.kind !== 'val') continue;
      expect(answerOf(item)).toBe(item.options[0].text);
      for (const o of item.options.slice(1)) expect(o.slip, o.text).toBeTruthy();
    }
  });

  it('shows working for every item and names the book', () => {
    for (const item of LAUSNIR_ITEMS) {
      expect(working(item).length).toBeGreaterThan(0);
      expect(item.source).toMatch(/kafli 11, „Samþynningareiginleikar“/);
    }
  });
});
