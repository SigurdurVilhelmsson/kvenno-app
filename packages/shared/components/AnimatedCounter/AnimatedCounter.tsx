/**
 * AnimatedCounter - Animated number counter with rolling/morphing transition
 *
 * Smoothly animates between numeric values using requestAnimationFrame
 * with easeOutExpo easing. Uses tabular-nums for stable digit width and
 * a brief scale-up spring on value change.
 *
 * @example
 * ```tsx
 * import { AnimatedCounter } from '@shared/components/AnimatedCounter';
 *
 * <AnimatedCounter value={score} suffix=" stig" />
 * <AnimatedCounter value={delta} prefix="+" duration={300} />
 * ```
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface AnimatedCounterProps {
  /** The target numeric value to display */
  value: number;
  /** Animation duration in milliseconds (default: 500) */
  duration?: number;
  /** Text prepended before the number (e.g., "+") */
  prefix?: string;
  /** Text appended after the number (e.g., " stig") */
  suffix?: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom number formatter (default: Math.round + toLocaleString) */
  formatNumber?: (n: number) => string;
}

/**
 * EaseOutExpo easing function for satisfying deceleration.
 * Returns 1 when t === 1, approaches 1 exponentially as t increases from 0.
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Default number formatter: rounds and uses locale string for thousands separators */
function defaultFormat(n: number): string {
  return Math.round(n).toLocaleString('is-IS');
}

/**
 * Animated number counter that rolls/morphs when the value changes.
 *
 * Uses requestAnimationFrame with easeOutExpo easing for a satisfying
 * deceleration feel. Displays numbers with tabular-nums for stable width.
 * Applies a brief scale-up (1.1x) on value change that springs back via CSS.
 *
 * Respects prefers-reduced-motion: skips animation and updates instantly.
 *
 * @param props - {@link AnimatedCounterProps}
 */
export function AnimatedCounter({
  value,
  duration = 500,
  prefix = '',
  suffix = '',
  className = '',
  formatNumber = defaultFormat,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValueRef = useRef(value);
  const animationFrameRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);
  const prefersReducedMotionRef = useRef(false);

  // Detect prefers-reduced-motion once on mount and listen for changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mql.matches;

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const animate = useCallback(
    (from: number, to: number) => {
      // Cancel any in-progress animation
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Reduced motion: instant update
      if (prefersReducedMotionRef.current) {
        setDisplayValue(to);
        return;
      }

      setIsAnimating(true);
      const startTime = performance.now();
      const delta = to - from;

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const currentValue = from + delta * easedProgress;

        setDisplayValue(currentValue);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          animationFrameRef.current = null;
          setDisplayValue(to);
          setIsAnimating(false);
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [duration],
  );

  useEffect(() => {
    // On mount, just show the value without animation
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      setDisplayValue(value);
      previousValueRef.current = value;
      return;
    }

    // Only animate if value actually changed
    if (value !== previousValueRef.current) {
      animate(previousValueRef.current, value);
      previousValueRef.current = value;
    }
  }, [value, animate]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <span
      className={`
        inline-block
        transition-transform duration-200
        ${isAnimating ? 'scale-110' : 'scale-100'}
        ${className}
      `.trim()}
      style={{
        fontVariantNumeric: 'tabular-nums',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}
