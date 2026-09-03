import { describe, it, expect } from 'vitest';

import { ANSWERABLE_PAIRS, WEAK_ACIDS } from '../data/acids';
import {
  PH_TOLERANCE,
  EXACT_APPROX_MAX_GAP,
  gradePH,
  referencePH,
  percentDissociation,
  isRelativelyClose,
  isAbsolutelyClose,
} from '../engine/grade';
import { solveWeakAcid, solveWeakBase } from '../engine/ka';

const acid = (id: string) => WEAK_ACIDS.find((a) => a.id === id)!;

describe('the grading ruling: approximate, by the 5 % rule', () => {
  it('quotes the same pH that ph-titration already stores for 0,100 M ediksýra', () => {
    // The whole reason the ruling went this way. `3-ar/ph-titration` stores
    // `initialPH: 2.87` at `data/titrations.ts:76`. If this game quoted the
    // exact root it would say 2.88, and two adjacent nodes of one chain would
    // disagree about the same beaker.
    expect(referencePH(acid('ediksyra').ka, 0.1)).toBeCloseTo(2.87, 2);
  });

  it('quotes the same pH that ph-titration stores for 0,100 M ammóníak', () => {
    // titrations.ts:138 stores 11.13. Kb of ammonia is 1,8 × 10⁻⁵.
    const b = solveWeakBase(1.8e-5, 0.1);
    expect(b.approximationValid).toBe(true);
    expect(b.pHApprox).toBeCloseTo(11.13, 2);
  });

  it('accepts both routes at every answerable pair', () => {
    // A student who solved the quadratic did the harder correct thing and must
    // not be marked wrong for it — and one who used the licensed approximation
    // must not be either.
    for (const { acid: a, concentration } of ANSWERABLE_PAIRS) {
      const s = solveWeakAcid(a.ka, concentration);
      const label = `${a.name} @ ${concentration} M`;
      expect(gradePH(s.pH, a.ka, concentration).correct, `exact: ${label}`).toBe(true);
      if (s.approximationValid) {
        expect(gradePH(s.pHApprox, a.ka, concentration).correct, `approx: ${label}`).toBe(true);
      }
    }
  });

  it('quotes the exact root, and says the rule failed, once dissociation passes 5 %', () => {
    // Maurasýra at 0,05 M and below dissociates past 5 %. The quoted answer
    // switches to the exact root there, and `approximationValid` reports the
    // failure — which is what feedback tells the student, whether or not their
    // typed number happened to land in tolerance.
    const ka = acid('maurasyra').ka;
    for (const c of [0.05, 0.025, 0.01]) {
      const s = solveWeakAcid(ka, c);
      expect(s.approximationValid, `${c} M`).toBe(false);
      const g = gradePH(s.pH, ka, c);
      expect(g.expected).toBeCloseTo(s.pH, 10);
      expect(g.approximationValid).toBe(false);
      expect(g.correct).toBe(true);
    }
  });

  it('refuses the approximation once the gap actually exceeds the tolerance', () => {
    // The honest boundary. Refusal is not a policy the grader applies on top of
    // the tolerance — it is what the tolerance does once the two roots are
    // further apart than ±0,02. Maurasýra at 0,01 M is 0,029 apart, so the
    // approximation is refused; at 0,025 M it is 0,018 apart and is not, even
    // though the 5 % rule has already failed there. Feedback carries that
    // distinction, grading cannot.
    const ka = acid('maurasyra').ka;

    const far = solveWeakAcid(ka, 0.01);
    expect(far.pHApprox - far.pH).toBeLessThan(-PH_TOLERANCE);
    expect(gradePH(far.pHApprox, ka, 0.01).correct).toBe(false);

    const near = solveWeakAcid(ka, 0.025);
    expect(Math.abs(near.pHApprox - near.pH)).toBeLessThan(PH_TOLERANCE);
    expect(gradePH(near.pHApprox, ka, 0.025).correct).toBe(true);
  });

  it('has real 5 %-rule failures in its own pool, so the rule is not decorative', () => {
    const invalid = ANSWERABLE_PAIRS.filter(
      ({ acid: a, concentration }) => !solveWeakAcid(a.ka, concentration).approximationValid
    );
    expect(invalid.length).toBeGreaterThan(0);
  });

  it('keeps the tolerance above the widest gap the 5 % rule allows', () => {
    // The bound that lets one comparison accept both routes. Since
    // h_exact = h_approx·√(1−α), the pH gap is −½·log₁₀(1−α), which at α = 5 %
    // is 0,0111. Tighten PH_TOLERANCE below that and a correct quadratic
    // solution starts being marked wrong where the approximation is quoted.
    //
    // The ½ is the whole content of this test. An earlier draft of this file
    // used −log₁₀(1−α) = 0,0223 and concluded the opposite: that the tolerance
    // was too narrow and a second explicit comparison was needed. It is not,
    // and it was not.
    expect(EXACT_APPROX_MAX_GAP).toBeCloseTo(0.0111, 4);
    expect(PH_TOLERANCE).toBeGreaterThan(EXACT_APPROX_MAX_GAP);
  });

  it('derives that bound from the engine rather than asserting it', () => {
    // Sweep dissociation up to the 5 % line; no licensed pair may beat the bound.
    for (let alpha = 0.001; alpha < 0.05; alpha += 0.001) {
      const c = 0.1;
      const ka = (alpha * alpha * c) / (1 - alpha);
      const s = solveWeakAcid(ka, c);
      if (!s.approximationValid) continue;
      expect(Math.abs(s.pH - s.pHApprox), `alpha=${alpha}`).toBeLessThanOrEqual(
        EXACT_APPROX_MAX_GAP + 1e-9
      );
    }
  });

  it('rejects an answer off by more than the rounding tolerance', () => {
    const ka = acid('ediksyra').ka;
    expect(gradePH(2.87, ka, 0.1).correct).toBe(true);
    expect(gradePH(2.87 + PH_TOLERANCE * 2, ka, 0.1).correct).toBe(false);
    expect(gradePH(2.87 - PH_TOLERANCE * 2, ka, 0.1).correct).toBe(false);
  });

  it('rejects an unparseable answer rather than treating NaN as close', () => {
    expect(gradePH(Number.NaN, acid('ediksyra').ka, 0.1).correct).toBe(false);
  });

  it('reports only what it knows: whether the rule held, never which route was taken', () => {
    // For 0,100 M ediksýra the two roots are 0,003 pH apart. Both are correct
    // and the grade is byte-identical for each, which is the honest outcome — a
    // correct answer here is no evidence of either method, so feedback may not
    // claim one. `approximationValid` describes the problem, not the student,
    // and is the field feedback may speak from.
    const ka = acid('ediksyra').ka;
    const s = solveWeakAcid(ka, 0.1);
    expect(Math.abs(s.pHApprox - s.pH)).toBeLessThan(PH_TOLERANCE);
    expect(gradePH(s.pHApprox, ka, 0.1)).toEqual(gradePH(s.pH, ka, 0.1));
    expect(gradePH(s.pH, ka, 0.1).approximationValid).toBe(true);
  });
});

