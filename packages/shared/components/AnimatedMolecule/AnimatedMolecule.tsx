/**
 * AnimatedMolecule - Main component for rendering molecules with animations
 *
 * A flexible, SVG-based molecule visualization component that supports:
 * - Multiple rendering modes (simple, lewis, vsepr, organic)
 * - Entrance animations with accessibility support
 * - Interactive atom/bond clicking
 * - Highlighting for selected atoms/bonds
 * - Size variants
 */

import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { AnimatedMoleculeProps, Position2D } from '@shared/types';

import { GEOMETRY_COORDS } from './molecule.constants';
import {
  calculateAtomPositions,
  calculateOrganicChainPositions,
  calculateBondEndpoints,
  calculateAngle,
  getElementVisual,
  getSizeConfig,
  ensureAtomIds,
  getDepthStyle,
  fitOrganicAtomRadius,
} from './molecule.utils';
import { MoleculeAtom, MoleculeAtomDefs } from './MoleculeAtom';
import { MoleculeBond, MoleculeBondDefs } from './MoleculeBond';
import {
  MoleculeDipole,
  MoleculeDipoleDefs,
  calculateDipoleDirection,
  calculateDipoleLength,
} from './MoleculeDipole';
import { boxAt, placeAtomTag, type Box, type Circle, type Segment } from './moleculeLabels';
import {
  MoleculeLonePair,
  MoleculeLonePairDefs,
  calculateLonePairAngles,
} from './MoleculeLonePair';
import { useMoleculeAnimation, MOLECULE_KEYFRAMES } from './useMoleculeAnimation';

/**
 * Largest boost applied to label text when the drawing is shrunk to fit a narrow container.
 * A `lg` molecule squeezed into a 320 px phone renders at ~0.78×, which takes its 11 px carbon
 * numbering down to ~8.7 px; 1.3× brings it back while staying inside the atom circles.
 */
const MAX_FONT_BOOST = 1.3;

/**
 * Text scale that cancels out how far CSS has shrunk the drawing: 1 when it renders at its
 * natural width (so desktop is untouched), up to MAX_FONT_BOOST when it is squeezed.
 */
export function fontBoostFor(renderedWidth: number, naturalWidth: number): number {
  if (!(renderedWidth > 0) || renderedWidth >= naturalWidth) return 1;
  return Math.min(naturalWidth / renderedWidth, MAX_FONT_BOOST);
}

/** Smallest rendered size, in CSS px, for the numbering and charge text beside the atoms. */
export const MIN_LABEL_PX = 12;

/**
 * How far that floor may enlarge the text beyond the size's own font. A drawing squeezed very
 * narrow would otherwise get labels larger than its atoms.
 */
const MAX_LABEL_GROWTH = 1.5;

/**
 * Smallest size, in drawing units, for the secondary text: whatever renders at MIN_LABEL_PX once
 * CSS has scaled the drawing, capped at MAX_LABEL_GROWTH times the size's base font. At natural
 * width that is simply MIN_LABEL_PX — the 9,8–11,2 px the numbering and charges used to be drawn
 * at on desktop too was below it.
 */
export function minTextSizeFor(
  renderedWidth: number,
  naturalWidth: number,
  baseFont: number
): number {
  const scale =
    renderedWidth > 0 && renderedWidth < naturalWidth ? renderedWidth / naturalWidth : 1;
  return Math.min(MIN_LABEL_PX / scale, baseFont * MAX_LABEL_GROWTH);
}

