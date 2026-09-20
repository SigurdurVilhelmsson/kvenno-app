import { describe, it, expect } from 'vitest';

import { APPENDIX_D3_KSP } from '@shared/data/appendix-d';

import { COMMON_ION_PROBLEMS } from '../data/problems';
import { SALTS, DIVERGENT, AGREEING, saltBy } from '../data/salts';
import {
  commonIonApproximationIsSafe,
  dissolutionEquation,
  formatScientific,
  gradeScientific,
  kspExpression,
  kspFromSolubility,
  mixAndCompare,
  molarSolubility,
  precipitationOrder,
  solubilityWithCommonIon,
} from '../engine/ksp';

/**
 * The engine checked against chemistry, and the pool against the book.
 *
 * The properties below are the ones the old `solubility-equilibrium` violated,
 * plus the two that Table D.3 itself makes possible to get wrong.
 */

describe('molar solubility is the general formula, not the AB special case', () => {
  it.each([
    // s = √Ksp only when x = y = 1.
    ['AgCl', 1.342e-5],
    ['BaSO₄', 1.049e-5],
    // 1:2 — s = (Ksp/4)^(1/3). A student using √Ksp gets 6.2e-6, not 2.1e-4.
    ['CaF₂', 2.136e-4],
    // 2:1 — also (Ksp/4)^(1/3), and √Ksp would give 1.1e-6 against 6.7e-5.
    ['Ag₂CrO₄', 6.694e-5],
  ])('%s has molar solubility %f', (formula, expected) => {
    // Relative, not absolute: these values span 10⁻⁵ to 10⁻⁴ and an absolute
    // toBeCloseTo would be comparing against the fourth significant figure of
    // a number written to four.
    expect(molarSolubility(saltBy(formula)) / expected).toBeCloseTo(1, 3);
  });

  it('a 1:2 or 2:1 salt is never the square root of its Ksp', () => {
    // The single commonest error in this topic, asserted as a property so a
    // future simplification of the engine cannot reintroduce it.
    for (const salt of SALTS) {
      if (salt.x === 1 && salt.y === 1) continue;
      const wrong = Math.sqrt(salt.ksp);
      const right = molarSolubility(salt);
      expect(Math.abs(right - wrong) / right, `${salt.formula} collapsed to √Ksp`).toBeGreaterThan(
        0.1
      );
    }
  });

  it('round-trips through Ksp for every salt', () => {
    for (const salt of SALTS) {
      const s = molarSolubility(salt);
      expect(kspFromSolubility(s, salt.x, salt.y) / salt.ksp, salt.formula).toBeCloseTo(1, 9);
    }
  });

  it('refuses a non-positive constant rather than returning NaN', () => {
    expect(() => molarSolubility({ ksp: 0, x: 1, y: 1 })).toThrow(/positive/);
    expect(() => kspFromSolubility(0, 1, 1)).toThrow(/positive/);
  });
});

describe('the pool respects Table D.3', () => {
  it('every Ksp is read from the book, not restated', () => {
    // The whole point of the derive-don't-store design: there is no second copy
    // of any constant that could drift from the first.
    for (const salt of SALTS) {
      expect(salt.ksp, salt.formula).toBe(APPENDIX_D3_KSP[salt.formula].ksp);
      expect(salt.x).toBe(APPENDIX_D3_KSP[salt.formula].cation);
      expect(salt.y).toBe(APPENDIX_D3_KSP[salt.formula].anion);
    }
  });

  it('excludes every starred sulfide', () => {
    // Table D.3's footnote: those rows are for
    // MS(s) + H₂O(l) ⇌ M²⁺(aq) + HS⁻(aq) + OH⁻(aq), so their constant is a
    // three-species product and `molarSolubility` would return a meaningless
    // number that looks perfectly plausible on screen.
    for (const salt of SALTS) {
      const row = APPENDIX_D3_KSP[salt.formula] as { hydrolytic?: boolean };
      expect(row.hydrolytic, `${salt.formula} is a hydrolytic sulfide`).toBeUndefined();
    }
  });

  it('the hydrolytic flag is actually set on the rows that need it', () => {
    // Guards the guard: if the flag were dropped from D.3, the test above would
    // pass vacuously and a sulfide could enter the pool.
    for (const formula of ['CuS', 'PbS', 'ZnS', 'Ag₂S', 'HgS', 'CdS', 'CoS', 'MnS', 'NiS', 'SnS']) {
      const row = APPENDIX_D3_KSP[formula as keyof typeof APPENDIX_D3_KSP] as {
        hydrolytic?: boolean;
      };
      expect(row?.hydrolytic, `${formula} lost its footnote flag`).toBe(true);
    }
  });

  it('every divergent salt carries a written reason', () => {
    // Brown wins by ruling, but a compound whose Icelandic-appendix value
    // differs has to say so, because a student may well look it up there.
    expect(DIVERGENT.length).toBeGreaterThan(0);
    expect(DIVERGENT.length).toBeLessThan(SALTS.length / 2);
    for (const salt of DIVERGENT) {
      expect(AGREEING.has(salt.formula)).toBe(false);
    }
  });

  it('spans the three stoichiometries a Y3 student meets', () => {
    const shapes = new Set(SALTS.map((s) => `${s.x}:${s.y}`));
    expect(shapes.has('1:1')).toBe(true);
    expect(shapes.has('1:2')).toBe(true);
    expect(shapes.has('2:1')).toBe(true);
  });
});

