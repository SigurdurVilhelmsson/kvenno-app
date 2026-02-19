/**
 * Utility to convert Molar Mass game element format to AnimatedMolecule format
 */

import type { Molecule, MoleculeAtom, MoleculeBond } from '@shared/types';

export interface ElementCount {
  symbol: string;
  count: number;
}

/**
 * Convert element counts to a Molecule object for AnimatedMolecule
 * Creates a simple linear layout of atoms
 */
export function elementsToMolecule(
  elements: ElementCount[],
  formula: string,
  name?: string
): Molecule {
  const atoms: MoleculeAtom[] = [];
  const bonds: MoleculeBond[] = [];

  let atomIndex = 0;

  // Create atoms for each element
  for (const element of elements) {
    for (let i = 0; i < element.count; i++) {
      atoms.push({
        id: `${element.symbol.toLowerCase()}-${atomIndex}`,
        symbol: element.symbol,
      });
      atomIndex++;
    }
  }

  // Create simple bonds between adjacent atoms (for visualization only)
  // This creates a linear chain for display purposes
  for (let i = 0; i < atoms.length - 1; i++) {
    bonds.push({
      from: atoms[i].id,
      to: atoms[i + 1].id,
      type: 'single',
    });
  }

  return {
    id: formula.toLowerCase().replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ''),
    formula,
    name,
    atoms,
    bonds,
  };
}

/**
 * Create a molecule with atoms only (no bonds) for simpler visualization
 */
export function elementsToAtomCluster(
  elements: ElementCount[],
  formula: string,
  name?: string
): Molecule {
  const atoms: MoleculeAtom[] = [];

  let atomIndex = 0;

  // Create atoms for each element
  for (const element of elements) {
    for (let i = 0; i < element.count; i++) {
      atoms.push({
        id: `${element.symbol.toLowerCase()}-${atomIndex}`,
        symbol: element.symbol,
      });
      atomIndex++;
    }
  }

  return {
    id: formula.toLowerCase().replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ''),
    formula,
    name,
    atoms,
    bonds: [], // No bonds for simple atom cluster view
  };
}

/**
 * Calculate total molar mass from elements
 */
export function calculateMolarMass(
  elements: ElementCount[],
  atomicMasses: Record<string, number>
): number {
  return elements.reduce((sum, el) => {
    const mass = atomicMasses[el.symbol] || 0;
    return sum + mass * el.count;
  }, 0);
}
