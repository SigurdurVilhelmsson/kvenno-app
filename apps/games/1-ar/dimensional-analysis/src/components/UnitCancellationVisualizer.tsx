import { useState, useEffect, useRef, useCallback } from 'react';
import { UnitBlock } from './UnitBlock';

interface UnitCancellationVisualizerProps {
  numeratorUnits: string[];
  denominatorUnits: string[];
  onCancel?: (unit: string) => void;
  showCancelButton?: boolean;
  /** Enable enhanced animations with strikethrough and connecting lines */
  enhancedAnimation?: boolean;
  /** Auto-animate cancellation on mount */
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
  autoAnimate = false
}: UnitCancellationVisualizerProps) {
  const [cancellingUnit, setCancellingUnit] = useState<string | null>(null);
  const [cancelledUnits, setCancelledUnits] = useState<Set<string>>(new Set());
  const [connectingLines, setConnectingLines] = useState<Array<{numIdx: number, denIdx: number, unit: string}>>([]);
  const [animatingLine, setAnimatingLine] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const numRefs = useRef<(HTMLDivElement | null)[]>([]);
  const denRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Find matching units that can be cancelled
  const matchingUnits = numeratorUnits.filter(u => denominatorUnits.includes(u) && !cancelledUnits.has(u));
  const hasMatchingUnits = matchingUnits.length > 0;

  // Calculate connecting lines between matching units
  const updateConnectingLines = useCallback(() => {
    if (!enhancedAnimation) return;

    const lines: Array<{numIdx: number, denIdx: number, unit: string}> = [];
    const usedDenIndices = new Set<number>();

    numeratorUnits.forEach((unit, numIdx) => {
      if (cancelledUnits.has(unit)) return;

      const denIdx = denominatorUnits.findIndex((d, idx) =>
        d === unit && !usedDenIndices.has(idx) && !cancelledUnits.has(d)
      );

      if (denIdx !== -1) {
        lines.push({ numIdx, denIdx, unit });
        usedDenIndices.add(denIdx);
      }
    });

    setConnectingLines(lines);
  }, [numeratorUnits, denominatorUnits, cancelledUnits, enhancedAnimation]);

  useEffect(() => {
    updateConnectingLines();
  }, [updateConnectingLines]);

  // Auto-animate when enabled and there are matching units
  useEffect(() => {
    if (autoAnimate && hasMatchingUnits && matchingUnits.length > 0 && !cancellingUnit) {
      const timer = setTimeout(() => {
        handleCancel(matchingUnits[0]);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnimate, hasMatchingUnits, matchingUnits.length]);

  const handleCancel = (unit: string) => {
    setCancellingUnit(unit);

    // Find and animate the connecting line
    const lineIdx = connectingLines.findIndex(l => l.unit === unit);
    if (lineIdx !== -1) {
      setAnimatingLine(lineIdx);
    }

    setTimeout(() => {
      if (onCancel) onCancel(unit);
      setCancellingUnit(null);
      setCancelledUnits(prev => new Set([...prev, unit]));
      setAnimatingLine(null);
    }, enhancedAnimation ? 800 : 600);
  };

  // Determine which units are matching and should be highlighted
  const getUnitStatus = (unit: string, position: 'numerator' | 'denominator') => {
    if (cancellingUnit === unit) return 'cancelling';
    if (cancelledUnits.has(unit)) return 'cancelled';

    // Check if this unit has a match in the other position
    const otherUnits = position === 'numerator' ? denominatorUnits : numeratorUnits;
    if (otherUnits.includes(unit) && !cancelledUnits.has(unit)) return 'matching';

    return 'normal';
  };

  const getUnitColor = (status: string, position: 'numerator' | 'denominator'): 'blue' | 'green' | 'orange' | 'gray' => {
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
    <div ref={containerRef} className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl shadow-lg border-2 border-gray-200 relative">
      {/* SVG overlay for connecting lines */}
      {enhancedAnimation && connectingLines.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none z-20"
          style={{ width: '100%', height: '100%' }}
        >
          {connectingLines.map((line, idx) => {
            const isAnimating = animatingLine === idx;
            const isCancelled = cancelledUnits.has(line.unit);
            if (isCancelled) return null;

            return (
              <path
                key={`line-${idx}`}
                d={getConnectingLinePath(line.numIdx, line.denIdx)}
                fill="none"
                stroke={isAnimating ? '#ef4444' : '#f97316'}
                strokeWidth={isAnimating ? 3 : 2}
                strokeDasharray={isAnimating ? '8,4' : '4,4'}
                className={`connect-line ${isAnimating ? 'animate-draw' : ''} ${cancellingUnit === line.unit ? 'animate-fade' : ''}`}
                opacity={0.7}
              />
            );
          })}
        </svg>
      )}

      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Einingagreining</h3>
        <p className="text-xs text-gray-500">Eins einingar strikast út</p>
      </div>

      {/* Numerator */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">Teljari</span>
        </div>
        <div className="min-h-[60px] border-2 border-dashed border-blue-300 rounded-xl p-3 bg-blue-50 flex flex-wrap items-center justify-center gap-3">
          {numeratorUnits.length === 0 ? (
            <span className="text-gray-400 text-sm italic">Engar einingar</span>
          ) : (
            numeratorUnits.map((unit, idx) => {
              const status = getUnitStatus(unit, 'numerator');
              return (
                <div key={`num-${idx}`} ref={el => numRefs.current[idx] = el}>
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
      <div className="relative my-4">
        <div className="h-1 bg-gray-800 rounded-full" />
        {hasMatchingUnits && (
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
            <div className={`w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center ${cancellingUnit ? 'animate-ping' : 'animate-pulse'}`}>
              <span className="text-white text-lg">×</span>
            </div>
          </div>
        )}
      </div>

      {/* Denominator */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">Nefnari</span>
        </div>
        <div className="min-h-[60px] border-2 border-dashed border-green-300 rounded-xl p-3 bg-green-50 flex flex-wrap items-center justify-center gap-3">
          {denominatorUnits.length === 0 ? (
            <span className="text-gray-400 text-sm italic">Engar einingar</span>
          ) : (
            denominatorUnits.map((unit, idx) => {
              const status = getUnitStatus(unit, 'denominator');
              return (
                <div key={`denom-${idx}`} ref={el => denRefs.current[idx] = el}>
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
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-center">
          <p className="text-sm text-orange-700">
            <span className="font-bold">{matchingUnits.join(', ')}</span> er í bæði teljara og nefnara og strikast út!
          </p>
        </div>
      )}

      {/* Cancel button */}
      {showCancelButton && hasMatchingUnits && (
        <button
          onClick={() => handleCancel(matchingUnits[0])}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={cancellingUnit !== null}
        >
          Strika út {matchingUnits[0]}
        </button>
      )}

      {/* Result preview */}
      {!hasMatchingUnits && numeratorUnits.length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
          <p className="text-sm text-green-700 font-semibold">
            Lokaeining: {numeratorUnits.filter(u => !denominatorUnits.includes(u)).join(' · ') || '(einingalaust)'}
            {denominatorUnits.filter(u => !numeratorUnits.includes(u)).length > 0 && (
              <> / {denominatorUnits.filter(u => !numeratorUnits.includes(u)).join(' · ')}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