describe('klofnunarhlutfall', () => {
  it('is computed from the exact root, so the 5 % rule does not test itself', () => {
    // Using the approximation here would make α = √(Ka·C)/C, which is exactly
    // the quantity whose validity the rule is meant to judge.
    const ka = acid('maurasyra').ka;
    const s = solveWeakAcid(ka, 0.1);
    expect(percentDissociation(ka, 0.1)).toBeCloseTo(s.fractionDissociated * 100, 10);
    expect(percentDissociation(ka, 0.1)).toBeCloseTo(4.15, 2);
  });

  it('rises as the solution is diluted — the result students find surprising', () => {
    const ka = acid('ediksyra').ka;
    const dilutions = [1.0, 0.1, 0.01].map((c) => percentDissociation(ka, c));
    expect(dilutions[0]).toBeLessThan(dilutions[1]);
    expect(dilutions[1]).toBeLessThan(dilutions[2]);
  });

  it('agrees with the 5 % rule flag at every answerable pair', () => {
    for (const { acid: a, concentration } of ANSWERABLE_PAIRS) {
      const pct = percentDissociation(a.ka, concentration);
      const { approximationValid } = solveWeakAcid(a.ka, concentration);
      expect(pct < 5, `${a.name} @ ${concentration} M`).toBe(approximationValid);
    }
  });
});

describe('the comparison helpers', () => {
  it('compares Ka relatively, so it means the same at 10⁻⁴ and 10⁻¹⁰', () => {
    expect(isRelativelyClose(1.8e-5, 1.8e-5)).toBe(true);
    expect(isRelativelyClose(1.81e-5, 1.8e-5)).toBe(true); // 0,56 % out
    expect(isRelativelyClose(1.9e-5, 1.8e-5)).toBe(false); // 5,6 % out
    expect(isRelativelyClose(1.31e-10, 1.3e-10)).toBe(true);
    expect(isRelativelyClose(1.4e-10, 1.3e-10)).toBe(false);
  });

  it('refuses NaN and treats an expected zero as needing an exact zero', () => {
    expect(isRelativelyClose(Number.NaN, 1)).toBe(false);
    expect(isRelativelyClose(0, 0)).toBe(true);
    expect(isRelativelyClose(1e-30, 0)).toBe(false);
    expect(isAbsolutelyClose(Number.NaN, 1, 0.1)).toBe(false);
  });
});
