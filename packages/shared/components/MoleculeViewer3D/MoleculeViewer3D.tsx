/**
 * MoleculeViewer3D - Three.js based 3D molecule visualization
 *
 * Uses @react-three/fiber and @react-three/drei for React integration
 * with Three.js. Supports ball-and-stick and space-fill rendering styles.
 */

import { Suspense, useMemo, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { MoleculeViewer3DProps, Atom3DProps, Bond3DProps } from './types';
import type { MoleculeAtom, MoleculeBond } from '../../types/molecule.types';
import { ELEMENT_VISUALS, DEFAULT_ELEMENT_VISUAL } from '../AnimatedMolecule/molecule.constants';

/**
 * Get element visual properties with fallback
 */
function getElementVisual(symbol: string) {
  return ELEMENT_VISUALS[symbol] || DEFAULT_ELEMENT_VISUAL;
}

/**
 * Get 3D positions for specific molecular geometries
 * Returns positions relative to central atom at origin
 */
function getGeometryPositions(
  geometry: string | undefined,
  numBondedAtoms: number,
  bondLength: number
): [number, number, number][] {
  // Standard geometric positions based on VSEPR theory
  const positions: Record<string, [number, number, number][]> = {
    // Linear: 180° angle
    'linear': [
      [bondLength, 0, 0],
      [-bondLength, 0, 0],
    ],

    // Trigonal planar: 120° angles in XY plane
    'trigonal-planar': [
      [bondLength, 0, 0],
      [-bondLength * 0.5, bondLength * 0.866, 0],
      [-bondLength * 0.5, -bondLength * 0.866, 0],
    ],

    // Bent (from trigonal planar with 1 lone pair): ~117° angle
    'bent': [
      [bondLength * 0.9, bondLength * 0.44, 0],
      [-bondLength * 0.9, bondLength * 0.44, 0],
    ],

    // Tetrahedral: 109.5° angles
    'tetrahedral': [
      [0, bondLength, 0],                                    // top
      [bondLength * 0.943, -bondLength * 0.333, 0],         // front-right
      [-bondLength * 0.471, -bondLength * 0.333, bondLength * 0.816],  // back-left
      [-bondLength * 0.471, -bondLength * 0.333, -bondLength * 0.816], // back-right
    ],

    // Trigonal pyramidal (from tetrahedral with 1 lone pair): ~107°
    'trigonal-pyramidal': [
      [bondLength * 0.943, -bondLength * 0.333, 0],
      [-bondLength * 0.471, -bondLength * 0.333, bondLength * 0.816],
      [-bondLength * 0.471, -bondLength * 0.333, -bondLength * 0.816],
    ],

    // Trigonal bipyramidal: 90° and 120° angles
    'trigonal-bipyramidal': [
      [0, bondLength, 0],                    // axial top
      [0, -bondLength, 0],                   // axial bottom
      [bondLength, 0, 0],                    // equatorial
      [-bondLength * 0.5, 0, bondLength * 0.866],
      [-bondLength * 0.5, 0, -bondLength * 0.866],
    ],

    // See-saw (from trigonal bipyramidal with 1 equatorial lone pair)
    'see-saw': [
      [0, bondLength, 0],                    // axial top
      [0, -bondLength, 0],                   // axial bottom
      [bondLength, 0, 0],                    // equatorial
      [-bondLength, 0, 0],
    ],

    // T-shaped (from trigonal bipyramidal with 2 equatorial lone pairs)
    't-shaped': [
      [0, bondLength, 0],
      [0, -bondLength, 0],
      [bondLength, 0, 0],
    ],

    // Square planar
    'square-planar': [
      [bondLength, 0, 0],
      [-bondLength, 0, 0],
      [0, 0, bondLength],
      [0, 0, -bondLength],
    ],

    // Square pyramidal
    'square-pyramidal': [
      [0, bondLength, 0],                    // apex
      [bondLength * 0.707, -bondLength * 0.3, bondLength * 0.707],
      [bondLength * 0.707, -bondLength * 0.3, -bondLength * 0.707],
      [-bondLength * 0.707, -bondLength * 0.3, bondLength * 0.707],
      [-bondLength * 0.707, -bondLength * 0.3, -bondLength * 0.707],
    ],

    // Octahedral: 90° angles
    'octahedral': [
      [0, bondLength, 0],
      [0, -bondLength, 0],
      [bondLength, 0, 0],
      [-bondLength, 0, 0],
      [0, 0, bondLength],
      [0, 0, -bondLength],
    ],
  };

  // Return positions for the specified geometry
  if (geometry && positions[geometry]) {
    return positions[geometry].slice(0, numBondedAtoms);
  }

  // Fallback: distribute atoms evenly on a sphere
  const fallbackPositions: [number, number, number][] = [];
  for (let i = 0; i < numBondedAtoms; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / numBondedAtoms);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    fallbackPositions.push([
      bondLength * Math.sin(phi) * Math.cos(theta),
      bondLength * Math.cos(phi),
      bondLength * Math.sin(phi) * Math.sin(theta),
    ]);
  }
  return fallbackPositions;
}

