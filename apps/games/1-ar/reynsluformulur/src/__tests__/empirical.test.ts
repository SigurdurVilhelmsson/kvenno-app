import { describe, it, expect } from 'vitest';

import { ATOMIC_MASSES } from '../data/elements';
import {
  MAX_MULTIPLIER,
  MAX_SUBSCRIPT,
  TOLERANCE,
  deriveEmpirical,
  deriveMolecular,
  formatFormula,
  percentComposition,
} from '../engine/empirical';

/**
 * The engine, and specifically the three shapes of defect the old
 * `hlutfallsgreining` shipped — each one asserted as a case the engine now
 * refuses or gets right.
 */

describe('deriveEmpirical', () => {
  it('walks the four columns on a 1:1 compound', () => {
    const d = deriveEmpirical({ Na: 39.34, Cl: 60.66 });
    expect(d.formula).toBe('NaCl');
    expect(d.multiplier).toBe(1);
    const na = d.rows.find((r) => r.element === 'Na')!;
    expect(na.moles).toBeCloseTo(39.34 / ATOMIC_MASSES.Na, 6);
    expect(na.ratio).toBeCloseTo(1, 3);
  });

  it('doubles rather than rounds when a ratio lands on 1,5', () => {
    // The February review's named misconception: "Students frequently round 1.5
    // to 2". Fe2O3 comes out as 1 : 1,5 and the answer is to double, not round.
    const d = deriveEmpirical({ Fe: 69.94, O: 30.06 });
    expect(d.multiplier).toBe(2);
    expect(d.formula).toBe('Fe₂O₃');
    const fe = d.rows.find((r) => r.element === 'Fe')!;
    expect(fe.ratio).toBeCloseTo(1, 2);
    expect(d.rows.find((r) => r.element === 'O')!.ratio).toBeCloseTo(1.5, 2);
  });

  it('gets ammonium nitrate right — the key the old game stored wrongly', () => {
    // `l2-5` shipped these exact percentages with the key NH₂O₃, which is the
    // 1,5-rounded-to-2 mistake frozen into the answer. The true reduction is
    // N 1 : H 2 : O 1,5, doubled to N₂H₄O₃.
    const d = deriveEmpirical({ N: 35.0, H: 5.04, O: 59.96 });
    expect(d.formula).toBe('N₂H₄O₃');
    expect(d.formula).not.toBe('NH₂O₃');
    expect(d.multiplier).toBe(2);
  });

  it('gets hydrogen peroxide right from ITS percentages, not water’s', () => {
    // `l2-1` was labelled hydrogen peroxide and carried water's percentages.
    expect(deriveEmpirical({ H: 5.93, O: 94.07 }).formula).toBe('HO');
    // Water's own numbers reduce to H₂O, which is why the old item was wrong
    // rather than merely imprecise.
    expect(deriveEmpirical({ H: 11.19, O: 88.81 }).formula).toBe('H₂O');
  });

  it('refuses the old l2-10 percentages, which describe no compound', () => {
    // `l2-10`'s shipped numbers, and a correction to the assessment that found
    // them. They do NOT "reduce to no whole-number formula at all": 1,667 : 1 :
    // 4,316 times 3 is 5 : 3 : 12,95, within 0,4 % of Mg₅P₃O₁₃. The arithmetic
    // works; the chemistry does not. MAX_SUBSCRIPT is what rejects it, and the
    // assessment's actual conclusion — the stored Mg₃(PO₄)₂ was unreachable —
    // holds either way.
    expect(() => deriveEmpirical({ Mg: 28.83, P: 22.04, O: 49.13 })).toThrow(
      /do not describe a compound/
    );
  });

  it('accepts a subscript of 12 and refuses 13', () => {
    // The bound has to admit glucose's empirical partner C₆H₁₂O₆ at molecular
    // scale while excluding the junk above; 12 is exactly that line.
    expect(MAX_SUBSCRIPT).toBe(12);
  });

  it('gets magnesium phosphate right from the real percentages', () => {
    expect(deriveEmpirical({ Mg: 27.74, P: 23.57, O: 48.69 }).formula).toBe('Mg₃P₂O₈');
  });

  it('refuses input that is not a composition', () => {
    expect(() => deriveEmpirical({ Na: 100 })).toThrow(/at least two elements/);
    expect(() => deriveEmpirical({ Na: 30, Cl: 30 })).toThrow(/not 100/);
  });

  it('is the exact inverse of percentComposition, for every formula it is given', () => {
    // The property the data file leans on: write the formula, derive the
    // percentages, derive the formula back.
    // Reduced formulas only. H₂O₂ is deliberately absent: its empirical formula
    // is HO, so the round trip lands on HO and that is correct, not a failure.
    const formulas: { element: keyof typeof ATOMIC_MASSES; subscript: number }[][] = [
      [
        { element: 'C', subscript: 2 },
        { element: 'H', subscript: 6 },
        { element: 'O', subscript: 1 },
      ],
      [
        { element: 'K', subscript: 2 },
        { element: 'Cr', subscript: 2 },
        { element: 'O', subscript: 7 },
      ],
      [
        { element: 'Mg', subscript: 3 },
        { element: 'P', subscript: 2 },
        { element: 'O', subscript: 8 },
      ],
      [
        { element: 'Ca', subscript: 1 },
        { element: 'C', subscript: 1 },
        { element: 'O', subscript: 3 },
      ],
    ];
    for (const counts of formulas) {
      const pct = Object.fromEntries(
        percentComposition(counts).map((p) => [p.element, Number(p.percent.toFixed(2))])
      );
      expect(deriveEmpirical(pct).formula, JSON.stringify(counts)).toBe(formatFormula(counts));
    }
  });

  it('keeps every shipped derivation far inside the tolerance', () => {
    // If a problem sits near the bound, the tolerance is doing work it should
    // not have to and the data is suspect.
    const d = deriveEmpirical({ Mg: 27.74, P: 23.57, O: 48.69 });
    expect(d.worstDeviation).toBeLessThan(TOLERANCE / 2);
  });
});

