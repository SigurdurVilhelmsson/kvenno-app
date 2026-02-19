import { HintTierKey, HINT_TIER_ICONS, HINT_TIER_LABELS } from '../../types/hint.types';

/**
 * Styling configuration for each tier
 */
const TIER_STYLES: Record<HintTierKey, { bg: string; border: string; text: string }> = {
  topic: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
  },
  strategy: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-800',
  },
  method: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-800',
  },
  solution: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-800',
  },
};

interface HintTierProps {
  /** Which tier this is */
  tier: HintTierKey;
  /** The hint content to display */
  content: string;
  /** Animation delay for staggered reveal */
  animationDelay?: number;
}

/**
 * Individual hint tier display component
 * Shows a single hint with appropriate styling based on tier level
 */
export function HintTier({ tier, content, animationDelay = 0 }: HintTierProps) {
  const styles = TIER_STYLES[tier];
  const icon = HINT_TIER_ICONS[tier];
  const label = HINT_TIER_LABELS[tier];

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} ${styles.text}
        border-l-4 rounded-lg p-3 mb-2
        animate-fadeIn
      `}
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0" role="img" aria-label={label}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-xs uppercase tracking-wide opacity-70">
            {label}
          </span>
          <p className="text-sm mt-0.5 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}

export default HintTier;
