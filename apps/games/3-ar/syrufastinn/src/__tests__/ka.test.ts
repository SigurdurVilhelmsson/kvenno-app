import { describe, it, expect } from 'vitest';

import {
  WEAK_ACIDS,
  MONOPROTIC_ACIDS,
  CONCENTRATIONS,
  ANSWERABLE_PAIRS,
  isAnswerable,
} from '../data/acids';
import {
  KW,
  solveWeakAcid,
  solveWeakBase,
  pKa,
  kaFromPKa,
  kbFromKa,
  kaFromKb,
  kaFromMeasuredPH,
  waterContributionMatters,
} from '../engine/ka';

describe('solveWeakAcid', () => {
  it('separates the exact pH of 0.100 M acetic acid from the quoted 2.87', () => {
    // The canonical worked example. **The 2.87 that textbooks quote — and that
    // 3-ar/ph-titration stores as its own expected value — is the
    // APPROXIMATE answer.** √(Ka·C) gives 2.8725; the exact quadratic gives
    // 2.8753, which rounds to 2.88. The gap is small here precisely because
    // acetic acid at 0.1 M is well inside the 5 % rule, and that is the point:
    // the approximation is good, and knowing *why* is the lesson.
    const s = solveWeakAcid(1.8e-5, 0.1);
    expect(s.pH).toBeCloseTo(2.8753, 3);
    expect(s.pHApprox).toBeCloseTo(2.8725, 3);
    expect(s.pHApprox).toBeCloseTo(2.87, 2); // what the tables print
  });

  it('agrees with the exact quadratic, not just the approximation', () => {
    // x² + Ka·x − Ka·C = 0 must hold for the exact root.
    const ka = 1.8e-5;
    const c = 0.1;
    const { hExact } = solveWeakAcid(ka, c);
    expect(hExact * hExact + ka * hExact - ka * c).toBeCloseTo(0, 12);
  });

  it('the approximation always overestimates [H⁺]', () => {
    // √(Ka·C) drops the −x from the denominator, so it must come out high.
    for (const c of [0.001, 0.01, 0.1, 1]) {
      for (const ka of [1e-10, 1e-7, 1e-5, 1e-3]) {
        const s = solveWeakAcid(ka, c);
        expect(s.hApprox).toBeGreaterThan(s.hExact);
        expect(s.approxRelativeError).toBeGreaterThan(0);
      }
    }
  });

  it('flags the approximation as invalid exactly when dissociation reaches 5%', () => {
    // A strong-ish weak acid at low concentration: HF-like Ka, dilute.
    const bad = solveWeakAcid(6.8e-4, 0.001);
    expect(bad.fractionDissociated).toBeGreaterThan(0.05);
    expect(bad.approximationValid).toBe(false);

    const good = solveWeakAcid(1.8e-5, 0.1);
    expect(good.fractionDissociated).toBeLessThan(0.05);
    expect(good.approximationValid).toBe(true);
  });

  it('the approximation error is worth teaching, not negligible', () => {
    // If the gap were always under rounding, the Apply phase would be asking
    // about nothing. At the invalid end it must be visible in the second digit.
    const s = solveWeakAcid(6.8e-4, 0.001);
    expect(Math.abs(s.pHApprox - s.pH)).toBeGreaterThan(0.05);
  });

  it('rejects non-physical inputs rather than returning NaN', () => {
    expect(() => solveWeakAcid(0, 0.1)).toThrow(RangeError);
    expect(() => solveWeakAcid(-1e-5, 0.1)).toThrow(RangeError);
    expect(() => solveWeakAcid(1.8e-5, 0)).toThrow(RangeError);
  });
});

describe('the conjugate relationship', () => {
  it('Ka · Kb = Kw', () => {
    for (const acid of WEAK_ACIDS) {
      expect(acid.ka * kbFromKa(acid.ka)).toBeCloseTo(KW, 20);
    }
  });

  it('round-trips Ka → Kb → Ka', () => {
    for (const acid of WEAK_ACIDS) {
      expect(kaFromKb(kbFromKa(acid.ka))).toBeCloseTo(acid.ka, 15);
    }
  });

  it('gives ammonia the textbook Kb from its conjugate acid pKa', () => {
    // NH₄⁺ pKa 9.25 → Kb(NH₃) ≈ 1.8e-5, the value every table prints.
    const kbAmmonia = kbFromKa(kaFromPKa(9.25));
    expect(kbAmmonia).toBeGreaterThan(1.7e-5);
    expect(kbAmmonia).toBeLessThan(1.9e-5);
  });
});

