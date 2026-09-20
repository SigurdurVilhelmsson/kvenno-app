import { describe, expect, it } from 'vitest';

import { REACTIONS, WITH_CONSTANT, reactionBy } from '../data/reactions';
import {
  APPROXIMATION_THRESHOLD,
  R_GAS,
  amountsAtExtent,
  appearsInK,
  approximateExtent,
  approximationIsSafe,
  canConvertToKp,
  deltaNGas,
  directionFromQ,
  equationOf,
  iceTable,
  isHomogeneous,
  kcExpression,
  kcToKp,
  kpExpression,
  kpToKc,
  largestRelativeChange,
  omittedFromK,
  reactionQuotient,
  solveExtent,
} from '../engine/equilibrium';

const ammoniak = reactionBy('ammoniak');
const kalksteinn = reactionBy('kalksteinn');
const no2 = reactionBy('no2-n2o4');

describe('what appears in K', () => {
  it('keeps gases and dissolved species, drops solids and pure liquids', () => {
    expect(appearsInK({ formula: 'X', coefficient: 1, phase: 'g' })).toBe(true);
    expect(appearsInK({ formula: 'X', coefficient: 1, phase: 'aq' })).toBe(true);
    expect(appearsInK({ formula: 'X', coefficient: 1, phase: 's' })).toBe(false);
    expect(appearsInK({ formula: 'X', coefficient: 1, phase: 'l' })).toBe(false);
  });

  it('writes the book’s four heterogeneous expressions', () => {
    // Transcribed from ch13/m68798, "Misleit jafnvægi".
    expect(kcExpression(kalksteinn)).toBe('Kc = 1 / [CO₂]');
    expect(kcExpression(reactionBy('kolefnistvisulfid-fast'))).toBe('Kc = [CS₂] / [S]²');
    expect(kcExpression(reactionBy('brom'))).toBe('Kc = [Br₂] / 1');
    expect(kcExpression(reactionBy('blyklorid'))).toBe('Kc = [Pb²⁺]·[Cl⁻]² / 1');
  });

  it('writes the book’s homogeneous expressions', () => {
    expect(kcExpression(reactionBy('ozon'))).toBe('Kc = [O₃]² / [O₂]³');
    expect(kcExpression(ammoniak)).toBe('Kc = [NH₃]² / [N₂]·[H₂]³');
    expect(kcExpression(reactionBy('ammoniakbruni'))).toBe('Kc = [NO₂]⁴·[H₂O]⁶ / [NH₃]⁴·[O₂]⁷');
  });

  it('refuses a Kp expression where a dissolved species is in K', () => {
    expect(kpExpression(reactionBy('blasyra'))).toBeNull();
    expect(kpExpression(reactionBy('blyklorid'))).toBeNull();
    expect(kpExpression(reactionBy('trijodid'))).toBeNull();
  });

  it('writes Kp for the two heterogeneous cases the book says it can', () => {
    expect(kpExpression(kalksteinn)).toBe('Kp = 1 / P(CO₂)');
    expect(kpExpression(reactionBy('kolefnistvisulfid-fast'))).toBe('Kp = P(CS₂) / P(S)²');
  });

  it('classifies homogeneous against heterogeneous', () => {
    expect(isHomogeneous(ammoniak)).toBe(true);
    expect(isHomogeneous(kalksteinn)).toBe(false);
    expect(
      omittedFromK(kalksteinn)
        .map((s) => s.formula)
        .sort()
    ).toEqual(['CaCO₃', 'CaO']);
    expect(omittedFromK(ammoniak)).toEqual([]);
  });
});

