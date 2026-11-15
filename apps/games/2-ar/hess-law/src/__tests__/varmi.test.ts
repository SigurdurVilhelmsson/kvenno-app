import { describe, expect, it } from 'vitest';

import { VARMI_PROBLEMS } from '../data/varmi';
import {
  BOND_ENERGY,
  SPECIFIC_HEAT,
  bondEnthalpy,
  finalTemperature,
  within,
} from '../engine/varmi';

const byId = (id: string) => VARMI_PROBLEMS.find((p) => p.id === id)!;

describe('Varmamælingar og tengjaorka: the book’s numbers', () => {
  it('carries the book’s specific heats and bond energies', () => {
    // ch05/m68724 and ch07/m68741.
    expect(SPECIFIC_HEAT).toMatchObject({ vatn: 4.184, al: 0.897, jarn: 0.449, kopar: 0.385 });
    expect(BOND_ENERGY).toMatchObject({
      'H–H': 436,
      'C–H': 415,
      'O–H': 464,
      'H–Cl': 432,
      'Cl–Cl': 243,
      'C=C': 611,
      'C≡O': 1080,
    });
  });

  it('reproduces every answer the book prints, to the 1 % the screen grades to', () => {
    const book: Record<string, number> = {
      ponnu: 50.7, // 5,07 × 10⁴ J
      'othekktur-malmur': 0.451,
      steypustyrktarjarn: 248,
      koparstykki: 38.7,
      hlutleysing: -2.9,
      kcl: 1.33,
      glukosi: -48.8,
      hcl: -185,
      metanol: -107,
      etanol: -35,
    };
    for (const p of VARMI_PROBLEMS) expect(within(p.answer, book[p.id]), p.id).toBe(true);
    expect(Object.keys(book).sort()).toEqual(VARMI_PROBLEMS.map((p) => p.id).sort());
  });

  it('agrees with the formation enthalpy of HCl, as the book checks', () => {
    // 2 × −92,307 = −184,6 kJ from appendix G, against −185 from bond energies.
    expect(Math.abs(byId('hcl').answer - 2 * -92.307)).toBeLessThan(1);
  });

  it('balances the heat in the two-body problems', () => {
    const tf = finalTemperature([
      { massG: 248, c: SPECIFIC_HEAT.kopar, t: 314 },
      { massG: 390, c: SPECIFIC_HEAT.vatn, t: 22.6 },
    ]);
    expect(
      248 * SPECIFIC_HEAT.kopar * (tf - 314) + 390 * SPECIFIC_HEAT.vatn * (tf - 22.6)
    ).toBeCloseTo(0, 6);
  });

  it('sums bonds broken minus bonds formed', () => {
    expect(bondEnthalpy([['H–H', 1]], [])).toBe(436);
    expect(bondEnthalpy([], [['H–H', 1]])).toBe(-436);
  });

  it('rejects 0, double, half, NaN and every slip on every problem', () => {
    for (const p of VARMI_PROBLEMS) {
      for (const wrong of [0, 2 * p.answer, p.answer / 2, NaN])
        expect(within(wrong, p.answer), `${p.id}: ${wrong}`).toBe(false);
      for (const s of p.slips) expect(within(s.value, p.answer), `${p.id}: ${s.text}`).toBe(false);
    }
  });

  it('prints every number with a decimal comma', () => {
    for (const p of VARMI_PROBLEMS) {
      const text = [p.setting, ...p.given, p.question, p.answerText, ...p.steps].join(' ');
      expect(text, p.id).not.toMatch(/\d\.\d/);
    }
  });
});
