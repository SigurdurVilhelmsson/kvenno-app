/**
 * MoleculeViewer3D - 3D molecule visualization with Three.js
 *
 * For optimal bundle size, use MoleculeViewer3DLazy which
 * dynamically imports Three.js dependencies only when needed.
 */

// Export the lazy-loaded version as the default
export { MoleculeViewer3DLazy } from './MoleculeViewer3DLazy';
export { MoleculeViewer3DLazy as MoleculeViewer3D } from './MoleculeViewer3DLazy';

// Export types
export type {
  MoleculeViewer3DProps,
  MoleculeViewer3DStyle,
  CameraPreset,
  Atom3DProps,
  Bond3DProps,
} from './types';

// Export the non-lazy version for direct use when Three.js is already loaded
// Note: Importing this directly will include Three.js in your bundle
export { MoleculeViewer3D as MoleculeViewer3DDirect } from './MoleculeViewer3D';
