/**
 * MoleculeDipole - SVG component for rendering dipole moment arrows
 *
 * Displays net dipole moment for polar molecules with an arrow pointing
 * from the partial positive to partial negative region.
 */

import type { Position2D, DipoleMoment } from '@shared/types';
import { MOLECULE_COLORS } from './molecule.constants';

export interface MoleculeDipoleProps {
  /** Center position of the molecule */
  moleculeCenter: Position2D;
  /** Dipole moment direction and magnitude */
  dipole: DipoleMoment;
  /** Arrow length in pixels */
  length?: number;
  /** Arrow line width */
  strokeWidth?: number;
  /** Arrow color */
  color?: string;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Whether to skip animations */
  reducedMotion?: boolean;
  /** Show the "δ" label at arrow ends */
  showLabels?: boolean;
}

/**
 * Convert direction to angle in degrees (0 = right, 90 = down)
 */
function directionToAngle(direction: DipoleMoment['direction']): number {
  switch (direction) {
    case 'right': return 0;
    case 'down': return 90;
    case 'left': return 180;
    case 'up': return 270;
    default: return 0;
  }
}

/**
 * Calculate endpoint based on center, angle, and distance
 */
function getEndpoint(center: Position2D, angleDeg: number, distance: number): Position2D {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + Math.cos(angleRad) * distance,
    y: center.y + Math.sin(angleRad) * distance,
  };
}

export function MoleculeDipole({
  moleculeCenter,
  dipole,
  length = 60,
  strokeWidth = 3,
  color = MOLECULE_COLORS.dipole,
  animationDelay = 0,
  reducedMotion = false,
  showLabels = true,
}: MoleculeDipoleProps) {
  const angle = directionToAngle(dipole.direction);
  const halfLength = length / 2;

  // Arrow goes from positive (tail) to negative (head)
  // The tail is at the positive end, head at negative end
  const tailPos = getEndpoint(moleculeCenter, angle + 180, halfLength);
  const headPos = getEndpoint(moleculeCenter, angle, halfLength);

  // Arrowhead dimensions
  const arrowHeadLength = 12;
  const arrowHeadWidth = 8;

  // Calculate arrowhead points
  const arrowAngleRad = (angle * Math.PI) / 180;
  const perpAngle = arrowAngleRad + Math.PI / 2;

  const arrowBase = {
    x: headPos.x - Math.cos(arrowAngleRad) * arrowHeadLength,
    y: headPos.y - Math.sin(arrowAngleRad) * arrowHeadLength,
  };

  const arrowLeft = {
    x: arrowBase.x + Math.cos(perpAngle) * arrowHeadWidth / 2,
    y: arrowBase.y + Math.sin(perpAngle) * arrowHeadWidth / 2,
  };

  const arrowRight = {
    x: arrowBase.x - Math.cos(perpAngle) * arrowHeadWidth / 2,
    y: arrowBase.y - Math.sin(perpAngle) * arrowHeadWidth / 2,
  };

  // Animation styles
  const animationStyle = reducedMotion
    ? {}
    : {
        opacity: 0,
        animation: `dipoleEnter 400ms ease-out ${animationDelay}ms forwards`,
      };

  // Label positions (offset from arrow ends)
  const labelOffset = 14;
  const posLabelPos = getEndpoint(tailPos, angle + 180, labelOffset);
  const negLabelPos = getEndpoint(headPos, angle, labelOffset);

  return (
    <g className="molecule-dipole" aria-label="dipole moment arrow" style={animationStyle}>
      {/* Dipole arrow line */}
      <line
        x1={tailPos.x}
        y1={tailPos.y}
        x2={arrowBase.x}
        y2={arrowBase.y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Arrowhead (pointing to negative end) */}
      <polygon
        points={`${headPos.x},${headPos.y} ${arrowLeft.x},${arrowLeft.y} ${arrowRight.x},${arrowRight.y}`}
        fill={color}
      />

      {/* Crossbar at positive end (conventional dipole notation) */}
      <line
        x1={tailPos.x + Math.cos(perpAngle) * 6}
        y1={tailPos.y + Math.sin(perpAngle) * 6}
        x2={tailPos.x - Math.cos(perpAngle) * 6}
        y2={tailPos.y - Math.sin(perpAngle) * 6}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Partial charge labels */}
      {showLabels && (
        <>
          <text
            x={posLabelPos.x}
            y={posLabelPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight="bold"
            fill={MOLECULE_COLORS.partialChargePositive}
          >
            δ+
          </text>
          <text
            x={negLabelPos.x}
            y={negLabelPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight="bold"
            fill={MOLECULE_COLORS.partialChargeNegative}
          >
            δ−
          </text>
        </>
      )}
    </g>
  );
}

/**
 * Calculate net dipole direction from atom positions and partial charges
 */
export function calculateDipoleDirection(
  atoms: Array<{ position: Position2D; partialCharge?: 'positive' | 'negative' | 'none' }>,
  _center: Position2D
): DipoleMoment['direction'] | undefined {
  // Find atoms with partial charges
  const positiveAtoms = atoms.filter(a => a.partialCharge === 'positive');
  const negativeAtoms = atoms.filter(a => a.partialCharge === 'negative');

  if (positiveAtoms.length === 0 || negativeAtoms.length === 0) {
    return undefined; // No clear dipole
  }

  // Calculate average positions
  const avgPositive = {
    x: positiveAtoms.reduce((sum, a) => sum + a.position.x, 0) / positiveAtoms.length,
    y: positiveAtoms.reduce((sum, a) => sum + a.position.y, 0) / positiveAtoms.length,
  };

  const avgNegative = {
    x: negativeAtoms.reduce((sum, a) => sum + a.position.x, 0) / negativeAtoms.length,
    y: negativeAtoms.reduce((sum, a) => sum + a.position.y, 0) / negativeAtoms.length,
  };

  // Calculate direction vector from positive to negative
  const dx = avgNegative.x - avgPositive.x;
  const dy = avgNegative.y - avgPositive.y;

  // Determine cardinal direction
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  if (angle >= -45 && angle < 45) return 'right';
  if (angle >= 45 && angle < 135) return 'down';
  if (angle >= -135 && angle < -45) return 'up';
  return 'left';
}

/**
 * Calculate dipole arrow length based on molecule size
 */
export function calculateDipoleLength(
  moleculeWidth: number,
  moleculeHeight: number,
  magnitude?: number
): number {
  const baseLength = Math.min(moleculeWidth, moleculeHeight) * 0.6;
  const scaledLength = magnitude ? baseLength * Math.min(magnitude, 2) : baseLength;
  return Math.max(40, Math.min(scaledLength, 100));
}

/**
 * SVG defs for dipole effects
 */
export function MoleculeDipoleDefs() {
  return (
    <defs>
      <style>
        {`
          @keyframes dipoleEnter {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .molecule-dipole {
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
