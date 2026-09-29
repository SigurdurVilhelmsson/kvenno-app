import { useState, useEffect, useRef, useMemo } from 'react';

import { UnitBlock } from './UnitBlock';

/**
 * A unit written as one string, split across the fraction bar: `km/klst` is km
 * over klst. Written whole, a compound unit could never cancel against a factor
 * — no factor carries `km/klst` — so on the three Level-2 problems that start
 * from one (km/klst, m/s, g/mL) the right chain drew no cancellation at all.
 */
export function splitUnit(unit: string): { numerator: string[]; denominator: string[] } {
  const [top, ...bottom] = unit
    .split('/')
    .map((part) => part.trim())
    .filter((part) => part !== '');
  return { numerator: top ? [top] : [], denominator: bottom };
}

/**
 * Every unit in a chain, on the side of the bar it sits on: the start unit, then
 * each `"num unit / den unit"` factor's two units.
 */
export function chainUnits(
  startUnit: string,
  factors: string[]
): { numerator: string[]; denominator: string[] } {
  const numerator: string[] = [];
  const denominator: string[] = [];
  const add = (unit: string, flip: boolean) => {
    const parts = splitUnit(unit);
    numerator.push(...(flip ? parts.denominator : parts.numerator));
    denominator.push(...(flip ? parts.numerator : parts.denominator));
  };
  add(startUnit, false);
  for (const factor of factors) {
    const [num, den] = factor.split(' / ');
    add(num.split(' ').slice(1).join(' '), false);
    add(den.split(' ').slice(1).join(' '), true);
  }
  return { numerator, denominator };
}

export interface UnitPair {
  numIdx: number;
  denIdx: number;
  unit: string;
}

/**
 * Which units cancel, one numerator unit against one denominator unit. A unit
 * cancels as many times as it appears on both sides and no more: mg·mg / mg
 * leaves mg. Matching by name alone cancelled every copy at once, so a chain
 * carrying a factor and its inverse was shown as unitless when it was not.
 */
export function pairUnits(
  numeratorUnits: string[],
  denominatorUnits: string[]
): { pairs: UnitPair[]; numerator: string[]; denominator: string[] } {
  const pairs: UnitPair[] = [];
  const usedDen = new Set<number>();
  numeratorUnits.forEach((unit, numIdx) => {
    const denIdx = denominatorUnits.findIndex((d, idx) => d === unit && !usedDen.has(idx));
    if (denIdx !== -1) {
      usedDen.add(denIdx);
      pairs.push({ numIdx, denIdx, unit });
    }
  });
  const pairedNum = new Set(pairs.map((p) => p.numIdx));
  return {
    pairs,
    numerator: numeratorUnits.filter((_, idx) => !pairedNum.has(idx)),
    denominator: denominatorUnits.filter((_, idx) => !usedDen.has(idx)),
  };
}

interface UnitCancellationVisualizerProps {
  numeratorUnits: string[];
  denominatorUnits: string[];
  onCancel?: (unit: string) => void;
  showCancelButton?: boolean;
  /** Enable enhanced animations with strikethrough and connecting lines */
  enhancedAnimation?: boolean;
  /** Start cancelling the matching pairs on their own, one after another */
  autoAnimate?: boolean;
}

/**
 * Enhanced visual unit cancellation display
 * Shows units in numerator and denominator with cancellation animation
 * Uses the same UnitBlock component as Level 1 for consistency
 */
