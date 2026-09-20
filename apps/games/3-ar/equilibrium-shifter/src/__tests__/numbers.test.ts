import { describe, expect, it } from 'vitest';

import { FORMATION_ENTHALPY, shiftConstantWithTemperature } from '@shared/data/thermo';
import { reactionQuotient } from '@shared/engine/equilibrium';

import { CONSTANTS, STARTING_MIXTURES, WITHOUT_CONSTANT } from '../data/constants';
import { equilibria } from '../data/equilibria';
import { applyStress, asReaction, canSolve, derivedEnthalpy, equilibrate } from '../engine/stress';
import { calculateShift } from '../utils/le-chatelier';

const byId = (id: number) => equilibria.find((e) => e.id === id)!;

describe('the sourced constants', () => {
  it('accounts for every equilibrium exactly once', () => {
    // A system either has a sourced constant or a written reason it has none.
    // Nothing may fall between the two, which is how an unsourced number would
    // otherwise appear without anyone deciding to put it there.
    for (const e of equilibria) {
      const has = CONSTANTS[e.id] !== undefined;
      const excused = WITHOUT_CONSTANT[e.id] !== undefined;
      expect(has !== excused, `equilibrium ${e.id} is ${has && excused ? 'both' : 'neither'}`).toBe(
        true
      );
    }
    expect(Object.keys(CONSTANTS).length + Object.keys(WITHOUT_CONSTANT).length).toBe(
      equilibria.length
    );
  });

  it('keeps the count of unsourced systems at ten', () => {
    // Asserted so that quietly supplying a missing constant is a failure
    // rather than an improvement nobody reviewed.
    expect(Object.keys(WITHOUT_CONSTANT).length).toBe(10);
  });

  it('gives every constant a positive finite value and a source', () => {
    for (const [id, c] of Object.entries(CONSTANTS)) {
      expect(Number.isFinite(c.value), id).toBe(true);
      expect(c.value, id).toBeGreaterThan(0);
      expect(c.source.trim().length, id).toBeGreaterThan(8);
    }
  });

  it('writes a reason for each system that has no constant', () => {
    for (const [id, why] of Object.entries(WITHOUT_CONSTANT)) {
      expect(why.trim().length, id).toBeGreaterThan(20);
    }
  });

  it('makes a reversed pair reciprocal, not separately looked up', () => {
    // CO + H₂O ⇌ CO₂ + H₂ and H₂ + CO₂ ⇌ H₂O + CO are the same equilibrium
    // written both ways, so their constants must multiply to 1. Two independent
    // lookups would not guarantee that; deriving one from the other does.
    expect(CONSTANTS[14].value * CONSTANTS[18].value).toBeCloseTo(1, 12);
    expect(CONSTANTS[14].temperatureC).toBe(CONSTANTS[18].temperatureC);
  });

  it('gives the same constant to every copy of the same reaction', () => {
    const haber = [11, 25, 26, 28].map((id) => CONSTANTS[id].value);
    expect(new Set(haber).size).toBe(1);
    expect(new Set([12, 30].map((id) => CONSTANTS[id].value)).size).toBe(1);
    expect(new Set([8, 24].map((id) => CONSTANTS[id].value)).size).toBe(1);
  });
});

describe('the shape of the pool', () => {
  it('reuses six of the thirty slots on two equations, and that is on purpose', () => {
    // The Haber process appears four times and the contact process twice. That
    // is NOT redundancy to clean up: each copy frames a different question —
    // temperature dependence, pressure optimisation, what a catalyst does —
    // and their names say so. Recorded here for the same reason
    // docs/README.md records the four look-alike option arrays: so nobody
    // "fixes" it, and so it cannot quietly grow.
    const counts = new Map<string, number>();
    for (const e of equilibria) counts.set(e.equation, (counts.get(e.equation) ?? 0) + 1);
    const repeated = [...counts.entries()].filter(([, n]) => n > 1).sort();
    expect(repeated).toEqual([
      ['2SO₂(g) + O₂(g) ⇌ 2SO₃(g)', 2],
      ['N₂(g) + 3H₂(g) ⇌ 2NH₃(g)', 4],
    ]);
  });

  it('writes acetic acid twice on purpose, as two different equations', () => {
    // Not a duplicate by equation, and not an accident: one is written with a
    // bare proton and one with hydronium, which is the distinction Y3 is
    // supposed to notice. They share a Ka because they are the same chemistry.
    expect(byId(8).equation).toBe('CH₃COOH(aq) ⇌ CH₃COO⁻(aq) + H⁺(aq)');
    expect(byId(24).equation).toBe('CH₃COOH(aq) + H₂O(l) ⇌ CH₃COO⁻(aq) + H₃O⁺(aq)');
    expect(CONSTANTS[8].value).toBe(CONSTANTS[24].value);
  });

  it('gives every repeated reaction its own framing', () => {
    // If two copies had the same name they really would be duplicates.
    const haber = equilibria.filter((e) => e.equation === 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)');
    expect(haber.length).toBe(4);
    expect(new Set(haber.map((e) => e.nameIs)).size).toBe(4);
  });
});

