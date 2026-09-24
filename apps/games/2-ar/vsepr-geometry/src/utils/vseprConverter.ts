/**
 * Utility to convert VSEPR game format to AnimatedMolecule format
 */

import type {
  Molecule,
  MoleculeAtom,
  MoleculeBond,
  BondType,
  MolecularGeometry,
} from '@shared/types';

export interface VSEPRGeometry {
  id: string;
  example: string;
  exampleName?: string;
  bondingPairs: number;
  lonePairs: number;
}

export interface VSEPRMolecule {
  formula: string;
  name?: string;
  centralAtom: string;
  bondingPairs: number;
  lonePairs: number;
  electronDomains: number;
  correctGeometryId: string;
  isPolar?: boolean;
  surroundingAtom?: string; // Default atom type for surrounding atoms
}

/**
 * Map VSEPR geometry IDs to AnimatedMolecule geometry types
 */
const GEOMETRY_MAP: Record<string, MolecularGeometry | undefined> = {
  linear: 'linear',
  bent: 'bent',
  'bent-2': 'bent',
  'bent-4': 'bent',
  'trigonal-planar': 'trigonal-planar',
  'trigonal-pyramidal': 'trigonal-pyramidal',
  tetrahedral: 'tetrahedral',
  seesaw: 'see-saw',
  'see-saw': 'see-saw',
  't-shaped': 't-shaped',
  'trigonal-bipyramidal': 'trigonal-bipyramidal',
  'square-planar': 'square-planar',
  'square-pyramidal': 'square-pyramidal',
  octahedral: 'octahedral',
};

/**
 * Extract atom symbols from a chemical formula
 */
function parseFormula(
  formula: string,
  centralHint?: string
): {
  central: string;
  surrounding: { symbol: string; count: number }[];
} {
  // Remove subscript characters and convert to regular numbers
  const normalized = formula
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9');

  // Match element symbols with optional counts
  const matches = normalized.match(/([A-Z][a-z]?)(\d*)/g) || [];
  const atoms: { symbol: string; count: number }[] = [];

  for (const match of matches) {
    const symbolMatch = match.match(/([A-Z][a-z]?)(\d*)/);
    if (symbolMatch) {
      const symbol = symbolMatch[1];
      const count = symbolMatch[2] ? parseInt(symbolMatch[2], 10) : 1;
      if (symbol) {
        atoms.push({ symbol, count });
      }
    }
  }

  // The central atom is the one named, or else the first atom that is not
  // hydrogen: hydrogen forms one bond and is never central. Taking the first
  // symbol blindly made H₂O an H bonded to a single O.
  let centralIndex = centralHint ? atoms.findIndex((a) => a.symbol === centralHint) : -1;
  if (centralIndex < 0) centralIndex = atoms.findIndex((a) => a.symbol !== 'H');
  if (centralIndex < 0) centralIndex = 0;
  const central = atoms[centralIndex]?.symbol || centralHint || 'C';

  // Every other atom surrounds it, including the other hydrogens of H₂O.
  const surrounding = atoms
    .map((a, i) => (i === centralIndex ? { ...a, count: a.count - 1 } : a))
    .filter((a) => a.count > 0);

  return { central, surrounding };
}

/**
 * Convert a VSEPR molecule to AnimatedMolecule Molecule format
 */
export function vseprToMolecule(vsepr: VSEPRMolecule, bondType: BondType = 'single'): Molecule {
  const atoms: MoleculeAtom[] = [];
  const bonds: MoleculeBond[] = [];

  // Parse formula to get atom types
  const parsed = parseFormula(vsepr.formula, vsepr.centralAtom);
  const centralSymbol = parsed.central;

  // Create central atom with lone pairs
  const centralId = `${centralSymbol.toLowerCase()}-central`;
  atoms.push({
    id: centralId,
    symbol: centralSymbol,
    lonePairs: vsepr.lonePairs,
  });

  // Create surrounding atoms
  let atomIndex = 0;
  for (const surrounding of parsed.surrounding) {
    for (let i = 0; i < surrounding.count; i++) {
      const atomId = `${surrounding.symbol.toLowerCase()}-${atomIndex}`;
      atoms.push({
        id: atomId,
        symbol: surrounding.symbol,
        lonePairs: 0, // Surrounding atoms typically shown without lone pairs in VSEPR
      });
      bonds.push({
        from: centralId,
        to: atomId,
        type: bondType,
      });
      atomIndex++;
    }
  }

  // Get geometry type
  const geometry = GEOMETRY_MAP[vsepr.correctGeometryId];

  return {
    id: vsepr.formula.toLowerCase().replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ''),
    formula: vsepr.formula,
    name: vsepr.name,
    atoms,
    bonds,
    geometry,
    isPolar: vsepr.isPolar,
  };
}

/**
 * Create a molecule from simple geometry data (for exploration mode)
 */
export function geometryToMolecule(geo: VSEPRGeometry): Molecule {
  const parsed = parseFormula(geo.example);
  const centralSymbol = parsed.central;
  const surroundingAtoms = parsed.surrounding;

  const atoms: MoleculeAtom[] = [];
  const bonds: MoleculeBond[] = [];

  // Create central atom
  const centralId = `${centralSymbol.toLowerCase()}-central`;
  atoms.push({
    id: centralId,
    symbol: centralSymbol,
    lonePairs: geo.lonePairs,
  });

  // Create surrounding atoms
  let atomIndex = 0;
  for (const surrounding of surroundingAtoms) {
    for (let i = 0; i < surrounding.count; i++) {
      const atomId = `${surrounding.symbol.toLowerCase()}-${atomIndex}`;
      atoms.push({
        id: atomId,
        symbol: surrounding.symbol,
        lonePairs: 0,
      });
      bonds.push({
        from: centralId,
        to: atomId,
        type: 'single',
      });
      atomIndex++;
    }
  }

  // Get geometry type
  const geometry = GEOMETRY_MAP[geo.id];

  return {
    id: geo.example.toLowerCase().replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ''),
    formula: geo.example,
    name: geo.exampleName,
    atoms,
    bonds,
    geometry,
  };
}
