/**
 * Utility to convert IMF game visualization format to AnimatedMolecule format
 */

import type { Molecule, MoleculeAtom, MoleculeBond, BondType, MolecularGeometry, PartialCharge, DipoleMoment } from '@shared/types';

export interface AtomVisualization {
  symbol: string;
  partialCharge?: 'positive' | 'negative' | 'none';
  position: 'center' | 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'small' | 'medium' | 'large';
}

export interface BondVisualization {
  from: string;
  to: string;
  type: 'single' | 'double' | 'triple';
  polar?: boolean;
}

export interface MoleculeVisualization {
  atoms: AtomVisualization[];
  bonds: BondVisualization[];
  shape?: 'linear' | 'bent' | 'trigonal' | 'tetrahedral' | 'diatomic';
  dipoleMoment?: 'left' | 'right' | 'up' | 'down' | 'none';
}

export interface IMFMolecule {
  formula: string;
  name?: string;
  isPolar: boolean;
  hasHBond: boolean;
  visualization?: MoleculeVisualization;
}

/**
 * Map IMF shape to AnimatedMolecule geometry
 */
const SHAPE_TO_GEOMETRY: Record<string, MolecularGeometry | undefined> = {
  'linear': 'linear',
  'diatomic': 'linear',
  'bent': 'bent',
  'trigonal': 'trigonal-planar',
  'tetrahedral': 'tetrahedral',
};

/**
 * Map position strings to atom IDs
 */
function positionToId(position: string, symbol: string, index: number): string {
  return `${symbol.toLowerCase()}-${position}-${index}`;
}

/**
 * Convert IMF visualization to AnimatedMolecule Molecule format
 */
export function imfToMolecule(imf: IMFMolecule): Molecule {
  const atoms: MoleculeAtom[] = [];
  const bonds: MoleculeBond[] = [];
  const positionToAtomId = new Map<string, string>();

  if (!imf.visualization) {
    // Fallback: create a simple molecule with just the formula
    return {
      id: imf.formula.toLowerCase().replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ''),
      formula: imf.formula,
      name: imf.name,
      atoms: [{ id: 'atom-0', symbol: imf.formula.charAt(0) }],
      bonds: [],
      isPolar: imf.isPolar,
    };
  }

  const viz = imf.visualization;

  // Create atoms from visualization
  viz.atoms.forEach((atom, index) => {
    const atomId = positionToId(atom.position, atom.symbol, index);
    positionToAtomId.set(atom.position, atomId);

    const partialCharge: PartialCharge = atom.partialCharge === 'positive' ? 'positive'
      : atom.partialCharge === 'negative' ? 'negative'
      : 'none';

    atoms.push({
      id: atomId,
      symbol: atom.symbol,
      partialCharge,
    });
  });

  // Create bonds from visualization
  viz.bonds.forEach((bond) => {
    const fromId = positionToAtomId.get(bond.from);
    const toId = positionToAtomId.get(bond.to);

    if (fromId && toId) {
      bonds.push({
        from: fromId,
        to: toId,
        type: bond.type as BondType,
        polar: bond.polar,
      });
    }
  });

  // Map geometry
  const geometry = viz.shape ? SHAPE_TO_GEOMETRY[viz.shape] : undefined;

  // Map dipole moment
  let dipoleMoment: DipoleMoment | undefined;
  if (viz.dipoleMoment && viz.dipoleMoment !== 'none') {
    dipoleMoment = {
      direction: viz.dipoleMoment,
    };
  }

  return {
    id: imf.formula.toLowerCase().replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ''),
    formula: imf.formula,
    name: imf.name,
    atoms,
    bonds,
    geometry,
    isPolar: imf.isPolar,
    dipoleMoment,
  };
}
