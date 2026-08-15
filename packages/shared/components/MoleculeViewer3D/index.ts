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

// The non-lazy MoleculeViewer3D is deliberately NOT re-exported here.
//
// A static re-export from this barrel puts './MoleculeViewer3D' — and therefore
// three, @react-three/fiber, and @react-three/drei — into the same chunk as the
// barrel itself. Since games import MoleculeViewer3DLazy *from this barrel*, that
// static edge silently defeated the lazy boundary: Rollup emitted
// "INEFFECTIVE_DYNAMIC_IMPORT ... dynamic import will not move module into
// another chunk" and Three.js loaded eagerly on every page open.
//
// If you genuinely need the eager component (Three.js already loaded), import it
// from its module directly — that keeps the static edge out of this barrel:
//
//   import { MoleculeViewer3D } from '@shared/components/MoleculeViewer3D/MoleculeViewer3D';
//
// e2e/threejs-lazy-loading.spec.ts guards this.
