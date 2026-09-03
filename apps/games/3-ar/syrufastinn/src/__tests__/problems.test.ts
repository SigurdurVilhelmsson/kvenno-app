import { describe, it, expect } from 'vitest';

import {
  APPLY_PROBLEMS,
  PRACTICE_PROBLEMS,
  RULE_BREAKING_PROBLEMS,
  EXPLORABLE_ACIDS,
  exploreSeries,
  gradeApply,
} from '../data/problems';
import { referencePH } from '../engine/grade';
import { kaFromMeasuredPH, solveWeakAcid } from '../engine/ka';

describe('the practice set', () => {
  it('is entirely inside the 5 % rule', () => {
    // Æfa teaches the method. Meeting the exception while still learning the
    // method teaches neither.
    expect(PRACTICE_PROBLEMS.length).toBeGreaterThan(0);
    for (const p of PRACTICE_PROBLEMS) {
      expect(p.approximationValid, p.id).toBe(true);
      expect(p.percentDissociated, p.id).toBeLessThan(5);
    }
  });

  it('spans the range rather than clustering at the comfortable end', () => {
    const pcts = PRACTICE_PROBLEMS.map((p) => p.percentDissociated);
    expect(Math.max(...pcts) - Math.min(...pcts)).toBeGreaterThan(1);
  });

  it('quotes the pH the engine quotes, for every problem', () => {
    for (const p of PRACTICE_PROBLEMS) {
      expect(p.answer, p.id).toBeCloseTo(referencePH(p.acid.ka, p.concentration), 10);
    }
  });
});

describe('the apply set', () => {
  it('includes pairs where the 5 % rule fails', () => {
    // A rule that never fires is a rule nobody believes. These are drawn from
    // the pool, not contrived.
    expect(RULE_BREAKING_PROBLEMS.length).toBeGreaterThan(0);
    expect(APPLY_PROBLEMS.some((p) => !p.approximationValid)).toBe(true);
  });

  it('asks each kind at least once', () => {
    const kinds = new Set(APPLY_PROBLEMS.map((p) => p.kind));
    expect([...kinds].sort()).toEqual(['ka', 'kb', 'klofnun', 'pH']);
  });

  it('accepts its own stated answer', () => {
    for (const p of APPLY_PROBLEMS) {
      expect(gradeApply(p, p.answer), p.id).toBe(true);
    }
  });

  it('asks Ka from the pH it actually states, not from the table', () => {
    // The defect this test exists for. The problem quotes pH = 2,87 for a
    // 0,100 M solution; that implies Ka = 1,84 × 10⁻⁵, while the acid's table
    // value is 1,8 × 10⁻⁵ — 2,5 % apart. Storing the tidy table value and
    // grading at 1 % would mark a correct calculation wrong.
    const p = APPLY_PROBLEMS.find((q) => q.id === 'apply-ka')!;
    const implied = kaFromMeasuredPH(2.87, 0.1);
    expect(p.answer).toBeCloseTo(implied, 12);
    expect(gradeApply(p, implied)).toBe(true);
    // And the table value must still pass, since the student may quote either.
    expect(gradeApply(p, 1.8e-5)).toBe(true);
  });

  it('grades a back-calculated Ka loosely enough for the pH it was given', () => {
    // pH to two decimals carries ±0,005, and Ka ∝ [H⁺]², so 2·ln10·0,005 = 2,3 %
    // of spread exists before the student rounds anything. The tolerance has to
    // clear that.
    const p = APPLY_PROBLEMS.find((q) => q.id === 'apply-ka')!;
    expect(p.grading.tolerance).toBeGreaterThan(2 * Math.LN10 * 0.005);
    expect(gradeApply(p, kaFromMeasuredPH(2.875, 0.1))).toBe(true);
    expect(gradeApply(p, kaFromMeasuredPH(2.865, 0.1))).toBe(true);
  });

  it('never lets a tolerance admit a trivially wrong answer', () => {
    // B13, generalised. An absolute tolerance on an answer of 0,0011 % accepts a
    // bare 0; a relative one does not. This asserts the property directly rather
    // than trusting the choice of mode.
    for (const p of APPLY_PROBLEMS) {
      expect(gradeApply(p, 0), `${p.id} accepts 0`).toBe(false);
      expect(gradeApply(p, p.answer * 2), `${p.id} accepts double`).toBe(false);
      expect(gradeApply(p, p.answer / 2), `${p.id} accepts half`).toBe(false);
      expect(gradeApply(p, Number.NaN), `${p.id} accepts NaN`).toBe(false);
    }
  });

  it('names a misconception on every rule-breaking problem', () => {
    // These are the ones whose wrong answer is diagnosable: a student who
    // substituted √(Ka·C) lands on a specific number, and the feedback can say
    // so. Where the wrong answer is not diagnosable the slot stays empty, per
    // CLAUDE.md.
    for (const p of APPLY_PROBLEMS.filter((q) => !q.approximationValid)) {
      expect(p.misconception, p.id).toBeTruthy();
      const s = solveWeakAcid(p.acid.ka, p.concentration);
      expect(p.misconception, p.id).toContain(s.pHApprox.toFixed(2).replace('.', ','));
    }
  });

  it('writes every number with the Icelandic decimal comma', () => {
    // The repo-wide B9/B10 pass. A worked example printing 2.53 teaches a format
    // the graders reject.
    for (const p of APPLY_PROBLEMS) {
      const text = [p.question, p.explanation, p.misconception ?? ''].join(' ');
      const withDot = text.match(/\d+\.\d+/g);
      expect(withDot, `${p.id}: ${withDot?.join(', ')}`).toBeNull();
    }
  });

  it('prints powers of ten as superscripts, not carets', () => {
    for (const p of APPLY_PROBLEMS) {
      expect([p.question, p.explanation].join(' '), p.id).not.toContain('10^');
    }
  });
});

describe('the explore series', () => {
  it('offers acids with enough concentrations to show Ka staying put', () => {
    expect(EXPLORABLE_ACIDS.length).toBeGreaterThan(0);
    for (const acid of EXPLORABLE_ACIDS) {
      expect(exploreSeries(acid).length, acid.name).toBeGreaterThanOrEqual(3);
    }
  });

  it('varies pH across the series while Ka does not — the whole discovery', () => {
    for (const acid of EXPLORABLE_ACIDS) {
      const series = exploreSeries(acid);
      const phs = series.map((p) => p.answer);
      expect(new Set(phs.map((v) => v.toFixed(2))).size, acid.name).toBeGreaterThan(1);

      for (const p of series) {
        const { hExact } = solveWeakAcid(acid.ka, p.concentration);
        const recovered = kaFromMeasuredPH(-Math.log10(hExact), p.concentration);
        expect(recovered, `${acid.name} @ ${p.concentration} M`).toBeCloseTo(acid.ka, 12);
      }
    }
  });

  it('sorts the series from concentrated to dilute', () => {
    for (const acid of EXPLORABLE_ACIDS) {
      const cs = exploreSeries(acid).map((p) => p.concentration);
      expect([...cs].sort((a, b) => b - a)).toEqual(cs);
    }
  });
});
