/**
 * AnimatedCounter - Shared score and counter components for chemistry games
 *
 * Provides animated number displays, floating score popups, streak indicators,
 * and a popup queue management hook. All components respect prefers-reduced-motion.
 *
 * @example
 * ```tsx
 * import {
 *   AnimatedCounter,
 *   ScorePopup,
 *   StreakCounter,
 *   useScorePopups,
 * } from '@shared/components/AnimatedCounter';
 *
 * function GameHUD() {
 *   const { popups, addPopup, removePopup } = useScorePopups();
 *
 *   return (
 *     <div className="relative">
 *       <AnimatedCounter value={score} suffix=" stig" />
 *       <StreakCounter count={streak} />
 *       {popups.map((p) => (
 *         <ScorePopup
 *           key={p.id}
 *           points={p.points}
 *           position={p.position}
 *           onComplete={() => removePopup(p.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

// Components
export { AnimatedCounter } from './AnimatedCounter';
export { ScorePopup } from './ScorePopup';
export { StreakCounter } from './StreakCounter';

// Hooks
export { useScorePopups } from './useScorePopups';

// Types
export type { AnimatedCounterProps } from './AnimatedCounter';
export type { ScorePopupProps } from './ScorePopup';
export type { StreakCounterProps } from './StreakCounter';
export type { PopupItem, UseScorePopupsReturn } from './useScorePopups';
