/**
 * StreakCounter - Streak indicator with escalating fire emoji
 *
 * Displays a pill-shaped badge showing the current streak count with
 * progressively more intense fire emojis. Hidden when the streak is
 * below 3. At 10+, adds a pulsing glow effect.
 *
 * Emoji progression:
 * - 0-2: hidden
 * - 3-4: fire + count
 * - 5-9: fire fire + count
 * - 10+: boom fire fire + count (with glow)
 *
 * @example
 * ```tsx
 * import { StreakCounter } from '@shared/components/AnimatedCounter';
 *
 * <StreakCounter count={7} />
 * ```
 */

import { useEffect, useRef, useState } from 'react';

export interface StreakCounterProps {
  /** Current streak count */
  count: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Returns the appropriate emoji string for a given streak level.
 * Also sets the CSS custom property --streak-icon for compatibility
 * with game-base.css utilities.
 */
function getStreakEmoji(count: number): string {
  if (count >= 10) return '\u{1F4A5}\u{1F525}\u{1F525}';
  if (count >= 5) return '\u{1F525}\u{1F525}';
  return '\u{1F525}';
}

/**
 * Streak indicator badge with escalating fire emoji.
 *
 * Only renders when count >= 3. Shows a pill-shaped badge with warm
 * background and fire emojis that escalate with the streak level.
 * At 10+ streaks, a pulse-glow animation draws extra attention.
 *
 * The count number animates with a brief scale pop on change.
 * Enters with a spring-in animation when first appearing (count 2->3).
 *
 * Respects prefers-reduced-motion via the CSS-level animation override
 * in theme.css.
 *
 * @param props - {@link StreakCounterProps}
 */
export function StreakCounter({ count, className = '' }: StreakCounterProps) {
  const [isPopping, setIsPopping] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const previousCountRef = useRef(count);
  const wasVisibleRef = useRef(count >= 3);

  useEffect(() => {
    const prevCount = previousCountRef.current;
    const wasVisible = wasVisibleRef.current;
    const isNowVisible = count >= 3;

    // Trigger entrance animation when streak first becomes visible
    if (!wasVisible && isNowVisible) {
      setIsEntering(true);
      const timer = setTimeout(() => setIsEntering(false), 500);
      previousCountRef.current = count;
      wasVisibleRef.current = isNowVisible;
      return () => clearTimeout(timer);
    }

    // Trigger pop animation when count changes while visible
    if (isNowVisible && count !== prevCount) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 200);
      previousCountRef.current = count;
      wasVisibleRef.current = isNowVisible;
      return () => clearTimeout(timer);
    }

    previousCountRef.current = count;
    wasVisibleRef.current = isNowVisible;
  }, [count]);

  // Don't render for streaks below 3
  if (count < 3) {
    return null;
  }

  const emoji = getStreakEmoji(count);
  const isHighStreak = count >= 10;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5
        rounded-full
        font-bold
        bg-amber-100 text-amber-900
        ${isHighStreak ? 'game-pulse-glow bg-amber-200' : ''}
        ${isEntering ? 'animate-spring-in' : ''}
        ${className}
      `.trim()}
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontVariantNumeric: 'tabular-nums',
        ['--streak-icon' as string]: `'${emoji}'`,
      }}
      role="status"
      aria-label={`${count} streak`}
    >
      <span aria-hidden="true">{emoji}</span>
      <span
        className={`
          inline-block
          transition-transform duration-200
          ${isPopping ? 'scale-125' : 'scale-100'}
        `.trim()}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {count}
      </span>
    </span>
  );
}
