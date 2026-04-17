/**
 * Utility to convert organic nomenclature game format to AnimatedMolecule format
 */

import type { Molecule, MoleculeAtom, MoleculeBond, BondType } from '@shared/types';

/**
 * A substituent branch on the main carbon chain.
 * Only methyl branches (length 1) are supported in the Level-2 pool today;
 * `length` is reserved for future ethyl/propyl extensions.
 */
export interface OrganicBranch {
  /** 1-indexed position on the main chain where the branch attaches */
  atPosition: number;
  /** Number of carbons in the branch (1 = methyl) */
  length: number;
}

export interface OrganicMolecule {
  id: number;
  type: 'alkane' | 'alkene' | 'alkyne';
  carbons: number;
  formula: string;
  correctName: string;
  doublePosition?: number;
  triplePosition?: number;
  branches?: OrganicBranch[];
}

export function hasBranches(molecule: OrganicMolecule): boolean {
  return (molecule.branches?.length ?? 0) > 0;
}

/**
 * Convert an organic molecule definition to AnimatedMolecule format.
 * Returns explicit Position2D for each atom so the renderer's
 * `hasExplicitPositions` path is used — branches render above the main chain.
 */
export function organicToMolecule(organic: OrganicMolecule): Molecule {
  const atoms: MoleculeAtom[] = [];
  const bonds: MoleculeBond[] = [];
  const branches = organic.branches ?? [];

  // Main chain along y = 0.3 (lower half of canvas).
  // X goes from -0.7 to +0.7 across `carbons` atoms.
  const mainCount = organic.carbons;
  const xStart = -0.7;
  const xEnd = 0.7;
  const xSpan = xEnd - xStart;
  const mainXFor = (index0: number) =>
    mainCount === 1 ? 0 : xStart + (index0 * xSpan) / (mainCount - 1);

  for (let i = 0; i < mainCount; i++) {
    atoms.push({
      id: `c-${i}`,
      symbol: 'C',
      label: `${i + 1}`,
      position: { x: mainXFor(i), y: 0.3 },
    });
  }

  for (let i = 0; i < mainCount - 1; i++) {
    let bondType: BondType = 'single';
    if (organic.type === 'alkene' && organic.doublePosition === i + 1) bondType = 'double';
    if (organic.type === 'alkyne' && organic.triplePosition === i + 1) bondType = 'triple';

    bonds.push({
      from: `c-${i}`,
      to: `c-${i + 1}`,
      type: bondType,
      highlight: bondType !== 'single',
    });
  }

  // Branches rise above the main chain so the parent-chain is visually obvious.
  branches.forEach((branch, branchIdx) => {
    const anchorIndex0 = branch.atPosition - 1;
    const anchorX = mainXFor(anchorIndex0);
    let parentId = `c-${anchorIndex0}`;

    for (let step = 0; step < branch.length; step++) {
      const atomId = `b${branchIdx}-${step}`;
      atoms.push({
        id: atomId,
        symbol: 'C',
        position: { x: anchorX, y: 0.3 - 0.35 * (step + 1) },
      });
      bonds.push({ from: parentId, to: atomId, type: 'single' });
      parentId = atomId;
    }
  });

  return {
    id: organic.correctName.toLowerCase(),
    formula: organic.formula,
    name: organic.correctName,
    atoms,
    bonds,
    carbonChainLength: organic.carbons,
  };
}