describe('the derived enthalpies', () => {
  it('matches the stored value exactly, wherever the book covers the reaction', () => {
    // Not merely "agrees in sign": one number, not two. A stored ΔH that can
    // drift from the equation it belongs to is how this game came to answer
    // H₂ + I₂ ⇌ 2HI backwards, and this is what makes that unwritable.
    let checked = 0;
    for (const e of equilibria) {
      const derived = derivedEnthalpy(e);
      if (derived === null) continue;
      expect(e.thermodynamics.deltaH, `${e.id} ${e.equation}`).toBeCloseTo(derived, 1);
      expect(e.thermodynamics.type, `${e.id} ${e.equation}`).toBe(
        derived > 0 ? 'endothermic' : 'exothermic'
      );
      checked += 1;
    }
    expect(checked, 'nothing was derivable, so this test proved nothing').toBeGreaterThan(15);
  });

  it('keeps H₂ + I₂ ⇌ 2HI exothermic, which it was not', () => {
    // The game shipped +53 kJ/mol, which is the enthalpy of
    // H₂(g) + I₂(**s**) → 2HI(g) — a different equation from the one it writes
    // and draws. For gaseous iodine the reaction is mildly EXOthermic at
    // −9,5 kJ/mol, so the game answered both temperature stresses backwards on
    // a beginner-level system. Iodine is a gas at the 400 °C this equilibrium
    // is run at, and `3-ar/jafnvaegisfasti` ships the same reaction as I₂(g).
    const e = byId(2);
    expect(e.equation).toContain('I₂(g)');
    expect(derivedEnthalpy(e)!).toBeCloseTo(-9.48, 2);
    expect(e.thermodynamics.type).toBe('exothermic');
  });

  it('records where the two books differ, without hiding it', () => {
    // Deriving from the Icelandic appendix moved two values by more than
    // rounding: N₂O₄ ⇌ 2NO₂ from 58 to 55,3 (its ΔHf°(N₂O₄) is 11,1 against
    // roughly 9,2 elsewhere) and CaCO₃ ⇌ CaO + CO₂ from 178 to 191,6 (ΔHf° of
    // calcite −1220,0 against Brown's −1207,1). Neither changes a sign, so no
    // answer moved — but the same two-book divergence that made Ksp a problem
    // is present here too, and this is where it is written down.
    expect(derivedEnthalpy(byId(1))!).toBeCloseTo(55.3, 1);
    expect(derivedEnthalpy(byId(5))!).toBeCloseTo(191.59, 1);
  });

  it('returns null rather than a partial sum when a species is missing', () => {
    // Hemoglobin is not in any thermodynamic table, so the whole reaction has
    // no derived enthalpy — not the enthalpy of the oxygen alone.
    expect(derivedEnthalpy(byId(29))).toBeNull();
    expect(FORMATION_ENTHALPY['Hb(aq)']).toBeUndefined();
  });
});

