import { useState, useCallback, useEffect } from 'react';

import { HintTier } from './HintTier';
import {
  TieredHints,
  HintTierKey,
  HINT_TIER_ORDER,
  HINT_TIER_LABELS,
  HINT_MULTIPLIERS,
} from '../../types/hint.types';

interface HintSystemProps {
  /** The 4-tier hints object */
  hints: TieredHints;
  /** Base points for the question (default: 20) */
  basePoints?: number;
  /** Called when a hint is revealed */
  onHintUsed?: (tier: 1 | 2 | 3 | 4, pointMultiplier: number) => void;
  /** Called when point multiplier changes */
  onPointsChange?: (multiplier: number) => void;
  /** Hide the component (e.g., when showing feedback) */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Reset hint state (increment to reset) */
  resetKey?: number;
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
  className = '',
  resetKey = 0,
}: HintSystemProps) {
  const [revealedTiers, setRevealedTiers] = useState<HintTierKey[]>([]);
  const [currentTierIndex, setCurrentTierIndex] = useState(0);

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

  // Don't render if disabled
  if (disabled) {
    return null;
  }

  return (
    <div className={`hint-system ${className}`}>
      {/* Revealed hints */}
      {revealedTiers.length > 0 && (
        <div className="mb-3">
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
      {!allRevealed && nextTier && (
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
      {allRevealed && (
        <div className="text-center text-gray-500 text-sm py-2">
          Allar vísbendingar notaðar
        </div>
      )}

      {/* Point indicator */}
      {revealedTiers.length > 0 && (
        <div className="text-center text-xs text-gray-400 mt-2">
          Stig: {Math.round(basePoints * HINT_MULTIPLIERS[currentTierIndex])} / {basePoints}
        </div>
      )}
    </div>
  );
}

export default HintSystem;
