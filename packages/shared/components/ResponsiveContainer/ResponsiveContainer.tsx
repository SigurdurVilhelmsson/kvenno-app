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

import React, { useRef, useState, useEffect, useCallback } from 'react';

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

    let width = Math.max(minWidth, Math.min(containerWidth, maxWidth));
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
      width = Math.max(minWidth, width);
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

      let width = Math.max(minWidth, Math.min(containerWidth, maxWidth));
      let height: number;

      if (aspectRatio) {
        height = width / aspectRatio;
        const maxAllowedHeight = Math.min(containerHeight || Infinity, maxHeight);
        if (height > maxAllowedHeight) {
          height = maxAllowedHeight;
          width = height * aspectRatio;
        }
        height = Math.max(minHeight, height);
        width = Math.max(minWidth, width);
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
