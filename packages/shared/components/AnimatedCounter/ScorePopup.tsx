/**
 * ScorePopup - Floating "+N" indicator that rises and fades
 *
 * Renders an absolutely-positioned score indicator that animates upward ~40px
 * while fading out over 800ms. Uses the `float-up` keyframe from theme.css.
 * Green for positive points, red for negative.
 *
 * @example
 * ```tsx
 * import { ScorePopup } from '@shared/components/AnimatedCounter';
 *
 * <ScorePopup
 *   points={10}
 *   position={{ x: 120, y: 80 }}
 *   onComplete={() => removePopup(id)}
 * />
 * ```
 */

import { useEffect, useRef } from 'react';

export interface ScorePopupProps {
  /** Points to display (positive shows "+N", negative shows "N") */
  points: number;
  /** Absolute position within the parent container */
  position: { x: number; y: number };
  /** Called when the float-up animation completes */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Floating score popup that rises and fades out.
 *
 * Absolutely positioned at the given coordinates within its parent.
 * Shows "+{points}" for positive values and "{points}" for negative.
 * Uses green for positive points and red for negative.
 * Automatically calls `onComplete` when the animation finishes.
 *
 * The component uses the `float-up` keyframe defined in theme.css
 * (translateY(0) -> translateY(-40px) with opacity 1 -> 0 over 800ms).
 *
 * @param props - {@link ScorePopupProps}
 */
export function ScorePopup({
  points,
  position,
  onComplete,
  className = '',
}: ScorePopupProps) {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleAnimationEnd = () => {
      onComplete?.();
    };

    element.addEventListener('animationend', handleAnimationEnd);
    return () => element.removeEventListener('animationend', handleAnimationEnd);
  }, [onComplete]);

  const isPositive = points > 0;
  const displayText = isPositive ? `+${points}` : `${points}`;

  return (
    <span
      ref={elementRef}
      className={`
        game-score-popup
        text-xl
        ${isPositive ? 'text-green-600' : 'text-red-600'}
        ${className}
      `.trim()}
      style={{
        left: position.x,
        top: position.y,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontWeight: 700,
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.5)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {displayText}
    </span>
  );
}