export function UnitCancellationVisualizer({
  numeratorUnits,
  denominatorUnits,
  onCancel,
  showCancelButton = false,
  enhancedAnimation = true,
  autoAnimate = false,
}: UnitCancellationVisualizerProps) {
  // Pairs are tracked by index, not by unit name, so two copies of one unit are
  // two separate cancellations.
  const [cancellingPair, setCancellingPair] = useState<number | null>(null);
  const [cancelledPairs, setCancelledPairs] = useState<Set<number>>(new Set());
  const [connectingLines, setConnectingLines] = useState<UnitPair[]>([]);
  const [animatingLine, setAnimatingLine] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const numRefs = useRef<(HTMLDivElement | null)[]>([]);
  const denRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cancelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The parent hands over fresh arrays on every render; key the pairing on
  // their contents so a keystroke elsewhere does not restart the animation.
  const numKey = numeratorUnits.join('\u0000');
  const denKey = denominatorUnits.join('\u0000');
  const {
    pairs,
    numerator: leftNumerator,
    denominator: leftDenominator,
  } = useMemo(
    () => pairUnits(numeratorUnits, denominatorUnits),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on contents, see above
    [numKey, denKey]
  );

  // Pairs still waiting to cancel, and their units once each for the message.
  const pendingPairs = pairs.map((_, idx) => idx).filter((idx) => !cancelledPairs.has(idx));
  const matchingUnits = [...new Set(pendingPairs.map((idx) => pairs[idx].unit))];
  const hasMatchingUnits = pendingPairs.length > 0;

  // Connecting lines between the pairs that have not cancelled yet. Set after
  // mount, when the unit refs they are drawn between exist.
  useEffect(() => {
    if (!enhancedAnimation) return;
    setConnectingLines(pairs);
  }, [pairs, enhancedAnimation]);

  useEffect(
    () => () => {
      if (cancelTimer.current) clearTimeout(cancelTimer.current);
    },
    []
  );

  const handleCancel = (pairIdx: number) => {
    setCancellingPair(pairIdx);
    setAnimatingLine(pairIdx);

    cancelTimer.current = setTimeout(
      () => {
        if (onCancel) onCancel(pairs[pairIdx].unit);
        setCancellingPair(null);
        setCancelledPairs((prev) => new Set([...prev, pairIdx]));
        setAnimatingLine(null);
      },
      enhancedAnimation ? 800 : 600
    );
  };

  // Auto-animate: cancel every pair, one after another. Once started it runs to
  // the end — a two-step chain has two pairs, and the parent's flag drops
  // before the second one begins, which used to leave it half-cancelled with
  // no final unit shown.
  const autoRunning = useRef(false);
  const nextPending = pendingPairs.length > 0 ? pendingPairs[0] : null;
  useEffect(() => {
    if (!(autoAnimate || autoRunning.current)) return;
    if (cancellingPair !== null || nextPending === null) return;
    autoRunning.current = true;
    const timer = setTimeout(() => handleCancel(nextPending), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleCancel is recreated each render
  }, [autoAnimate, cancellingPair, nextPending]);

  // Where a unit stands: part of a pair that is cancelling, has cancelled or
  // is waiting to, or on its own.
  const getUnitStatus = (idx: number, position: 'numerator' | 'denominator') => {
    const pairIdx = pairs.findIndex((p) =>
      position === 'numerator' ? p.numIdx === idx : p.denIdx === idx
    );
    if (pairIdx === -1) return 'normal';
    if (cancellingPair === pairIdx) return 'cancelling';
    if (cancelledPairs.has(pairIdx)) return 'cancelled';
    return 'matching';
  };

  const getUnitColor = (
    status: string,
    position: 'numerator' | 'denominator'
  ): 'blue' | 'green' | 'orange' | 'gray' => {
    if (status === 'cancelling' || status === 'cancelled') return 'gray';
    if (status === 'matching') return 'orange';
    return position === 'numerator' ? 'blue' : 'green';
  };

  // Get SVG path for connecting line between two units
  const getConnectingLinePath = (numIdx: number, denIdx: number): string => {
    const numEl = numRefs.current[numIdx];
    const denEl = denRefs.current[denIdx];
    const container = containerRef.current;

    if (!numEl || !denEl || !container) return '';

    const containerRect = container.getBoundingClientRect();
    const numRect = numEl.getBoundingClientRect();
    const denRect = denEl.getBoundingClientRect();

    const x1 = numRect.left + numRect.width / 2 - containerRect.left;
    const y1 = numRect.bottom - containerRect.top;
    const x2 = denRect.left + denRect.width / 2 - containerRect.left;
    const y2 = denRect.top - containerRect.top;

    // Create a curved path
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} Q ${x1} ${midY} ${(x1 + x2) / 2} ${midY} Q ${x2} ${midY} ${x2} ${y2}`;
  };

  return (
    <div
      ref={containerRef}
      className="bg-gradient-to-b from-warm-50 to-white p-4 sm:p-6 phone:p-3 rounded-2xl shadow-lg border-2 border-warm-200 relative"
    >
      {/* SVG overlay for connecting lines */}
      {enhancedAnimation && connectingLines.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none z-20"
          style={{ width: '100%', height: '100%' }}
        >
          {connectingLines.map((line, idx) => {
            const isAnimating = animatingLine === idx;
            const isCancelled = cancelledPairs.has(idx);
            if (isCancelled) return null;

            return (
              <path
                key={`line-${idx}`}
                d={getConnectingLinePath(line.numIdx, line.denIdx)}
                fill="none"
                stroke={isAnimating ? '#ef4444' : '#f97316'}
                strokeWidth={isAnimating ? 3 : 2}
                strokeDasharray={isAnimating ? '8,4' : '4,4'}
                className={`connect-line ${isAnimating ? 'animate-draw' : ''} ${cancellingPair === idx ? 'animate-fade' : ''}`}
                opacity={0.7}
              />
            );
          })}
        </svg>
      )}

      {/* Header */}
      <div className="text-center mb-4 phone:mb-2 phone:flex phone:flex-wrap phone:items-baseline phone:justify-center phone:gap-x-2">
        <h3 className="text-sm font-bold text-warm-700 uppercase tracking-wide">Einingagreining</h3>
        <p className="text-xs text-warm-500">Eins einingar strikast út</p>
      </div>

      {/* Numerator */}
      <div className="mb-2 phone:mb-1 phone:relative">
        <div className="flex items-center gap-2 mb-2 phone:absolute phone:left-1.5 phone:top-1.5 phone:z-10 phone:mb-0">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
            Teljari
          </span>
        </div>
        <div className="min-h-[60px] border-2 border-dashed border-blue-300 rounded-xl p-3 bg-blue-50 flex flex-wrap items-center justify-center gap-3 phone:min-h-12 phone:p-1.5 phone:gap-2 phone:pl-[4.75rem]">
          {numeratorUnits.length === 0 ? (
            <span className="text-warm-400 text-sm italic">Engar einingar</span>
          ) : (
            numeratorUnits.map((unit, idx) => {
              const status = getUnitStatus(idx, 'numerator');
              return (
                <div
                  key={`num-${idx}`}
                  ref={(el) => {
                    numRefs.current[idx] = el;
                  }}
                >
                  <UnitBlock
                    value={1}
                    unit={unit}
                    color={getUnitColor(status, 'numerator')}
                    size="medium"
                    showValue={false}
                    isCancelling={status === 'cancelling'}
                    isCancelled={status === 'cancelled'}
                    isMatching={status === 'matching'}
                    useStrikethrough={enhancedAnimation}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Fraction bar */}
      <div className="relative my-4 phone:my-2">
        <div className="h-1 bg-warm-800 rounded-full" />
        {hasMatchingUnits && (
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
            <div
              className={`w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center ${cancellingPair !== null ? 'animate-ping' : 'animate-pulse'}`}
            >
              <span className="text-white text-lg">×</span>
            </div>
          </div>
        )}
      </div>

      {/* Denominator */}
      <div className="mb-4 phone:mb-2 phone:relative">
        <div className="flex items-center gap-2 mb-2 phone:absolute phone:left-1.5 phone:top-1.5 phone:z-10 phone:mb-0">
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
            Nefnari
          </span>
        </div>
        <div className="min-h-[60px] border-2 border-dashed border-green-300 rounded-xl p-3 bg-green-50 flex flex-wrap items-center justify-center gap-3 phone:min-h-12 phone:p-1.5 phone:gap-2 phone:pl-[4.75rem]">
          {denominatorUnits.length === 0 ? (
            <span className="text-warm-400 text-sm italic">Engar einingar</span>
          ) : (
            denominatorUnits.map((unit, idx) => {
              const status = getUnitStatus(idx, 'denominator');
              return (
                <div
                  key={`denom-${idx}`}
                  ref={(el) => {
                    denRefs.current[idx] = el;
                  }}
                >
                  <UnitBlock
                    value={1}
                    unit={unit}
                    color={getUnitColor(status, 'denominator')}
                    size="medium"
                    showValue={false}
                    isCancelling={status === 'cancelling'}
                    isCancelled={status === 'cancelled'}
                    isMatching={status === 'matching'}
                    useStrikethrough={enhancedAnimation}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Matching units indicator */}
      {hasMatchingUnits && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-center phone:mb-2 phone:p-2">
          <p className="text-sm text-orange-700">
            <span className="font-bold">{matchingUnits.join(', ')}</span>{' '}
            {matchingUnits.length > 1 ? 'eru' : 'er'} í bæði teljara og nefnara og strikast út!
          </p>
        </div>
      )}

      {/* Cancel button */}
      {showCancelButton && hasMatchingUnits && (
        <button
          onClick={() => handleCancel(pendingPairs[0])}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={cancellingPair !== null}
        >
          Strika út {pairs[pendingPairs[0]].unit}
        </button>
      )}

      {/* Result preview */}
      {!hasMatchingUnits && numeratorUnits.length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center phone:p-2">
          <p className="text-sm text-green-700 font-semibold">
            Lokaeining: {leftNumerator.join(' · ') || '(einingalaust)'}
            {leftDenominator.length > 0 && <> / {leftDenominator.join(' · ')}</>}
          </p>
        </div>
      )}
    </div>
  );
}
