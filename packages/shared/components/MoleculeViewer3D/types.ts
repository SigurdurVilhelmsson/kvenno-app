/**
 * Types for the 3D Molecule Viewer component
 */

import type { Molecule, MoleculeAtom } from '../../types/molecule.types';

/**
 * 3D visualization style for molecules
 */
export type MoleculeViewer3DStyle = 'ball-stick' | 'space-fill';

/**
 * Camera control presets
 */
export type CameraPreset = 'default' | 'top' | 'front' | 'side';

/**
 * Props for the MoleculeViewer3D component
 */
export interface MoleculeViewer3DProps {
  /** The molecule to render */
  molecule: Molecule;
  /** Visualization style (default: 'ball-stick') */
  style?: MoleculeViewer3DStyle;
  /** Show element labels on atoms */
  showLabels?: boolean;
  /** Enable auto-rotation */
  autoRotate?: boolean;
  /** Auto-rotation speed (default: 2) */
  autoRotateSpeed?: number;
  /** Initial camera preset */
  cameraPreset?: CameraPreset;
  /** Callback when an atom is clicked */
  onAtomClick?: (atomId: string, atom: MoleculeAtom) => void;
  /** Width of the viewer (default: 100%) */
  width?: string | number;
  /** Height of the viewer (default: 300px) */
  height?: string | number;
  /** Background color (default: transparent) */
  backgroundColor?: string;
  /** Additional CSS classes */
  className?: string;
  /** Loading placeholder content */
  loadingFallback?: React.ReactNode;
}

/**
 * Props for the Atom3D sub-component
 */
export interface Atom3DProps {
  /** Atom data */
  atom: MoleculeAtom;
  /** 3D position [x, y, z] */
  position: [number, number, number];
  /** Atom radius */
  radius: number;
  /** Color (hex) */
  color: string;
  /** Show element label */
  showLabel?: boolean;
  /** Whether atom is interactive */
  interactive?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Props for the Bond3D sub-component
 */
export interface Bond3DProps {
  /** Start position [x, y, z] */
  start: [number, number, number];
  /** End position [x, y, z] */
  end: [number, number, number];
  /** Bond radius */
  radius: number;
  /** Bond color */
  color: string;
}

/**
 * 3D position for atom placement
 */
export interface Position3DArray {
  position: [number, number, number];
  atomId: string;
}
