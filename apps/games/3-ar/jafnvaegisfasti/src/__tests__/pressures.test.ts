import { describe, expect, it } from 'vitest';

import {
  deltaNGas,
  iceTable,
  extentFromTotalPressure,
  kcToKp,
  reactionQuotient,
  totalPressure,
} from '@shared/engine/equilibrium';

import { PRESSURE_PROBLEMS } from '../data/problems';
import { reactionBy } from '../data/reactions';

/**
 * ICE in partial pressures, checked against the book's own printed answers.
 *
 * The engine is unit-agnostic, so most of this is not new arithmetic — it is
 * evidence that treating pressures as amounts gives the numbers the textbook
 * gives, which is the only thing that makes the claim safe to teach.
 */

const byId = (id: string) => PRESSURE_PROBLEMS.find((p) => p.id.includes(id))!;

describe("the book's own Kp answers", () => {
  it('reproduces the H₂S decomposition — against the approximation the book used', () => {
    // ch13/m68801: 2H₂S ⇌ 2H₂ + S₂, Kp = 2,2 × 10⁻⁶, from 0,824 atm H₂S.
    // Printed answer: H₂S 0,810 · H₂ 0,014 · S₂ 0,0072 atm.
    //
    // Those are the SHORTCUT's numbers — the exercise says in as many words to
    // assume the change is negligible, so 4x³/0,824² = Kp gives x = 7,20 × 10⁻³.
    // The exact root is 7,118 × 10⁻³, 1,2 % lower. Both round to 0,007 and the
    // book's own 5 % check passes, so nothing is wrong with either; the test
    // compares like with like rather than holding the exact root to a figure
    // that was never the exact root.
    const problem = byId('brennisteinsvetni');
    const approx = problem.result.approximateExtent!;
    expect(approx).toBeCloseTo(0.0072, 4);
    expect(0.824 - 2 * approx).toBeCloseTo(0.81, 3);
    expect(2 * approx).toBeCloseTo(0.0144, 4);
    // And the exact root sits just below it, inside the 5 % the rule allows.
    expect(problem.result.extent).toBeCloseTo(0.007118, 5);
    expect(Math.abs(approx - problem.result.extent) / problem.result.extent).toBeLessThan(0.05);
  });

  it('confirms the book’s claim that the change is negligible there', () => {
    // The exercise's part (b) asks the student to confirm it. Same 5 % rule,
    // same threshold as everywhere else on the platform.
    expect(byId('brennisteinsvetni').result.approximationSafe).toBe(true);
  });

  it('reproduces the BrCl pressure the book asks for', () => {
    // Cl₂ + Br₂ ⇌ 2BrCl, Kp = 4,7 × 10⁻². Printed answer: 4,9 × 10⁻² atm.
    //
    // **Read the exercise carefully before reusing it.** Its 0,115 and 0,450
    // atm are the pressures "in the mixture" — the EQUILIBRIUM values — so it
    // is a missing-pressure question, not an ICE, and solving it as an ICE
    // from those two as initial pressures gives a different number entirely.
    // The shipped problem uses different initial pressures for that reason;
    // this checks the book's own question against the K expression directly.
    const kp = reactionBy('bromklorid').constant!.value;
    expect(Math.sqrt(kp * 0.115 * 0.45)).toBeCloseTo(4.9e-2, 3);
  });

  it('reproduces the ammonium chloride result, and its equal pressures', () => {
    // NH₄Cl(s) ⇌ NH₃ + HCl, Kp = 3,06. The solid is out of K and the two
    // gases are 1 : 1, so each is √Kp = 1,75 atm — which is the pressure the
    // exercise measured in the first place.
    const eq = Object.fromEntries(
      byId('ammoniumklorid').result.rows.map((r) => [r.formula, r.equilibrium])
    );
    expect(eq['NH₃']).toBeCloseTo(1.75, 2);
    expect(eq['HCl']).toBeCloseTo(eq['NH₃'], 12);
  });

  it('reproduces the Kc-to-Kp conversion the book prints', () => {
    // N₂ + 3H₂ ⇌ 2NH₃, Kc = 0,50 at 400 °C. Printed answer: Kp = 1,6 × 10⁻⁴.
    const haber = reactionBy('ammoniak');
    const kp = kcToKp(0.5, deltaNGas(haber), 400);
    expect(Number(kp.toPrecision(2))).toBe(1.6e-4);
    // And H₂ + I₂ ⇌ 2HI has Δn = 0, so the book prints Kp = Kc unchanged.
    expect(kcToKp(50.2, deltaNGas(reactionBy('vetnisjodid')), 448)).toBeCloseTo(50.2, 12);
  });
});

