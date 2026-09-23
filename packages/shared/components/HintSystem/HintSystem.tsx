import { useState, useCallback, useEffect } from 'react';

import { HintTier } from './HintTier';
import {
  TieredHints,
  HintTierKey,
  HINT_TIER_ORDER,
  HINT_TIER_LABELS,
  HINT_MULTIPLIERS,
} from '../../types/hint.types';
import { usePresenceExiting } from '../Transition/Transition';

interface HintSystemProps {
  /** The 4-tier hints object */
  hints: TieredHints;
  /** Base points for the question (default: 20) */
  basePoints?: number;
  /** Called when a hint is revealed */
  onHintUsed?: (tier: 1 | 2 | 3 | 4, pointMultiplier: number) => void;
  /** Called when point multiplier changes */
  onPointsChange?: (multiplier: number) => void;
  /**
   * Freeze the component once the question is answered (e.g. while feedback
   * shows). No more tiers can be opened, but the ones already revealed stay
   * visible, read-only. With none revealed, nothing renders — and nothing
   * renders either while an enclosing Presence is fading the hints out, since
   * they are leaving anyway.
   */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Reset hint state (increment to reset) */
  resetKey?: number;
  /**
   * Show the "Stig: x / y" indicator that tells the student what the revealed
   * tiers have cost them. Defaults to true, which is what the games that
   * actually apply `onPointsChange` want. Pass false in a game where hints are
   * free — otherwise the indicator announces a penalty nothing deducts.
   */
  showPointCost?: boolean;
}

/**
 * Tiered Hint System Component
 *
 * Provides a 4-tier progressive hint system:
 * 1. Topic reminder (80% points)
 * 2. Strategy hint (60% points)
 * 3. Formula/method (40% points)
 * 4. Worked solution (40% points)
 *
 * Usage:
 * ```tsx
 * <HintSystem
 *   hints={challenge.hints}
 *   onHintUsed={(tier) => setHintsUsed(tier)}
 *   onPointsChange={setHintMultiplier}
 *   disabled={showFeedback}
 * />
 * ```
 */
export function HintSystem({
  hints,
  basePoints = 20,
  onHintUsed,
  onPointsChange,
  disabled = false,
  showPointCost = true,
  className = '',
  resetKey = 0,
}: HintSystemProps) {
  const [revealedTiers, setRevealedTiers] = useState<HintTierKey[]>([]);
  const [currentTierIndex, setCurrentTierIndex] = useState(0);
  const leaving = usePresenceExiting();

  // Reset state when resetKey changes
  useEffect(() => {
    setRevealedTiers([]);
    setCurrentTierIndex(0);
  }, [resetKey]);

  const allRevealed = currentTierIndex >= HINT_TIER_ORDER.length;
  const nextTier = allRevealed ? null : HINT_TIER_ORDER[currentTierIndex];
  const nextTierNumber = (currentTierIndex + 1) as 1 | 2 | 3 | 4;

  const handleRevealHint = useCallback(() => {
    if (allRevealed || !nextTier) return;

    const newTierIndex = currentTierIndex + 1;
    const tierKey = HINT_TIER_ORDER[currentTierIndex];
    const multiplier = HINT_MULTIPLIERS[newTierIndex];

    setRevealedTiers((prev) => [...prev, tierKey]);
    setCurrentTierIndex(newTierIndex);

    onHintUsed?.(newTierIndex as 1 | 2 | 3 | 4, multiplier);
    onPointsChange?.(multiplier);
  }, [currentTierIndex, allRevealed, nextTier, onHintUsed, onPointsChange]);

  // Disabled means the question has been answered: no more tiers can be opened.
  // The tiers the student already opened stay on screen, read-only. Removing
  // them took away text the student had just been reading and pulled the
  // feedback below up by their height. With nothing revealed there is nothing
  // to keep, so the component renders nothing, as it always has.
  //
  // The one exception is a HintSystem whose own Presence is fading it out
  // (ph-titration Stig 1 and equilibrium-shifter swap it for the feedback that
  // way). The tiers are leaving regardless, and keeping them through the fade
  // only lands the feedback below them and then jumps it up by their height
  // when the fade ends. There they go at once, exactly as before.
  if (disabled && (revealedTiers.length === 0 || leaving)) {
    return null;
  }

  return (
    <div className={`hint-system ${className}`}>
      {/* Revealed hints. The element stays in the same place when `disabled`
          flips, so React keeps the tiers mounted and their fade-in does not
          replay. */}
      {revealedTiers.length > 0 && (
        <div className={disabled ? undefined : 'mb-3'}>
          {revealedTiers.map((tierKey, index) => (
            <HintTier
              key={tierKey}
              tier={tierKey}
              content={hints[tierKey]}
              animationDelay={index * 100}
            />
          ))}
        </div>
      )}

      {/* Hint button */}
      {!disabled && !allRevealed && nextTier && (
        <button
          onClick={handleRevealHint}
          className="
            w-full bg-yellow-100 hover:bg-yellow-200
            text-yellow-800 font-semibold
            py-3 px-4 rounded-xl
            transition-colors
            flex items-center justify-center gap-2
          "
          type="button"
        >
          <span>💡</span>
          <span>
            Vísbending {nextTierNumber}/4: {HINT_TIER_LABELS[nextTier]}
          </span>
        </button>
      )}

      {/* All hints used message */}
      {!disabled && allRevealed && (
        <div className="text-center text-gray-500 text-sm py-2">Allar vísbendingar notaðar</div>
      )}

      {/* Point indicator */}
      {!disabled && showPointCost && revealedTiers.length > 0 && (
        <div className="text-center text-xs text-gray-400 mt-2">
          Stig: {Math.round(basePoints * HINT_MULTIPLIERS[currentTierIndex])} / {basePoints}
        </div>
      )}
    </div>
  );
}

export default HintSystem;
