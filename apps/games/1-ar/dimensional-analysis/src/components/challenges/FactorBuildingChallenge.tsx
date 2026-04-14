import { useState, useEffect } from 'react';

interface FactorBuildingChallengeProps {
  onComplete: () => void;
  onAttempt: (isIncorrect?: boolean) => void;
}

const availableBlocks = [
  { value: 1000, unit: 'mL', type: 'volume' },
  { value: 1, unit: 'L', type: 'volume' },
  { value: 500, unit: 'mL', type: 'volume' },
  { value: 0.5, unit: 'L', type: 'volume' },
];

/**
 * C2: Factor Building - Create a conversion factor that equals 1
 *
 * Students click blocks into a fraction to create a factor = 1.
 * Teaches: A conversion factor equals 1 when numerator and denominator
 * represent the SAME quantity (just with different units).
 */
export function FactorBuildingChallenge({ onComplete, onAttempt }: FactorBuildingChallengeProps) {
  const [numerator, setNumerator] = useState<{ value: number; unit: string } | null>(null);
  const [denominator, setDenominator] = useState<{ value: number; unit: string } | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'same_unit' | 'wrong_ratio'>('none');

  useEffect(() => {
    if (numerator && denominator) {
      const numInML = numerator.unit === 'L' ? numerator.value * 1000 : numerator.value;
      const denInML = denominator.unit === 'L' ? denominator.value * 1000 : denominator.value;

      if (numerator.unit === denominator.unit) {
        setErrorType('same_unit');
        setIsCorrect(false);
      } else if (Math.abs(numInML - denInML) < 0.01) {
        setIsCorrect(true);
        setErrorType('none');
        onComplete();
      } else {
        setErrorType('wrong_ratio');
        setIsCorrect(false);
      }
    } else {
      setErrorType('none');
    }
  }, [numerator, denominator, onComplete]);

  const handleBlockClick = (block: { value: number; unit: string; type: string }) => {
    onAttempt();
    if (!numerator) {
      setNumerator(block);
    } else if (!denominator) {
      setDenominator(block);
    } else {
      setNumerator(block);
      setDenominator(null);
      setIsCorrect(false);
      setErrorType('none');
    }
  };

  return (
    <div className="space-y-6">
      {/* Fraction display */}
      <div className="flex flex-col items-center p-6 sm:p-8 bg-warm-50 rounded-xl">
        {/* Numerator slot */}
        <div
          className={`
          min-w-[120px] sm:min-w-[150px] min-h-[50px] sm:min-h-[60px] p-3 sm:p-4 rounded-lg border-2 border-dashed
          flex items-center justify-center text-base sm:text-lg font-bold
          ${numerator ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-warm-100 border-warm-300 text-warm-400'}
        `}
        >
          {numerator ? `${numerator.value} ${numerator.unit}` : 'Teljari'}
        </div>

        {/* Fraction bar */}
        <div className="w-36 sm:w-48 h-1 bg-warm-800 my-2 sm:my-3" />

        {/* Denominator slot */}
        <div
          className={`
          min-w-[120px] sm:min-w-[150px] min-h-[50px] sm:min-h-[60px] p-3 sm:p-4 rounded-lg border-2 border-dashed
          flex items-center justify-center text-base sm:text-lg font-bold
          ${denominator ? 'bg-green-100 border-green-400 text-green-700' : 'bg-warm-100 border-warm-300 text-warm-400'}
        `}
        >
          {denominator ? `${denominator.value} ${denominator.unit}` : 'Nefnari'}
        </div>

        {/* Result */}
        {numerator && denominator && (
          <div
            className={`mt-4 sm:mt-6 text-xl sm:text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
          >
            = {isCorrect ? '1 ✓' : '≠ 1'}
          </div>
        )}
      </div>

      {/* Error explanations */}
      {errorType === 'same_unit' && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
          <p className="text-red-800 font-semibold mb-1">Sömu einingarnar!</p>
          <p className="text-red-600 text-sm">
            {numerator?.value} {numerator?.unit} / {denominator?.value} {denominator?.unit} ={' '}
            {numerator && denominator ? (numerator.value / denominator.value).toFixed(1) : '?'}
          </p>
          <p className="text-red-500 text-xs mt-2">
            Þú þarft <strong>mismunandi</strong> einingar sem tákna sama rúmmál.
          </p>
        </div>
      )}

      {errorType === 'wrong_ratio' && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
          <p className="text-red-800 font-semibold mb-1">Ekki sama rúmmálið!</p>
          <p className="text-red-600 text-sm">
            {numerator?.value} {numerator?.unit} ≠ {denominator?.value} {denominator?.unit}
          </p>
          <p className="text-red-500 text-xs mt-2">
            Mundu: 1000 mL = 1 L. Þetta brot er ekki jafnt 1.
          </p>
        </div>
      )}

      {/* Available blocks */}
      {!isCorrect && (
        <div className="p-4 bg-white rounded-xl border-2 border-warm-200">
          <p className="text-sm text-warm-600 mb-3 text-center">
            Veldu tvær einingar sem tákna <strong>sama rúmmál</strong>:
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {availableBlocks.map((block, idx) => (
              <button
                key={idx}
                onClick={() => handleBlockClick(block)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-colors border-2 text-sm sm:text-base ${
                  (numerator?.value === block.value && numerator?.unit === block.unit) ||
                  (denominator?.value === block.value && denominator?.unit === block.unit)
                    ? 'bg-orange-200 border-orange-400 text-orange-800'
                    : 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200'
                }`}
              >
                {block.value} {block.unit}
              </button>
            ))}
          </div>
          {(numerator || denominator) && (
            <button
              onClick={() => {
                setNumerator(null);
                setDenominator(null);
                setIsCorrect(false);
                setErrorType('none');
              }}
              className="mt-4 w-full text-sm text-warm-500 hover:text-warm-700"
            >
              Byrja upp á nýtt
            </button>
          )}
        </div>
      )}

      {/* Success hint */}
      {isCorrect && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
          <p className="text-green-800">
            <strong>
              {numerator?.value} {numerator?.unit}
            </strong>{' '}
            og{' '}
            <strong>
              {denominator?.value} {denominator?.unit}
            </strong>{' '}
            er sama rúmmálið!
          </p>
          <p className="text-green-600 text-sm mt-1">Þess vegna er brotið = 1</p>
        </div>
      )}
    </div>
  );
}