describe('the rendered expressions', () => {
  it.each([
    ['AgCl', 'Ksp = [Ag⁺][Cl⁻]'],
    ['CaF₂', 'Ksp = [Ca²⁺][F⁻]²'],
    ['Ag₂CrO₄', 'Ksp = [Ag⁺]²[CrO₄²⁻]'],
  ])('%s expression', (formula, expected) => {
    expect(kspExpression(saltBy(formula))).toBe(expected);
  });

  it.each([
    ['AgCl', 'AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)'],
    ['CaF₂', 'CaF₂(s) ⇌ Ca²⁺(aq) + 2F⁻(aq)'],
    ['Ag₂CrO₄', 'Ag₂CrO₄(s) ⇌ 2Ag⁺(aq) + CrO₄²⁻(aq)'],
  ])('%s dissolution equation', (formula, expected) => {
    expect(dissolutionEquation(saltBy(formula))).toBe(expected);
  });

  it('keeps trailing zeros, because they are significant figures', () => {
    expect(formatScientific(1e-8)).toBe('1,0 × 10⁻⁸');
    expect(formatScientific(1.8e-10)).toBe('1,8 × 10⁻¹⁰');
    expect(formatScientific(8.3e-17, 2)).toBe('8,3 × 10⁻¹⁷');
    expect(formatScientific(1.342e-5, 3)).toBe('1,34 × 10⁻⁵');
  });
});

describe('the common-ion effect', () => {
  it('always suppresses solubility, never raises it', () => {
    for (const salt of SALTS) {
      const pure = molarSolubility(salt);
      for (const ion of ['cation', 'anion'] as const) {
        const { exact } = solubilityWithCommonIon(salt, ion, 0.01);
        expect(exact, `${salt.formula} ${ion}`).toBeLessThan(pure);
        expect(exact).toBeGreaterThan(0);
      }
    }
  });

  it('reduces to the pure-water value when there is no common ion', () => {
    for (const salt of SALTS) {
      const { exact } = solubilityWithCommonIon(salt, 'anion', 0);
      expect(exact / molarSolubility(salt), salt.formula).toBeCloseTo(1, 6);
    }
  });

  it('the approximation is safe wherever the game actually uses it', () => {
    // NOT a property of the whole pool — that claim was written first and is
    // false. PbCl₂ has a molar solubility of 1,6 × 10⁻² M, so in 0,010 M Pb²⁺
    // the salt supplies more of the common ion than the solution does and the
    // textbook approximation is out by 53 %. Grading one answer while a
    // student computes the other is exactly the syrufastinn trap, so the
    // shipped problems are held to the 5 % rule instead.
    for (const p of COMMON_ION_PROBLEMS) {
      const { safe, fraction } = commonIonApproximationIsSafe(
        saltBy(p.formula),
        p.ion,
        p.concentration
      );
      expect(safe, `${p.id} breaks the 5 % rule at ${(fraction * 100).toFixed(1)} %`).toBe(true);
      expect(Math.abs(p.approximate - p.exact) / p.exact).toBeLessThan(0.02);
    }
  });

  it('knows PbCl₂ is the case that breaks it', () => {
    // The rule-breaker, asserted explicitly so the guard above cannot be
    // dismissed as vacuous.
    const { safe, fraction } = commonIonApproximationIsSafe(saltBy('PbCl₂'), 'cation', 0.01);
    expect(safe).toBe(false);
    expect(fraction).toBeGreaterThan(0.5);
  });

  it('reproduces the worked AgCl case', () => {
    // AgCl in 0,10 M NaCl: s = Ksp/[Cl⁻] = 1,8 × 10⁻⁹, a 7500-fold suppression.
    const { exact } = solubilityWithCommonIon(saltBy('AgCl'), 'anion', 0.1);
    expect(exact).toBeCloseTo(1.8e-9, 12);
  });
});

describe('mixing and Q', () => {
  it('dilutes before comparing, using the real total volume', () => {
    // The step the old game pre-computed away. 25 mL into 75 mL is not a halving.
    const r = mixAndCompare(
      saltBy('BaSO₄'),
      { concentration: 4.0e-5, volume: 0.025 },
      { concentration: 4.0e-5, volume: 0.075 }
    );
    expect(r.totalVolume).toBeCloseTo(0.1, 12);
    expect(r.diluted.cation).toBeCloseTo(1.0e-5, 12);
    expect(r.diluted.anion).toBeCloseTo(3.0e-5, 12);
    expect(r.q).toBeCloseTo(3.0e-10, 18);
    expect(r.precipitates).toBe(true);
  });

  it('raises each diluted concentration to its own subscript', () => {
    // CaF₂: Q = [Ca²⁺][F⁻]², not the product of the two.
    const r = mixAndCompare(
      saltBy('CaF₂'),
      { concentration: 2.0e-3, volume: 0.05 },
      { concentration: 2.0e-3, volume: 0.05 }
    );
    expect(r.q).toBeCloseTo(1.0e-3 * 1.0e-3 * 1.0e-3, 15);
  });

  it('refuses a zero total volume', () => {
    expect(() =>
      mixAndCompare(
        saltBy('AgCl'),
        { concentration: 1, volume: 0 },
        { concentration: 1, volume: 0 }
      )
    ).toThrow(/volume/);
  });
});