describe('pKa conversions', () => {
  it('round-trips', () => {
    for (const acid of WEAK_ACIDS) {
      expect(kaFromPKa(pKa(acid.ka))).toBeCloseTo(acid.ka, 15);
    }
  });

  it('puts acetic acid at pKa 4.74', () => {
    expect(pKa(1.8e-5)).toBeCloseTo(4.74, 2);
  });
});

describe('kaFromMeasuredPH — the Explore direction', () => {
  it('recovers the Ka it started from', () => {
    for (const acid of MONOPROTIC_ACIDS) {
      const c = 0.1;
      const { pH } = solveWeakAcid(acid.ka, c);
      expect(kaFromMeasuredPH(pH, c)).toBeCloseTo(acid.ka, 12);
    }
  });

  it('refuses a pH implying more than full dissociation', () => {
    // pH 1 in a 0.01 M solution would mean [H⁺] > C, which is impossible.
    expect(() => kaFromMeasuredPH(1, 0.01)).toThrow(RangeError);
  });
});

describe('solveWeakBase', () => {
  it('gives 0.100 M ammonia 11.125 exactly, against the quoted 11.13', () => {
    // Same story as acetic acid, mirrored: the 11.13 in the tables is
    // 14 − pOH from √(Kb·C). The exact route gives 11.1247.
    const s = solveWeakBase(1.8e-5, 0.1);
    expect(s.pH).toBeCloseTo(11.1247, 3);
    expect(s.pHApprox).toBeCloseTo(11.13, 2); // what the tables print
  });

  it('is basic, i.e. above 7', () => {
    expect(solveWeakBase(1.8e-5, 0.1).pH).toBeGreaterThan(7);
  });
});

describe('the shipped acid data', () => {
  it('has a plausible Ka for every acid — weak, not strong, not vanishing', () => {
    for (const acid of WEAK_ACIDS) {
      expect(acid.ka, acid.name).toBeGreaterThan(1e-12);
      expect(acid.ka, acid.name).toBeLessThan(1);
    }
  });

  it('never lets a polyprotic acid into the monoprotic pool', () => {
    // The lausnir/molmassi lesson: the data declares what it is, so the
    // generator cannot ask a question the student cannot correctly answer.
    for (const acid of MONOPROTIC_ACIDS) {
      expect(acid.protons, acid.name).toBe(1);
    }
    expect(WEAK_ACIDS.some((a) => a.protons > 1)).toBe(true); // guard is load-bearing
  });

  it('never offers a pair the model cannot answer', () => {
    // This assertion used to read "water autoionisation is negligible at 0.1 M"
    // and check every monoprotic acid at that one concentration. That held only
    // while the pool contained nothing weaker than acetic acid. Fenól (Ka
    // 1,3 × 10⁻¹⁰) breaks it: at 0,1 M its [H⁺] is 3,6 × 10⁻⁶ and water's own
    // 10⁻⁷ is 2,8 % of that, so the pH the engine computes is not the pH the
    // solution has. The acid is not the problem — the *pair* is, and fenól at
    // 1,0 M is fine. So the guard moved to the pair, and this checks the pair.
    for (const { acid, concentration } of ANSWERABLE_PAIRS) {
      const { hExact } = solveWeakAcid(acid.ka, concentration);
      expect(waterContributionMatters(hExact), `${acid.name} @ ${concentration} M`).toBe(false);
    }
  });

  it('the answerability guard actually rejects something', () => {
    // A guard that never fires is a guard nobody notices has stopped working.
    // 6 of the 28 acid×concentration pairs are refused, all of them fenól below
    // 1,0 M. If the pool changes so that nothing is refused, this fails and asks
    // whether the guard still means anything.
    const total = MONOPROTIC_ACIDS.length * CONCENTRATIONS.length;
    expect(ANSWERABLE_PAIRS.length).toBeLessThan(total);
    expect(ANSWERABLE_PAIRS.length).toBeGreaterThan(total / 2);
    expect(
      isAnswerable(
        WEAK_ACIDS.find((a) => a.id === 'fenol')!,
        0.01
      )
    ).toBe(false);
    expect(
      isAnswerable(
        WEAK_ACIDS.find((a) => a.id === 'fenol')!,
        1.0
      )
    ).toBe(true);
  });

  it('excludes every polyprotic acid from the answerable pairs, not just the pool', () => {
    const polyprotic = WEAK_ACIDS.filter((a) => a.protons > 1);
    expect(polyprotic.length).toBeGreaterThan(0);
    for (const acid of polyprotic) {
      for (const c of CONCENTRATIONS) {
        expect(isAnswerable(acid, c), `${acid.name} @ ${c} M`).toBe(false);
      }
    }
  });

  it('names every acid somewhere the platform already ships it', () => {
    // The other half of the data discipline: an invented Icelandic name is the
    // error this repo re-committed in April after fixing it in February.
    for (const acid of WEAK_ACIDS) {
      expect(acid.nameEstablished, acid.name).not.toBe('');
    }
  });

  it('declines every name, because the question templates need oblique cases', () => {
    // `lausn af ediksýra` is not Icelandic. The pool spans three genders, so the
    // nominative cannot be massaged into the dative by rule — CLAUDE.md's
    // standing warning that a term swap in Icelandic is not a string swap.
    for (const acid of WEAK_ACIDS) {
      expect(acid.nameDative, acid.name).not.toBe('');
      expect(acid.nameGenitive, acid.name).not.toBe('');
      expect(acid.nameDative, `${acid.name} dative is capitalised`).toBe(
        acid.nameDative.toLowerCase()
      );
      expect(acid.nameGenitive, `${acid.name} genitive is capitalised`).toBe(
        acid.nameGenitive.toLowerCase()
      );
      // Every name in this pool declines, so no oblique form may equal the
      // nominative — that is the shape the bug took before this test existed.
      expect(acid.nameDative, `${acid.name} dative is the nominative`).not.toBe(
        acid.name.toLowerCase()
      );
      expect(acid.nameGenitive, `${acid.name} genitive is the nominative`).not.toBe(
        acid.name.toLowerCase()
      );
    }
  });

  it('has unique ids and formulas', () => {
    expect(new Set(WEAK_ACIDS.map((a) => a.id)).size).toBe(WEAK_ACIDS.length);
    expect(new Set(WEAK_ACIDS.map((a) => a.formula)).size).toBe(WEAK_ACIDS.length);
  });
});