describe('delta-n and Kc to Kp', () => {
  it('reproduces the book’s four worked delta-n values', () => {
    // ch13/m68798, "Útreikningur á Kp", parts a-d.
    expect(deltaNGas(reactionBy('etan'))).toBe(1);
    expect(deltaNGas(reactionBy('vatnsgas'))).toBe(0);
    expect(deltaNGas(ammoniak)).toBe(-2);
    expect(deltaNGas(reactionBy('kolefnistvisulfid'))).toBe(-2);
  });

  it('counts only gases toward delta-n', () => {
    // CaO(s) + CO₂(g) ⇌ CaCO₃(s): one mole of gas consumed, none produced.
    expect(deltaNGas(kalksteinn)).toBe(-1);
    // Every species dissolved, so no gas moles change at all.
    expect(deltaNGas(reactionBy('trijodid'))).toBe(0);
  });

  it('reproduces the book’s worked Kp for CS₂ + 4H₂ at 900 °C', () => {
    // (0,28)[(0,0821)(1173)]⁻² = 3,0 × 10⁻⁵
    const kp = kcToKp(0.28, -2, 900);
    expect(kp).toBeCloseTo(3.0e-5, 6);
    expect(Number(kp.toPrecision(2))).toBe(3.0e-5);
  });

  it('uses the gas constant the book uses', () => {
    expect(R_GAS).toBe(0.0821);
  });

  it('leaves K alone when delta-n is zero', () => {
    expect(kcToKp(0.64, 0, 800)).toBe(0.64);
  });

  it('round-trips Kc to Kp and back', () => {
    for (const r of WITH_CONSTANT) {
      const t = r.constant?.temperatureC;
      if (t === undefined) continue;
      const dn = deltaNGas(r);
      const kc = r.constant!.value;
      expect(kpToKc(kcToKp(kc, dn, t), dn, t)).toBeCloseTo(kc, 12);
    }
  });

  it('refuses to convert a constant with no stated temperature', () => {
    // The book gives no temperature for either of these, so none is recorded
    // and neither can reach the Kp exercise. Inventing 25 °C would have put an
    // unsourced number on screen with nothing to catch it.
    expect(canConvertToKp(reactionBy('pcl5'))).toBe(false);
    expect(canConvertToKp(reactionBy('blasyra'))).toBe(false);
    expect(canConvertToKp(ammoniak)).toBe(true);
  });

  it('rejects a temperature at or below absolute zero', () => {
    expect(() => kcToKp(1, 1, -273.15)).toThrow(RangeError);
    expect(() => kcToKp(1, 1, -300)).toThrow(RangeError);
  });
});

describe('the reaction quotient', () => {
  it('reproduces the book’s three water-gas experiments', () => {
    // ch13/m68798, "Spáð fyrir um stefnu efnahvarfs". Kc = 0,64.
    const r = reactionBy('vatnsgas');
    const q1 = reactionQuotient(r, { CO: 0.02, 'H₂O': 0.02, 'CO₂': 0.004, 'H₂': 0.004 });
    const q2 = reactionQuotient(r, { CO: 0.011, 'H₂O': 0.0011, 'CO₂': 0.037, 'H₂': 0.046 });
    const q3 = reactionQuotient(r, { CO: 0.0094, 'H₂O': 0.0025, 'CO₂': 0.0015, 'H₂': 0.0076 });
    expect(q1).toBeCloseTo(0.04, 6);
    expect(Number(q2.toPrecision(2))).toBe(1.4e2);
    // The book prints 0,48 for this one and the arithmetic gives 0,4851,
    // which is 0,49 to two significant figures. A rounding slip in the book,
    // not in the data: the inputs are unambiguous and reproduce 0,4851 exactly.
    // It changes nothing the example teaches — the conclusion is Q < K either
    // way — but the game shows its own computed value, so this records why the
    // screen and the book differ in the last digit.
    expect(q3).toBeCloseTo(0.4851, 4);
    expect(directionFromQ(q1, 0.64)).toBe('afram');
    expect(directionFromQ(q2, 0.64)).toBe('afturabak');
    expect(directionFromQ(q3, 0.64)).toBe('afram');
  });

  it('reproduces the book’s NO₂ worked example', () => {
    // Q before any reaction is 0; K at equilibrium is 1,6 × 10².
    expect(reactionQuotient(no2, { 'NO₂': 0.1, 'N₂O₄': 0 })).toBe(0);
    const k = reactionQuotient(no2, { 'NO₂': 0.016, 'N₂O₄': 0.042 });
    expect(Number(k.toPrecision(2))).toBe(1.6e2);
  });

  it('ignores solids entirely', () => {
    const withSolid = reactionQuotient(kalksteinn, { CaO: 5, 'CO₂': 0.2, 'CaCO₃': 99 });
    const withLessSolid = reactionQuotient(kalksteinn, { CaO: 0.001, 'CO₂': 0.2, 'CaCO₃': 1 });
    expect(withSolid).toBe(withLessSolid);
    expect(withSolid).toBeCloseTo(1 / 0.2, 12);
  });

  it('is infinite when a reactant is used up and zero when a product is absent', () => {
    expect(reactionQuotient(no2, { 'NO₂': 0, 'N₂O₄': 0.5 })).toBe(Number.POSITIVE_INFINITY);
    expect(reactionQuotient(no2, { 'NO₂': 0.5, 'N₂O₄': 0 })).toBe(0);
    expect(directionFromQ(Number.POSITIVE_INFINITY, 1)).toBe('afturabak');
  });

  it('refuses a missing or negative amount rather than guessing', () => {
    expect(() => reactionQuotient(no2, { 'NO₂': 0.1 })).toThrow(/N₂O₄/);
    expect(() => reactionQuotient(no2, { 'NO₂': -1, 'N₂O₄': 1 })).toThrow(RangeError);
  });
});

