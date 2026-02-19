/**
 * useMoleculeLayout - Hook for calculating molecule layout and positioning
 *
 * Provides centralized layout calculations for:
 * - Atom positions based on geometry
 * - Bond endpoints
 * - VSEPR 3D depth styling
 * - Dipole arrow positioning
 */

import { useMemo } from 'react';
import type {
  Molecule,
  MoleculeAtom,
  Position2D,
  MolecularGeometry,
  MoleculeRenderMode,
  DipoleMoment,
} from '@shared/types';
import { GEOMETRY_COORDS } from './molecule.constants';
import {
  project3Dto2D,
  getElementVisual,
  calculateBondEndpoints,
  ensureAtomIds,
} from './molecule.utils';

export interface LayoutConfig {
  /** SVG width */
  width: number;
  /** SVG height */
  height: number;
  /** Base atom radius */
  atomRadius: number;
  /** Rendering mode */
  mode: MoleculeRenderMode;
}

export interface AtomLayout {
  /** Atom ID */
  id: string;
  /** Atom data */
  atom: MoleculeAtom;
  /** 2D position */
  position: Position2D;
  /** Calculated radius (based on element and scale) */
  radius: number;
  /** Depth opacity for 3D effect (1 = front, lower = back) */
  depthOpacity: number;
  /** Depth scale for 3D effect (1 = front, smaller = back) */
  depthScale: number;
  /** Z-index for rendering order */
  zIndex: number;
}

export interface BondLayout {
  /** Bond index */
  index: number;
  /** Start position (adjusted for atom radius) */
  start: Position2D;
  /** End position (adjusted for atom radius) */
  end: Position2D;
  /** Bond length in pixels */
  length: number;
}

export interface MoleculeLayoutResult {
  /** Layout info for each atom, sorted by z-index */
  atoms: AtomLayout[];
  /** Layout info for each bond */
  bonds: BondLayout[];
  /** Molecule center position */
  center: Position2D;
  /** Molecule bounding box */
  bounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number };
  /** Calculated dipole (if applicable) */
  dipole: DipoleMoment | null;
  /** Position for dipole arrow */
  dipolePosition: Position2D | null;
}

/**
 * Get depth-based styling for VSEPR 3D effect
 */
function getDepthStyle(z: number): { opacity: number; scale: number; zIndex: number } {
  // z ranges from -1 (back) to 1 (front)
  // Map to visual properties
  const normalizedZ = (z + 1) / 2; // 0 to 1

  return {
    opacity: 0.5 + normalizedZ * 0.5, // 0.5 to 1.0
    scale: 0.7 + normalizedZ * 0.3,   // 0.7 to 1.0
    zIndex: Math.round(normalizedZ * 100), // 0 to 100
  };
}

/**
 * Calculate atom positions for VSEPR geometry
 */
