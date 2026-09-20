import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { canConvertToKp } from '@shared/engine/equilibrium';

import { KP_PROBLEMS } from '../data/problems';
import { REACTIONS, WITH_CONSTANT } from '../data/reactions';

/**
 * Every constant traces to a named place in the school's own textbook.
 *
 * **This is the local form of Siggi's 2026-09-19 ruling, not a copy of it.**
 * That ruling says a constant with no Appendix D row does not ship, and it is
 * what `3-ar/syrufastinn` and `3-ar/leysnijafnvaegi` are held to by their
 * `appendix-d-conformance` tests. There is no Appendix D table for Kc — in
 * either book — because a general equilibrium constant is only meaningful
 * beside its temperature, so both books state Kc values inside worked examples.
 *
 * So the rule here is: a citation, or the constant does not ship. If Siggi
 * would rather supply a Kc table, this test is what would change.
 */

const repoRoot = join(__dirname, '../../../../../..');

describe('every constant is sourced', () => {
  it('gives each reaction a citation naming a real chapter module', () => {
    for (const r of REACTIONS) {
      expect(r.source.module, r.id).toMatch(/^ch\d\d\/m\d+$/);
      expect(r.source.where.trim().length, r.id).toBeGreaterThan(8);
    }
  });

  it('gives each constant its own citation', () => {
    for (const r of WITH_CONSTANT) {
      const c = r.constant!;
      expect(c.source.module, r.id).toMatch(/^ch\d\d\/m\d+$/);
      expect(c.source.where.trim().length, r.id).toBeGreaterThan(8);
    }
  });

  it('cites only the two equilibrium modules', () => {
    // If a value ever arrives from somewhere else, that is worth noticing
    // rather than absorbing silently.
    const allowed = new Set(['ch13/m68798', 'ch13/m68801']);
    for (const r of REACTIONS) {
      expect(allowed.has(r.source.module), `${r.id}: ${r.source.module}`).toBe(true);
      if (r.constant) {
        expect(allowed.has(r.constant.source.module), r.id).toBe(true);
      }
    }
  });

  it('gives every constant a positive finite value', () => {
    for (const r of WITH_CONSTANT) {
      expect(Number.isFinite(r.constant!.value), r.id).toBe(true);
      expect(r.constant!.value, r.id).toBeGreaterThan(0);
    }
  });

  it('records a temperature for most constants and never invents one', () => {
    // Five constants genuinely have no temperature in the book — it states one
    // for most values and not for all. The list is asserted by name so that a
    // future edit which quietly supplies one is a failure rather than a silent
    // improvement, and so that adding a reaction without checking is caught.
    const without = WITH_CONSTANT.filter((r) => r.constant!.temperatureC === undefined);
    expect(without.map((r) => r.id).sort()).toEqual([
      'ammoniumklorid',
      'blasyra',
      'brennisteinsvetni',
      'nituroxidklorid',
      'pcl5',
    ]);
  });

  it('keeps a Kp quoted as Kp out of the Kc-to-Kp exercise', () => {
    // Nothing converts a constant the book already states as Kp. Asking a
    // student to convert it would mean converting it back first, and
    // `canConvertToKp` guards that by requiring a Kc basis.
    const quotedAsKp = WITH_CONSTANT.filter((r) => r.constant!.basis === 'Kp');
    expect(quotedAsKp.length).toBeGreaterThan(0);
    for (const r of quotedAsKp) {
      expect(canConvertToKp(r), r.id).toBe(false);
    }
  });
});

describe('agreement with the rest of the platform', () => {
  it('quotes HCN at the value Sýrufastinn ships', () => {
    // The book uses HCN as its algebra-simplifying example and gives
    // Kc = 4,9 × 10⁻¹⁰. That is the same number as HCN's sýrufasti, which
    // 3-ar/syrufastinn takes from Brown Table D.1 — and the point the Skilja
    // phase makes is that they are the same quantity, not two that happen to
    // agree. If one node ever moves, this fails.
    const acids = readFileSync(
      join(repoRoot, 'apps/games/3-ar/syrufastinn/src/data/acids.ts'),
      'utf8'
    );
    const blasyra = REACTIONS.find((r) => r.id === 'blasyra')!;
    const mantissa = blasyra.constant!.value / 1e-10;
    expect(mantissa).toBeCloseTo(4.9, 10);
    expect(acids).toMatch(/4\.9e-10|4\.9 ?\* ?(Math\.pow\(10, ?-10\)|1e-10)/);
  });

  it('shares the lead-chloride equilibrium with Leysnijafnvægi', () => {
    // The book's first heterogeneous example is PbCl₂(s) ⇌ Pb²⁺ + 2Cl⁻ with
    // Kc = [Pb²⁺][Cl⁻]², which IS a leysnimargfeldi. 3-ar/leysnijafnvaegi
    // ships that salt with its Appendix D.3 constant, so the two nodes are
    // describing one equilibrium from two directions. No Ksp value is copied
    // here — only the claim that the salt is in both pools.
    const salts = readFileSync(
      join(repoRoot, 'apps/games/3-ar/leysnijafnvaegi/src/data/salts.ts'),
      'utf8'
    );
    expect(salts).toContain("formula: 'PbCl₂'");
    expect(REACTIONS.some((r) => r.id === 'blyklorid')).toBe(true);
  });
});

describe('the Kc-to-Kp exercise keeps its shape', () => {
  it('does not let Δn = 0 take over the set', () => {
    // KP_PROBLEMS is a blanket filter over everything convertible, so a
    // reaction added for another purpose joins this exercise by default. The
    // cobalt pair did exactly that — both Δn = 0 — and would have made five of
    // ten problems the special case where (R·T)^Δn disappears. They now carry
    // `excludeFromKpExercise`. This is the guard that says so next time.
    const flat = KP_PROBLEMS.filter((p) => p.deltaN === 0);
    expect(flat.length, KP_PROBLEMS.map((p) => `${p.id}:${p.deltaN}`).join(' ')).toBeLessThan(
      KP_PROBLEMS.length / 2
    );
  });

  it('spans both signs of Δn as well as zero', () => {
    const signs = new Set(KP_PROBLEMS.map((p) => Math.sign(p.deltaN)));
    expect([...signs].sort()).toEqual([-1, 0, 1]);
  });

  it('excludes only what is named, and names why', () => {
    // An exclusion list that grows silently is an exemption that stops
    // enforcing the rule it was carved out of.
    const excluded = REACTIONS.filter((r) => r.excludeFromKpExercise).map((r) => r.id);
    expect(excluded.sort()).toEqual(['kobolt-koloxid', 'kobolt-vetni']);
  });
});
