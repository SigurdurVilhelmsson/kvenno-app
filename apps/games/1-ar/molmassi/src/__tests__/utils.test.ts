import { describe, it, expect } from 'vitest';

import type { Compound } from '../data/compounds';
import {
  generateCalculationBreakdown,
  validateAnswer,
  calculatePoints,
} from '../utils/calculations';
import {
  ATOMIC_MASSES,
  generateChallenge,
  LEVEL1_COMPOUNDS,
} from '../utils/challengeGenerator';
import {
  elementsToMolecule,
  elementsToAtomCluster,
  calculateMolarMass,
} from '../utils/moleculeConverter';
import { validateInput } from '../utils/validation';

// ---------------------------------------------------------------------------
// utils/calculations.ts
// ---------------------------------------------------------------------------
describe('generateCalculationBreakdown', () => {
  it('should return calculation steps for a regular compound (H2O)', () => {
    const water: Compound = {
      formula: 'H₂O',
      name: 'Vatn',
      elements: [
        { symbol: 'H', count: 2 },
        { symbol: 'O', count: 1 },
      ],
      molarMass: 18.015,
      difficulty: 'easy',
    };

    const breakdown = generateCalculationBreakdown(water);

    // Should have one step per element (no sections for regular compounds)
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]).toMatchObject({
      type: 'calculation',
      symbol: 'H',
      count: 2,
      atomicMass: 1.008,
      total: 2 * 1.008,
    });
    expect(breakdown[1]).toMatchObject({
      type: 'calculation',
      symbol: 'O',
      count: 1,
      atomicMass: 15.999,
      total: 15.999,
    });
  });

  it('should return section and calculation steps for a hydrate compound (CuSO4·5H2O)', () => {
    const hydrate: Compound = {
      formula: 'CuSO₄·5H₂O',
      name: 'Koparbrennisteinshýdrat',
      elements: [
        { symbol: 'Cu', count: 1 },
        { symbol: 'S', count: 1 },
        { symbol: 'O', count: 9 },
        { symbol: 'H', count: 10 },
      ],
      molarMass: 249.685,
      difficulty: 'hard',
    };

    const breakdown = generateCalculationBreakdown(hydrate);

    // First step should be the main compound section header
    expect(breakdown[0]).toMatchObject({ type: 'section' });
    expect(breakdown[0].label).toContain('Aðalefni');

    // Should include Cu, S as non-H/O main compound elements
    const cuStep = breakdown.find(s => s.symbol === 'Cu');
    expect(cuStep).toBeDefined();
    expect(cuStep!.count).toBe(1);

    const sStep = breakdown.find(s => s.symbol === 'S');
    expect(sStep).toBeDefined();
    expect(sStep!.count).toBe(1);

    // Should have a water section header
    const waterSection = breakdown.find(
      s => s.type === 'section' && s.label?.includes('Vatn')
    );
    expect(waterSection).toBeDefined();
    expect(waterSection!.label).toContain('5H₂O');

    // Water part should include H with count = 5*2 = 10 and O with count = 5
    const waterSteps = breakdown.slice(breakdown.indexOf(waterSection!) + 1);
    const hWater = waterSteps.find(s => s.symbol === 'H');
    expect(hWater).toBeDefined();
    expect(hWater!.count).toBe(10);

    const oWater = waterSteps.find(s => s.symbol === 'O');
    expect(oWater).toBeDefined();
    expect(oWater!.count).toBe(5);
  });

  it('should compute main compound O correctly for hydrate with oxygen in main formula', () => {
    // MgSO4·7H2O: total O = 11, water O = 7, main O = 4
    const hydrate: Compound = {
      formula: 'MgSO₄·7H₂O',
      name: 'Epsom salt hýdrat',
      elements: [
        { symbol: 'Mg', count: 1 },
        { symbol: 'S', count: 1 },
        { symbol: 'O', count: 11 },
        { symbol: 'H', count: 14 },
      ],
      molarMass: 246.475,
      difficulty: 'hard',
    };

    const breakdown = generateCalculationBreakdown(hydrate);

    // Find O steps before the water section
    const waterSectionIdx = breakdown.findIndex(
      s => s.type === 'section' && s.label?.includes('Vatn')
    );
    const mainSteps = breakdown.slice(0, waterSectionIdx);
    const mainO = mainSteps.find(s => s.symbol === 'O');
    expect(mainO).toBeDefined();
    // totalO=11, waterO=7, mainO=4
    expect(mainO!.count).toBe(4);
    expect(mainO!.total).toBeCloseTo(4 * 15.999);
  });
});