describe('total pressure as a measurement', () => {
  it('moves with the extent wherever Δn is not zero', () => {
    for (const p of PRESSURE_PROBLEMS) {
      const dn = deltaNGas(p.reaction);
      if (dn === 0) continue;
      expect(p.equilibriumTotal, p.id).not.toBeNull();
      // P_total(x) = P_total(0) + Δn·x, exactly.
      expect(p.equilibriumTotal!).toBeCloseTo(p.initialTotal + dn * p.result.extent, 9);
    }
  });

  it('reads back the extent it was produced from', () => {
    for (const p of PRESSURE_PROBLEMS) {
      if (deltaNGas(p.reaction) === 0) continue;
      const recovered = extentFromTotalPressure(p.reaction, p.initial, p.equilibriumTotal!);
      expect(recovered, p.id).toBeCloseTo(p.result.extent, 9);
    }
  });

  it('is unmoved by how much solid is in the flask', () => {
    // The lesson a heterogeneous equilibrium is for. NH₄Cl is not in K, so
    // tenfold more of it settles to exactly the same gas pressures — and it
    // gets no ICE row at all, which is the textbook convention.
    const salt = byId('ammoniumklorid');
    const more = iceTable(
      salt.reaction,
      { ...salt.initial, 'NH₄Cl': 50 },
      salt.reaction.constant!.value
    );
    expect(more.extent).toBeCloseTo(salt.result.extent, 9);
    expect(salt.result.rows.map((r) => r.formula).sort()).toEqual(['HCl', 'NH₃']);
  });

  it('refuses to measure an extent where Δn is zero', () => {
    // Cl₂ + Br₂ ⇌ 2BrCl: two moles of gas each side, so the manometer never
    // moves however far the reaction runs. Refusing is the teaching point —
    // a number here would be invented from a measurement carrying none.
    const flat = byId('bromklorid');
    expect(deltaNGas(flat.reaction)).toBe(0);
    expect(flat.equilibriumTotal).toBeNull();
    expect(() => extentFromTotalPressure(flat.reaction, flat.initial, 1.0)).toThrow(/Δn = 0/);
  });

  it('holds total pressure constant across the whole run where Δn is zero', () => {
    const flat = byId('bromklorid');
    const eq = Object.fromEntries(flat.result.rows.map((r) => [r.formula, r.equilibrium]));
    expect(totalPressure(flat.reaction, eq)).toBeCloseTo(flat.initialTotal, 9);
  });

  it('leaves a solid out of the total, as a manometer would', () => {
    // NH₄Cl is a solid sitting in the flask. It exerts no partial pressure,
    // so it must not appear in a reading.
    const salt = byId('ammoniumklorid');
    expect(salt.initialTotal).toBe(0);
    expect(salt.equilibriumTotal).toBeCloseTo(2 * 1.75, 2);
  });

  it('refuses a species with no pressure given rather than assuming zero', () => {
    const r = reactionBy('bromklorid');
    expect(() => totalPressure(r, { 'Cl₂': 0.1, 'Br₂': 0.4 })).toThrow(/BrCl/);
  });
});

describe('the pressure problem set', () => {
  it('settles every problem onto its Kp', () => {
    for (const p of PRESSURE_PROBLEMS) {
      const k = p.reaction.constant!.value;
      const eq = Object.fromEntries(p.result.rows.map((r) => [r.formula, r.equilibrium]));
      expect(Math.abs(reactionQuotient(p.reaction, eq) - k) / k, p.id).toBeLessThan(1e-9);
    }
  });

  it('uses only constants the book states as Kp', () => {
    for (const p of PRESSURE_PROBLEMS) {
      expect(p.reaction.constant!.basis, p.id).toBe('Kp');
    }
  });

  it('covers both sides of the approximation and both signs of Δn', () => {
    // A set where the shortcut always works teaches that it always works, and
    // a set where Δn is never zero hides that the manometer can say nothing.
    expect(PRESSURE_PROBLEMS.some((p) => p.result.approximationSafe)).toBe(true);
    expect(PRESSURE_PROBLEMS.some((p) => !p.result.approximationSafe)).toBe(true);
    expect(PRESSURE_PROBLEMS.some((p) => deltaNGas(p.reaction) === 0)).toBe(true);
    expect(PRESSURE_PROBLEMS.some((p) => deltaNGas(p.reaction) !== 0)).toBe(true);
  });

  it('never drives a pressure negative', () => {
    for (const p of PRESSURE_PROBLEMS) {
      for (const row of p.result.rows) {
        expect(row.equilibrium, `${p.id} ${row.formula}`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
