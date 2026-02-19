import { describe, it, expect } from 'vitest';
import {
  calculateShift,
  getStressDescriptionIs,
  getStressDescription,
  isReactant,
  isProduct,
} from '../utils/le-chatelier';
import { Equilibrium, Stress } from '../types';

// ---------------------------------------------------------------------------
// Mock Equilibrium helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal Equilibrium object for testing.
 * Defaults: endothermic, 4 reactant gas moles vs 2 product gas moles.
 */
const makeEquilibrium = (
  overrides: Partial<Equilibrium> = {},
): Equilibrium => ({
  id: 1,
  equation: 'N2(g) + 3H2(g) ⇌ 2NH3(g)',
  name: 'Haber process',
  nameIs: 'Haber-ferlið',
  difficulty: 'beginner',
  reactants: [
    { formula: 'N2', coefficient: 1, phase: 'g', display: '🔵' },
    { formula: 'H2', coefficient: 3, phase: 'g', display: '⚪' },
  ],
  products: [
    { formula: 'NH3', coefficient: 2, phase: 'g', display: '🟢' },
  ],
  thermodynamics: { deltaH: 92, type: 'endothermic' },
  gasMoles: { reactants: 4, products: 2 },
  description: 'Synthesis of ammonia',
  descriptionIs: 'Myndun ammoníaks',
  possibleStresses: [],
  ...overrides,
});

const endothermicEq = makeEquilibrium();

const exothermicEq = makeEquilibrium({
  thermodynamics: { deltaH: -92, type: 'exothermic' },
});

const equalMolesEq = makeEquilibrium({
  gasMoles: { reactants: 2, products: 2 },
});

const moreProductMolesEq = makeEquilibrium({
  gasMoles: { reactants: 1, products: 3 },
});

const noGasEq = makeEquilibrium({
  gasMoles: { reactants: 0, products: 0 },
  reactants: [
    { formula: 'AgCl', coefficient: 1, phase: 's', display: '⬜' },
  ],
  products: [
    { formula: 'Ag+', coefficient: 1, phase: 'aq', display: '🔘' },
    { formula: 'Cl-', coefficient: 1, phase: 'aq', display: '🟡' },
  ],
});

// ---------------------------------------------------------------------------
// calculateShift — Concentration stresses
// ---------------------------------------------------------------------------

