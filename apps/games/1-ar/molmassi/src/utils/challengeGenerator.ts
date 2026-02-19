/**
 * Challenge generation logic for Level 1 of the Molmassi game.
 * Generates random challenges that cycle through different types:
 * count atoms, compare mass, build molecule, and estimate range.
 */

// Atomic masses for calculations
export const ATOMIC_MASSES: Record<string, number> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  S: 32.065,
  Cl: 35.453,
  Na: 22.990,
  Ca: 40.078,
  Fe: 55.845,
  K: 39.098,
  Mg: 24.305,
  P: 30.974,
  Al: 26.982,
  Cu: 63.546,
};

// Challenge types for Level 1
export type ChallengeType = 'count_atoms' | 'compare_mass' | 'build_molecule' | 'estimate_range';

export interface CompoundData {
  formula: string;
  name: string;
  elements: { symbol: string; count: number }[];
  molarMass: number;
}

export interface Challenge {
  type: ChallengeType;
  compound: CompoundData;
  // For count_atoms
  targetElement?: string;
  correctCount?: number;
  // For compare_mass
  compareCompound?: CompoundData;
  // For estimate_range
  ranges?: { min: number; max: number; label: string }[];
  correctRangeIndex?: number;
}

// Simple compounds for Level 1
export const LEVEL1_COMPOUNDS: CompoundData[] = [
  { formula: 'H\u2082O', name: 'Vatn', elements: [{ symbol: 'H', count: 2 }, { symbol: 'O', count: 1 }], molarMass: 18.015 },
  { formula: 'CO\u2082', name: 'Koltvísýringur', elements: [{ symbol: 'C', count: 1 }, { symbol: 'O', count: 2 }], molarMass: 44.009 },
  { formula: 'NaCl', name: 'Borðsalt', elements: [{ symbol: 'Na', count: 1 }, { symbol: 'Cl', count: 1 }], molarMass: 58.44 },
  { formula: 'CH\u2084', name: 'Metan', elements: [{ symbol: 'C', count: 1 }, { symbol: 'H', count: 4 }], molarMass: 16.043 },
  { formula: 'NH\u2083', name: 'Ammóníak', elements: [{ symbol: 'N', count: 1 }, { symbol: 'H', count: 3 }], molarMass: 17.031 },
  { formula: 'O\u2082', name: 'Súrefni', elements: [{ symbol: 'O', count: 2 }], molarMass: 31.998 },
  { formula: 'N\u2082', name: 'Köfnunarefni', elements: [{ symbol: 'N', count: 2 }], molarMass: 28.014 },
  { formula: 'HCl', name: 'Saltsýra', elements: [{ symbol: 'H', count: 1 }, { symbol: 'Cl', count: 1 }], molarMass: 36.458 },
  { formula: 'CaO', name: 'Kalsíumoxíð', elements: [{ symbol: 'Ca', count: 1 }, { symbol: 'O', count: 1 }], molarMass: 56.077 },
  { formula: 'MgO', name: 'Magnesíumoxíð', elements: [{ symbol: 'Mg', count: 1 }, { symbol: 'O', count: 1 }], molarMass: 40.304 },
];

/**
 * Generate a random challenge for Level 1.
 * Cycles through challenge types based on the challenge number.
 */
export function generateChallenge(challengeNumber: number): Challenge {
  const compound = LEVEL1_COMPOUNDS[Math.floor(Math.random() * LEVEL1_COMPOUNDS.length)];

  // Cycle through challenge types
  const types: ChallengeType[] = ['count_atoms', 'compare_mass', 'build_molecule', 'estimate_range'];
  const type = types[challengeNumber % types.length];

  switch (type) {
    case 'count_atoms': {
      const element = compound.elements[Math.floor(Math.random() * compound.elements.length)];
      return {
        type: 'count_atoms',
        compound,
        targetElement: element.symbol,
        correctCount: element.count,
      };
    }

    case 'compare_mass': {
      let other = LEVEL1_COMPOUNDS[Math.floor(Math.random() * LEVEL1_COMPOUNDS.length)];
      while (other.formula === compound.formula) {
        other = LEVEL1_COMPOUNDS[Math.floor(Math.random() * LEVEL1_COMPOUNDS.length)];
      }
      return {
        type: 'compare_mass',
        compound,
        compareCompound: other,
      };
    }

    case 'build_molecule': {
      return {
        type: 'build_molecule',
        compound,
      };
    }

    case 'estimate_range': {
      const ranges = [
        { min: 0, max: 25, label: '0-25 g/mol' },
        { min: 25, max: 50, label: '25-50 g/mol' },
        { min: 50, max: 100, label: '50-100 g/mol' },
      ];
      const correctIndex = ranges.findIndex(r => compound.molarMass >= r.min && compound.molarMass < r.max);
      return {
        type: 'estimate_range',
        compound,
        ranges,
        correctRangeIndex: correctIndex >= 0 ? correctIndex : 2,
      };
    }

    default:
      return { type: 'count_atoms', compound };
  }
}
