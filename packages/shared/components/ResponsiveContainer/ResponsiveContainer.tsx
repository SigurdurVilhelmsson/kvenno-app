/**
 * ResponsiveContainer - A wrapper that provides responsive sizing for fixed-dimension components
 *
 * Uses ResizeObserver to track container size and provides dimensions to children
 * via render props or context.
 *
 * Usage:
 * ```tsx
 * <ResponsiveContainer aspectRatio={16/9} maxWidth={500}>
 *   {({ width, height }) => (
 *     <ParticleSimulation container={{ width, height }} ... />
 *   )}
 * </ResponsiveContainer>
 * ```
 */

import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';

/**
 * `minWidth` is a floor for comfortable rendering, but it must never push content wider than
 * the container that holds it: on a 320 px phone that is a horizontal page scroll. A measured
 * container width therefore wins over `minWidth`. An unmeasured (0) container leaves it alone.
 */
function fitWidth(width: number, containerWidth: number): number {
  return containerWidth > 0 ? Math.min(width, containerWidth) : width;
}

export interface ResponsiveContainerProps {
  /** Render function receiving current dimensions */
  children: (dimensions: { width: number; height: number }) => React.ReactNode;
  /** Aspect ratio (width/height). If not provided, uses natural container height */
  aspectRatio?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Additional CSS class */
  className?: string;
  /** Debounce delay for resize events (ms) */
  debounceMs?: number;
}

export function ResponsiveContainer({
  children,
  aspectRatio,
  maxWidth = Infinity,
  maxHeight = Infinity,
  minWidth = 100,
  minHeight = 100,
  className = '',
  debounceMs = 100,
}: ResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const timeoutRef = useRef<number>(undefined);

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    let width = fitWidth(Math.max(minWidth, Math.min(containerWidth, maxWidth)), containerWidth);
    let height: number;

    if (aspectRatio) {
      // Calculate height from aspect ratio
      height = width / aspectRatio;

      // Check if height exceeds container or max
      const maxAllowedHeight = Math.min(containerHeight || Infinity, maxHeight);
      if (height > maxAllowedHeight) {
        height = maxAllowedHeight;
        width = height * aspectRatio;
      }

      // Ensure minimums
      height = Math.max(minHeight, height);
      width = fitWidth(Math.max(minWidth, width), containerWidth);
    } else {
      // No aspect ratio - use container height
      height = Math.max(minHeight, Math.min(containerHeight || minHeight, maxHeight));
    }

    // Round to avoid sub-pixel rendering issues
    width = Math.round(width);
    height = Math.round(height);

    setDimensions({ width, height });
  }, [aspectRatio, maxWidth, maxHeight, minWidth, minHeight]);

  const debouncedUpdate = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(updateDimensions, debounceMs);
  }, [updateDimensions, debounceMs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial measurement
    updateDimensions();

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(debouncedUpdate);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedUpdate, updateDimensions]);

  return (
    <div
      ref={containerRef}
      className={`responsive-container w-full ${className}`}
      style={{ minHeight: minHeight }}
    >
      {dimensions && (
        <div
          className="flex items-center justify-center"
          style={{ width: dimensions.width, height: dimensions.height, margin: '0 auto' }}
        >
          {children(dimensions)}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for responsive sizing in components
 */
export function useResponsiveSize(
  ref: React.RefObject<HTMLElement | null>,
  options: {
    aspectRatio?: number;
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
    debounceMs?: number;
  } = {}
) {
  const {
    aspectRatio,
    maxWidth = Infinity,
    maxHeight = Infinity,
    minWidth = 100,
    minHeight = 100,
    debounceMs = 100,
  } = options;

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: minWidth,
    height: minHeight,
  });
  const timeoutRef = useRef<number>(undefined);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateDimensions = () => {
      const containerWidth = element.clientWidth;
      const containerHeight = element.clientHeight;

      let width = fitWidth(Math.max(minWidth, Math.min(containerWidth, maxWidth)), containerWidth);
      let height: number;

      if (aspectRatio) {
        height = width / aspectRatio;
        const maxAllowedHeight = Math.min(containerHeight || Infinity, maxHeight);
        if (height > maxAllowedHeight) {
          height = maxAllowedHeight;
          width = height * aspectRatio;
        }
        height = Math.max(minHeight, height);
        width = fitWidth(Math.max(minWidth, width), containerWidth);
      } else {
        height = Math.max(minHeight, Math.min(containerHeight || minHeight, maxHeight));
      }

      setDimensions({ width: Math.round(width), height: Math.round(height) });
    };

    const debouncedUpdate = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(updateDimensions, debounceMs);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(debouncedUpdate);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [ref, aspectRatio, maxWidth, maxHeight, minWidth, minHeight, debounceMs]);

  return dimensions;
}

/**
 * Width available to an element, tracked as its container resizes (phone rotation, a sidebar
 * opening). Returns `null` until the first measurement, so a caller can render at its preferred
 * size until then — which keeps the first desktop paint identical to a fixed-size component.
 *
 * Measured in a layout effect, so on a phone the corrected size is applied before first paint.
 */
export function useContainerWidth(ref: React.RefObject<HTMLElement | null>): number | null {
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const next = element.clientWidth;
      if (next > 0) setWidth((prev) => (prev === next ? prev : next));
    };
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

/**
 * Backing-store scale for a `<canvas>`: draw at devicePixelRatio so lines and labels stay crisp
 * on a phone's 2–3× screen instead of being upscaled from a 1× bitmap. Capped at 3, beyond which
 * the extra pixels cost memory and fill time without a visible gain.
 */
export function canvasPixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
}
