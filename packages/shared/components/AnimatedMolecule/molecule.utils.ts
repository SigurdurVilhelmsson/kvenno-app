/**
 * Utility functions for molecule visualization
 */

import type {
  Position2D,
  Position3D,
  Molecule,
  MoleculeAtom,
  MolecularGeometry,
  ElementVisual,
} from '@shared/types';

import {
  ELEMENT_VISUALS,
  DEFAULT_ELEMENT_VISUAL,
  GEOMETRY_COORDS,
  SIZE_CONFIG,
} from './molecule.constants';

/**
 * Get element visual properties, with fallback to default
 */
export function getElementVisual(symbol: string): ElementVisual {
  return ELEMENT_VISUALS[symbol] || DEFAULT_ELEMENT_VISUAL;
}

/**
 * Project 3D coordinates to 2D using simple isometric projection
 * @param point - 3D point to project
 * @param scale - Scale factor for the projection
 * @param centerX - X center offset
 * @param centerY - Y center offset
 */
export function project3Dto2D(
  point: Position3D,
  scale: number,
  centerX: number = 0,
  centerY: number = 0
): Position2D {
  // Simple isometric projection
  // X shifts right with positive z
  // Y shifts up with negative z (screen coordinates)
  return {
    x: centerX + (point.x + point.z * 0.3) * scale,
    y: centerY + (point.y - point.z * 0.3) * scale,
  };
}

/**
 * Get depth-based styling for 3D effect
 * @param z - Z coordinate (-1 to 1 range)
 * @returns opacity and scale multipliers
 */
export function getDepthStyle(z: number): { opacity: number; scale: number } {
  // z ranges from -1 (back) to 1 (front)
  const normalizedZ = (z + 1) / 2; // 0 to 1
  return {
    opacity: 0.6 + normalizedZ * 0.4, // 0.6 to 1.0
    scale: 0.8 + normalizedZ * 0.2, // 0.8 to 1.0
  };
}

/**
 * Calculate positions for atoms based on VSEPR geometry
 */
export function calculateGeometryPositions(
  geometry: MolecularGeometry,
  centerX: number,
  centerY: number,
  scale: number
): Position2D[] {
  const coords3D = GEOMETRY_COORDS[geometry];
  if (!coords3D) return [];

  return coords3D.map((point) => project3Dto2D(point, scale, centerX, centerY));
}

/**
 * Calculate atom positions for a molecule
 * Handles various cases: explicit positions, geometry-based, or simple layout
 */
export function calculateAtomPositions(
  molecule: Molecule,
  width: number,
  height: number,
  atomRadius: number
): Map<string, Position2D> {
  const positions = new Map<string, Position2D>();
  const centerX = width / 2;
  const centerY = height / 2;

  // If atoms have explicit positions, use them (scaled to container)
  const hasExplicitPositions = molecule.atoms.some((a) => a.position);
  if (hasExplicitPositions) {
    for (const atom of molecule.atoms) {
      if (atom.position) {
        positions.set(atom.id, {
          x: atom.position.x * (width / 2) + centerX,
          y: atom.position.y * (height / 2) + centerY,
        });
      }
    }
    return positions;
  }

  // If geometry is specified, use VSEPR positions
  if (molecule.geometry && molecule.atoms.length > 1) {
    const scale = Math.min(width, height) / 3;
    const geometryPositions = calculateGeometryPositions(
      molecule.geometry,
      centerX,
      centerY,
      scale
    );

    // First atom is typically central
    positions.set(molecule.atoms[0].id, { x: centerX, y: centerY });

    // Remaining atoms get geometry positions
    for (let i = 1; i < molecule.atoms.length && i <= geometryPositions.length; i++) {
      positions.set(molecule.atoms[i].id, geometryPositions[i - 1]);
    }
    return positions;
  }

  // Simple layout: arrange atoms in a line or cluster
  const atomCount = molecule.atoms.length;

  if (atomCount === 1) {
    // Single atom at center
    positions.set(molecule.atoms[0].id, { x: centerX, y: centerY });
  } else if (atomCount === 2) {
    // Two atoms side by side
    const spacing = atomRadius * 3;
    positions.set(molecule.atoms[0].id, { x: centerX - spacing, y: centerY });
    positions.set(molecule.atoms[1].id, { x: centerX + spacing, y: centerY });
  } else {
    // Linear arrangement for more atoms
    const totalWidth = (atomCount - 1) * atomRadius * 2.5;
    const startX = centerX - totalWidth / 2;

    for (let i = 0; i < atomCount; i++) {
      positions.set(molecule.atoms[i].id, {
        x: startX + i * atomRadius * 2.5,
        y: centerY,
      });
    }
  }

  return positions;
}

/**
 * Calculate bond line endpoints, accounting for atom radii
 */
export function calculateBondEndpoints(
  fromPos: Position2D,
  toPos: Position2D,
  fromRadius: number,
  toRadius: number
): { start: Position2D; end: Position2D } {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return { start: fromPos, end: toPos };
  }

  // Normalize direction
  const nx = dx / length;
  const ny = dy / length;

  // Start just outside the from atom's radius
  const start: Position2D = {
    x: fromPos.x + nx * fromRadius,
    y: fromPos.y + ny * fromRadius,
  };

  // End just outside the to atom's radius
  const end: Position2D = {
    x: toPos.x - nx * toRadius,
    y: toPos.y - ny * toRadius,
  };

  return { start, end };
}

/**
 * Calculate angle between two points in degrees
 */
export function calculateAngle(from: Position2D, to: Position2D): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

/**
 * Calculate position at a given angle and distance from a center point
 */
