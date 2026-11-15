import { describe, expect, it } from 'vitest';

import { answerOf, numberSlip, numericAnswer, working } from '../components/FasarScreen';
import { FASAR_ITEMS, type NumericItem } from '../data/fasar';
import {
  closeTo,
  heatSteps,
  heatingCurve,
  stateAfter,
  totalHeat,
  vaporisationEnthalpy,
} from '../engine/fasar';

const numeric = FASAR_ITEMS.filter((i): i is NumericItem => i.kind !== 'val');

describe('the engine', () => {
  it('works the book’s heating curve in its five steps', () => {
    const steps = heatSteps(135, -15, 120);
    expect(steps.map((s) => s.kind)).toEqual(['hitun', 'hamskipti', 'hitun', 'hamskipti', 'hitun']);
    expect(steps.map((s) => Number(s.q.toPrecision(3)))).toEqual([4.23, 45, 56.5, 305, 4.97]);
  });

  it('turns every sign when the water cools the same way back', () => {
    expect(totalHeat(94, -30, 80)).toBeCloseTo(-totalHeat(94, 80, -30), 9);
    expect(heatSteps(94, 80, -30).every((s) => s.q < 0)).toBe(true);
  });

  it('stands still on a plateau while the phases change', () => {
    const curve = heatingCurve(100, -20, 120);
    const start = curve[1].q;
    const end = curve[2].q;
    const half = stateAfter(100, -20, 120, (start + end) / 2);
    expect(half.t).toBe(0);
    expect(half.ice).toBeCloseTo(50, 6);
    expect(half.water).toBeCloseTo(50, 6);
    expect(stateAfter(100, -20, 120, curve.at(-1)!.q).steam).toBe(100);
  });

  it('gives the same ΔH whichever point is first', () => {
    expect(vaporisationEnthalpy(63.5, 53.3, 20, 5.95)).toBeCloseTo(
      vaporisationEnthalpy(20, 5.95, 63.5, 53.3),
      9
    );
  });
});

describe('the items', () => {
  it('asks ten, five of them numbers', () => {
    expect(FASAR_ITEMS).toHaveLength(10);
    expect(numeric).toHaveLength(5);
  });

  it.each(numeric.map((i) => [i.id, i] as const))(
    '%s agrees with the book and refuses 0, its negative, double and half',
    (_, item) => {
      const key = numericAnswer(item);
      expect(closeTo(item.bookAnswer, key), `${item.bookAnswer} against ${key}`).toBe(true);
      for (const wrong of [0, -key, 2 * key, key / 2]) expect(closeTo(wrong, key)).toBe(false);
    }
  );

  it('keeps one right option per choice item, each wrong one with its slip', () => {
    for (const item of FASAR_ITEMS) {
      if (item.kind !== 'val') continue;
      expect(answerOf(item)).toBe(item.options[0].text);
      expect(new Set(item.options.map((o) => o.text)).size).toBe(item.options.length);
      for (const o of item.options.slice(1)) expect(o.slip, o.text).toBeTruthy();
    }
  });

  it('names the forgotten plateau, the missing mole and the J', () => {
    const heating = numeric.find((i) => i.id === 'vatn-hitun')!;
    expect(numberSlip(heating, 65.7)).toMatch(/aðeins hitunina/);
    expect(numberSlip(heating, 415.4 - 304.7)).toMatch(/Gufunin gleymdist/);
    const cooling = numeric.find((i) => i.id === 'vatn-kolnun')!;
    expect(numberSlip(cooling, -68.7)).toMatch(/jákvæð tala/);
    expect(numberSlip(heating, 415.4 - 45.0)).toMatch(/Bræðslan gleymdist/);
    const melt = numeric.find((i) => i.id === 'braedsla-ticl4')!;
    expect(numberSlip(melt, 263.1 * 9.37)).toMatch(/á mól/);
    const cc = numeric.find((i) => i.id === 'gufunarvermi-etanol')!;
    expect(numberSlip(cc, 41357)).toMatch(/J\/mól/);
  });

  it('shows working for every item and names the book', () => {
    for (const item of FASAR_ITEMS) {
      expect(working(item).length).toBeGreaterThan(0);
      expect(item.source).toMatch(/kafli 10, „(Fasabreytingar|Fasarit)“/);
    }
  });
});