describe('every Ka traces to Brown Appendix D', () => {
  // Siggi supplied Tables D.1 and D.2 on 2026-09-19 and ruled Appendix D
  // authoritative. This file's acids were verified against D.1 that day; this
  // holds them there, so a future edit cannot quietly swap in another book's
  // second significant figure.
  const D1: Record<string, number> = {
    maurasyra: 1.8e-4, // formic
    ediksyra: 1.8e-5, // acetic
    propansyra: 1.3e-5, // propionic
    flussyra: 6.8e-4, // hydrofluoric
    saltpeturssyrlingur: 4.5e-4, // nitrous
    fenol: 1.3e-10, // phenol
    vetnissyanid: 4.9e-10, // hydrocyanic
    kolsyra: 4.3e-7, // carbonic Ka1
    oxalsyra: 5.9e-2, // oxalic Ka1
  };

  it('covers every acid in the pool, so a new one cannot skip the check', () => {
    expect(Object.keys(D1).sort()).toEqual(WEAK_ACIDS.map((a) => a.id).sort());
  });

  it.each(WEAK_ACIDS.map((a) => [a.id, a.name] as const))('%s (%s)', (id) => {
    const acid = WEAK_ACIDS.find((a) => a.id === id)!;
    expect(acid.ka, `${id} is not its Appendix D value`).toBe(D1[id]);
  });

  it('HNO2 and HCN are in, with the values D.1 settled', () => {
    // Both were held out until 2026-09-19: first because two sources disagreed
    // about their Ka, then — once D.1 settled that — because the platform had no
    // Icelandic name for either. Siggi ruled the four terms that day.
    const hno2 = WEAK_ACIDS.find((a) => a.id === 'saltpeturssyrlingur')!;
    expect(hno2.ka).toBe(4.5e-4); // not the competing 5.6e-4
    expect(hno2.conjugateBaseName).toBe('nítrítjón');
    const hcn = WEAK_ACIDS.find((a) => a.id === 'vetnissyanid')!;
    expect(hcn.ka).toBe(4.9e-10); // not the competing 6.2e-10
    expect(hcn.conjugateBaseName).toBe('sýaníðjón');
  });

  it('HF is in the pool, and is the case that breaks the 5 % rule', () => {
    // Added 2026-09-19 once its name was ruled. Unlike the rest it dissociates
    // far enough that the approximation fails over most of the range, which is
    // the Beita phase's whole point — so its presence is deliberate, not an
    // oversight to be "corrected" by removing it.
    const hf = WEAK_ACIDS.find((a) => a.id === 'flussyra');
    expect(hf).toBeDefined();
    expect(hf!.protons).toBe(1);
    const { hExact } = solveWeakAcid(hf!.ka, 0.1);
    expect(hExact / 0.1).toBeGreaterThan(0.05);
  });
});