describe('fractional precipitation', () => {
  it('reproduces the Mohr titration, where the lower Ksp comes down second', () => {
    // The result the whole task exists for, and the one an earlier draft of
    // `precipitationOrder` inverted by using x where y belonged.
    const order = precipitationOrder('cation', [
      { salt: saltBy('AgCl'), otherIonConcentration: 0.01 },
      { salt: saltBy('Ag₂CrO₄'), otherIonConcentration: 0.01 },
    ]);
    expect(order.map((o) => o.salt.formula)).toEqual(['AgCl', 'Ag₂CrO₄']);
    expect(order[0].threshold).toBeCloseTo(1.8e-8, 12);
    expect(order[1].threshold).toBeCloseTo(1.095e-5, 8);
    // And the point: AgCl's Ksp is the LARGER of the two.
    expect(saltBy('AgCl').ksp).toBeGreaterThan(saltBy('Ag₂CrO₄').ksp);
  });

  it('follows Ksp order when the stoichiometries match', () => {
    const order = precipitationOrder('anion', [
      { salt: saltBy('CaCO₃'), otherIonConcentration: 0.01 },
      { salt: saltBy('SrCO₃'), otherIonConcentration: 0.01 },
      { salt: saltBy('FeCO₃'), otherIonConcentration: 0.01 },
    ]);
    expect(order.map((o) => o.salt.formula)).toEqual(['FeCO₃', 'SrCO₃', 'CaCO₃']);
  });

  it('refuses a non-positive concentration', () => {
    expect(() =>
      precipitationOrder('cation', [{ salt: saltBy('AgCl'), otherIonConcentration: 0 }])
    ).toThrow(/positive/);
  });
});

describe('grading a scientific answer', () => {
  const expected = 1.342e-5;

  it('accepts the right answer in either decimal convention', () => {
    expect(gradeScientific({ mantissa: '1,34', exponent: '-5' }, expected).outcome).toBe('rett');
    expect(gradeScientific({ mantissa: '1.34', exponent: '-5' }, expected).outcome).toBe('rett');
    expect(gradeScientific({ mantissa: '1,34', exponent: '−5' }, expected).outcome).toBe('rett');
  });

  it('tells a wrong power of ten from wrong digits', () => {
    // The distinction a single merged input cannot make, and the reason for
    // two fields.
    expect(gradeScientific({ mantissa: '1,34', exponent: '-4' }, expected).outcome).toBe(
      'veldisvisir'
    );
    expect(gradeScientific({ mantissa: '6,7', exponent: '-5' }, expected).outcome).toBe(
      'tolustafir'
    );
    expect(gradeScientific({ mantissa: '9,9', exponent: '-2' }, expected).outcome).toBe('baedi');
  });

  it('rejects empty, zero and nonsense rather than scoring them', () => {
    // B13's general rule: a grader must reject 0 explicitly. The old game's
    // absolute-tolerance branch accepted a bare 0 on a 0,050 M answer.
    for (const entry of [
      { mantissa: '', exponent: '-5' },
      { mantissa: '1,34', exponent: '' },
      { mantissa: '0', exponent: '-5' },
      { mantissa: 'abc', exponent: '-5' },
      { mantissa: '1,34', exponent: 'x' },
      { mantissa: '-1', exponent: '-5' },
    ]) {
      expect(gradeScientific(entry, expected).outcome, JSON.stringify(entry)).toBe('ogilt');
    }
  });

  it('rejects double and half the right answer', () => {
    expect(gradeScientific({ mantissa: '2,68', exponent: '-5' }, expected).outcome).not.toBe(
      'rett'
    );
    expect(gradeScientific({ mantissa: '6,7', exponent: '-6' }, expected).outcome).not.toBe('rett');
  });

  it('accepts the answer it prints, for every salt in the pool', () => {
    // The molmassi defect as a property: whatever the game renders has to grade
    // as correct when typed straight back in.
    for (const salt of SALTS) {
      const s = molarSolubility(salt);
      const printed = formatScientific(s, 3);
      const [mantissa, power] = printed.split(' × 10');
      const exponent = power
        .replace('⁻', '-')
        .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (d) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(d)));
      expect(
        gradeScientific({ mantissa, exponent }, s).outcome,
        `${salt.formula} prints ${printed}, which does not grade back`
      ).toBe('rett');
    }
  });
});
