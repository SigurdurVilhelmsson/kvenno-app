/**
 * Lazy-loaded wrapper for MoleculeViewer3D
 *
 * This wrapper uses dynamic imports to load Three.js dependencies
 * only when the component is actually rendered. This prevents
 * bundle bloat for games that don't need 3D visualization.
 *
 * Usage:
 * ```tsx
 * import { MoleculeViewer3DLazy } from '@shared/components/MoleculeViewer3D';
 *
 * // Use like the regular MoleculeViewer3D
 * <MoleculeViewer3DLazy molecule={molecule} showLabels />
 * ```
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import type { MoleculeViewer3DProps } from './types';

// Lazy load the actual 3D viewer component
const MoleculeViewer3DComponent = lazy(() =>
  import('./MoleculeViewer3D').then((module) => ({
    default: module.MoleculeViewer3D,
  }))
);

/**
 * Default loading placeholder
 */
function DefaultLoadingPlaceholder({
  width,
  height,
}: {
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div
      className="
        flex items-center justify-center
        bg-gray-100 rounded-xl
        text-gray-500 text-sm
      "
      style={{
        width: typeof width === 'number' ? `${width}px` : width || '100%',
        height: typeof height === 'number' ? `${height}px` : height || '300px',
      }}
    >
      <div className="text-center">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-2" />
        <span>Loading 3D viewer...</span>
      </div>
    </div>
  );
}

/**
 * Error fallback when Three.js fails to load
 */
function ErrorFallback({
  width,
  height,
  error,
}: {
  width?: string | number;
  height?: string | number;
  error?: string;
}) {
  return (
    <div
      className="
        flex items-center justify-center
        bg-gray-100 rounded-xl
        text-gray-500 text-sm
      "
      style={{
        width: typeof width === 'number' ? `${width}px` : width || '100%',
        height: typeof height === 'number' ? `${height}px` : height || '300px',
      }}
    >
      <div className="text-center p-4">
        <span className="block text-amber-500 text-lg mb-2">⚠</span>
        <span className="block">3D viewer not available</span>
        <span className="block text-xs text-gray-400 mt-1">
          {error || 'Three.js dependencies may not be installed'}
        </span>
      </div>
    </div>
  );
}

/**
 * MoleculeViewer3DLazy - Lazy-loaded 3D molecule viewer
 *
 * Wraps MoleculeViewer3D with React.lazy() and Suspense for
 * optimal bundle splitting. Three.js and related dependencies
 * are only loaded when this component is rendered.
 *
 * @example
 * ```tsx
 * import { MoleculeViewer3DLazy } from '@shared/components';
 *
 * function MyComponent() {
 *   return (
 *     <MoleculeViewer3DLazy
 *       molecule={h2oMolecule}
 *       style="ball-stick"
 *       autoRotate
 *     />
 *   );
 * }
 * ```
 */
export function MoleculeViewer3DLazy(props: MoleculeViewer3DProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  // Check if Three.js is available
  useEffect(() => {
    const checkDependencies = async () => {
      try {
        await import('three');
        await import('@react-three/fiber');
        await import('@react-three/drei');
      } catch (err) {
        setHasError(true);
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load 3D dependencies'
        );
      }
    };
    checkDependencies();
  }, []);

  if (hasError) {
    return (
      <ErrorFallback
        width={props.width}
        height={props.height}
        error={errorMessage}
      />
    );
  }

  return (
    <Suspense
      fallback={
        props.loadingFallback || (
          <DefaultLoadingPlaceholder width={props.width} height={props.height} />
        )
      }
    >
      <MoleculeViewer3DComponent {...props} />
    </Suspense>
  );
}

export default MoleculeViewer3DLazy;