describe('settling a mixture', () => {
  it('lands on K for every system with a starting mixture', () => {
    for (const [idText, start] of Object.entries(STARTING_MIXTURES)) {
      const id = Number(idText);
      const e = byId(id);
      const k = CONSTANTS[id].value;
      const settled = equilibrate(e, k, start)!;
      expect(settled, `${id} did not settle`).not.toBeNull();
      const q = reactionQuotient(asReaction(e), settled);
      expect(Math.abs(q - k) / k, `${id} settled to Q = ${q}, K = ${k}`).toBeLessThan(1e-9);
    }
  });

  it('never drives a concentration negative', () => {
    for (const [idText, start] of Object.entries(STARTING_MIXTURES)) {
      const id = Number(idText);
      const settled = equilibrate(byId(id), CONSTANTS[id].value, start)!;
      for (const [formula, amount] of Object.entries(settled)) {
        expect(amount, `${id} ${formula}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('ignores how much solvent water is written in', () => {
    // Water is in K's derivation only as the thing that was divided out. If
    // its stated amount moved the answer, the equation would be wrong.
    const e = byId(9);
    const base = equilibrate(e, CONSTANTS[9].value, STARTING_MIXTURES[9])!;
    const less = equilibrate(e, CONSTANTS[9].value, { ...STARTING_MIXTURES[9], 'H₂O': 1 })!;
    expect(less['NH₄⁺']).toBeCloseTo(base['NH₄⁺'], 12);
  });

  it('gives no mixture where K has nothing on one side', () => {
    // H₂O(l) ⇌ H⁺ + OH⁻ and AgCl(s) ⇌ Ag⁺ + Cl⁻ carry a constant but cannot
    // be settled: there is no extent to solve for.
    expect(canSolve(byId(7))).toBe(false);
    expect(canSolve(byId(10))).toBe(false);
    expect(STARTING_MIXTURES[7]).toBeUndefined();
    expect(STARTING_MIXTURES[10]).toBeUndefined();
  });

  it('reproduces the weak-acid result a student would get by hand', () => {
    // 0,10 M acetic acid, Ka = 1,8 × 10⁻⁵: x = √(Ka·C) to the five per cent
    // rule gives 1,34 × 10⁻³ M, and pH 2,87 — the value 3-ar/ph-titration
    // stores for the same beaker.
    const settled = equilibrate(byId(8), CONSTANTS[8].value, STARTING_MIXTURES[8])!;
    expect(settled['H⁺']).toBeCloseTo(1.33e-3, 5);
    expect(-Math.log10(settled['H⁺'])).toBeCloseTo(2.88, 2);
  });
});

describe('applying a stress', () => {
  const stressed = (id: number, stress: Parameters<typeof applyStress>[3]) =>
    applyStress(byId(id), CONSTANTS[id], STARTING_MIXTURES[id], stress)!;

  it('moves Q and leaves K alone for a concentration change', () => {
    const out = stressed(11, { type: 'add-reactant', target: 'N₂' });
    expect(out.kAfter).toBe(out.kBefore);
    expect(out.q).toBeLessThan(out.kBefore);
    expect(out.inert).toBe(false);
  });

  it('moves K and leaves the mixture alone for a temperature change', () => {
    // The Haber process is exothermic, so heating must lower K. The mixture
    // is untouched at the instant of the change, which is the distinction the
    // whole topic turns on.
    const out = stressed(11, { type: 'increase-temp', target: null });
    expect(out.kAfter).toBeLessThan(out.kBefore);
    expect(out.q).toBeCloseTo(out.kBefore, 9);
    expect(out.afterStress).toEqual(out.before);
    expect(out.deltaH).toBeCloseTo(-91.8, 6);
    expect(out.temperatureAfterC).toBe(500);
  });

  it('raises K on cooling an exothermic reaction', () => {
    const out = stressed(11, { type: 'decrease-temp', target: null });
    expect(out.kAfter).toBeGreaterThan(out.kBefore);
    expect(out.temperatureAfterC).toBe(300);
  });

  it('raises K on heating an endothermic reaction', () => {
    const out = stressed(1, { type: 'increase-temp', target: null });
    expect(out.deltaH!).toBeGreaterThan(0);
    expect(out.kAfter).toBeGreaterThan(out.kBefore);
  });

  it('tells "cannot say how much" apart from "nothing happens"', () => {
    // PCl₅ ⇌ PCl₃ + Cl₂ carries a Kc the book states no temperature for, so
    // van 't Hoff has nothing to anchor to. In the numbers that looks exactly
    // like a catalyst — K unchanged, mixture unchanged — and means the
    // opposite. Reading one as the other would tell a student a heater and a
    // catalyst do the same thing, which is this game's core misconception.
    const heated = stressed(3, { type: 'increase-temp', target: null });
    expect(heated.kUnknown).toBe(true);
    expect(heated.inert).toBe(false);
    expect(CONSTANTS[3].temperatureC).toBeUndefined();

    const catalysed = stressed(3, { type: 'add-catalyst', target: null });
    expect(catalysed.inert).toBe(true);
    expect(catalysed.kUnknown).toBe(false);
  });

  it('knows the new K exactly when it has both a reference temperature and a ΔH', () => {
    // Two things are needed and either can be missing, which is why this is
    // stated as the conjunction rather than as "has a temperature". The
    // aqueous systems are the second case: their constants are quoted at
    // 25 °C, but the formation-enthalpy table carries no dissolved ions, so
    // there is no ΔH to move K with.
    let known = 0;
    let missingEnthalpy = 0;
    for (const e of equilibria) {
      const c = CONSTANTS[e.id];
      const start = STARTING_MIXTURES[e.id];
      if (!c || !start) continue;
      for (const stress of e.possibleStresses) {
        if (stress.type !== 'increase-temp' && stress.type !== 'decrease-temp') continue;
        const out = applyStress(e, c, start, stress)!;
        const computable = c.temperatureC !== undefined && derivedEnthalpy(e) !== null;
        expect(out.kUnknown, `${e.id} ${stress.type}`).toBe(!computable);
        if (computable) known += 1;
        else if (derivedEnthalpy(e) === null) missingEnthalpy += 1;
      }
    }
    expect(known, 'no temperature stress could be computed at all').toBeGreaterThan(8);
    expect(missingEnthalpy, 'the aqueous cases should be the ones without a ΔH').toBeGreaterThan(0);
  });

  it('changes nothing for a catalyst', () => {
    const out = stressed(11, { type: 'add-catalyst', target: null });
    expect(out.inert).toBe(true);
    expect(out.kAfter).toBe(out.kBefore);
    expect(out.afterStress).toEqual(out.before);
    expect(out.q).toBeCloseTo(out.kBefore, 9);
  });

  it('changes nothing for pressure when the gas moles are equal', () => {
    // H₂ + I₂ ⇌ 2HI: two moles of gas each side, so compressing multiplies
    // numerator and denominator alike and Q comes back to exactly K.
    const out = stressed(2, { type: 'increase-pressure', target: null });
    expect(out.inert).toBe(true);
    expect(out.q).toBeCloseTo(out.kBefore, 9);
  });

  it('lowers Q on compressing a reaction that makes fewer gas moles', () => {
    // The Haber process, Δn = −2. This is the case the qualitative panel used
    // to get backwards, so the number and the sentence are checked together.
    const out = stressed(11, { type: 'increase-pressure', target: null });
    expect(out.q).toBeLessThan(out.kBefore);
    expect(calculateShift(byId(11), { type: 'increase-pressure', target: null }).direction).toBe(
      'right'
    );
  });

  it('agrees with the qualitative engine on every stress it can compute', () => {
    // The two halves of this game must not disagree: if Q lands below K the
    // qualitative answer has to be a shift right, and above it a shift left.
    let checked = 0;
    for (const e of equilibria) {
      const constant = CONSTANTS[e.id];
      const start = STARTING_MIXTURES[e.id];
      if (!constant || !start) continue;
      for (const stress of e.possibleStresses) {
        const out = applyStress(e, constant, start, stress);
        if (!out || !Number.isFinite(out.q)) continue;
        const said = calculateShift(e, stress).direction;
        // Temperature moves K rather than Q, so the comparison is Q against
        // the NEW K.
        const ratio = out.q / out.kAfter;
        if (out.kUnknown) {
          // The direction is known; the size of the change is not.
          continue;
        }
        if (out.inert) {
          expect(said, `${e.id} ${stress.type}`).toBe('none');
        } else if (ratio < 1 - 1e-9) {
          expect(said, `${e.id} ${stress.type}: Q/K = ${ratio}`).toBe('right');
        } else if (ratio > 1 + 1e-9) {
          expect(said, `${e.id} ${stress.type}: Q/K = ${ratio}`).toBe('left');
        }
        checked += 1;
      }
    }
    // So the loop cannot pass by skipping everything.
    expect(checked).toBeGreaterThan(40);
  });

  it('settles back onto the new K after the system responds', () => {
    for (const e of equilibria) {
      const constant = CONSTANTS[e.id];
      const start = STARTING_MIXTURES[e.id];
      if (!constant || !start) continue;
      for (const stress of e.possibleStresses) {
        const out = applyStress(e, constant, start, stress);
        if (!out?.afterEquilibrium) continue;
        const q = reactionQuotient(asReaction(e), out.afterEquilibrium);
        expect(
          Math.abs(q - out.kAfter) / out.kAfter,
          `${e.id} ${stress.type} settled to ${q}, K = ${out.kAfter}`
        ).toBeLessThan(1e-9);
      }
    }
  });
});

describe('van ’t Hoff', () => {
  it('is a no-op across zero temperature change', () => {
    expect(shiftConstantWithTemperature(0.5, -91.8, 400, 400)).toBeCloseTo(0.5, 12);
  });

  it('is reversible', () => {
    const up = shiftConstantWithTemperature(0.5, -91.8, 400, 500);
    expect(shiftConstantWithTemperature(up, -91.8, 500, 400)).toBeCloseTo(0.5, 12);
  });

  it('leaves K alone when the reaction is thermoneutral', () => {
    expect(shiftConstantWithTemperature(2, 0, 25, 500)).toBeCloseTo(2, 12);
  });

  it('refuses a temperature at or below absolute zero', () => {
    expect(() => shiftConstantWithTemperature(1, -10, 25, -273.15)).toThrow(RangeError);
  });
});
