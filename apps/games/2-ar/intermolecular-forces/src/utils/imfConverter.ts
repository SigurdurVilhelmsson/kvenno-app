/**
 * Utility to convert IMF game visualization format to AnimatedMolecule format
 */

import type {
  Molecule,
  MoleculeAtom,
  MoleculeBond,
  BondType,
  MolecularGeometry,
  PartialCharge,
  Position2D,
} from '@shared/types';

export type AtomPosition =
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface AtomVisualization {
  symbol: string;
  partialCharge?: 'positive' | 'negative' | 'none';
  position: AtomPosition;
  size?: 'small' | 'medium' | 'large';
}

export interface BondVisualization {
  from: string;
  to: string;
  type: 'single' | 'double' | 'triple';
  polar?: boolean;
}

/**
 * There is deliberately no dipole field here. The arrow is derived from where the partial
 * charges are drawn (see `imfToMolecule`), because a stored direction pointed at the δ+ end
 * on water, chloroform and methanol and nothing checked it against the drawing.
 */
export interface MoleculeVisualization {
  atoms: AtomVisualization[];
  bonds: BondVisualization[];
  shape?: 'linear' | 'bent' | 'trigonal' | 'trigonal-pyramidal' | 'tetrahedral' | 'diatomic';
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
  linear: 'linear',
  diatomic: 'linear',
  bent: 'bent',
  trigonal: 'trigonal-planar',
  'trigonal-pyramidal': 'trigonal-pyramidal',
  tetrahedral: 'tetrahedral',
};

/**
 * Where each authored position is drawn, in AnimatedMolecule's explicit-position space: −1…1
 * from the centre to the edge of the drawing, y pointing down.
 *
 * The converter used to drop these positions and pass only a geometry, and AnimatedMolecule's
 * geometry layout puts the FIRST atom in the middle. Several molecules do not list their
 * central atom first, so CO₂ was drawn C=O=O, methanol with carbon in the middle, and HCl and
 * HF with the hydrogen in the middle and the halogen on the wrong side. What the data
 * describes is now what is drawn. (The 3D viewer finds its central atom by bond count and
 * never read these, so it is unaffected.)
 *
 * One bond is two thirds of the half-width, the length the geometry layout used, so the
 * drawing keeps its size. The upper pair sits at water's 104,5° H–O–H angle; the lower three
 * fan out 60° either side of straight down.
 */
const BOND = 2 / 3;
const HALF_HOH = ((104.5 / 2) * Math.PI) / 180;
const FAN = Math.PI / 3;

export const POSITION_COORDS: Record<AtomPosition, Position2D> = {
  center: { x: 0, y: 0 },
  left: { x: -BOND, y: 0 },
  right: { x: BOND, y: 0 },
  top: { x: 0, y: -BOND },
  bottom: { x: 0, y: BOND },
  'top-left': { x: -BOND * Math.sin(HALF_HOH), y: -BOND * Math.cos(HALF_HOH) },
  'top-right': { x: BOND * Math.sin(HALF_HOH), y: -BOND * Math.cos(HALF_HOH) },
  'bottom-left': { x: -BOND * Math.sin(FAN), y: BOND * Math.cos(FAN) },
  'bottom-right': { x: BOND * Math.sin(FAN), y: BOND * Math.cos(FAN) },
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

    const partialCharge: PartialCharge =
      atom.partialCharge === 'positive'
        ? 'positive'
        : atom.partialCharge === 'negative'
          ? 'negative'
          : 'none';

    atoms.push({
      id: atomId,
      symbol: atom.symbol,
      partialCharge,
      position: POSITION_COORDS[atom.position],
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

  return {
    id: imf.formula.toLowerCase().replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ''),
    formula: imf.formula,
    name: imf.name,
    atoms,
    bonds,
    geometry,
    // No dipoleMoment: AnimatedMolecule derives the arrow from the δ+ and δ− atoms as they
    // are drawn, pointing at the δ− end, so it cannot disagree with the picture.
    isPolar: imf.isPolar,
  };
}
