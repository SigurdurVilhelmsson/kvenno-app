/**
 * MoleculeLonePair - SVG component for rendering electron lone pairs
 *
 * Lone pairs are shown as two small dots positioned at the specified angle
 * around an atom, representing non-bonding electron pairs in Lewis structures.
 */

import type { Position2D } from '@shared/types';
import { MOLECULE_COLORS } from './molecule.constants';
import { positionAtAngle } from './molecule.utils';

export interface MoleculeLonePairProps {
  /** Center position of the parent atom */
  atomPosition: Position2D;
  /** Angle in degrees for lone pair placement (0 = right, 90 = down) */
  angle: number;
  /** Distance from atom center to lone pair */
  distance: number;
  /** Size of each dot */
  dotSize?: number;
  /** Color of the dots */
  color?: string;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Whether to skip animations */
  reducedMotion?: boolean;
}

export function MoleculeLonePair({
  atomPosition,
  angle,
  distance,
  dotSize = 4,
  color = MOLECULE_COLORS.lonePair,
  animationDelay = 0,
  reducedMotion = false,
}: MoleculeLonePairProps) {
  // Calculate position for the lone pair center
  const pairCenter = positionAtAngle(atomPosition, angle, distance);

  // Calculate positions for the two dots (perpendicular to angle)
  const perpAngle = angle + 90;
  const dotSpacing = dotSize * 1.2;

  const dot1 = positionAtAngle(pairCenter, perpAngle, dotSpacing / 2);
  const dot2 = positionAtAngle(pairCenter, perpAngle + 180, dotSpacing / 2);

  // Animation styles
  const animationStyle = reducedMotion
    ? {}
    : {
        opacity: 0,
        transform: 'scale(0)',
        animation: `lonePairEnter 200ms ease-out ${animationDelay}ms forwards`,
      };

  return (
    <g className="molecule-lone-pair" aria-label="lone pair">
      <circle
        cx={dot1.x}
        cy={dot1.y}
        r={dotSize / 2}
        fill={color}
        style={animationStyle}
      />
      <circle
        cx={dot2.x}
        cy={dot2.y}
        r={dotSize / 2}
        fill={color}
        style={{
          ...animationStyle,
          animationDelay: reducedMotion ? '0ms' : `${animationDelay + 50}ms`,
        }}
      />
    </g>
  );
}

/**
 * Calculate lone pair angles for an atom based on its bonding configuration
 *
 * @param bondAngles - Angles of existing bonds (in degrees)
 * @param lonePairCount - Number of lone pairs to place
 * @returns Array of angles for each lone pair
 */
export function calculateLonePairAngles(
  bondAngles: number[],
  lonePairCount: number
): number[] {
  if (lonePairCount === 0) return [];

  // If no bonds, distribute lone pairs evenly
  if (bondAngles.length === 0) {
    const angles: number[] = [];
    const step = 360 / lonePairCount;
    for (let i = 0; i < lonePairCount; i++) {
      angles.push(i * step - 90); // Start from top
    }
    return angles;
  }

  // Find gaps between bonds and place lone pairs in the largest gaps
  const sortedBonds = [...bondAngles].sort((a, b) => a - b);
  const gaps: { midAngle: number; size: number }[] = [];

  for (let i = 0; i < sortedBonds.length; i++) {
    const current = sortedBonds[i];
    const next = sortedBonds[(i + 1) % sortedBonds.length];
    let gapSize = next - current;
    if (gapSize <= 0) gapSize += 360;

    const midAngle = current + gapSize / 2;
    gaps.push({ midAngle: midAngle % 360, size: gapSize });
  }

  // Sort gaps by size (largest first)
  gaps.sort((a, b) => b.size - a.size);

  // Take the largest gaps for lone pairs
  const result: number[] = [];
  for (let i = 0; i < lonePairCount && i < gaps.length; i++) {
    result.push(gaps[i].midAngle);
  }

  return result;
}

/**
 * Get predefined lone pair angles for common molecular geometries
 */
export function getLonePairAnglesForGeometry(
  geometry: string,
  lonePairCount: number,
  position: 'central' | 'terminal'
): number[] {
  // For central atoms with specific geometries
  if (position === 'central') {
    switch (geometry) {
      case 'bent':
        // Water-like: lone pairs above the bent structure
        if (lonePairCount === 2) return [-90, -135];
        if (lonePairCount === 1) return [-90];
        break;
      case 'trigonal-pyramidal':
        // Ammonia-like: one lone pair on top
        if (lonePairCount === 1) return [-90];
        break;
      case 'linear':
        // Linear with lone pairs perpendicular
        if (lonePairCount === 2) return [-90, 90];
        if (lonePairCount === 3) return [-90, 90, 180];
        break;
      case 't-shaped':
        // T-shaped (like ClF3)
        if (lonePairCount === 2) return [-90, 90];
        break;
      case 'square-planar':
        // Square planar (like XeF4)
        if (lonePairCount === 2) return [-90, 90];
        break;
    }
  }

  // For terminal atoms, place lone pairs opposite to the bond
  if (position === 'terminal') {
    // Default: spread around opposite side
    switch (lonePairCount) {
      case 1:
        return [180]; // Opposite to bond
      case 2:
        return [135, 225]; // Spread on opposite side
      case 3:
        return [120, 180, 240]; // Three on opposite side
    }
  }

  // Fallback: evenly distribute starting from top
  const angles: number[] = [];
  const step = 360 / Math.max(lonePairCount, 1);
  for (let i = 0; i < lonePairCount; i++) {
    angles.push(i * step - 90);
  }
  return angles;
}

/**
 * SVG defs for lone pair animations
 */
export function MoleculeLonePairDefs() {
  return (
    <defs>
      <style>
        {`
          @keyframes lonePairEnter {
            from {
              opacity: 0;
              transform: scale(0);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .molecule-lone-pair circle {
              animation: none !important;
              opacity: 1 !important;
              transform: scale(1) !important;
            }
          }
        `}
      </style>
    </defs>
  );
}