function calculateVSEPRPositions(
  atoms: MoleculeAtom[],
  geometry: MolecularGeometry,
  width: number,
  height: number,
  atomRadius: number
): Map<string, { position: Position2D; depth: { opacity: number; scale: number; zIndex: number } }> {
  const result = new Map<string, { position: Position2D; depth: { opacity: number; scale: number; zIndex: number } }>();
  const coords3D = GEOMETRY_COORDS[geometry];

  if (!coords3D || atoms.length === 0) {
    return result;
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 3 - atomRadius;

  // First atom is central - place at center
  result.set(atoms[0].id, {
    position: { x: centerX, y: centerY },
    depth: { opacity: 1, scale: 1, zIndex: 50 },
  });

  // Remaining atoms use geometry coordinates
  for (let i = 1; i < atoms.length && i <= coords3D.length; i++) {
    const coord3D = coords3D[i - 1];
    const projected = project3Dto2D(coord3D, scale);
    const depth = getDepthStyle(coord3D.z);

    result.set(atoms[i].id, {
      position: {
        x: centerX + projected.x,
        y: centerY + projected.y,
      },
      depth,
    });
  }

  return result;
}

/**
 * Calculate simple linear/grid layout for non-VSEPR modes
 */
function calculateSimplePositions(
  atoms: MoleculeAtom[],
  bonds: Molecule['bonds'],
  width: number,
  height: number,
  atomRadius: number
): Map<string, { position: Position2D; depth: { opacity: number; scale: number; zIndex: number } }> {
  const result = new Map<string, { position: Position2D; depth: { opacity: number; scale: number; zIndex: number } }>();
  const defaultDepth = { opacity: 1, scale: 1, zIndex: 50 };

  if (atoms.length === 0) return result;

  // Check for atoms with explicit positions
  const hasExplicitPositions = atoms.some(a => a.position);

  if (hasExplicitPositions) {
    // Use explicit positions, scaling to fit
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const atom of atoms) {
      if (atom.position) {
        minX = Math.min(minX, atom.position.x);
        maxX = Math.max(maxX, atom.position.x);
        minY = Math.min(minY, atom.position.y);
        maxY = Math.max(maxY, atom.position.y);
      }
    }

    const scaleX = (width - atomRadius * 4) / Math.max(maxX - minX, 1);
    const scaleY = (height - atomRadius * 4) / Math.max(maxY - minY, 1);
    const scale = Math.min(scaleX, scaleY, 1);

    const offsetX = (width - (maxX - minX) * scale) / 2 - minX * scale;
    const offsetY = (height - (maxY - minY) * scale) / 2 - minY * scale;

    for (const atom of atoms) {
      if (atom.position) {
        result.set(atom.id, {
          position: {
            x: atom.position.x * scale + offsetX,
            y: atom.position.y * scale + offsetY,
          },
          depth: defaultDepth,
        });
      }
    }
    return result;
  }

  // Build adjacency for connected layout
  const adjacency = new Map<string, string[]>();
  for (const atom of atoms) {
    adjacency.set(atom.id, []);
  }
  for (const bond of bonds) {
    adjacency.get(bond.from)?.push(bond.to);
    adjacency.get(bond.to)?.push(bond.from);
  }

  // Simple radial layout from first atom
  if (atoms.length === 1) {
    result.set(atoms[0].id, { position: { x: width / 2, y: height / 2 }, depth: defaultDepth });
    return result;
  }

  // Use BFS to place atoms
  const placed = new Set<string>();
  const queue: Array<{ id: string; position: Position2D }> = [];
  const spacing = Math.min(width, height) / Math.max(atoms.length, 2) * 0.8;

  // Start with first atom at center
  const startPos = { x: width / 2, y: height / 2 };
  result.set(atoms[0].id, { position: startPos, depth: defaultDepth });
  placed.add(atoms[0].id);
  queue.push({ id: atoms[0].id, position: startPos });

  let angleOffset = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacency.get(current.id) || [];
    const unplacedNeighbors = neighbors.filter(n => !placed.has(n));

    if (unplacedNeighbors.length > 0) {
      const angleStep = (2 * Math.PI) / Math.max(unplacedNeighbors.length, 1);
      let angle = angleOffset;

      for (const neighborId of unplacedNeighbors) {
        const newPos = {
          x: current.position.x + Math.cos(angle) * spacing,
          y: current.position.y + Math.sin(angle) * spacing,
        };
        result.set(neighborId, { position: newPos, depth: defaultDepth });
        placed.add(neighborId);
        queue.push({ id: neighborId, position: newPos });
        angle += angleStep;
      }
    }
    angleOffset += Math.PI / 6; // Slight rotation for each level
  }

  // Place any unconnected atoms
  let row = 0;
  for (const atom of atoms) {
    if (!placed.has(atom.id)) {
      result.set(atom.id, {
        position: {
          x: atomRadius * 2 + row * spacing,
          y: height - atomRadius * 2,
        },
        depth: defaultDepth,
      });
      row++;
    }
  }

  return result;
}

/**
 * Calculate net dipole moment from atom positions and charges
 */