describe('calculateShift - concentration changes', () => {
  it('shifts right when a reactant is added', () => {
    const stress: Stress = { type: 'add-reactant', target: 'N2' };
    const result = calculateShift(endothermicEq, stress);
    expect(result.direction).toBe('right');
    expect(result.explanation).toContain('N2');
    expect(result.explanationIs).toContain('N2');
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it('shifts left when a product is added', () => {
    const stress: Stress = { type: 'add-product', target: 'NH3' };
    const result = calculateShift(endothermicEq, stress);
    expect(result.direction).toBe('left');
    expect(result.explanation).toContain('NH3');
  });

  it('shifts left when a reactant is removed', () => {
    const stress: Stress = { type: 'remove-reactant', target: 'H2' };
    const result = calculateShift(endothermicEq, stress);
    expect(result.direction).toBe('left');
    expect(result.explanation).toContain('H2');
  });

  it('shifts right when a product is removed', () => {
    const stress: Stress = { type: 'remove-product', target: 'NH3' };
    const result = calculateShift(endothermicEq, stress);
    expect(result.direction).toBe('right');
    expect(result.explanation).toContain('NH3');
  });
});

// ---------------------------------------------------------------------------
// calculateShift — Temperature stresses
// ---------------------------------------------------------------------------

describe('calculateShift - temperature changes', () => {
  it('shifts right when temperature increases in an endothermic reaction', () => {
    const stress: Stress = { type: 'increase-temp', target: null };
    const result = calculateShift(endothermicEq, stress);
    expect(result.direction).toBe('right');
    expect(result.explanation).toContain('ENDOTHERMIC');
    expect(result.explanationIs).toContain('VARMABINDANDI');
  });

  it('shifts left when temperature increases in an exothermic reaction', () => {
    const stress: Stress = { type: 'increase-temp', target: null };
    const result = calculateShift(exothermicEq, stress);
    expect(result.direction).toBe('left');
    expect(result.explanation).toContain('EXOTHERMIC');
    expect(result.explanationIs).toContain('VARMALOSANDI');
  });

  it('shifts left when temperature decreases in an endothermic reaction', () => {
    const stress: Stress = { type: 'decrease-temp', target: null };
    const result = calculateShift(endothermicEq, stress);
    expect(result.direction).toBe('left');
    expect(result.explanation).toContain('ENDOTHERMIC');
  });

  it('shifts right when temperature decreases in an exothermic reaction', () => {
    const stress: Stress = { type: 'decrease-temp', target: null };
    const result = calculateShift(exothermicEq, stress);
    expect(result.direction).toBe('right');
    expect(result.explanation).toContain('EXOTHERMIC');
  });
});

// ---------------------------------------------------------------------------
// calculateShift — Pressure stresses
// ---------------------------------------------------------------------------

describe('calculateShift - pressure changes', () => {
  it('no shift when pressure increases with equal gas moles', () => {
    const stress: Stress = { type: 'increase-pressure', target: null };
    const result = calculateShift(equalMolesEq, stress);
    expect(result.direction).toBe('none');
    expect(result.explanation).toContain('Equal moles');
  });

  it('shifts right when pressure increases with more reactant gas moles', () => {
    // endothermicEq has reactants: 4, products: 2
    const stress: Stress = { type: 'increase-pressure', target: null };
    const result = calculateShift(endothermicEq, stress);
    expect(result.direction).toBe('right');
    expect(result.explanation).toContain('FEWER');
  });

  it('shifts left when pressure increases with more product gas moles', () => {
    const stress: Stress = { type: 'increase-pressure', target: null };
    const result = calculateShift(moreProductMolesEq, stress);
    expect(result.direction).toBe('left');
    expect(result.explanation).toContain('FEWER');
  });

  it('shifts left when pressure decreases with more reactant gas moles', () => {
    const stress: Stress = { type: 'decrease-pressure', target: null };
    const result = calculateShift(endothermicEq, stress);
    expect(result.direction).toBe('left');
    expect(result.explanation).toContain('MORE');
  });

  it('shifts right when pressure decreases with more product gas moles', () => {
    const stress: Stress = { type: 'decrease-pressure', target: null };
    const result = calculateShift(moreProductMolesEq, stress);
    expect(result.direction).toBe('right');
    expect(result.explanation).toContain('MORE');
  });

  it('no shift when pressure increases with no gas molecules', () => {
    const stress: Stress = { type: 'increase-pressure', target: null };
    const result = calculateShift(noGasEq, stress);
    expect(result.direction).toBe('none');
    expect(result.explanation).toContain('without gas molecules');
  });

  it('no shift when pressure decreases with no gas molecules', () => {
    const stress: Stress = { type: 'decrease-pressure', target: null };
    const result = calculateShift(noGasEq, stress);
    expect(result.direction).toBe('none');
    expect(result.explanation).toContain('without gas molecules');
  });

  it('no shift when pressure decreases with equal gas moles', () => {
    const stress: Stress = { type: 'decrease-pressure', target: null };
    const result = calculateShift(equalMolesEq, stress);
    expect(result.direction).toBe('none');
    expect(result.explanation).toContain('Equal moles');
  });
});

// ---------------------------------------------------------------------------
// calculateShift — Catalyst
// ---------------------------------------------------------------------------

describe('calculateShift - catalyst', () => {
  it('causes no shift when a catalyst is added', () => {
    const stress: Stress = { type: 'add-catalyst', target: null };
    const result = calculateShift(endothermicEq, stress);
    expect(result.direction).toBe('none');
    expect(result.explanation).toContain('CATALYST');
    expect(result.explanationIs).toContain('HVATI');
    expect(result.reasoning).toContain(
      'NO SHIFT - this is critical to understand!',
    );
  });
});

// ---------------------------------------------------------------------------
// calculateShift — ShiftResult shape
// ---------------------------------------------------------------------------

describe('calculateShift - result structure', () => {
  it('always returns all ShiftResult fields', () => {
    const stress: Stress = { type: 'add-reactant', target: 'N2' };
    const result = calculateShift(endothermicEq, stress);

    expect(result).toHaveProperty('direction');
    expect(result).toHaveProperty('explanation');
    expect(result).toHaveProperty('explanationIs');
    expect(result).toHaveProperty('reasoning');
    expect(result).toHaveProperty('molecularView');
    expect(Array.isArray(result.reasoning)).toBe(true);
    expect(typeof result.molecularView).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// getStressDescriptionIs — Icelandic descriptions
// ---------------------------------------------------------------------------

describe('getStressDescriptionIs', () => {
  it('returns Icelandic description for each stress type', () => {
    const cases: Array<{ stress: Stress; expected: string }> = [
      { stress: { type: 'add-reactant', target: 'N2' }, expected: 'Bæta við N2 (hvarfefni)' },
      { stress: { type: 'add-product', target: 'NH3' }, expected: 'Bæta við NH3 (afurð)' },
      { stress: { type: 'remove-reactant', target: 'H2' }, expected: 'Fjarlægja H2 (hvarfefni)' },
      { stress: { type: 'remove-product', target: 'NH3' }, expected: 'Fjarlægja NH3 (afurð)' },
      { stress: { type: 'increase-temp', target: null }, expected: 'Auka hitastig' },
      { stress: { type: 'decrease-temp', target: null }, expected: 'Lækka hitastig' },
      { stress: { type: 'increase-pressure', target: null }, expected: 'Auka þrýsting' },
      { stress: { type: 'decrease-pressure', target: null }, expected: 'Minnka þrýsting' },
      { stress: { type: 'add-catalyst', target: null }, expected: 'Bæta við hvata' },
    ];

    for (const { stress, expected } of cases) {
      expect(getStressDescriptionIs(stress)).toBe(expected);
    }
  });
});

// ---------------------------------------------------------------------------
// getStressDescription — English descriptions
// ---------------------------------------------------------------------------

describe('getStressDescription', () => {
  it('returns English description for each stress type', () => {
    const cases: Array<{ stress: Stress; expected: string }> = [
      { stress: { type: 'add-reactant', target: 'N2' }, expected: 'Add N2 (reactant)' },
      { stress: { type: 'add-product', target: 'NH3' }, expected: 'Add NH3 (product)' },
      { stress: { type: 'remove-reactant', target: 'H2' }, expected: 'Remove H2 (reactant)' },
      { stress: { type: 'remove-product', target: 'NH3' }, expected: 'Remove NH3 (product)' },
      { stress: { type: 'increase-temp', target: null }, expected: 'Increase temperature' },
      { stress: { type: 'decrease-temp', target: null }, expected: 'Decrease temperature' },
      { stress: { type: 'increase-pressure', target: null }, expected: 'Increase pressure' },
      { stress: { type: 'decrease-pressure', target: null }, expected: 'Decrease pressure' },
      { stress: { type: 'add-catalyst', target: null }, expected: 'Add catalyst' },
    ];

    for (const { stress, expected } of cases) {
      expect(getStressDescription(stress)).toBe(expected);
    }
  });
});

// ---------------------------------------------------------------------------
// isReactant / isProduct
// ---------------------------------------------------------------------------

describe('isReactant', () => {
  it('returns true for a molecule on the reactant side', () => {
    expect(isReactant('N2', endothermicEq)).toBe(true);
    expect(isReactant('H2', endothermicEq)).toBe(true);
  });

  it('returns false for a molecule not on the reactant side', () => {
    expect(isReactant('NH3', endothermicEq)).toBe(false);
    expect(isReactant('O2', endothermicEq)).toBe(false);
  });
});

describe('isProduct', () => {
  it('returns true for a molecule on the product side', () => {
    expect(isProduct('NH3', endothermicEq)).toBe(true);
  });

  it('returns false for a molecule not on the product side', () => {
    expect(isProduct('N2', endothermicEq)).toBe(false);
    expect(isProduct('O2', endothermicEq)).toBe(false);
  });
});
