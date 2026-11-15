import { describe, expect, it } from 'vitest';

import { molarMassOf } from '@shared/utils';

import { BLONDUR_PROBLEMS, fig3, shownAnswer } from '../data/blondur';
import {
  BLONDUR_TOLERANCE,
  WATER_VAPOUR_TORR,
  kelvin,
  moleFractions,
  pressureOf,
  volumeOf,
  waterVapourTorr,
  within,
} from '../engine/blondur';

const byId = (id: string) => {
  const p = BLONDUR_PROBLEMS.find((q) => q.id === id);
  if (!p) throw new Error(id);
  return p;
};

describe('Gasblöndur engine', () => {
  it('uses the game’s own kelvin rule, K = °C + 273', () => {
    expect(kelvin(25)).toBe(298);
  });

  it('adds partial pressures: equal flasks at 300, 450 and 600 kPa make 1350 kPa (the book)', () => {
    // Three equal flasks mixed into one of the same size: each gas keeps its own pressure.
    const T = 298;
    const V = 10;
    const kPa = (n: number) => pressureOf(n, V, T) * 101.325;
    const n = (p: number) => (p / 101.325) * (V / (0.08206 * T));
    expect(kPa(n(300) + n(450) + n(600))).toBeCloseTo(1350, 6);
  });

  it('gives mole fractions that sum to 1, and none for an empty flask', () => {
    const x = moleFractions([2.83, 8.41]);
    expect(x[0] + x[1]).toBeCloseTo(1, 12);
    expect(moleFractions([0, 0])).toEqual([0, 0]);
  });

  it('transcribes the book’s vapour pressures and refuses a temperature it lacks', () => {
    expect(waterVapourTorr(26)).toBe(25.2);
    expect(waterVapourTorr(29)).toBe(30.0);
    expect(Object.keys(WATER_VAPOUR_TORR)).toHaveLength(13);
    expect(() => waterVapourTorr(31)).toThrow();
  });

  it('volumeOf and pressureOf invert each other', () => {
    expect(volumeOf(0.5, 300, pressureOf(0.5, 7, 300))).toBeCloseTo(7, 12);
  });
});

describe('Gasblöndur problems', () => {
  it('poses eight, each with a unique id, a source in ch. 9 and a worked solution', () => {
    expect(BLONDUR_PROBLEMS).toHaveLength(8);
    expect(new Set(BLONDUR_PROBLEMS.map((p) => p.id)).size).toBe(8);
    for (const p of BLONDUR_PROBLEMS) {
      expect(p.source).toMatch(/^Kafli 9/);
      expect(p.steps.length).toBeGreaterThan(1);
      expect(p.steps.at(-1)).toContain(shownAnswer(p));
    }
  });

  it('reproduces the book’s answers within the graded tolerance', () => {
    const book: Record<string, number> = {
      heildarthrystingur: 1.137,
      svaefingargas: 48.3,
      massablanda: 1.87,
      'argon-yfir-vatni': 724.8,
      'thurt-surefni': 0.537,
      etylen: 51.0,
      gallin: 4.94,
      brennisteinn: 1.3e3,
    };
    for (const p of BLONDUR_PROBLEMS) {
      expect(within(book[p.id], p.answer), p.id).toBe(true);
    }
  });

  it('rejects 0, double, half and NaN on every problem', () => {
    for (const p of BLONDUR_PROBLEMS) {
      for (const wrong of [0, 2 * p.answer, p.answer / 2, Number.NaN]) {
        expect(within(wrong, p.answer), `${p.id} ${wrong}`).toBe(false);
      }
    }
  });

  it('never lets a slip be graded right, and every slip is a distinct wrong answer', () => {
    for (const p of BLONDUR_PROBLEMS) {
      expect(p.slips.length, p.id).toBeGreaterThan(0);
      for (const s of p.slips) {
        expect(within(s.value, p.answer), `${p.id}: ${s.text}`).toBe(false);
        expect(Math.abs(s.value - p.answer) / p.answer).toBeGreaterThan(3 * BLONDUR_TOLERANCE);
      }
    }
  });

  it('takes hydrogen gas as H₂, not H, in the mixture given in grams', () => {
    const p = byId('massablanda');
    expect(p.steps[0]).toContain(`${String(molarMassOf('H₂').toFixed(3)).replace('.', ',')} g/mól`);
  });

  it('prints the vapour pressure it subtracts, at the temperature the problem states', () => {
    expect(byId('argon-yfir-vatni').given.join(' ')).toContain(
      'Gufunarþrýstingur vatns við 26 °C: 25,2 torr'
    );
    expect(byId('thurt-surefni').given.join(' ')).toContain('30,0 torr');
  });

  it('prints three significant figures, in standard form from 1000', () => {
    expect(fig3(1.13563)).toBe('1,14');
    expect(fig3(0.538)).toBe('0,538');
    expect(fig3(51)).toBe('51,0');
    expect(fig3(724.8)).toBe('725');
    expect(fig3(1303.06)).toBe('1,30 × 10³');
  });
});
