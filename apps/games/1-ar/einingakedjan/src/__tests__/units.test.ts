import { describe, it, expect } from 'vitest';

import {
  applyRatio,
  formatNumber,
  formatQuantity,
  formatSignature,
  inferSpecies,
  orient,
  quantity,
  signature,
  signatureMatches,
  tokensMatch,
  type Equivalence,
} from '../engine/units';

const molarMassMg: Equivalence = {
  id: 'mm-Mg',
  left: { value: 24.31, unit: 'g', species: 'Mg' },
  right: { value: 1, unit: 'mol', species: 'Mg' },
  kind: 'molmassi',
};

const molarMassO2: Equivalence = {
  id: 'mm-O2',
  left: { value: 32.0, unit: 'g', species: 'O₂' },
  right: { value: 1, unit: 'mol', species: 'O₂' },
  kind: 'molmassi',
};

const mlToL: Equivalence = {
  id: 'metric-mL-L',
  left: { value: 1000, unit: 'mL' },
  right: { value: 1, unit: 'L' },
  kind: 'metric',
};

describe('tokensMatch', () => {
  it('cancels identical unit and species', () => {
    expect(tokensMatch({ unit: 'mol', species: 'Mg' }, { unit: 'mol', species: 'Mg' })).toBe(true);
  });

  it('refuses to cancel the same unit on different species', () => {
    // The whole reason units carry a species: mol Mg and mol O2 are different units.
    expect(tokensMatch({ unit: 'mol', species: 'Mg' }, { unit: 'mol', species: 'O₂' })).toBe(false);
  });

  it('treats an untagged token as a wildcard', () => {
    expect(tokensMatch({ unit: 'mL', species: 'H₂O' }, { unit: 'mL' })).toBe(true);
  });

  it('never cancels different units', () => {
    expect(tokensMatch({ unit: 'g', species: 'Mg' }, { unit: 'mol', species: 'Mg' })).toBe(false);
  });
});

describe('inferSpecies', () => {
  it('gives an untagged metric ratio the species of the quantity it meets', () => {
    const q = quantity(250, 'mL', 'NaOH(aq)');
    const inferred = inferSpecies(q, orient(mlToL, 'forward'));
    expect(inferred.num.species).toBe('NaOH(aq)');
    expect(inferred.den.species).toBe('NaOH(aq)');
  });

  it('leaves an already-tagged ratio alone', () => {
    const q = quantity(5, 'g', 'Mg');
    const inferred = inferSpecies(q, orient(molarMassMg, 'flipped'));
    expect(inferred.num.species).toBe('Mg');
    expect(inferred.den.species).toBe('Mg');
  });
});

describe('applyRatio', () => {
  it('cancels and computes a correctly oriented step', () => {
    // 5,00 g Mg * (1 mol Mg / 24,31 g Mg)
    const step = applyRatio(quantity(5.0, 'g', 'Mg'), orient(molarMassMg, 'flipped'));
    expect(step.cancelCount).toBe(1);
    expect(step.after.value).toBeCloseTo(0.2056767, 7);
    expect(formatSignature(step.after)).toBe('mol Mg');
  });

  it('cancels nothing when the ratio is upside down, and says so in the units', () => {
    // 5,00 g Mg * (24,31 g Mg / 1 mol Mg) -> g*g/mol, which means nothing.
    const step = applyRatio(quantity(5.0, 'g', 'Mg'), orient(molarMassMg, 'forward'));
    expect(step.cancelCount).toBe(0);
    expect(formatSignature(step.after)).toBe('g Mg·g Mg / mol Mg');
  });

  it('cancels nothing when the substance is wrong, even with the right unit', () => {
    // The classic stoichiometry error: reaching for the other reactant's molar mass.
    const step = applyRatio(quantity(5.0, 'g', 'Mg'), orient(molarMassO2, 'flipped'));
    expect(step.cancelCount).toBe(0);
  });

  it('carries the species through an untagged metric conversion', () => {
    const step = applyRatio(quantity(250, 'mL', 'NaOH(aq)'), orient(mlToL, 'flipped'));
    expect(step.cancelCount).toBe(1);
    expect(step.after.value).toBeCloseTo(0.25, 10);
    expect(formatSignature(step.after)).toBe('L NaOH(aq)');
  });

  it('reports which tokens were struck out', () => {
    const step = applyRatio(quantity(5.0, 'g', 'Mg'), orient(molarMassMg, 'flipped'));
    expect(step.marks.quantity.num).toEqual([0]);
    expect(step.marks.ratio.den).toBe(true);
    expect(step.marks.ratio.num).toBe(false);
  });
});

describe('signatureMatches', () => {
  it('requires the species to agree, not just the unit', () => {
    const gramsOfOxide = { value: 8.29, num: [{ unit: 'g', species: 'MgO' }], den: [] };
    expect(signatureMatches(gramsOfOxide, signature('g', 'MgO'))).toBe(true);
    expect(signatureMatches(gramsOfOxide, signature('g', 'Mg'))).toBe(false);
  });

  it('rejects a leftover denominator', () => {
    const messy = {
      value: 1,
      num: [{ unit: 'g', species: 'MgO' }],
      den: [{ unit: 'mol', species: 'Mg' }],
    };
    expect(signatureMatches(messy, signature('g', 'MgO'))).toBe(false);
  });
});

describe('formatNumber', () => {
  it('uses an Icelandic decimal comma', () => {
    expect(formatNumber(8.28877)).toBe('8,289');
    expect(formatNumber(0.025)).toBe('0,025');
  });

  it('switches to scientific notation for very large values', () => {
    expect(formatNumber(1.2386e23)).toBe('1,24 × 10²³');
  });

  it('switches to scientific notation for very small values', () => {
    expect(formatNumber(0.00005)).toBe('5 × 10⁻⁵');
  });

  it('renormalises a mantissa that rounds up to ten', () => {
    // 9,999e5 must not print as "10,0 x 10^5".
    expect(formatNumber(999900)).toBe('1 × 10⁶');
  });

  it('handles zero and non-finite input without producing NaN text', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(Number.NaN)).toBe('—');
  });
});

describe('formatQuantity', () => {
  it('renders number and units together', () => {
    expect(formatQuantity(quantity(5.0, 'g', 'Mg'))).toBe('5 g Mg');
  });
});