/**
 * Calculate 3D positions for atoms based on bonds and geometry
 */
function calculateAtomPositions3D(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
  geometry?: string
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();

  if (atoms.length === 0) return positions;

  // Find central atom (most bonds)
  const bondCounts = new Map<string, number>();
  for (const bond of bonds) {
    bondCounts.set(bond.from, (bondCounts.get(bond.from) || 0) + 1);
    bondCounts.set(bond.to, (bondCounts.get(bond.to) || 0) + 1);
  }

  let centralAtom = atoms[0];
  let maxBonds = 0;
  for (const atom of atoms) {
    const count = bondCounts.get(atom.id) || 0;
    if (count > maxBonds) {
      maxBonds = count;
      centralAtom = atom;
    }
  }

  // Place central atom at origin
  positions.set(centralAtom.id, [0, 0, 0]);

  // Get atoms bonded to central atom
  const bondedAtomIds: string[] = [];
  for (const bond of bonds) {
    if (bond.from === centralAtom.id) {
      bondedAtomIds.push(bond.to);
    } else if (bond.to === centralAtom.id) {
      bondedAtomIds.push(bond.from);
    }
  }

  // Get geometry-specific positions
  const bondLength = 1.5;
  const geometryPositions = getGeometryPositions(geometry, bondedAtomIds.length, bondLength);

  // Assign positions to bonded atoms
  bondedAtomIds.forEach((atomId, index) => {
    if (index < geometryPositions.length) {
      positions.set(atomId, geometryPositions[index]);
    }
  });

  // Handle remaining atoms (atoms not directly bonded to central)
  for (const atom of atoms) {
    if (!positions.has(atom.id)) {
      // Find what this atom is bonded to
      let parentPos: [number, number, number] = [0, 0, 0];
      for (const bond of bonds) {
        const otherId = bond.from === atom.id ? bond.to : (bond.to === atom.id ? bond.from : null);
        if (otherId && positions.has(otherId)) {
          parentPos = positions.get(otherId)!;
          break;
        }
      }
      // Place at an offset from parent
      const offset = bondLength * 0.8;
      positions.set(atom.id, [
        parentPos[0] + offset,
        parentPos[1] + offset * 0.5,
        parentPos[2],
      ]);
    }
  }

  return positions;
}

/**
 * 3D Atom component
 */
function Atom3D({
  atom,
  position,
  radius,
  color,
  showLabel = false,
  interactive = false,
  onClick,
}: Atom3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onClick?.();
    },
    [onClick]
  );

  const handlePointerOver = useCallback(() => {
    if (interactive && meshRef.current) {
      document.body.style.cursor = 'pointer';
    }
  }, [interactive]);

  const handlePointerOut = useCallback(() => {
    if (interactive) {
      document.body.style.cursor = 'default';
    }
  }, [interactive]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={interactive ? handleClick : undefined}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      {showLabel && (
        <Text
          position={[0, radius + 0.2, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {atom.symbol}
        </Text>
      )}
    </group>
  );
}

/**
 * 3D Bond component (cylinder between two points)
 */
function Bond3D({ start, end, radius, color }: Bond3DProps) {
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  const direction = new THREE.Vector3(
    end[0] - start[0],
    end[1] - start[1],
    end[2] - start[2]
  );
  const length = direction.length();

  // Calculate rotation to align cylinder with bond direction
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize()
  );

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 16]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
    </mesh>
  );
}

