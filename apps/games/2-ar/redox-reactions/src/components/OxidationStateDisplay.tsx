import { useState, useEffect, useMemo, useRef } from 'react';

interface OxidationChange {
  element: string;
  before: number;
  after: number;
}

interface OxidationStateDisplayProps {
  /** Species involved in the redox reaction */
  changes: OxidationChange[];
  /** Whether to animate the electron transfer */
  animate?: boolean;
  /** Show electron count */
  showElectrons?: boolean;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether to say which species is oxidised and which reduced. Off, the diagram shows only the
   * oxidation numbers before and after — the route to the answer, without the answer — and runs
   * no electron animation, since the direction the electrons fly is the verdict too.
   */
  revealVerdict?: boolean;
}

/**
 * OxidationStateDisplay - Visual representation of oxidation state changes
 *
 * Shows:
 * - Color-coded oxidation states (blue for negative, red for positive)
 * - Animated electron transfer between species
 * - Clear indication of which species is oxidized/reduced
 */
export function OxidationStateDisplay({
  changes,
  animate = true,
  showElectrons = true,
  onAnimationComplete,
  size = 'medium',
  revealVerdict = true,
}: OxidationStateDisplayProps) {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'electrons' | 'complete'>('idle');
  const [electronPositions, setElectronPositions] = useState<number[]>([]);

  // Calculate electrons transferred for each species
  const electronChanges = useMemo(() => {
    return changes.map((c) => ({
      ...c,
      electronsDelta: c.before - c.after, // Negative = oxidized (lost e⁻), positive = reduced (gained e⁻)
      isOxidized: c.after > c.before,
      isReduced: c.after < c.before,
    }));
  }, [changes]);

  // Find oxidized and reduced species
  const oxidizedSpecies = electronChanges.find((c) => c.isOxidized);
  const reducedSpecies = electronChanges.find((c) => c.isReduced);
  const electronsMoved = oxidizedSpecies ? Math.abs(oxidizedSpecies.electronsDelta) : 0;
  // Electrons fly from the oxidised species to the reduced one, whichever side each is drawn on.
  const electronsFlyLeft =
    oxidizedSpecies !== undefined &&
    reducedSpecies !== undefined &&
    electronChanges.indexOf(oxidizedSpecies) > electronChanges.indexOf(reducedSpecies);

  // A callback prop is a new function on most parent renders; reading it through a ref keeps a
  // parent re-render (a hint tap) from restarting the animation.
  const onCompleteRef = useRef(onAnimationComplete);
  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  const running = animate && revealVerdict;

  // Start animation when component mounts. Keyed on values, not on the `changes` array: a parent
  // that builds that array inline hands over a new one on every render, which replayed the
  // animation and hid the explanation for two seconds each time.
  useEffect(() => {
    if (!running) {
      setAnimationPhase('complete');
      return;
    }

    setAnimationPhase('idle');
    const timer1 = setTimeout(() => {
      setAnimationPhase('electrons');
      // Generate electron positions for animation
      setElectronPositions(Array.from({ length: electronsMoved }, (_, i) => i));
    }, 500);

    const timer2 = setTimeout(() => {
      setAnimationPhase('complete');
      onCompleteRef.current?.();
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [running, electronsMoved]);

  // Get color based on oxidation state
  const getOxidationColor = (value: number): string => {
    if (value <= -3) return 'bg-blue-800';
    if (value === -2) return 'bg-blue-600';
    if (value === -1) return 'bg-blue-400';
    if (value === 0) return 'bg-warm-400';
    if (value === 1) return 'bg-orange-400';
    if (value === 2) return 'bg-orange-500';
    if (value === 3) return 'bg-red-500';
    if (value === 4) return 'bg-red-600';
    if (value >= 5) return 'bg-red-800';
    return 'bg-warm-400';
  };

  // Get text color for contrast
  const getTextColor = (value: number): string => {
    if (value === 0) return 'text-warm-800';
    return 'text-white';
  };

  // Size classes
  const sizeClasses = {
    small: { badge: 'w-8 h-8 text-sm', element: 'text-lg', container: 'gap-2' },
    medium: {
      badge: 'w-10 h-10 text-base sm:w-12 sm:h-12 sm:text-lg',
      element: 'text-2xl',
      container: 'gap-x-3 gap-y-4 sm:gap-4',
    },
    large: { badge: 'w-16 h-16 text-xl', element: 'text-3xl', container: 'gap-6' },
  };

  const classes = sizeClasses[size];

  return (
    <div className="bg-gradient-to-br from-warm-800 to-warm-900 rounded-xl p-3 sm:p-6 shadow-lg">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <span className="text-lg">⚡</span>
        Rafeindaflutningur
      </h3>

      <div className={`flex flex-wrap items-center justify-center ${classes.container} relative`}>
        {electronChanges.map((change) => (
          <div key={change.element} className="flex flex-col items-center">
            {/* Element symbol */}
            <div className={`font-bold ${classes.element} text-white mb-2`}>{change.element}</div>

            {/* Oxidation state change */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Before state */}
              <div
                className={`${classes.badge} ${getOxidationColor(change.before)} ${getTextColor(change.before)}
                  rounded-full flex flex-col items-center justify-center font-bold shadow-lg
                  ${revealVerdict && animationPhase === 'electrons' && change.isOxidized ? 'animate-pulse' : ''}`}
                aria-label={`Oxunartala ${change.element}: ${change.before > 0 ? '+' : ''}${change.before}`}
              >
                <span>{change.before > 0 ? `+${change.before}` : change.before}</span>
              </div>

              {/* Arrow with direction label */}
              <div className="flex flex-col items-center">
                <div className="text-warm-400 text-xl">→</div>
                {revealVerdict && (change.isOxidized || change.isReduced) && (
                  <div className="text-[9px] max-sm:text-xs pointer-coarse:text-xs text-warm-500 whitespace-nowrap">
                    {change.isOxidized ? 'e⁻ →' : '← e⁻'}
                  </div>
                )}
              </div>

              {/* After state */}
              <div
                className={`${classes.badge} ${getOxidationColor(change.after)} ${getTextColor(change.after)}
                  rounded-full flex flex-col items-center justify-center font-bold shadow-lg
                  ${revealVerdict && animationPhase === 'complete' ? 'ring-2 ring-white/50' : ''}`}
                aria-label={`Oxunartala ${change.element}: ${change.after > 0 ? '+' : ''}${change.after}`}
              >
                <span>{change.after > 0 ? `+${change.after}` : change.after}</span>
              </div>
            </div>

            {/* Label: Oxidized/Reduced */}
            {revealVerdict && (
              <div
                className={`mt-2 text-xs font-bold px-2 py-1 rounded ${
                  change.isOxidized
                    ? 'bg-orange-500/30 text-orange-300'
                    : change.isReduced
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'bg-warm-500/30 text-warm-400'
                }`}
              >
                {change.isOxidized ? '↑ OXAST' : change.isReduced ? '↓ AFOXAST' : 'Óbreytt'}
              </div>
            )}

            {/* Electron count */}
            {revealVerdict && showElectrons && (change.isOxidized || change.isReduced) && (
              <div className="mt-1 text-xs text-warm-400">
                {change.isOxidized
                  ? `Tapar ${Math.abs(change.electronsDelta)} e⁻`
                  : `Öðlast ${Math.abs(change.electronsDelta)} e⁻`}
              </div>
            )}
          </div>
        ))}

        {/* Electron transfer animation */}
        {revealVerdict && animationPhase === 'electrons' && oxidizedSpecies && reducedSpecies && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {electronPositions.map((_, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 bg-yellow-400 rounded-full shadow-lg ${
                  electronsFlyLeft ? 'animate-electron-transfer-left' : 'animate-electron-transfer'
                }`}
                style={{
                  ...(electronsFlyLeft ? { right: '30%' } : { left: '30%' }),
                  top: '50%',
                  animationDelay: `${i * 150}ms`,
                }}
              >
                <span className="text-[8px] font-bold text-yellow-900">e⁻</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explanation */}
      {revealVerdict && animationPhase === 'complete' && (
        <div className="mt-4 bg-warm-700/50 rounded-lg p-3 text-sm">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {oxidizedSpecies && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 shrink-0 rounded-full bg-orange-500 mt-1.5" />
                <div>
                  <span className="text-orange-300 font-semibold">{oxidizedSpecies.element}</span>
                  <span className="text-warm-400"> oxast: </span>
                  <span className="text-warm-300">
                    {oxidizedSpecies.before > 0
                      ? `+${oxidizedSpecies.before}`
                      : oxidizedSpecies.before}{' '}
                    →{' '}
                    {oxidizedSpecies.after > 0
                      ? `+${oxidizedSpecies.after}`
                      : oxidizedSpecies.after}
                  </span>
                </div>
              </div>
            )}
            {reducedSpecies && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 shrink-0 rounded-full bg-blue-500 mt-1.5" />
                <div>
                  <span className="text-blue-300 font-semibold">{reducedSpecies.element}</span>
                  <span className="text-warm-400"> afoxast: </span>
                  <span className="text-warm-300">
                    {reducedSpecies.before > 0
                      ? `+${reducedSpecies.before}`
                      : reducedSpecies.before}{' '}
                    → {reducedSpecies.after > 0 ? `+${reducedSpecies.after}` : reducedSpecies.after}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-6 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
          <span className="text-warm-400">Neikvæð oxunartala</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 shrink-0 rounded-full bg-warm-400" />
          <span className="text-warm-400">Núll</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 shrink-0 rounded-full bg-gradient-to-r from-orange-400 to-red-600" />
          <span className="text-warm-400">Jákvæð oxunartala</span>
        </div>
      </div>

      {/* CSS for electron animation */}
      <style>{`
        @keyframes electron-transfer {
          0% {
            transform: translateX(0) translateY(-50%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(200px) translateY(-50%);
            opacity: 0;
          }
        }

        @keyframes electron-transfer-left {
          0% {
            transform: translateX(0) translateY(-50%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(-200px) translateY(-50%);
            opacity: 0;
          }
        }

        .animate-electron-transfer {
          animation: electron-transfer 1.5s ease-in-out forwards;
        }

        .animate-electron-transfer-left {
          animation: electron-transfer-left 1.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}

export default OxidationStateDisplay;
