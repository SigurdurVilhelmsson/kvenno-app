import { useState } from 'react';

import { ConversionFactorBlock } from '../UnitBlock';

interface OrientationChallengeProps {
  onComplete: () => void;
  onAttempt: (isIncorrect?: boolean) => void;
}

/**
 * C4: Orientation - Try both factor orientations for km → m
 *
 * Shows visually what happens with each orientation:
 * - Wrong: km doesn't cancel (both in numerator)
 * - Correct: km cancels (numerator × denominator)
 */
export function OrientationChallenge({ onComplete, onAttempt }: OrientationChallengeProps) {
  const [triedWrong, setTriedWrong] = useState(false);
  const [triedCorrect, setTriedCorrect] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<'wrong' | 'correct' | null>(null);

  const handleTryFactor = (type: 'wrong' | 'correct') => {
    onAttempt();
    setSelectedFactor(type);

    if (type === 'wrong') {
      setTriedWrong(true);
    } else {
      setTriedCorrect(true);
      setTimeout(() => onComplete(), 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Starting value */}
      <div className="text-center p-4 bg-warm-50 rounded-lg">
        <p className="text-sm text-warm-600 mb-2">Við viljum breyta:</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-bold text-blue-600">5 km</span>
          <span className="text-2xl text-warm-400">→</span>
          <span className="text-2xl font-bold text-green-600">? m</span>
        </div>
      </div>

      <p className="text-center text-warm-700">Prófaðu báða stuðla og sjáðu hvað gerist:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Wrong factor */}
        <div
          className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
            selectedFactor === 'wrong'
              ? 'border-red-500 bg-red-50'
              : 'border-warm-200 bg-white hover:border-warm-300'
          }`}
        >
          <div className="flex justify-center mb-4">
            <ConversionFactorBlock
              numeratorValue={1}
              numeratorUnit="km"
              denominatorValue={1000}
              denominatorUnit="m"
              onClick={() => handleTryFactor('wrong')}
              isCorrect={selectedFactor === 'wrong' ? false : null}
              size="medium"
            />
          </div>

          {selectedFactor === 'wrong' && (
            <div className="p-3 bg-red-100 rounded-lg">
              <p className="text-red-800 text-sm font-semibold text-center mb-2">Virkar ekki!</p>
              <div className="flex items-center justify-center gap-1 text-sm mb-2 flex-wrap">
                <span className="font-bold">5</span>
                <span className="text-blue-600 font-bold">km</span>
                <span>×</span>
                <span className="text-blue-600 font-bold">km</span>
                <span>/</span>
                <span className="text-green-600">m</span>
              </div>
              <p className="text-red-600 text-xs text-center">
                <span className="text-blue-600 font-bold">km</span> er í teljara <em>beggja</em> -
                strikast ekki út!
              </p>
              <p className="text-red-500 text-xs text-center mt-1">
                Við fáum km×km/m sem er vitlaust.
              </p>
            </div>
          )}
        </div>

        {/* Correct factor */}
        <div
          className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
            selectedFactor === 'correct'
              ? 'border-green-500 bg-green-50'
              : 'border-warm-200 bg-white hover:border-warm-300'
          }`}
        >
          <div className="flex justify-center mb-4">
            <ConversionFactorBlock
              numeratorValue={1000}
              numeratorUnit="m"
              denominatorValue={1}
              denominatorUnit="km"
              onClick={() => handleTryFactor('correct')}
              isCorrect={selectedFactor === 'correct' ? true : null}
              size="medium"
            />
          </div>

          {selectedFactor === 'correct' && (
            <div className="p-3 bg-green-100 rounded-lg">
              <p className="text-green-800 text-sm font-semibold text-center mb-2">Rétt!</p>
              <div className="flex items-center justify-center gap-1 text-sm mb-2 flex-wrap">
                <span className="font-bold">5</span>
                <span className="text-red-400 line-through">km</span>
                <span>×</span>
                <span className="text-green-600 font-bold">m</span>
                <span>/</span>
                <span className="text-red-400 line-through">km</span>
              </div>
              <p className="text-green-600 text-xs text-center">
                <span className="line-through text-red-400">km</span> strikast út →
                <span className="text-green-600 font-bold"> m</span> verður eftir!
              </p>
              <p className="text-green-700 text-sm text-center mt-2 font-semibold">= 5000 m ✓</p>
            </div>
          )}
        </div>
      </div>

      {triedWrong && !triedCorrect && (
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">Prófaðu hinn stuðulinn!</p>
        </div>
      )}
    </div>
  );
}