/**
 * Scene content component (contains all 3D objects)
 */
function MoleculeScene({
  molecule,
  style = 'ball-stick',
  showLabels = false,
  onAtomClick,
}: Pick<MoleculeViewer3DProps, 'molecule' | 'style' | 'showLabels' | 'onAtomClick'>) {
  // Calculate 3D positions based on molecular geometry
  const atomPositions = useMemo(
    () => calculateAtomPositions3D(molecule.atoms, molecule.bonds, molecule.geometry),
    [molecule.atoms, molecule.bonds, molecule.geometry]
  );

  // Determine atom radius based on style
  const getAtomRadius = useCallback(
    (symbol: string) => {
      const visual = getElementVisual(symbol);
      if (style === 'space-fill') {
        return visual.radius * 0.8;
      }
      return visual.radius * 0.35;
    },
    [style]
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      {/* Atoms */}
      {molecule.atoms.map((atom) => {
        const position = atomPositions.get(atom.id) || [0, 0, 0];
        const visual = getElementVisual(atom.symbol);
        const radius = getAtomRadius(atom.symbol);

        return (
          <Atom3D
            key={atom.id}
            atom={atom}
            position={position}
            radius={radius}
            color={visual.color}
            showLabel={showLabels}
            interactive={!!onAtomClick}
            onClick={() => onAtomClick?.(atom.id, atom)}
          />
        );
      })}

      {/* Bonds (only in ball-stick mode) */}
      {style === 'ball-stick' &&
        molecule.bonds.map((bond, index) => {
          const startPos = atomPositions.get(bond.from) || [0, 0, 0];
          const endPos = atomPositions.get(bond.to) || [0, 0, 0];

          return (
            <Bond3D
              key={`bond-${index}`}
              start={startPos}
              end={endPos}
              radius={0.08}
              color="#374151"
            />
          );
        })}
    </>
  );
}

/**
 * Loading fallback component
 */
function LoadingFallback({ text = 'Loading 3D viewer...' }: { text?: string }) {
  return (
    <Html center>
      <div className="text-gray-500 text-sm">{text}</div>
    </Html>
  );
}

/**
 * MoleculeViewer3D Component
 *
 * A 3D molecule visualization component using Three.js.
 * Supports orbital controls (rotate, zoom, pan) and multiple rendering styles.
 *
 * @example
 * ```tsx
 * <MoleculeViewer3D
 *   molecule={waterMolecule}
 *   style="ball-stick"
 *   showLabels
 *   autoRotate
 *   onAtomClick={(id, atom) => console.log('Clicked:', atom.symbol)}
 * />
 * ```
 */
export function MoleculeViewer3D({
  molecule,
  style = 'ball-stick',
  showLabels = false,
  autoRotate = false,
  autoRotateSpeed = 2,
  cameraPreset = 'default',
  onAtomClick,
  width = '100%',
  height = 300,
  backgroundColor = 'transparent',
  className = '',
  loadingFallback,
}: MoleculeViewer3DProps) {
  // Camera position based on preset
  const cameraPosition = useMemo((): [number, number, number] => {
    switch (cameraPreset) {
      case 'top':
        return [0, 5, 0];
      case 'front':
        return [0, 0, 5];
      case 'side':
        return [5, 0, 0];
      case 'default':
      default:
        return [3, 2, 3];
    }
  }, [cameraPreset]);

  return (
    <div
      className={`molecule-viewer-3d ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor,
      }}
    >
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={loadingFallback || <LoadingFallback />}>
          <MoleculeScene
            molecule={molecule}
            style={style}
            showLabels={showLabels}
            onAtomClick={onAtomClick}
          />
        </Suspense>
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
}

export default MoleculeViewer3D;
