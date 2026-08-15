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
        {/* "Sæki", not "Hleð" — in these games "hleðsla" is electric charge. */}
        <span>Sæki þrívíddarsýn…</span>
      </div>
    </div>
  );
}

/**
 * Error fallback when Three.js fails to load
 */
function ErrorFallback({ width, height }: { width?: string | number; height?: string | number }) {
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
        <span className="block">Þrívíddarsýn er ekki tiltæk</span>
        <span className="block text-xs text-gray-400 mt-1">
          Ekki tókst að sækja þrívíddarsýnina. Athugaðu nettenginguna.
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

  // Probe the deferred 3D chunks so a network failure degrades to a localized
  // message inside the molecule panel. Without this the Suspense fallback spins
  // forever with no explanation — React.lazy failures don't reach Suspense, and
  // the games' only ErrorBoundary wraps the whole App, so an uncaught throw would
  // replace the entire game rather than just this panel.
  //
  // Deliberately does NOT probe '@react-three/drei': importing that barrel pulled
  // 1.6 MB (hls.js, @mediapipe/tasks-vision) into the graph purely to test that it
  // resolves. three + fiber are the chunks that actually travel over the network.
  useEffect(() => {
    const checkDependencies = async () => {
      try {
        await import('three');
        await import('@react-three/fiber');
      } catch (err) {
        // Students get the Icelandic message below; the raw cause goes to the
        // console rather than on screen.
        console.error('3D dependency load failed:', err);
        setHasError(true);
      }
    };
    checkDependencies();
  }, []);

  if (hasError) {
    return <ErrorFallback width={props.width} height={props.height} />;
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