describe('validateAnswer', () => {
  it('should accept an answer within default tolerance of 0.5', () => {
    expect(validateAnswer(18.0, 18.015)).toBe(true);
    expect(validateAnswer(18.3, 18.015)).toBe(true);
  });

  it('should reject an answer outside default tolerance', () => {
    expect(validateAnswer(19.0, 18.015)).toBe(false);
  });

  it('should accept an answer within a custom tolerance', () => {
    expect(validateAnswer(100, 98, 3)).toBe(true);
  });

  it('should reject an answer outside a custom tolerance', () => {
    expect(validateAnswer(100, 98, 1)).toBe(false);
  });
});

describe('calculatePoints', () => {
  it('should return correct base points for each difficulty', () => {
    expect(calculatePoints('easy', 0, 0)).toBe(10);
    expect(calculatePoints('medium', 0, 0)).toBe(20);
    expect(calculatePoints('hard', 0, 0)).toBe(30);
  });

  it('should add a time bonus based on remaining time', () => {
    // 60 seconds remaining => floor(60/10) = 6 bonus
    expect(calculatePoints('easy', 60, 0)).toBe(10 + 6);
  });

  it('should subtract hint penalty (5 per hint)', () => {
    expect(calculatePoints('medium', 0, 2)).toBe(20 - 10);
  });

  it('should never return less than 5 points', () => {
    // heavy hint penalty: 20 - 0 - 5*10 = -30, clamped to 5
    expect(calculatePoints('medium', 0, 10)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// utils/validation.ts
// ---------------------------------------------------------------------------
describe('validateInput', () => {
  it('should accept empty string as valid', () => {
    const result = validateInput('');
    expect(result.valid).toBe(true);
    expect(result.error).toBe('');
  });

  it('should accept whitespace-only string as valid', () => {
    const result = validateInput('   ');
    expect(result.valid).toBe(true);
  });

  it('should reject non-numeric input', () => {
    const result = validateInput('abc');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should reject zero', () => {
    const result = validateInput('0');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should reject negative numbers', () => {
    const result = validateInput('-5');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should reject numbers >= 1000', () => {
    const result = validateInput('1000');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should accept a valid positive number below 1000', () => {
    const result = validateInput('18.015');
    expect(result.valid).toBe(true);
    expect(result.error).toBe('');
  });
});

// ---------------------------------------------------------------------------
// utils/challengeGenerator.ts
// ---------------------------------------------------------------------------
describe('ATOMIC_MASSES', () => {
  it('should contain correct atomic mass for hydrogen', () => {
    expect(ATOMIC_MASSES['H']).toBeCloseTo(1.008);
  });

  it('should contain correct atomic mass for carbon', () => {
    expect(ATOMIC_MASSES['C']).toBeCloseTo(12.011);
  });

  it('should contain correct atomic mass for iron', () => {
    expect(ATOMIC_MASSES['Fe']).toBeCloseTo(55.845);
  });
});

describe('generateChallenge', () => {
  it('should cycle through challenge types based on challengeNumber', () => {
    const types = ['count_atoms', 'compare_mass', 'build_molecule', 'estimate_range'];
    for (let i = 0; i < 4; i++) {
      const challenge = generateChallenge(i);
      expect(challenge.type).toBe(types[i % 4]);
    }
  });

  it('should wrap around after 4 challenges', () => {
    const c4 = generateChallenge(4);
    expect(c4.type).toBe('count_atoms');
    const c5 = generateChallenge(5);
    expect(c5.type).toBe('compare_mass');
  });

  it('should provide targetElement and correctCount for count_atoms type', () => {
    const challenge = generateChallenge(0); // count_atoms
    expect(challenge.targetElement).toBeDefined();
    expect(challenge.correctCount).toBeGreaterThan(0);
  });

  it('should provide a different compareCompound for compare_mass type', () => {
    const challenge = generateChallenge(1); // compare_mass
    expect(challenge.compareCompound).toBeDefined();
    expect(challenge.compareCompound!.formula).not.toBe(challenge.compound.formula);
  });

  it('should provide ranges and correctRangeIndex for estimate_range type', () => {
    const challenge = generateChallenge(3); // estimate_range
    expect(challenge.ranges).toBeDefined();
    expect(challenge.ranges).toHaveLength(3);
    expect(challenge.correctRangeIndex).toBeGreaterThanOrEqual(0);
  });
});

describe('LEVEL1_COMPOUNDS molar mass accuracy', () => {
  it('should have molar masses that match sum of element atomic masses', () => {
    for (const compound of LEVEL1_COMPOUNDS) {
      const computed = compound.elements.reduce((sum, el) => {
        return sum + ATOMIC_MASSES[el.symbol] * el.count;
      }, 0);
      expect(computed).toBeCloseTo(compound.molarMass, 0);
    }
  });
});

// ---------------------------------------------------------------------------
// utils/moleculeConverter.ts
// ---------------------------------------------------------------------------
describe('elementsToMolecule', () => {
  it('should create atoms for each element count', () => {
    const elements = [
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 1 },
    ];
    const molecule = elementsToMolecule(elements, 'H₂O', 'Vatn');

    expect(molecule.atoms).toHaveLength(3); // 2 H + 1 O
    expect(molecule.atoms[0].symbol).toBe('H');
    expect(molecule.atoms[1].symbol).toBe('H');
    expect(molecule.atoms[2].symbol).toBe('O');
  });

  it('should create linear bonds between adjacent atoms', () => {
    const elements = [
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 1 },
    ];
    const molecule = elementsToMolecule(elements, 'H₂O');

    expect(molecule.bonds).toHaveLength(2); // 3 atoms => 2 bonds
    expect(molecule.bonds[0].from).toBe('h-0');
    expect(molecule.bonds[0].to).toBe('h-1');
    expect(molecule.bonds[1].from).toBe('h-1');
    expect(molecule.bonds[1].to).toBe('o-2');
  });

  it('should set formula, name, and id correctly', () => {
    const molecule = elementsToMolecule(
      [{ symbol: 'C', count: 1 }, { symbol: 'O', count: 2 }],
      'CO₂',
      'Koltvísýringur'
    );

    expect(molecule.formula).toBe('CO₂');
    expect(molecule.name).toBe('Koltvísýringur');
    // id strips subscript unicode chars
    expect(molecule.id).toBe('co');
  });
});

describe('elementsToAtomCluster', () => {
  it('should create atoms but no bonds', () => {
    const elements = [
      { symbol: 'Na', count: 1 },
      { symbol: 'Cl', count: 1 },
    ];
    const molecule = elementsToAtomCluster(elements, 'NaCl');

    expect(molecule.atoms).toHaveLength(2);
    expect(molecule.bonds).toHaveLength(0);
  });
});

describe('calculateMolarMass', () => {
  it('should compute correct molar mass from element counts and atomic masses', () => {
    const elements = [
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 1 },
    ];
    const masses = { H: 1.008, O: 15.999 };
    const result = calculateMolarMass(elements, masses);
    expect(result).toBeCloseTo(18.015, 2);
  });

  it('should return 0 for unknown elements', () => {
    const elements = [{ symbol: 'Xx', count: 5 }];
    const masses = { H: 1.008 };
    expect(calculateMolarMass(elements, masses)).toBe(0);
  });
});