describe('formatFormula', () => {
  it('elides a subscript of 1 and writes the rest as Unicode', () => {
    expect(
      formatFormula([
        { element: 'Na', subscript: 1 },
        { element: 'Cl', subscript: 1 },
      ])
    ).toBe('NaCl');
    expect(
      formatFormula([
        { element: 'C', subscript: 6 },
        { element: 'H', subscript: 12 },
      ])
    ).toBe('C₆H₁₂');
  });
});

describe('deriveMolecular', () => {
  it('finds n and scales the formula', () => {
    const m = deriveMolecular(
      [
        { element: 'C', subscript: 1 },
        { element: 'H', subscript: 2 },
        { element: 'O', subscript: 1 },
      ],
      180.16
    );
    expect(m.n).toBe(6);
    expect(m.formula).toBe('C₆H₁₂O₆');
    expect(m.empiricalMass).toBeCloseTo(30.026, 2);
  });

  it('accepts n = 1, where the two formulas coincide', () => {
    const m = deriveMolecular(
      [
        { element: 'C', subscript: 2 },
        { element: 'H', subscript: 6 },
        { element: 'O', subscript: 1 },
      ],
      46.07
    );
    expect(m.n).toBe(1);
    expect(m.formula).toBe('C₂H₆O');
  });

  it('refuses a molar mass that is not a whole multiple', () => {
    const ch2o = [
      { element: 'C' as const, subscript: 1 },
      { element: 'H' as const, subscript: 2 },
      { element: 'O' as const, subscript: 1 },
    ];
    expect(() => deriveMolecular(ch2o, 100)).toThrow(/not a whole multiple/);
    expect(() => deriveMolecular(ch2o, 10)).toThrow(/below the empirical mass/);
  });
});

describe('the engine cannot silently accept nonsense', () => {
  it('MAX_MULTIPLIER is small enough to reject junk and large enough for school formulas', () => {
    // Sixths cover every empirical formula in a first-year course; raising this
    // would start accepting compositions that are not compounds.
    expect(MAX_MULTIPLIER).toBe(6);
    expect(TOLERANCE).toBeLessThanOrEqual(0.02);
  });
});