function calculateNetDipole(
  atomLayouts: AtomLayout[]
): DipoleMoment | null {
  const positiveAtoms = atomLayouts.filter(a => a.atom.partialCharge === 'positive');
  const negativeAtoms = atomLayouts.filter(a => a.atom.partialCharge === 'negative');

  if (positiveAtoms.length === 0 || negativeAtoms.length === 0) {
    return null;
  }

  // Calculate center of positive and negative charges
  const avgPositive = {
    x: positiveAtoms.reduce((sum, a) => sum + a.position.x, 0) / positiveAtoms.length,
    y: positiveAtoms.reduce((sum, a) => sum + a.position.y, 0) / positiveAtoms.length,
  };

  const avgNegative = {
    x: negativeAtoms.reduce((sum, a) => sum + a.position.x, 0) / negativeAtoms.length,
    y: negativeAtoms.reduce((sum, a) => sum + a.position.y, 0) / negativeAtoms.length,
  };

  // Calculate direction vector
  const dx = avgNegative.x - avgPositive.x;
  const dy = avgNegative.y - avgPositive.y;
  const magnitude = Math.sqrt(dx * dx + dy * dy);

  if (magnitude < 5) {
    return null; // Too small to display
  }

  // Determine cardinal direction
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  let direction: DipoleMoment['direction'];

  if (angle >= -45 && angle < 45) direction = 'right';
  else if (angle >= 45 && angle < 135) direction = 'down';
  else if (angle >= -135 && angle < -45) direction = 'up';
  else direction = 'left';

  return { direction, magnitude: magnitude / 50 }; // Normalize magnitude
}

/**
 * Hook for calculating molecule layout
 */
export function useMoleculeLayout(
  molecule: Molecule,
  config: LayoutConfig
): MoleculeLayoutResult {
  const { width, height, atomRadius, mode } = config;

  return useMemo(() => {
    // Ensure atoms have IDs
    const atomsWithIds = ensureAtomIds(molecule.atoms);

    // Calculate positions based on mode and geometry
    let positionMap: Map<string, { position: Position2D; depth: { opacity: number; scale: number; zIndex: number } }>;

    if (mode === 'vsepr' && molecule.geometry) {
      positionMap = calculateVSEPRPositions(atomsWithIds, molecule.geometry, width, height, atomRadius);
    } else {
      positionMap = calculateSimplePositions(atomsWithIds, molecule.bonds, width, height, atomRadius);
    }

    // Build atom layouts
    const atomLayouts: AtomLayout[] = atomsWithIds.map(atom => {
      const layoutData = positionMap.get(atom.id) || {
        position: { x: width / 2, y: height / 2 },
        depth: { opacity: 1, scale: 1, zIndex: 50 },
      };
      const visual = getElementVisual(atom.symbol);

      return {
        id: atom.id,
        atom,
        position: layoutData.position,
        radius: atomRadius * visual.radius * layoutData.depth.scale,
        depthOpacity: layoutData.depth.opacity,
        depthScale: layoutData.depth.scale,
        zIndex: layoutData.depth.zIndex,
      };
    });

    // Sort by z-index for proper rendering order (back to front)
    atomLayouts.sort((a, b) => a.zIndex - b.zIndex);

    // Build bond layouts
    const bondLayouts: BondLayout[] = molecule.bonds.map((bond, index) => {
      const fromAtom = atomLayouts.find(a => a.id === bond.from);
      const toAtom = atomLayouts.find(a => a.id === bond.to);

      if (!fromAtom || !toAtom) {
        return { index, start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, length: 0 };
      }

      const { start, end } = calculateBondEndpoints(
        fromAtom.position,
        toAtom.position,
        fromAtom.radius,
        toAtom.radius
      );

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      return { index, start, end, length };
    });

    // Calculate bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const atom of atomLayouts) {
      minX = Math.min(minX, atom.position.x - atom.radius);
      maxX = Math.max(maxX, atom.position.x + atom.radius);
      minY = Math.min(minY, atom.position.y - atom.radius);
      maxY = Math.max(maxY, atom.position.y + atom.radius);
    }

    const bounds = {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };

    // Calculate center
    const center = {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    };

    // Calculate dipole if molecule is polar
    let dipole: DipoleMoment | null = molecule.dipoleMoment || null;
    if (!dipole && molecule.isPolar) {
      dipole = calculateNetDipole(atomLayouts);
    }

    return {
      atoms: atomLayouts,
      bonds: bondLayouts,
      center,
      bounds,
      dipole,
      dipolePosition: dipole ? center : null,
    };
  }, [molecule, width, height, atomRadius, mode]);
}

export { getDepthStyle };
