import { describe, it, expect } from 'vitest';

import { ELEMENTS } from '../data/elements';
import {
  particleMisconception,
  tableClickMisconception,
  level2Misconception,
} from '../utils/misconceptions';

/**
 * The Year-1 curriculum review found this game names no misconception at all —
 * zero call sites across all 26 items — so "Rangt" plus a restatement of the
 * right answer was the whole response. These check the diagnosis reads the
 * student's actual answer rather than reaching for a catch-all.
 */

const bySymbol = (symbol: string) => ELEMENTS.find((e) => e.symbol === symbol)!;

describe('particleMisconception', () => {
  const carbon = bySymbol('C'); // Z 6, A 12, N 6 — Z and N coincide
  const copper = bySymbol('Cu'); // Z 29, A 63, N 34

  it('has the elements it tests with', () => {
    expect(carbon.atomicNumber).toBe(6);
    expect(copper.atomicNumber).toBe(29);
    expect(copper.massNumber - copper.atomicNumber).toBe(34);
  });

  it('reads the mass number given for a proton count', () => {
    expect(particleMisconception('protons', copper, 63)).toMatch(/massatölunni \(63\)/);
    expect(particleMisconception('electrons', copper, 63)).toMatch(/Rafeindir/);
  });

  it('reads the neutron count given for a proton count', () => {
    expect(particleMisconception('protons', copper, 34)).toMatch(/fjölda nifteinda/);
  });

  it('reads a neutron answer that gave the protons, the mass number, or a sum', () => {
    expect(particleMisconception('neutrons', copper, 29)).toMatch(/fjölda róteinda/);
    expect(particleMisconception('neutrons', copper, 63)).toMatch(/Massatalan \(63\)/);
    expect(particleMisconception('neutrons', copper, 92)).toMatch(/lagt saman þar sem á að draga/);
  });

  it('names the atomic-mass-vs-mass-number trap', () => {
    // Cu's atomic mass is 63.546, which rounds to 64 — not its mass number, 63.
    // A student reading the table instead of the isotope name lands on 64 - 29.
    const rounded = Math.round(copper.atomicMass);
    expect(rounded).not.toBe(copper.massNumber);
    expect(particleMisconception('neutrons', copper, rounded - copper.atomicNumber)).toMatch(
      /frumeindamassann/
    );
  });

  it('says nothing about an answer it cannot read', () => {
    expect(particleMisconception('protons', copper, 1)).toBeUndefined();
    expect(particleMisconception('neutrons', copper, 7)).toBeUndefined();
    expect(particleMisconception('identify-by-particles', copper, 3)).toBeUndefined();
  });

  it('does not claim a neutron/proton mix-up where the two coincide', () => {
    // Carbon-12 has six of each, so "you gave the neutrons" says nothing.
    expect(particleMisconception('protons', carbon, 6)).toBeUndefined();
  });
});

describe('tableClickMisconception', () => {
  it('names a click in the same lota', () => {
    const target = bySymbol('O'); // period 2, group 16
    const sameRow = ELEMENTS.find(
      (e) => e.period === target.period && e.symbol !== target.symbol && e.group !== target.group
    )!;
    expect(tableClickMisconception(target, sameRow)).toMatch(/sömu lotu/);
  });

  it('names a click in the same flokkur', () => {
    const target = bySymbol('O');
    const sameColumn = ELEMENTS.find(
      (e) => e.group === target.group && e.symbol !== target.symbol && e.period !== target.period
    )!;
    expect(tableClickMisconception(target, sameColumn)).toMatch(/sama flokki/);
  });

  it('says nothing when the click was right', () => {
    const target = bySymbol('O');
    expect(tableClickMisconception(target, target)).toBeUndefined();
  });
});

describe('level2Misconception', () => {
  it.each(['classify', 'order-by-mass', 'group-property', 'trend'] as const)(
    '%s has something to say',
    (type) => {
      const message = level2Misconception(type);
      expect(message).toBeTruthy();
      expect(message!.length).toBeGreaterThan(40);
    }
  );

  it('keeps lota and flokkur the right way round', () => {
    expect(level2Misconception('group-property')).toMatch(/flokkurinn — lóðrétti dálkurinn/);
    expect(level2Misconception('group-property')).toMatch(/Lotan, lárétta röðin/);
  });
});
