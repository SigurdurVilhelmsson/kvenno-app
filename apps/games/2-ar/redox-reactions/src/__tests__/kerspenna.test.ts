import { describe, expect, it } from 'vitest';

import { ELECTRODE_POTENTIALS } from '@shared/data/electrode-potentials';

import { answerOf, numberSlip, working } from '../components/KerspennaScreen';
import { KANNA_COUPLES, KER_ITEMS, coupleLabel } from '../data/kerspenna';
import {
  closeTo,
  deltaG,
  ecell,
  electronsOf,
  electronsTransferred,
  imbalance,
  isBalanced,
  spontaneousCell,
} from '../engine/kerspenna';

describe('cell potentials from the book’s table', () => {
  it('gives the Daniell cell 1,10 V and its ΔG° near −212 kJ', () => {
    const cell = spontaneousCell('Zn2+/Zn', 'Cu2+/Cu');
    expect(cell).toEqual({ cathode: 'Cu2+/Cu', anode: 'Zn2+/Zn' });
    expect(ecell(cell)).toBeCloseTo(1.0988, 4);
    expect(electronsTransferred(cell)).toBe(2);
    expect(deltaG(cell)).toBeCloseTo(-212.0, 1);
  });

  it('puts the higher E° at the katóða whatever order the couples come in', () => {
    expect(spontaneousCell('Cu2+/Cu', 'Ag+/Ag')).toEqual(spontaneousCell('Ag+/Ag', 'Cu2+/Cu'));
    for (const a of KANNA_COUPLES) {
      for (const b of KANNA_COUPLES) {
        expect(ecell(spontaneousCell(a, b))).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('reads n from the table and takes the least common multiple', () => {
    expect(electronsOf('Ag+/Ag')).toBe(1);
    expect(electronsOf('Al3+/Al')).toBe(3);
    expect(electronsTransferred({ cathode: 'Ni2+/Ni', anode: 'Al3+/Al' })).toBe(6);
    expect(electronsTransferred({ cathode: 'Fe3+/Fe2+', anode: 'I2/I-' })).toBe(2);
  });

  it('grades a potential to 0,011 V and an energy to 1 %', () => {
    expect(closeTo(1.1, 1.0988, 'V')).toBe(true);
    expect(closeTo(1.12, 1.0988, 'V')).toBe(false);
    expect(closeTo(-212.3, -212.03, 'kJ')).toBe(true);
    expect(closeTo(-106, -212.03, 'kJ')).toBe(false);
  });
});

describe('the balance check', () => {
  it('passes every half-reaction in the table', () => {
    for (const [couple, row] of Object.entries(ELECTRODE_POTENTIALS)) {
      expect(isBalanced(row.halfReaction), couple).toBe(true);
    }
  });

  it('names what is out of balance', () => {
    expect(imbalance('MnO₄⁻ + 8H⁺ + 3e⁻ → Mn²⁺ + 4H₂O')).toEqual({ atoms: [], charge: true });
    expect(imbalance('MnO₄⁻ + 4H⁺ + 5e⁻ → Mn²⁺ + 2H₂O').atoms).toEqual(['O']);
    expect(isBalanced('Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s)')).toBe(true);
  });
});

describe('the data', () => {
  it('writes couples as a student reads them', () => {
    expect(coupleLabel('Cr2O72-/Cr3+')).toBe('Cr₂O₇²⁻/Cr³⁺');
    expect(coupleLabel('I2/I-')).toBe('I₂/I⁻');
    expect(coupleLabel('Ag+/Ag')).toBe('Ag⁺/Ag');
  });

  it.each(KER_ITEMS.map((i) => [i.id, i] as const))(
    '%s is answerable and consistent',
    (_, item) => {
      const key = answerOf(item);
      if (item.kind === 'halfhvarf') {
        const values = item.options.map((o) => o.value);
        expect(new Set(values).size).toBe(4);
        expect(values.filter((v) => v === key)).toHaveLength(1);
        for (const o of item.options) {
          expect(isBalanced(o.value), o.value).toBe(o.value === key);
          if (o.value !== key) expect(o.slip).toBeTruthy();
        }
      }
      if (item.kind === 'stefna' || item.kind === 'dg') {
        expect(isBalanced(item.equation), item.equation).toBe(true);
      }
      if (item.kind === 'ecell' || item.kind === 'dg') {
        expect(typeof key).toBe('number');
        // Every graded number refuses 0, its own negative, double and half.
        for (const wrong of [0, -(key as number), 2 * (key as number), (key as number) / 2]) {
          expect(
            closeTo(wrong, key as number, item.kind === 'ecell' ? 'V' : 'kJ'),
            `${wrong}`
          ).toBe(false);
        }
      }
      expect(working(item).length).toBeGreaterThan(0);
    }
  );

  it('asks one direction that is not sjálfgengt', () => {
    expect(KER_ITEMS.filter((i) => i.kind === 'stefna').map(answerOf)).toEqual(['Já', 'Nei', 'Já']);
  });

  it('names the slips it can tell', () => {
    const zn = KER_ITEMS.find((i) => i.id === 'ecell-zn-cu')!;
    expect(numberSlip(zn, -1.1)).toMatch(/Formerkið/);
    expect(numberSlip(zn, -0.42)).toMatch(/lagðir E° saman/);
    const dg = KER_ITEMS.find((i) => i.id === 'dg-zn-cu')!;
    expect(numberSlip(dg, -106.0)).toMatch(/n vantar/);
    expect(numberSlip(dg, 212)).toMatch(/Formerkið/);
    expect(numberSlip(dg, -212030)).toMatch(/í J/);
  });
});