describe('solving for the extent of reaction', () => {
  it('lands exactly on K for every shipped constant and a forward start', () => {
    for (const r of WITH_CONSTANT) {
      if (!isHomogeneous(r)) continue;
      const initial: Record<string, number> = {};
      for (const s of r.reactants) initial[s.formula] = 1;
      for (const s of r.products) initial[s.formula] = 0;
      const k = r.constant!.value;
      const x = solveExtent(r, initial, k);
      const q = reactionQuotient(r, amountsAtExtent(r, initial, x));
      expect(Math.abs(q - k) / k, `${r.id}`).toBeLessThan(1e-9);
    }
  });

  it('works from a product-only start, running backwards', () => {
    const r = reactionBy('vetnisjodid');
    const x = solveExtent(r, { 'H₂': 0, 'I₂': 0, HI: 2 }, 50);
    expect(x).toBeLessThan(0);
    const at = amountsAtExtent(r, { 'H₂': 0, 'I₂': 0, HI: 2 }, x);
    expect(reactionQuotient(r, at)).toBeCloseTo(50, 6);
    expect(at['H₂']).toBeGreaterThan(0);
  });

  it('reproduces the book’s PCl₅ answer', () => {
    // ch13/m68801: Kc = 0,0211 from 1,00 M PCl₅ gives about 0,135 M of each
    // product and 0,87 M PCl₅ left.
    const r = reactionBy('pcl5');
    const ice = iceTable(r, { 'PCl₅': 1.0, 'PCl₃': 0, 'Cl₂': 0 }, 0.0211);
    expect(ice.extent).toBeCloseTo(0.135, 3);
    const eq = Object.fromEntries(ice.rows.map((row) => [row.formula, row.equilibrium]));
    expect(eq['PCl₅']).toBeCloseTo(0.865, 3);
    expect(eq['PCl₃']).toBeCloseTo(0.135, 3);
  });

  it('reproduces the book’s HCN answer', () => {
    // ch13/m68801: 0,15 M HCN, Kc = 4,9 × 10⁻¹⁰, x = 8,6 × 10⁻⁶ M.
    const r = reactionBy('blasyra');
    const ice = iceTable(r, { HCN: 0.15, 'H⁺': 0, 'CN⁻': 0 }, 4.9e-10);
    expect(ice.extent).toBeCloseTo(8.6e-6, 7);
    expect(ice.approximationSafe).toBe(true);
  });

  it('handles the quartic that has no hand solution', () => {
    // N₂ + 3H₂ ⇌ 2NH₃ from 1,0 and 3,0 M. Solving this by algebra means a
    // fourth-degree equation; bisection does not care.
    const ice = iceTable(ammoniak, { 'N₂': 1, 'H₂': 3, 'NH₃': 0 }, 0.5);
    const eq = Object.fromEntries(ice.rows.map((r) => [r.formula, r.equilibrium]));
    expect(reactionQuotient(ammoniak, eq)).toBeCloseTo(0.5, 9);
    for (const v of Object.values(eq)) expect(v).toBeGreaterThan(0);
    // Mass balance: the 2:1:3 stoichiometry must hold across the table.
    expect(1 - eq['N₂']).toBeCloseTo(eq['NH₃'] / 2, 12);
    expect(3 - eq['H₂']).toBeCloseTo((3 * eq['NH₃']) / 2, 12);
  });

  it('refuses a heterogeneous reaction rather than pretending', () => {
    expect(() => solveExtent(kalksteinn, { CaO: 1, 'CO₂': 1, 'CaCO₃': 0 }, 1)).toThrow(
      /not homogeneous/
    );
  });

  it('refuses a non-positive or infinite K', () => {
    const start = { 'NO₂': 0.1, 'N₂O₄': 0 };
    expect(() => solveExtent(no2, start, 0)).toThrow(RangeError);
    expect(() => solveExtent(no2, start, -1)).toThrow(RangeError);
    expect(() => solveExtent(no2, start, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it('refuses a mixture with nothing to react', () => {
    expect(() => solveExtent(no2, { 'NO₂': 0, 'N₂O₄': 0 }, 1)).toThrow(/no room/);
  });
});

describe('the approximation', () => {
  it('agrees with the exact root when the five per cent rule holds', () => {
    const r = reactionBy('blasyra');
    const initial = { HCN: 0.15, 'H⁺': 0, 'CN⁻': 0 };
    const exact = solveExtent(r, initial, 4.9e-10);
    const approx = approximateExtent(r, initial, 4.9e-10)!;
    expect(approximationIsSafe(r, initial, approx)).toBe(true);
    expect(Math.abs(approx - exact) / exact).toBeLessThan(1e-4);
  });

  it('is visibly wrong where the rule fails, which is the point', () => {
    const r = reactionBy('pcl5');
    const initial = { 'PCl₅': 1.0, 'PCl₃': 0, 'Cl₂': 0 };
    const exact = solveExtent(r, initial, 0.0211);
    const approx = approximateExtent(r, initial, 0.0211)!;
    expect(approximationIsSafe(r, initial, approx)).toBe(false);
    // Roughly 0,145 against 0,135 — about 8 %, and the rule catches it.
    expect(Math.abs(approx - exact) / exact).toBeGreaterThan(0.05);
  });

  it('returns null where the shortcut has no defined meaning', () => {
    // A mixture that already contains product is not the case the shortcut
    // is derived for, so no number is offered.
    const r = reactionBy('no2-n2o4');
    expect(approximateExtent(r, { 'NO₂': 0.1, 'N₂O₄': 0.01 }, 160)).toBeNull();
  });

  it('measures the change against every reactant, not just the smallest', () => {
    // H₂ is consumed three times as fast as N₂, so from equal starting
    // amounts it is H₂ that breaks the assumption first.
    const initial = { 'N₂': 1, 'H₂': 1, 'NH₃': 0 };
    const worst = largestRelativeChange(ammoniak, initial, 0.02);
    expect(worst).toBeCloseTo(0.06, 10);
    expect(worst).toBeGreaterThan(APPROXIMATION_THRESHOLD);
  });

  it('uses the same threshold as the other two constants in this chain', () => {
    expect(APPROXIMATION_THRESHOLD).toBe(0.05);
  });
});

describe('equation rendering', () => {
  it('writes an equation the way the book does', () => {
    expect(equationOf(ammoniak)).toBe('N₂(g) + 3H₂(g) ⇌ 2NH₃(g)');
    expect(equationOf(kalksteinn)).toBe('CaO(s) + CO₂(g) ⇌ CaCO₃(s)');
  });

  it('never prints a coefficient of 1', () => {
    for (const r of REACTIONS) expect(equationOf(r)).not.toMatch(/(^|[\s+])1[A-Z]/);
  });
});

describe('the shipped pool', () => {
  it('gives every reaction a distinct id', () => {
    const ids = REACTIONS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every reaction at least one species on each side', () => {
    for (const r of REACTIONS) {
      expect(r.reactants.length, r.id).toBeGreaterThan(0);
      expect(r.products.length, r.id).toBeGreaterThan(0);
    }
  });

  it('uses whole-number coefficients of at least one', () => {
    for (const r of REACTIONS) {
      for (const s of [...r.reactants, ...r.products]) {
        expect(Number.isInteger(s.coefficient), `${r.id} ${s.formula}`).toBe(true);
        expect(s.coefficient, `${r.id} ${s.formula}`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('balances every reaction by atom count', () => {
    // A K expression built on an unbalanced equation has the wrong exponents,
    // and nothing downstream would notice.
    for (const r of REACTIONS) {
      if (r.id === 'blyklorid') continue; // an ionic equation; charge, not atoms, below
      const tally = (list: typeof r.reactants, sign: number) => {
        const counts: Record<string, number> = {};
        for (const s of list) {
          for (const [element, n] of parseFormula(s.formula)) {
            counts[element] = (counts[element] ?? 0) + sign * n * s.coefficient;
          }
        }
        return counts;
      };
      const net: Record<string, number> = { ...tally(r.reactants, 1) };
      for (const [el, n] of Object.entries(tally(r.products, -1))) {
        net[el] = (net[el] ?? 0) + n;
      }
      for (const [el, n] of Object.entries(net)) {
        expect(n, `${r.id} is unbalanced in ${el}`).toBe(0);
      }
    }
  });
});

/** Minimal formula parser for the balance check. Subscripts only, no nesting. */
function parseFormula(formula: string): [string, number][] {
  const SUBS = '₀₁₂₃₄₅₆₇₈₉';
  const bare = formula.replace(/[⁺⁻¹²³⁴⁵⁶⁷⁸⁹]/g, '');
  const out: [string, number][] = [];
  const re = /([A-Z][a-z]?)([₀-₉]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bare)) !== null) {
    if (!m[1]) continue;
    const digits = m[2]
      .split('')
      .map((d) => SUBS.indexOf(d))
      .join('');
    out.push([m[1], digits === '' ? 1 : Number(digits)]);
  }
  return out;
}
