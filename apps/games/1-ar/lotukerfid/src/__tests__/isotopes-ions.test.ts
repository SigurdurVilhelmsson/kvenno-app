import { describe, expect, it } from 'vitest';

import { generateQuestions, isRight, type Question } from '../components/Level3';
import { ELEMENTS } from '../data/elements';
import { ionFormula, IONS } from '../data/ions';
import { AVERAGE_MASS_TOLERANCE, averageMass, ISOTOPE_SAMPLES } from '../data/isotopes';
import { averageMassMisconception, ionMisconception } from '../utils/misconceptions';

/**
 * Stig 3's two newer question types, year-1 plan item 12 (2026-11-15), from the book's
 * `ch02/m68692`: electrons in an ion, and the average atomic mass from isotope
 * abundances. Every sample is the book's, and every answer derived.
 */

const sample = (symbol: string) => ISOTOPE_SAMPLES.find((s) => s.symbol === symbol)!;

describe('isotope samples', () => {
  it('reproduce the answers the book prints', () => {
    const printed: Record<string, number> = {
      B: 10.81,
      Ne: 20.15,
      Mg: 24.31,
      Cl: 35.45,
      Cu: 63.55,
    };
    for (const s of ISOTOPE_SAMPLES) {
      expect(averageMass(s), s.symbol).toBeCloseTo(printed[s.symbol], 2);
    }
  });

  it('add up to 100 %', () => {
    for (const s of ISOTOPE_SAMPLES) {
      const sum = s.isotopes.reduce((t, i) => t + i.percent, 0);
      expect(sum, s.symbol).toBeCloseTo(100, 6);
    }
  });

  it('name elements the table carries', () => {
    for (const s of ISOTOPE_SAMPLES) {
      expect(
        ELEMENTS.some((e) => e.symbol === s.symbol),
        s.symbol
      ).toBe(true);
    }
  });
});

describe('grading an average mass', () => {
  const question = (symbol: string): Question => ({
    type: 'average-mass',
    element: ELEMENTS.find((e) => e.symbol === symbol)!,
    sample: sample(symbol),
    text: '',
    correctAnswer: averageMass(sample(symbol)),
    explanation: '',
  });

  it("accepts the book's own rounding", () => {
    expect(isRight(question('B'), 10.8)).toBe(true);
    expect(isRight(question('Ne'), 20.15)).toBe(true);
  });

  it('rejects every shortcut, and 0', () => {
    for (const s of ISOTOPE_SAMPLES) {
      const q = question(s.symbol);
      const plainMean = s.isotopes.reduce((t, i) => t + i.mass, 0) / s.isotopes.length;
      const commonest = s.isotopes.reduce((a, b) => (b.percent > a.percent ? b : a));
      for (const wrong of [0, plainMean, commonest.massNumber, q.correctAnswer * 100]) {
        expect(isRight(q, wrong), `${s.symbol}: ${wrong}`).toBe(false);
      }
    }
  });

  it("rejects the table's 20,18 for neon from the solar wind", () => {
    expect(isRight(question('Ne'), 20.18)).toBe(false);
  });

  it('names the shortcut taken', () => {
    const b = sample('B');
    const want = averageMass(b);
    const tol = AVERAGE_MASS_TOLERANCE;
    expect(averageMassMisconception(b.isotopes, want, 10.511, tol)).toMatch(/venjulegt meðaltal/);
    expect(averageMassMisconception(b.isotopes, want, 1081.1, tol)).toMatch(/Deildu/);
    expect(averageMassMisconception(b.isotopes, want, 11, tol)).toMatch(/algengustu/);
    expect(averageMassMisconception(b.isotopes, want, want, tol)).toBeUndefined();
    expect(averageMassMisconception(b.isotopes, want, 7, tol)).toBeUndefined();
  });
});

describe('ions', () => {
  it("count the book's two examples right", () => {
    const na = IONS.find((i) => i.symbol === 'Na')!;
    const o = IONS.find((i) => i.symbol === 'O')!;
    expect(ionFormula(na)).toBe('Na⁺');
    expect(ionFormula(o)).toBe('O²⁻');
    const z = (s: string) => ELEMENTS.find((e) => e.symbol === s)!.atomicNumber;
    expect(z('Na') - na.charge).toBe(10);
    expect(z('O') - o.charge).toBe(10);
  });

  it('are all of elements in the level pool', () => {
    for (const ion of IONS) {
      const el = ELEMENTS.find((e) => e.symbol === ion.symbol);
      expect(el?.period, ion.symbol).toBeLessThanOrEqual(4);
    }
  });

  it('name the neutral count, the sign slip and the bare charge', () => {
    expect(ionMisconception(11, 1, 11)).toMatch(/hlutlausa atóminu/);
    expect(ionMisconception(11, 1, 12)).toMatch(/misst rafeindir/);
    expect(ionMisconception(8, -2, 6)).toMatch(/fengið rafeindir/);
    expect(ionMisconception(8, -2, 2)).toMatch(/Byrjaðu á sætistölunni/);
    expect(ionMisconception(11, 1, 10)).toBeUndefined();
  });
});

describe('a Stig 3 run', () => {
  it('asks two of each of the six types', () => {
    for (let run = 0; run < 50; run++) {
      const counts: Record<string, number> = {};
      for (const q of generateQuestions()) counts[q.type] = (counts[q.type] ?? 0) + 1;
      expect(counts).toEqual({
        protons: 2,
        electrons: 2,
        neutrons: 2,
        'identify-by-particles': 2,
        'ion-electrons': 2,
        'average-mass': 2,
      });
    }
  });
});
