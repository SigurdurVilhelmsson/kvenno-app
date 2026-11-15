import { describe, expect, it } from 'vitest';

import { APPENDIX_D1_ACIDS } from '@shared/data/appendix-d';
import { gradeScientific } from '@shared/utils';

import { answerOf } from '../components/GibbsKScreen';
import { GIBBS_K_PROBLEMS, problemDeltaG } from '../data/gibbs-k';
import {
  K_TOLERANCE,
  deltaGFromK,
  deltaGSlip,
  isGibbsDeltaGCorrect,
  kFromDeltaG,
  kJPerDecade,
  kSlip,
} from '../utils/gibbs-k';
import { calculateDeltaG } from '../utils/thermo-calculations';

/**
 * ΔG° = −RT ln K (m68819). Each problem's answer is computed, so these tests hold the
 * computation to the book's own answers and the answers to the grader.
 */

const byId = (id: string) => {
  const p = GIBBS_K_PROBLEMS.find((q) => q.id === id);
  if (!p) throw new Error(id);
  return p;
};

/** Write a positive number as the two fields of a scientific answer. */
const fields = (x: number) => {
  const exponent = Math.floor(Math.log10(x));
  return {
    mantissa: (x / 10 ** exponent).toFixed(3).replace('.', ','),
    exponent: String(exponent),
  };
};

describe('the relation', () => {
  it('is its own inverse', () => {
    for (const [g, t] of [
      [-32.5, 298],
      [2.8, 298],
      [47.5, 700],
      [0, 500],
    ]) {
      expect(deltaGFromK(kFromDeltaG(g, t), t)).toBeCloseTo(g, 9);
    }
  });

  it('gives K = 1 at ΔG° = 0, above 1 below it and under 1 above it', () => {
    expect(kFromDeltaG(0, 298)).toBe(1);
    expect(kFromDeltaG(-1, 298)).toBeGreaterThan(1);
    expect(kFromDeltaG(1, 298)).toBeLessThan(1);
  });

  it('changes K tenfold per 5,7 kJ/mól at 298 K', () => {
    expect(kJPerDecade(298)).toBeCloseTo(5.705, 2);
    expect(kFromDeltaG(-kJPerDecade(298), 298)).toBeCloseTo(10, 9);
  });
});

describe('the problems', () => {
  it('are six: two of each kind', () => {
    expect(GIBBS_K_PROBLEMS).toHaveLength(6);
    for (const kind of ['K-fra-G', 'K-fra-HS', 'G-fra-K'] as const) {
      expect(GIBBS_K_PROBLEMS.filter((p) => p.kind === kind)).toHaveLength(2);
    }
  });

  it("N₂O₄ ⇌ 2NO₂ gives the book's K = 0,32 (m68819)", () => {
    const p = byId('n2o4');
    expect(problemDeltaG(p)).toBe(2.8);
    expect(answerOf(p)).toBeCloseTo(0.32, 2);
  });

  it("AgCl gives the book's Ksp to within Appendix D's 1,8 × 10⁻¹⁰", () => {
    const p = byId('agcl');
    expect(problemDeltaG(p)).toBe(55.7);
    expect(Math.abs(answerOf(p) - 1.8e-10) / 1.8e-10).toBeLessThan(0.06);
  });

  it("works the Haber ΔG° through the game's own calculateDeltaG", () => {
    expect(problemDeltaG(byId('haber-298'))).toBe(calculateDeltaG(-91.8, -199, 298));
    expect(problemDeltaG(byId('haber-700'))).toBeCloseTo(47.5, 9);
    // Heating from 298 K to 700 K takes K from about 5 × 10⁵ to about 2,9 × 10⁻⁴.
    expect(answerOf(byId('haber-298'))).toBeCloseTo(4.97e5, -4);
    expect(answerOf(byId('haber-700'))).toBeCloseTo(2.85e-4, 6);
  });

  it('takes the acetic-acid Ka from Appendix D', () => {
    const p = byId('ediksyra');
    expect(p.kind === 'G-fra-K' && p.k).toBe(APPENDIX_D1_ACIDS.acetic.ka[0]);
    expect(answerOf(p)).toBeCloseTo(27.07, 1);
    expect(answerOf(byId('vetnisjodid'))).toBeCloseTo(-21.89, 1);
  });
});

describe('the grader', () => {
  it('accepts every answer, and rejects 0, half, double and NaN', () => {
    for (const p of GIBBS_K_PROBLEMS) {
      const answer = answerOf(p);
      if (p.kind === 'G-fra-K') {
        expect(isGibbsDeltaGCorrect(String(answer).replace('.', ','), answer)).toBe(true);
        for (const wrong of [0, answer / 2, answer * 2, Number.NaN]) {
          expect(isGibbsDeltaGCorrect(String(wrong), answer)).toBe(false);
        }
      } else {
        expect(gradeScientific(fields(answer), answer, K_TOLERANCE).outcome).toBe('rett');
        for (const wrong of [answer / 2, answer * 2]) {
          expect(gradeScientific(fields(wrong), answer, K_TOLERANCE).outcome).not.toBe('rett');
        }
        expect(
          gradeScientific({ mantissa: '0', exponent: '0' }, answer, K_TOLERANCE).outcome
        ).not.toBe('rett');
      }
    }
  });

  it('names each slip it is built for, and never calls a right answer one', () => {
    for (const p of GIBBS_K_PROBLEMS) {
      const answer = answerOf(p);
      if (p.kind === 'G-fra-K') {
        expect(deltaGSlip(answer, p.k, p.temp)).toBeNull();
        expect(deltaGSlip(-answer, p.k, p.temp)).toBe('formerki');
        expect(deltaGSlip(answer * 1000, p.k, p.temp)).toBe('kilojoule');
        expect(deltaGSlip(answer / Math.LN10, p.k, p.temp)).toBe('log10');
        for (const slip of [-answer, answer * 1000, answer / Math.LN10]) {
          expect(isGibbsDeltaGCorrect(String(slip), answer)).toBe(false);
        }
      } else {
        const g = problemDeltaG(p)!;
        const t = p.temp;
        expect(kSlip(answer, g, t)).toBeNull();
        expect(kSlip(1 / answer, g, t)).toBe('formerki');
        expect(kSlip(Math.exp(-g / (8.314 * t)), g, t)).toBe('kilojoule');
        expect(kSlip(10 ** ((-g * 1000) / (8.314 * t)), g, t)).toBe('log10');
      }
    }
  });
});
