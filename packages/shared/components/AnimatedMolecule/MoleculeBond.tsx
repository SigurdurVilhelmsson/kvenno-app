/**
 * MoleculeBond - SVG component for rendering bonds between atoms
 */

import type { MoleculeBond as MoleculeBondType, Position2D, MoleculeRenderMode } from '@shared/types';
import { MOLECULE_COLORS, BOND_STYLES } from './molecule.constants';
import { getOrganicBondColor, getOrganicBondGlow } from './molecule.utils';

export interface MoleculeBondProps {
  /** Bond data */
  bond: MoleculeBondType;
  /** Start position */
  startPos: Position2D;
  /** End position */
  endPos: Position2D;
  /** Bond line width */
  bondWidth: number;
  /** Rendering mode (reserved for future mode-specific styling) */
  mode?: MoleculeRenderMode;
  /** Whether bond is highlighted */
  isHighlighted?: boolean;
  /** Whether bond is interactive */
  isInteractive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Whether to skip animations */
  reducedMotion?: boolean;
}

/**
 * Calculate perpendicular offset for double/triple bonds
 */
function getPerpendicularOffset(
  start: Position2D,
  end: Position2D,
  offset: number
): { dx: number; dy: number } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return { dx: 0, dy: 0 };

  // Perpendicular unit vector
  return {
    dx: (-dy / length) * offset,
    dy: (dx / length) * offset,
  };
}

export function MoleculeBond({
  bond,
  startPos,
  endPos,
  bondWidth,
  mode = 'simple',
  isHighlighted = false,
  isInteractive = false,
  onClick,
  animationDelay = 0,
  reducedMotion = false,
}: MoleculeBondProps) {
  const bondStyle = BOND_STYLES[bond.type];

  // Determine stroke color based on mode
  let strokeColor: string;
  if (isHighlighted) {
    strokeColor = MOLECULE_COLORS.bondHighlight;
  } else if (mode === 'organic') {
    strokeColor = getOrganicBondColor(bond.type);
  } else if (bond.polar) {
    strokeColor = MOLECULE_COLORS.bondPolar;
  } else {
    strokeColor = MOLECULE_COLORS.bond;
  }

  // Get glow effect for organic mode
  const glowColor = mode === 'organic' ? getOrganicBondGlow(bond.type) : null;

  // Calculate bond length for animation
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const bondLength = Math.sqrt(dx * dx + dy * dy);

  // Animation styles
  const animationStyle = reducedMotion
    ? {}
    : {
        strokeDasharray: bondLength,
        strokeDashoffset: bondLength,
        animation: `bondDraw 300ms ease-out ${animationDelay}ms forwards`,
      };

  // Render single bond
  if (bond.type === 'single') {
    return (
      <g
        className={`molecule-bond ${isInteractive ? 'cursor-pointer' : ''}`}
        onClick={isInteractive ? onClick : undefined}
        role={isInteractive ? 'button' : undefined}
        aria-label={`${bond.type} bond`}
      >
        <line
          x1={startPos.x}
          y1={startPos.y}
          x2={endPos.x}
          y2={endPos.y}
          stroke={strokeColor}
          strokeWidth={bondWidth}
          strokeLinecap="round"
          style={animationStyle}
        />
      </g>
    );
  }

  // Render double bond
  if (bond.type === 'double') {
    const offset = getPerpendicularOffset(startPos, endPos, bondStyle.gap / 2);
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;

    return (
      <g
        className={`molecule-bond ${isInteractive ? 'cursor-pointer' : ''}`}
        onClick={isInteractive ? onClick : undefined}
        role={isInteractive ? 'button' : undefined}
        aria-label="double bond"
      >
        {/* Glow effect for organic mode */}
        {glowColor && (
          <ellipse
            cx={midX}
            cy={midY}
            rx={bondLength / 2 + 8}
            ry={12}
            fill={glowColor}
            style={animationStyle}
          />
        )}
        <line
          x1={startPos.x + offset.dx}
          y1={startPos.y + offset.dy}
          x2={endPos.x + offset.dx}
          y2={endPos.y + offset.dy}
          stroke={strokeColor}
          strokeWidth={bondWidth}
          strokeLinecap="round"
          style={animationStyle}
        />
        <line
          x1={startPos.x - offset.dx}
          y1={startPos.y - offset.dy}
          x2={endPos.x - offset.dx}
          y2={endPos.y - offset.dy}
          stroke={strokeColor}
          strokeWidth={bondWidth}
          strokeLinecap="round"
          style={{
            ...animationStyle,
            animationDelay: reducedMotion ? '0ms' : `${animationDelay + 50}ms`,
          }}
        />
      </g>
    );
  }

  // Render triple bond
  if (bond.type === 'triple') {
    const offset = getPerpendicularOffset(startPos, endPos, bondStyle.gap);
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;

    return (
      <g
        className={`molecule-bond ${isInteractive ? 'cursor-pointer' : ''}`}
        onClick={isInteractive ? onClick : undefined}
        role={isInteractive ? 'button' : undefined}
        aria-label="triple bond"
      >
        {/* Glow effect for organic mode */}
        {glowColor && (
          <ellipse
            cx={midX}
            cy={midY}
            rx={bondLength / 2 + 8}
            ry={14}
            fill={glowColor}
            style={animationStyle}
          />
        )}
        {/* Center line */}
        <line
          x1={startPos.x}
          y1={startPos.y}
          x2={endPos.x}
          y2={endPos.y}
          stroke={strokeColor}
          strokeWidth={bondWidth}
          strokeLinecap="round"
          style={animationStyle}
        />
        {/* Top line */}
        <line
          x1={startPos.x + offset.dx}
          y1={startPos.y + offset.dy}
          x2={endPos.x + offset.dx}
          y2={endPos.y + offset.dy}
          stroke={strokeColor}
          strokeWidth={bondWidth}
          strokeLinecap="round"
          style={{
            ...animationStyle,
            animationDelay: reducedMotion ? '0ms' : `${animationDelay + 50}ms`,
          }}
        />
        {/* Bottom line */}
        <line
          x1={startPos.x - offset.dx}
          y1={startPos.y - offset.dy}
          x2={endPos.x - offset.dx}
          y2={endPos.y - offset.dy}
          stroke={strokeColor}
          strokeWidth={bondWidth}
          strokeLinecap="round"
          style={{
            ...animationStyle,
            animationDelay: reducedMotion ? '0ms' : `${animationDelay + 100}ms`,
          }}
        />
      </g>
    );
  }

  return null;
}

/**
 * SVG defs for bond effects (to be included in parent SVG)
 */
export function MoleculeBondDefs() {
  return (
    <defs>
      {/* Bond draw animation */}
      <style>
        {`
          @keyframes bondDraw {
            to {
              stroke-dashoffset: 0;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .molecule-bond {
              animation: none !important;
              stroke-dashoffset: 0 !important;
            }
          }
        `}
      </style>
    </defs>
  );
}
