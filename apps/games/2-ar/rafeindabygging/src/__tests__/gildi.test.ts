import { describe, expect, it } from 'vitest';

import { answerOf, explanation, isAnswer } from '../components/GildiScreen';
import { GILDI_ITEMS, KANNA_ELEMENTS } from '../data/gildi';
import {
  atomConfig,
  ionConfig,
  ionLabel,
  lewisSides,
  shorthand,
  sidesLabel,
  valenceElectrons,
} from '../engine/gildi';

describe('configurations from Z', () => {
  it('builds the atoms the book writes out', () => {
    expect(shorthand(atomConfig(11))).toBe('[Ne] 3s¹');
    expect(shorthand(atomConfig(26))).toBe('[Ar] 4s² 3d⁶');
    expect(shorthand(atomConfig(35))).toBe('[Ar] 4s² 3d¹⁰ 4p⁵');
    expect(shorthand(atomConfig(1))).toBe('1s¹');
  });

  it('keeps the Cr and Cu exceptions Stig 3 teaches', () => {
    expect(shorthand(atomConfig(24))).toBe('[Ar] 4s¹ 3d⁵');
    expect(shorthand(atomConfig(29))).toBe('[Ar] 4s¹ 3d¹⁰');
  });

  it("agrees with every key in Stig 3's own data", async () => {
    const { periodicPuzzles } = await import('../data/periodic-configs');
    // Strontium (Z = 38) is past krypton, where this engine stops.
    for (const p of periodicPuzzles.filter((q) => q.atomicNumber <= 36)) {
      expect(shorthand(atomConfig(p.atomicNumber)), p.element).toBe(p.fullShorthand);
    }
  });

  it("makes the book's worked ions (m68734)", () => {
    expect(shorthand(ionConfig(11, 1))).toBe('[Ne]');
    expect(shorthand(ionConfig(15, -3))).toBe('[Ar]');
    expect(shorthand(ionConfig(13, 2))).toBe('[Ne] 3s¹');
    expect(shorthand(ionConfig(26, 2))).toBe('[Ar] 3d⁶');
  });

  it('takes a transition metal’s 4s electrons before its 3d', () => {
    expect(shorthand(ionConfig(26, 3))).toBe('[Ar] 3d⁵');
    expect(shorthand(ionConfig(29, 1))).toBe('[Ar] 3d¹⁰');
    expect(shorthand(ionConfig(29, 2))).toBe('[Ar] 3d⁹');
    expect(shorthand(ionConfig(30, 2))).toBe('[Ar] 3d¹⁰');
    expect(shorthand(ionConfig(31, 3))).toBe('[Ar] 3d¹⁰');
  });

  it('refuses what it cannot build', () => {
    expect(() => atomConfig(37)).toThrow();
    expect(() => valenceElectrons(26)).toThrow();
    expect(() => lewisSides(9)).toThrow();
  });
});

describe('valence electrons and Lewis symbols', () => {
  it('counts the highest n only, so bromine has seven', () => {
    expect(valenceElectrons(35)).toBe(7);
    expect(valenceElectrons(15)).toBe(5);
    expect(valenceElectrons(20)).toBe(2);
    expect(valenceElectrons(31)).toBe(3);
  });

  it('is the same down a main group', () => {
    for (const [a, b] of [
      [9, 17],
      [17, 35],
      [8, 16],
      [16, 34],
      [11, 19],
    ]) {
      expect(valenceElectrons(a)).toBe(valenceElectrons(b));
    }
  });

  it('puts one dot on each side before any side takes two', () => {
    expect(lewisSides(1)).toEqual([1, 0, 0, 0]);
    expect(lewisSides(4)).toEqual([1, 1, 1, 1]);
    expect(lewisSides(5)).toEqual([2, 1, 1, 1]);
    expect(lewisSides(7)).toEqual([2, 2, 2, 1]);
    expect(lewisSides(8)).toEqual([2, 2, 2, 2]);
  });

  it('reads the dots aloud', () => {
    expect(sidesLabel([1, 0, 0, 0])).toBe('1 punktur');
    expect(sidesLabel([1, 1, 1, 0])).toBe('3 punktar, allir stakir');
    expect(sidesLabel([2, 1, 1, 1])).toBe('5 punktar: eitt par og þrír stakir');
    expect(sidesLabel([2, 2, 2, 2])).toBe('8 punktar, fjögur pör');
  });

  it('writes ion charges as superscripts', () => {
    expect(ionLabel('Fe', 2)).toBe('Fe²⁺');
    expect(ionLabel('Cl', -1)).toBe('Cl⁻');
    expect(ionLabel('N', -3)).toBe('N³⁻');
  });
});

describe('the data', () => {
  it.each(GILDI_ITEMS.map((i) => [i.id, i] as const))(
    '%s offers its key exactly once, among four distinct options',
    (_, item) => {
      const keys = item.options.map((o) => (Array.isArray(o.value) ? o.value.join() : o.value));
      expect(new Set(keys).size).toBe(4);
      expect(item.options.filter((o) => isAnswer(item, o.value))).toHaveLength(1);
      for (const o of item.options) {
        if (!isAnswer(item, o.value)) expect(o.slip, `${item.id}: ${keys}`).toBeTruthy();
      }
    }
  );

  it('asks each ion question about the ion it names', () => {
    for (const item of GILDI_ITEMS) {
      if (item.kind !== 'jon') continue;
      expect(item.question).toContain(ionLabel(item.symbol, item.charge));
    }
  });

  it('every Lewis option has the same symbol and plausible dots', () => {
    for (const item of GILDI_ITEMS) {
      if (item.kind !== 'lewis') continue;
      for (const o of item.options) {
        expect(o.value.every((n) => n >= 0 && n <= 2)).toBe(true);
      }
    }
  });

  it('every explanation names the answer it explains', () => {
    for (const item of GILDI_ITEMS) {
      const text = explanation(item).join(' ');
      const key = answerOf(item);
      if (item.kind === 'jon') expect(text).toContain(String(key));
      if (item.kind === 'gildi') expect(text).toContain(`${key} talsins`);
    }
  });

  it('Kanna offers only main-group elements, each with a Lewis symbol', () => {
    for (const e of KANNA_ELEMENTS) {
      expect(() => lewisSides(valenceElectrons(e.z)), e.symbol).not.toThrow();
      if (e.ion !== undefined) {
        // Every ion Kanna names reaches a noble gas's configuration.
        expect(shorthand(ionConfig(e.z, e.ion)), e.symbol).toMatch(/^\[\w+\](?: 3d¹⁰)?$/);
      }
    }
  });
});
