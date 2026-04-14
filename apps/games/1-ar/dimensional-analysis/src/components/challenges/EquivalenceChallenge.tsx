import { useState, useEffect } from 'react';

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
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const leftVolumeInML = 1000;
  const rightVolumeInML = rightValue * 1000;

  useEffect(() => {
    const correct = rightValue === 1;
    setIsCorrect(correct);
    if (correct && hasAttempted) {
      onComplete();
    }
  }, [rightValue, hasAttempted, onComplete]);

  const adjustValue = (delta: number) => {
    onAttempt();
    setHasAttempted(true);
    const newValue = Math.max(0, rightValue + delta);
    setRightValue(Number(newValue.toFixed(1)));
  };

  const comparison = rightVolumeInML - leftVolumeInML;

  return (
    <div className="space-y-6">
      <EquivalenceDisplay
        leftValue={1000}
        leftUnit="mL"
        rightValue={rightValue}
        rightUnit="L"
        isEqual={isCorrect}
        comparison={comparison}
      />

      {!isCorrect && (
        <div className="flex flex-col items-center gap-4 p-6 bg-warm-50 rounded-xl">
          <p className="text-warm-700 font-semibold">Hversu margir lítrar jafngilda 1000 mL?</p>

          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-green-700">{rightValue}</span>
            <span className="text-2xl font-bold text-green-600">L</span>
          </div>

          {hasAttempted && !isCorrect && (
            <p className="text-sm text-warm-500">
              {comparison < 0 ? '↑ Þú þarft meira' : comparison > 0 ? '↓ Þú þarft minna' : ''}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <button
              onClick={() => adjustValue(-1)}
              className="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors text-lg"
            >
              -1
            </button>
            <button
              onClick={() => adjustValue(-0.5)}
              className="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              -0.5
            </button>
            <button
              onClick={() => adjustValue(-0.1)}
              className="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              -0.1
            </button>
            <button
              onClick={() => adjustValue(0.1)}
              className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-colors"
            >
              +0.1
            </button>
            <button
              onClick={() => adjustValue(0.5)}
              className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-colors"
            >
              +0.5
            </button>
            <button
              onClick={() => adjustValue(1)}
              className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-colors text-lg"
            >
              +1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