/** Tracks the rendered width of the SVG, which `max-width: 100%` may make narrower than its viewBox. */
function useRenderedWidth(ref: React.RefObject<SVGSVGElement | null>): number {
  const [renderedWidth, setRenderedWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const next = el.getBoundingClientRect().width;
      setRenderedWidth((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return renderedWidth;
}

export function AnimatedMolecule({
  molecule,
  mode = 'simple',
  size = 'md',
  animation = 'fade-in',
  animationDuration,
  showLonePairs = false,
  showFormalCharges = true,
  showPartialCharges = false,
  showDipoleMoment = false,
  showAtomLabels = false,
  interactive = false,
  onAtomClick,
  onBondClick,
  highlightedAtoms = [],
  highlightedBonds = [],
  className = '',
  reducedMotion = false,
  ariaLabel,
  onAnimationComplete,
}: AnimatedMoleculeProps) {
  // Get size configuration
  const sizeConfig = getSizeConfig(size);
  const { width, height, atomRadius, bondWidth } = sizeConfig;

  // The SVG scales down to fit a phone (max-width: 100%); its label text is boosted by the
  // same factor so it stays legible. Geometry keeps using the unboosted size.
  const svgRef = useRef<SVGSVGElement>(null);
  const renderedWidth = useRenderedWidth(svgRef);
  const fontSize = sizeConfig.fontSize * fontBoostFor(renderedWidth, width);
  const minTextSize = minTextSizeFor(renderedWidth, width, sizeConfig.fontSize);

  // Ensure all atoms have IDs
  const atomsWithIds = useMemo(() => ensureAtomIds(molecule.atoms), [molecule.atoms]);

  // Count lone pairs for animation
  const lonePairCount = useMemo(() => {
    if (!showLonePairs || mode !== 'lewis') return 0;
    return atomsWithIds.reduce((sum, atom) => sum + (atom.lonePairs || 0), 0);
  }, [atomsWithIds, showLonePairs, mode]);

  // Use animation hook for orchestrated timing
  const { getAtomTiming, getBondTiming, getLonePairTiming, shouldSkipAnimation } =
    useMoleculeAnimation({
      atomCount: atomsWithIds.length,
      bondCount: molecule.bonds.length,
      lonePairCount,
      animation,
      baseDuration: animationDuration,
      reducedMotion,
      onAnimationComplete,
    });

  // Calculate atom positions based on mode. Organic mode honours explicit positions (branches).
  const atomPositions = useMemo(() => {
    if (mode === 'organic') {
      return calculateOrganicChainPositions(
        { ...molecule, atoms: atomsWithIds },
        width,
        height,
        atomRadius
      );
    }
    return calculateAtomPositions({ ...molecule, atoms: atomsWithIds }, width, height, atomRadius);
  }, [molecule, atomsWithIds, width, height, atomRadius, mode]);

  // Organic chains shrink their circles as far as the shortest bond needs, so every bond — and
  // the colour that marks a double or triple one — stays visible.
  const drawRadius = useMemo(
    () =>
      mode === 'organic'
        ? fitOrganicAtomRadius({ ...molecule, atoms: atomsWithIds }, atomPositions, atomRadius)
        : atomRadius,
    [mode, molecule, atomsWithIds, atomPositions, atomRadius]
  );

  // Numbering sits above each atom, unless a branch rises from the chain: then it would sit on
  // the branch bond, so the whole chain is numbered underneath instead.
  const labelPlacement = useMemo<'above' | 'below'>(() => {
    if (!showAtomLabels) return 'above';
    const labelled = new Set(atomsWithIds.filter((a) => a.label).map((a) => a.id));
    for (const bond of molecule.bonds) {
      for (const [self, other] of [
        [bond.from, bond.to],
        [bond.to, bond.from],
      ]) {
        const p = atomPositions.get(self);
        const q = atomPositions.get(other);
        if (labelled.has(self) && p && q && q.y < p.y - 1) return 'below';
      }
    }
    return 'above';
  }, [showAtomLabels, atomsWithIds, molecule.bonds, atomPositions]);

  // Calculate bond angles for each atom (needed for lone pair positioning)
  const atomBondAngles = useMemo(() => {
    const angles = new Map<string, number[]>();

    for (const atom of atomsWithIds) {
      const atomPos = atomPositions.get(atom.id);
      if (!atomPos) continue;

      const bondAnglesForAtom: number[] = [];

      for (const bond of molecule.bonds) {
        if (bond.from === atom.id) {
          const otherPos = atomPositions.get(bond.to);
          if (otherPos) {
            bondAnglesForAtom.push(calculateAngle(atomPos, otherPos));
          }
        } else if (bond.to === atom.id) {
          const otherPos = atomPositions.get(bond.from);
          if (otherPos) {
            bondAnglesForAtom.push(calculateAngle(atomPos, otherPos));
          }
        }
      }

      angles.set(atom.id, bondAnglesForAtom);
    }

    return angles;
  }, [atomsWithIds, atomPositions, molecule.bonds]);

  // Get 3D depth info for VSEPR mode
  const depthInfo = useMemo(() => {
    if (mode !== 'vsepr' || !molecule.geometry)
      return new Map<string, { opacity: number; scale: number }>();

    const coords3D = GEOMETRY_COORDS[molecule.geometry];
    if (!coords3D) return new Map();

    const info = new Map<string, { opacity: number; scale: number }>();

    // First atom is central - full opacity
    if (atomsWithIds.length > 0) {
      info.set(atomsWithIds[0].id, { opacity: 1, scale: 1 });
    }

    // Remaining atoms get depth-based styling
    for (let i = 1; i < atomsWithIds.length && i <= coords3D.length; i++) {
      const z = coords3D[i - 1].z;
      info.set(atomsWithIds[i].id, getDepthStyle(z));
    }

    return info;
  }, [mode, molecule.geometry, atomsWithIds]);

  // Calculate dipole moment for polar molecules
  const dipoleData = useMemo(() => {
    if (!showDipoleMoment) return null;

    // Use explicit dipole from molecule data, or calculate from partial charges
    let dipoleDirection = molecule.dipoleMoment?.direction;

    if (!dipoleDirection && molecule.isPolar) {
      // Build atom position data for dipole calculation
      const atomsWithPositions = atomsWithIds
        .map((atom) => ({
          position: atomPositions.get(atom.id)!,
          partialCharge: atom.partialCharge,
        }))
        .filter((a) => a.position);

      dipoleDirection = calculateDipoleDirection(atomsWithPositions, {
        x: width / 2,
        y: height / 2,
      });
    }

    if (!dipoleDirection) return null;

    // Calculate dipole arrow length based on molecule size
    const dipoleLength = calculateDipoleLength(
      width * 0.6,
      height * 0.6,
      molecule.dipoleMoment?.magnitude
    );

    return {
      direction: dipoleDirection,
      magnitude: molecule.dipoleMoment?.magnitude,
      length: dipoleLength,
      center: { x: width / 2, y: height / 2 },
    };
  }, [
    showDipoleMoment,
    molecule.dipoleMoment,
    molecule.isPolar,
    atomsWithIds,
    atomPositions,
    width,
    height,
  ]);

  // δ+/δ− tags go beside their atom where they meet no bond, atom, dipole arrow or other tag.
  const chargeTagPositions = useMemo(() => {
    const tags = new Map<string, Position2D>();
    if (!showPartialCharges) return tags;

    const tagSize = Math.max(fontSize * 0.9, minTextSize);
    const halfWidth = tagSize * 0.62;
    const halfHeight = tagSize * 0.5;

    const circles = new Map<string, Circle>();
    for (const atom of atomsWithIds) {
      const p = atomPositions.get(atom.id);
      if (!p) continue;
      const scale = depthInfo.get(atom.id)?.scale ?? 1;
      circles.set(atom.id, {
        x: p.x,
        y: p.y,
        r: drawRadius * getElementVisual(atom.symbol).radius * scale,
      });
    }

    const segments: Segment[] = [];
    for (const bond of molecule.bonds) {
      const a = atomPositions.get(bond.from);
      const b = atomPositions.get(bond.to);
      if (!a || !b) continue;
      const multiple = bond.type === 'double' || bond.type === 'triple';
      segments.push({ a, b, clearance: multiple ? bondWidth * 1.5 + 3 : bondWidth / 2 + 1 });
    }
    if (showDipoleMoment && dipoleData) {
      const unit = {
        right: { x: 1, y: 0 },
        left: { x: -1, y: 0 },
        down: { x: 0, y: 1 },
        up: { x: 0, y: -1 },
      }[dipoleData.direction] ?? { x: 1, y: 0 };
      const half = dipoleData.length / 2;
      segments.push({
        a: { x: dipoleData.center.x - unit.x * half, y: dipoleData.center.y - unit.y * half },
        b: { x: dipoleData.center.x + unit.x * half, y: dipoleData.center.y + unit.y * half },
        clearance: 7,
      });
    }

    const placed: Box[] = [];
    for (const atom of atomsWithIds) {
      if (!atom.partialCharge || atom.partialCharge === 'none') continue;
      const own = circles.get(atom.id);
      if (!own) continue;
      const others = [...circles.entries()].filter(([id]) => id !== atom.id).map(([, c]) => c);
      const center = placeAtomTag(
        own,
        halfWidth,
        halfHeight,
        { circles: others, segments, boxes: placed },
        { width, height }
      );
      tags.set(atom.id, center);
      placed.push(boxAt(center, halfWidth, halfHeight));
    }
    return tags;
  }, [
    showPartialCharges,
    showDipoleMoment,
    dipoleData,
    fontSize,
    minTextSize,
    atomsWithIds,
    atomPositions,
    depthInfo,
    drawRadius,
    molecule.bonds,
    bondWidth,
    width,
    height,
  ]);

  // Handle atom click
  const handleAtomClick = (atomId: string) => {
    if (!interactive || !onAtomClick) return;
    const atom = atomsWithIds.find((a) => a.id === atomId);
    onAtomClick({ type: 'atom', atomId, atom });
  };

  // Handle bond click
  const handleBondClick = (bondIndex: number) => {
    if (!interactive || !onBondClick) return;
    const bond = molecule.bonds[bondIndex];
    onBondClick({ type: 'bond', bondIndex, bond });
  };

  // Render bonds
  const renderedBonds = molecule.bonds.map((bond, index) => {
    const fromPos = atomPositions.get(bond.from);
    const toPos = atomPositions.get(bond.to);

    if (!fromPos || !toPos) return null;

    // Get atom radii for bond endpoint calculation
    const fromAtom = atomsWithIds.find((a) => a.id === bond.from);
    const toAtom = atomsWithIds.find((a) => a.id === bond.to);
    const fromRadius = drawRadius * (fromAtom ? getElementVisual(fromAtom.symbol).radius : 1);
    const toRadius = drawRadius * (toAtom ? getElementVisual(toAtom.symbol).radius : 1);

    // Calculate bond endpoints (just outside atom circles)
    const { start, end } = calculateBondEndpoints(fromPos, toPos, fromRadius, toRadius);

    const bondTiming = getBondTiming(index);

    return (
      <MoleculeBond
        key={`bond-${index}`}
        bond={bond}
        startPos={start}
        endPos={end}
        bondWidth={bondWidth}
        mode={mode}
        isHighlighted={highlightedBonds.includes(index) || bond.highlight}
        isInteractive={interactive}
        onClick={() => handleBondClick(index)}
        animationDelay={bondTiming.delay}
        reducedMotion={shouldSkipAnimation}
      />
    );
  });

  // Render atoms
  const renderedAtoms = atomsWithIds.map((atom, index) => {
    const position = atomPositions.get(atom.id);
    if (!position) return null;

    const depth = depthInfo.get(atom.id) || { opacity: 1, scale: 1 };
    const atomTiming = getAtomTiming(index);

    return (
      <MoleculeAtom
        key={atom.id}
        atom={atom}
        position={position}
        baseRadius={drawRadius}
        fontSize={fontSize}
        minTextSize={minTextSize}
        labelPlacement={labelPlacement}
        partialChargePosition={chargeTagPositions.get(atom.id)}
        mode={mode}
        showLabel={showAtomLabels}
        showFormalCharge={showFormalCharges && mode === 'lewis'}
        showPartialCharge={showPartialCharges}
        isHighlighted={highlightedAtoms.includes(atom.id) || atom.highlight}
        isInteractive={interactive}
        onClick={() => handleAtomClick(atom.id)}
        animationDelay={atomTiming.delay}
        reducedMotion={shouldSkipAnimation}
        depthOpacity={depth.opacity}
        depthScale={depth.scale}
      />
    );
  });

  // Generate accessible label
  const accessibleLabel =
    ariaLabel ||
    `${molecule.name || molecule.formula} molecule with ${atomsWithIds.length} atoms and ${molecule.bonds.length} bonds`;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      // Shrinks to a narrow container instead of overflowing it; height follows the viewBox.
      style={{ maxWidth: '100%', height: 'auto' }}
      className={`animated-molecule ${className}`}
      role="img"
      aria-label={accessibleLabel}
    >
      {/* SVG definitions for filters and animations */}
      <defs>
        <style>{MOLECULE_KEYFRAMES}</style>
      </defs>
      <MoleculeAtomDefs />
      <MoleculeBondDefs />
      <MoleculeLonePairDefs />
      <MoleculeDipoleDefs />

      {/* Background (optional) */}
      <rect x={0} y={0} width={width} height={height} fill="transparent" rx={8} />

      {/* Bonds layer (rendered first so atoms appear on top) */}
      <g className="molecule-bonds">{renderedBonds}</g>

      {/* Dipole moment arrow (for polar molecules). Under the atoms: it runs through the
          molecule's centre, and drawn on top it struck through the central atom's symbol. */}
      {showDipoleMoment && dipoleData && (
        <MoleculeDipole
          moleculeCenter={dipoleData.center}
          dipole={{ direction: dipoleData.direction, magnitude: dipoleData.magnitude }}
          length={dipoleData.length}
          animationDelay={shouldSkipAnimation ? 0 : 500}
          reducedMotion={shouldSkipAnimation}
          showLabels={!showPartialCharges} // Don't duplicate labels if partial charges are shown
        />
      )}

      {/* Atoms layer */}
      <g className="molecule-atoms">{renderedAtoms}</g>

      {/* Lone pairs layer (Lewis mode only) */}
      {showLonePairs && mode === 'lewis' && (
        <g className="molecule-lone-pairs">
          {atomsWithIds.map((atom, atomIndex) => {
            if (!atom.lonePairs || atom.lonePairs === 0) return null;

            const position = atomPositions.get(atom.id);
            if (!position) return null;

            const bondAngles = atomBondAngles.get(atom.id) || [];
            const lonePairAngles = calculateLonePairAngles(bondAngles, atom.lonePairs);
            const visual = getElementVisual(atom.symbol);
            const radius = drawRadius * visual.radius;

            // Distance from atom center to lone pairs
            const lonePairDistance = radius + 8;

            return lonePairAngles.map((angle, lpIndex) => {
              const lpTiming = getLonePairTiming(atomIndex, lpIndex);
              return (
                <MoleculeLonePair
                  key={`${atom.id}-lp-${lpIndex}`}
                  atomPosition={position}
                  angle={angle}
                  distance={lonePairDistance}
                  dotSize={Math.max(4, fontSize * 0.4)}
                  animationDelay={lpTiming.delay}
                  reducedMotion={shouldSkipAnimation}
                />
              );
            });
          })}
        </g>
      )}
    </svg>
  );
}

// Re-export sub-components for advanced usage
export { MoleculeAtom, MoleculeAtomDefs } from './MoleculeAtom';
export { MoleculeBond, MoleculeBondDefs } from './MoleculeBond';
