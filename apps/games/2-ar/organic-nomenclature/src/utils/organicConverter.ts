/**
 * Utility to convert organic nomenclature game format to AnimatedMolecule format
 */

import type { Molecule, MoleculeAtom, MoleculeBond, BondType } from '@shared/types';

export interface OrganicMolecule {
  id: number;
  type: 'alkane' | 'alkene' | 'alkyne';
  carbons: number;
  formula: string;
  correctName: string;
  doublePosition?: number;
  triplePosition?: number;
}

/**
 * Convert an organic molecule definition to AnimatedMolecule format
 */
export function organicToMolecule(organic: OrganicMolecule): Molecule {
  const atoms: MoleculeAtom[] = [];
  const bonds: MoleculeBond[] = [];

  // Create carbon atoms with labels
  for (let i = 0; i < organic.carbons; i++) {
    atoms.push({
      id: `c-${i}`,
      symbol: 'C',
      label: `${i + 1}`, // Carbon number for nomenclature
    });
  }

  // Create bonds between carbons
  for (let i = 0; i < organic.carbons - 1; i++) {
    let bondType: BondType = 'single';

    // Check for double bond position
    if (organic.type === 'alkene' && organic.doublePosition === i + 1) {
      bondType = 'double';
    }

    // Check for triple bond position
    if (organic.type === 'alkyne' && organic.triplePosition === i + 1) {
      bondType = 'triple';
    }

    bonds.push({
      from: `c-${i}`,
      to: `c-${i + 1}`,
      type: bondType,
      highlight: bondType !== 'single', // Highlight unsaturated bonds
    });
  }

  return {
    id: organic.correctName.toLowerCase(),
    formula: organic.formula,
    name: organic.correctName,
    atoms,
    bonds,
    carbonChainLength: organic.carbons,
  };
}
