/**
 * Utility to convert Lewis Structure game format to AnimatedMolecule format
 */

import type { Molecule, MoleculeAtom, MoleculeBond, BondType, MolecularGeometry } from '@shared/types';

export interface LewisStructure {
  centralAtom: string;
  surroundingAtoms: {
    symbol: string;
    bondType: 'single' | 'double' | 'triple';
    lonePairs: number;
    formalCharge?: number;
  }[];
  centralLonePairs: number;
  centralFormalCharge?: number;
  centralUnpairedElectron?: boolean;
}

/**
 * Infer molecular geometry from atom arrangement
 */
function inferGeometry(
  centralLonePairs: number,
  surroundingCount: number
): MolecularGeometry | undefined {
  const totalDomains = centralLonePairs + surroundingCount;

  // Diatomic molecules
  if (surroundingCount === 1) return 'linear';

  // Linear geometries
  if (totalDomains === 2 && centralLonePairs === 0) return 'linear';

  // Trigonal arrangements
  if (totalDomains === 3) {
    if (centralLonePairs === 0) return 'trigonal-planar';
    if (centralLonePairs === 1) return 'bent';
  }

  // Tetrahedral arrangements
  if (totalDomains === 4) {
    if (centralLonePairs === 0) return 'tetrahedral';
    if (centralLonePairs === 1) return 'trigonal-pyramidal';
    if (centralLonePairs === 2) return 'bent';
  }

  // Trigonal bipyramidal arrangements (expanded octet)
  if (totalDomains === 5) {
    if (centralLonePairs === 0) return 'trigonal-bipyramidal';
    if (centralLonePairs === 1) return 'see-saw';
    if (centralLonePairs === 2) return 't-shaped';
    if (centralLonePairs === 3) return 'linear';
  }

  // Octahedral arrangements (expanded octet)
  if (totalDomains === 6) {
    if (centralLonePairs === 0) return 'octahedral';
    if (centralLonePairs === 1) return 'square-pyramidal';
    if (centralLonePairs === 2) return 'square-planar';
  }

  return undefined;
}

/**
 * Convert a LewisStructure to a Molecule object for AnimatedMolecule
 */
export function lewisToMolecule(
  lewis: LewisStructure,
  formula: string,
  name?: string
): Molecule {
  const atoms: MoleculeAtom[] = [];
  const bonds: MoleculeBond[] = [];

  // Create central atom
  const centralId = `${lewis.centralAtom.toLowerCase()}-central`;
  atoms.push({
    id: centralId,
    symbol: lewis.centralAtom,
    lonePairs: lewis.centralLonePairs,
    formalCharge: lewis.centralFormalCharge,
    isRadical: lewis.centralUnpairedElectron,
  });

  // Create surrounding atoms and bonds
  lewis.surroundingAtoms.forEach((atom, index) => {
    const atomId = `${atom.symbol.toLowerCase()}-${index}`;

    atoms.push({
      id: atomId,
      symbol: atom.symbol,
      lonePairs: atom.lonePairs,
      formalCharge: atom.formalCharge,
    });

    bonds.push({
      from: centralId,
      to: atomId,
      type: atom.bondType as BondType,
    });
  });

  // Infer geometry
  const geometry = inferGeometry(lewis.centralLonePairs, lewis.surroundingAtoms.length);

  return {
    id: formula.toLowerCase().replace(/[₀₁₂₃₄₅₆₇₈₉⁺⁻]/g, ''),
    formula,
    name,
    atoms,
    bonds,
    geometry,
  };
}

/**
 * Create a simple diatomic molecule for display
 */
export function createDiatomic(
  atom1: string,
  atom2: string,
  bondType: BondType,
  atom1LonePairs: number,
  atom2LonePairs: number,
  atom1FormalCharge?: number,
  atom2FormalCharge?: number,
  formula?: string
): Molecule {
  const id1 = `${atom1.toLowerCase()}-0`;
  const id2 = `${atom2.toLowerCase()}-1`;

  return {
    id: formula?.toLowerCase() || `${atom1}${atom2}`.toLowerCase(),
    formula: formula || `${atom1}${atom2}`,
    atoms: [
      { id: id1, symbol: atom1, lonePairs: atom1LonePairs, formalCharge: atom1FormalCharge },
      { id: id2, symbol: atom2, lonePairs: atom2LonePairs, formalCharge: atom2FormalCharge },
    ],
    bonds: [{ from: id1, to: id2, type: bondType }],
    geometry: 'linear',
  };
}
