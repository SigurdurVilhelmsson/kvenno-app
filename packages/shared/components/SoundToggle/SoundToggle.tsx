import { useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SoundToggleProps {
  /** Whether sound is currently enabled */
  isEnabled: boolean;
  /** Callback to toggle sound on/off */
  onToggle: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Size variant (default: 'md') */
  size?: 'sm' | 'md';
}

// ---------------------------------------------------------------------------
// Inline SVG icons (no external dependency)
// ---------------------------------------------------------------------------

/**
 * Speaker icon with sound waves (sound enabled).
 */
function SpeakerOnIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Speaker body */}
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity={0.15} />
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {/* Sound waves */}
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/**
 * Speaker icon with X mark (sound disabled).
 */
function SpeakerOffIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Speaker body */}
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity={0.15} />
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {/* X mark */}
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Size config
// ---------------------------------------------------------------------------

const SIZE_CONFIG = {
  sm: { button: 28, icon: 14, padding: 'px-1.5 py-1' },
  md: { button: 36, icon: 18, padding: 'px-2.5 py-1.5' },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A compact toggle button for enabling/disabling game sounds.
 *
 * Renders a pill-shaped button with an inline SVG speaker icon that
 * cross-fades between the "on" (with sound waves) and "off" (with X) states.
 *
 * All user-facing labels are in Icelandic.
 *
 * @example
 * ```tsx
 * const { isEnabled, toggleSound } = useGameSounds();
 * <SoundToggle isEnabled={isEnabled} onToggle={toggleSound} />
 * ```
 *
 * @example
 * ```tsx
 * // Small variant
 * <SoundToggle isEnabled={isEnabled} onToggle={toggleSound} size="sm" />
 * ```
 */
export function SoundToggle({
  isEnabled,
  onToggle,
  className = '',
  size = 'md',
}: SoundToggleProps) {
  const { icon: iconSize, padding } = SIZE_CONFIG[size];

  const handleClick = useCallback(() => {
    onToggle();
  }, [onToggle]);

  // Icelandic labels: "Hljóð á" = Sound on, "Hljóð af" = Sound off
  const label = isEnabled ? 'Hljóð af' : 'Hljóð á';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        // Base styles
        'inline-flex items-center justify-center rounded-full',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400',
        // Hover effect
        'hover:scale-105 active:scale-95',
        // Background
        isEnabled
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
        // Size
        padding,
        // Custom classes
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      title={label}
    >
      {/* Cross-fade container */}
      <span className="relative" style={{ width: iconSize, height: iconSize }}>
        {/* Enabled icon */}
        <span
          className="absolute inset-0 transition-opacity duration-200 ease-in-out"
          style={{ opacity: isEnabled ? 1 : 0 }}
        >
          <SpeakerOnIcon size={iconSize} />
        </span>
        {/* Disabled icon */}
        <span
          className="absolute inset-0 transition-opacity duration-200 ease-in-out"
          style={{ opacity: isEnabled ? 0 : 1 }}
        >
          <SpeakerOffIcon size={iconSize} />
        </span>
      </span>
    </button>
  );
}

export default SoundToggle;
