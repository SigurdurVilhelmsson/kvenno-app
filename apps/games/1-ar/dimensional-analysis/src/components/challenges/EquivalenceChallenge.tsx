import { useState } from 'react';

import { formatDecimal } from '@shared/utils';

import { EquivalenceDisplay } from '../UnitBlock';

interface EquivalenceChallengeProps {
  onComplete: () => void;
  onAttempt: (isIncorrect?: boolean) => void;
}

/**
 * C1: Unit Equivalence - Find how many L equals 1000 mL
 *
 * Students adjust ONLY the L value to match 1000 mL.
 * Teaches: "Different numbers with different units = same amount"
 */
export function EquivalenceChallenge({ onComplete, onAttempt }: EquivalenceChallengeProps) {
  const [rightValue, setRightValue] = useState(0);
  const [hasAttempted, setHasAttempted] = useState(false);

  const leftVolumeInML = 1000;
  const rightVolumeInML = rightValue * 1000;
  const isCorrect = rightValue === 1;

  // Success is reported from the click that reaches 1 L, not from an effect.
  // An effect listing `onComplete` re-ran every time the level re-rendered,
  // and reporting success re-renders the level: a loop.
  const adjustValue = (delta: number) => {
    onAttempt();
    setHasAttempted(true);
    const newValue = Number(Math.max(0, rightValue + delta).toFixed(1));
    setRightValue(newValue);
    if (newValue === 1) onComplete();
  };

  const comparison = rightVolumeInML - leftVolumeInML;

  return (
    <div className="space-y-6 phone:space-y-3">
      <EquivalenceDisplay
        leftValue={1000}
        leftUnit="mL"
        rightValue={rightValue}
        rightUnit="L"
        isEqual={isCorrect}
        comparison={comparison}
      />

      {!isCorrect && (
        <div className="flex flex-col items-center gap-4 p-4 sm:p-6 bg-warm-50 rounded-xl phone:gap-3 phone:p-3">
          {/* The instruction above asks the same question; a phone reads it once. */}
          <p className="text-warm-700 font-semibold phone:sr-only">
            Hversu margir lítrar jafngilda 1000 mL?
          </p>

          {/* On a phone the value and the "more/less" line share a row, and the
              line's height is kept before the first tap, so it never pushes the
              buttons down under the finger that is using them. */}
          <div className="contents phone:flex phone:items-center phone:justify-center phone:gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-green-700">{formatDecimal(rightValue)}</span>
              <span className="text-2xl font-bold text-green-600">L</span>
            </div>

            <p
              className={`text-sm text-warm-500 phone:min-h-5 phone:min-w-[8.5rem] ${hasAttempted ? '' : 'hidden phone:block'}`}
            >
              {hasAttempted && comparison < 0
                ? '↑ Þú þarft meira'
                : hasAttempted && comparison > 0
                  ? '↓ Þú þarft minna'
                  : ''}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
            {[-1, -0.5, -0.1, 0.1, 0.5, 1].map((delta) => {
              const isNegative = delta < 0;
              const sizeClass = Math.abs(delta) === 1 ? 'text-lg' : '';
              const colorClass = isNegative
                ? 'bg-red-100 text-red-700 hover:bg-red-200 focus-visible:ring-red-400'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus-visible:ring-blue-400';
              return (
                <button
                  key={delta}
                  onClick={() => adjustValue(delta)}
                  aria-label={`${delta > 0 ? 'Bæta við' : 'Draga frá'} ${formatDecimal(Math.abs(delta))} lítra`}
                  className={`min-h-[44px] min-w-[44px] px-2 sm:px-4 py-3 rounded-lg font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${colorClass} ${sizeClass}`}
                >
                  {delta > 0 ? `+${formatDecimal(delta)}` : formatDecimal(delta)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
