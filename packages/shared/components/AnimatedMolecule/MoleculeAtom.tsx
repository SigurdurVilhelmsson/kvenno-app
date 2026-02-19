/**
 * MoleculeAtom - SVG component for rendering individual atoms
 */

import type { MoleculeAtom as MoleculeAtomType, Position2D, MoleculeRenderMode } from '@shared/types';

import { MOLECULE_COLORS } from './molecule.constants';
import { getElementVisual, getContrastTextColor } from './molecule.utils';

export interface MoleculeAtomProps {
  /** Atom data */
  atom: MoleculeAtomType;
  /** Position in SVG coordinate space */
  position: Position2D;
  /** Base radius for atoms */
  baseRadius: number;
  /** Font size for symbols */
  fontSize: number;
  /** Rendering mode (reserved for future mode-specific styling) */
  mode?: MoleculeRenderMode;
  /** Show atom label/number */
  showLabel?: boolean;
  /** Show formal charge badge */
  showFormalCharge?: boolean;
  /** Show partial charge indicator */
  showPartialCharge?: boolean;
  /** Whether atom is highlighted */
  isHighlighted?: boolean;
  /** Whether atom is interactive */
  isInteractive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Animation delay in ms (for staggered animations) */
  animationDelay?: number;
  /** Whether to skip animations */
  reducedMotion?: boolean;
  /** Depth-based opacity (for VSEPR 3D effect) */
  depthOpacity?: number;
  /** Depth-based scale (for VSEPR 3D effect) */
  depthScale?: number;
}

export function MoleculeAtom({
  atom,
  position,
  baseRadius,
  fontSize,
  mode: _mode,
  showLabel = false,
  showFormalCharge = true,
  showPartialCharge = false,
  isHighlighted = false,
  isInteractive = false,
  onClick,
  animationDelay = 0,
  reducedMotion = false,
  depthOpacity = 1,
  depthScale = 1,
}: MoleculeAtomProps) {
  const visual = getElementVisual(atom.symbol);
  const radius = baseRadius * visual.radius * depthScale;
  const textColor = getContrastTextColor(visual.color);

  // Animation styles
  const animationStyle = reducedMotion
    ? {}
    : {
        opacity: 0,
        transform: 'scale(0)',
        animation: `atomEnter 300ms ease-out ${animationDelay}ms forwards`,
      };

  // Highlight glow filter
  const highlightFilter = isHighlighted ? 'url(#atomHighlightGlow)' : undefined;

  // Use strokeColor from element visual for better visibility on any background
  const strokeColor = visual.strokeColor;
  const strokeWidth = strokeColor ? 2 : 0;

  return (
    <g
      className={`molecule-atom ${isInteractive ? 'cursor-pointer' : ''}`}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-label={`${visual.name || atom.symbol} atom`}
      style={{ opacity: depthOpacity }}
    >
      {/* Main atom circle */}
      <circle
        cx={position.x}
        cy={position.y}
        r={radius}
        fill={visual.color}
        stroke={strokeColor || 'transparent'}
        strokeWidth={strokeWidth}
        filter={highlightFilter}
        style={animationStyle}
      />

      {/* Highlight ring */}
      {isHighlighted && (
        <circle
          cx={position.x}
          cy={position.y}
          r={radius + 4}
          fill="none"
          stroke={MOLECULE_COLORS.atomHighlight}
          strokeWidth={3}
          opacity={0.7}
          style={animationStyle}
        />
      )}

      {/* Element symbol */}
      <text
        x={position.x}
        y={position.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize * depthScale}
        fontWeight="bold"
        fill={textColor}
        style={animationStyle}
      >
        {atom.symbol}
      </text>

      {/* Atom label (for organic nomenclature - numbering) */}
      {showLabel && atom.label && (
        <text
          x={position.x}
          y={position.y - radius - 8}
          textAnchor="middle"
          fontSize={fontSize * 0.8}
          fill="#6B7280"
          style={animationStyle}
        >
          {atom.label}
        </text>
      )}

      {/* Formal charge badge (Lewis structures) */}
      {showFormalCharge && atom.formalCharge !== undefined && atom.formalCharge !== 0 && (
        <g style={animationStyle}>
          <circle
            cx={position.x + radius * 0.7}
            cy={position.y - radius * 0.7}
            r={fontSize * 0.6}
            fill={atom.formalCharge > 0 ? MOLECULE_COLORS.formalChargePositive : MOLECULE_COLORS.formalChargeNegative}
          />
          <text
            x={position.x + radius * 0.7}
            y={position.y - radius * 0.7}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize * 0.7}
            fontWeight="bold"
            fill="white"
          >
            {atom.formalCharge > 0 ? `+${atom.formalCharge}` : atom.formalCharge}
          </text>
        </g>
      )}

      {/* Partial charge indicator (delta+/delta-) */}
      {showPartialCharge && atom.partialCharge && atom.partialCharge !== 'none' && (
        <text
          x={position.x + radius * 0.8}
          y={position.y - radius * 0.8}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize * 0.9}
          fontWeight="bold"
          fill={atom.partialCharge === 'positive' ? MOLECULE_COLORS.partialChargePositive : MOLECULE_COLORS.partialChargeNegative}
          style={animationStyle}
        >
          {atom.partialCharge === 'positive' ? 'δ+' : 'δ−'}
        </text>
      )}

      {/* Radical electron indicator */}
      {atom.isRadical && (
        <circle
          cx={position.x + radius * 0.9}
          cy={position.y}
          r={4}
          fill={MOLECULE_COLORS.radical}
          style={animationStyle}
        >
          {!reducedMotion && (
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="1s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}
    </g>
  );
}

/**
 * SVG defs for atom effects (to be included in parent SVG)
 */
export function MoleculeAtomDefs() {
  return (
    <defs>
      {/* Highlight glow filter */}
      <filter id="atomHighlightGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood floodColor={MOLECULE_COLORS.atomHighlight} result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Atom entrance animation */}
      <style>
        {`
          @keyframes atomEnter {
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
            .molecule-atom * {
              animation: none !important;
              transition: none !important;
              opacity: 1 !important;
              transform: scale(1) !important;
            }
          }
        `}
      </style>
    </defs>
  );
}