export function positionAtAngle(
  center: Position2D,
  angleDegrees: number,
  distance: number
): Position2D {
  const angleRadians = angleDegrees * (Math.PI / 180);
  return {
    x: center.x + Math.cos(angleRadians) * distance,
    y: center.y + Math.sin(angleRadians) * distance,
  };
}

/**
 * Get size configuration for a given size variant
 */
export function getSizeConfig(size: keyof typeof SIZE_CONFIG) {
  return SIZE_CONFIG[size];
}

/**
 * Calculate text color based on background color (for atom symbols)
 * Returns white or dark text depending on background brightness
 */
export function getContrastTextColor(backgroundColor: string): string {
  // Simple luminance check
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#1F2937' : '#FFFFFF';
}

/**
 * Generate unique IDs for atoms if not provided
 */
export function ensureAtomIds(atoms: MoleculeAtom[]): MoleculeAtom[] {
  return atoms.map((atom, index) => ({
    ...atom,
    id: atom.id || `atom-${index}`,
  }));
}

/**
 * Calculate lone pair positions around an atom
 * @param atomPosition - Position of the atom
 * @param lonePairs - Number of lone pairs (1-3)
 * @param bondAngles - Angles of existing bonds (to avoid overlap)
 * @param distance - Distance from atom center
 */
export function calculateLonePairPositions(
  atomPosition: Position2D,
  lonePairs: number,
  bondAngles: number[],
  distance: number
): Position2D[][] {
  const positions: Position2D[][] = [];

  if (lonePairs === 0) return positions;

  // Find available angles (opposite to bonds)
  const usedAngles = new Set(bondAngles.map((a) => Math.round(a / 45) * 45));
  const availableAngles: number[] = [];

  for (let angle = 0; angle < 360; angle += 45) {
    if (!usedAngles.has(angle) && !usedAngles.has((angle + 180) % 360)) {
      availableAngles.push(angle);
    }
  }

  // Default angles if no bonds
  if (availableAngles.length === 0) {
    availableAngles.push(90, 180, 270, 0);
  }

  // Place lone pairs at available angles
  for (let i = 0; i < lonePairs && i < availableAngles.length; i++) {
    const angle = availableAngles[i];
    // Each lone pair is represented by two dots
    const dot1 = positionAtAngle(atomPosition, angle - 10, distance);
    const dot2 = positionAtAngle(atomPosition, angle + 10, distance);
    positions.push([dot1, dot2]);
  }

  return positions;
}

/**
 * Determine if a point is inside an SVG element bounds
 */
export function isPointInBounds(
  point: Position2D,
  bounds: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

/**
 * Calculate positions for organic chain layout (linear carbon chain)
 * @param carbonCount - Number of carbons in the chain
 * @param width - Container width
 * @param height - Container height
 * @param atomRadius - Base atom radius
 * @returns Map of atom IDs to positions
 */
export function calculateOrganicChainPositions(
  molecule: Molecule,
  width: number,
  height: number,
  atomRadius: number
): Map<string, Position2D> {
  const positions = new Map<string, Position2D>();
  const centerY = height / 2;

  // Find carbon atoms (main chain)
  const carbons = molecule.atoms.filter((a) => a.symbol === 'C');
  const otherAtoms = molecule.atoms.filter((a) => a.symbol !== 'C');

  if (carbons.length === 0) {
    // Fallback to simple layout
    return calculateAtomPositions(molecule, width, height, atomRadius);
  }

  // Calculate spacing for carbon chain
  const padding = atomRadius * 2;
  const availableWidth = width - padding * 2;
  const spacing = Math.min(atomRadius * 3, availableWidth / Math.max(carbons.length - 1, 1));
  const totalChainWidth = (carbons.length - 1) * spacing;
  const startX = (width - totalChainWidth) / 2;

  // Position carbons in a horizontal line
  carbons.forEach((carbon, index) => {
    positions.set(carbon.id, {
      x: startX + index * spacing,
      y: centerY,
    });
  });

  // Position other atoms (hydrogens, etc.) around their bonded carbons
  for (const atom of otherAtoms) {
    // Find which carbon this atom is bonded to
    const bond = molecule.bonds.find((b) => b.from === atom.id || b.to === atom.id);

    if (bond) {
      const carbonId = bond.from === atom.id ? bond.to : bond.from;
      const carbonPos = positions.get(carbonId);

      if (carbonPos) {
        // Position hydrogen above or below the carbon
        const hydrogenOffset = atomRadius * 1.5;

        // Alternate above/below for visual clarity
        const yOffset = otherAtoms.indexOf(atom) % 2 === 0 ? -hydrogenOffset : hydrogenOffset;

        positions.set(atom.id, {
          x: carbonPos.x,
          y: carbonPos.y + yOffset,
        });
      }
    }
  }

  return positions;
}

/**
 * Get bond color for organic mode based on bond type
 */
export function getOrganicBondColor(bondType: 'single' | 'double' | 'triple'): string {
  switch (bondType) {
    case 'single':
      return '#4B5563'; // Gray
    case 'double':
      return '#16A34A'; // Green
    case 'triple':
      return '#9333EA'; // Purple
    default:
      return '#4B5563';
  }
}

/**
 * Get glow color for functional group highlighting
 */
export function getOrganicBondGlow(bondType: 'single' | 'double' | 'triple'): string | null {
  switch (bondType) {
    case 'double':
      return 'rgba(34, 197, 94, 0.4)'; // Green glow
    case 'triple':
      return 'rgba(168, 85, 247, 0.4)'; // Purple glow
    default:
      return null; // No glow for single bonds
  }
}

/**
 * Get bond symbol for organic nomenclature display
 */
export function getBondSymbol(bondType: 'single' | 'double' | 'triple'): string {
  switch (bondType) {
    case 'single':
      return '-';
    case 'double':
      return '=';
    case 'triple':
      return '≡';
    default:
      return '-';
  }
}
