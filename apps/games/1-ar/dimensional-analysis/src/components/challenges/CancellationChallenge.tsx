import { useState } from 'react';

import { shuffleArray } from '@shared/utils';

import { UnitBlock, ConversionFactorBlock } from '../UnitBlock';

interface Factor {
  num: number;
  numUnit: string;
  den: number;
  denUnit: string;
  correct: boolean;
}

interface ChainStep {
  label: string;
  factors: Factor[];
  errorMessage: string;
  resultLabel: string;
}

interface CancellationChallengeProps {
  onComplete: () => void;
  onAttempt: (isIncorrect?: boolean) => void;
  /** Challenge variant */
  variant: 'mL-to-L' | 'mg-to-kg' | 'time-chain';
}

// Random starting values for C3
function getRandomStartValue(): number {
  const options = [250, 500, 750, 1500, 2000];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * C3/C5/C6: Cancellation challenges - select the right conversion factor(s)
 *
 * - mL-to-L: Single-step cancellation (C3)
 * - mg-to-kg: Two-step chain mg -> g -> kg (C5)
 * - time-chain: Two-step chain klst -> min -> s (C6)
 */
export function CancellationChallenge({
  onComplete,
  onAttempt,
  variant,
}: CancellationChallengeProps) {
  if (variant === 'mL-to-L') {
    return <SingleStepCancellation onComplete={onComplete} onAttempt={onAttempt} />;
  }
  if (variant === 'mg-to-kg') {
    return (
      <ChainCancellation
        onComplete={onComplete}
        onAttempt={onAttempt}
        steps={mgToKgSteps}
        startBlock={{ value: 5000, unit: 'mg' }}
        finalResult="5000 mg → 5 g → 0.005 kg"
      />
    );
  }
  return (
    <ChainCancellation
      onComplete={onComplete}
      onAttempt={onAttempt}
      steps={timeSteps}
      startBlock={{ value: 1, unit: 'klst' }}
      finalResult="1 klst × (60 mín / 1 klst) × (60 s / 1 mín) = 3600 s"
    />
  );
}

// ---- C3: Single-step mL → L ----

function SingleStepCancellation({
  onComplete,
  onAttempt,
}: {
  onComplete: () => void;
  onAttempt: (isIncorrect?: boolean) => void;
}) {
  const [selectedFactor, setSelectedFactor] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'selecting' | 'cancelling' | 'done'>(
    'selecting'
  );
  const [startValue] = useState(() => getRandomStartValue());
  const [factors] = useState(() =>
    shuffleArray([
      { num: 1000, numUnit: 'mL', den: 1, denUnit: 'L', correct: false },
      { num: 1, numUnit: 'L', den: 1000, denUnit: 'mL', correct: true },
    ])
  );

  const handleFactorSelect = (idx: number) => {
    onAttempt();
    const correct = factors[idx].correct;
    setSelectedFactor(idx);
    setIsCorrect(correct);
    setShowAnimation(true);
    setAnimationPhase('cancelling');

    setTimeout(() => {
      setAnimationPhase('done');
      if (correct) onComplete();
    }, 1500);
  };

  const selectedFactorData = selectedFactor !== null ? factors[selectedFactor] : null;
  const isCancellingPhase = animationPhase === 'cancelling' || animationPhase === 'done';

  return (
    <div className="space-y-6">
      {/* Starting value */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6 bg-warm-50 rounded-xl flex-wrap">
        <div className="text-center">
          <p className="text-sm text-warm-600 mb-2">Byrjunargildi:</p>
          <div className="flex items-center gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">{startValue}</span>
            <span
              className={`text-2xl sm:text-3xl font-bold transition-all duration-500 ${
                isCancellingPhase && isCorrect
                  ? 'text-red-400 line-through opacity-50'
                  : 'text-blue-600'
              }`}
            >
              mL
            </span>
          </div>
        </div>

        <div className="text-2xl sm:text-3xl text-warm-400">×</div>

        {/* Factor slot */}
        <div
          className={`
          min-w-[120px] sm:min-w-[140px] min-h-[70px] sm:min-h-[80px] p-3 sm:p-4 rounded-xl border-2
          flex items-center justify-center transition-all duration-300
          ${
            selectedFactor !== null
              ? isCorrect
                ? 'border-green-500 bg-green-50'
                : showAnimation && !isCorrect
                  ? 'border-red-500 bg-red-50'
                  : 'border-orange-500 bg-orange-50'
              : 'border-dashed border-warm-300 bg-warm-50'
          }
        `}
        >
          {selectedFactorData ? (
            <div className="text-center">
              <div
                className={`font-bold text-sm sm:text-base transition-all duration-500 ${
                  isCancellingPhase && isCorrect && selectedFactorData.numUnit === 'L'
                    ? 'text-green-600 scale-110'
                    : isCancellingPhase && !isCorrect && selectedFactorData.numUnit === 'mL'
                      ? 'text-orange-500'
                      : 'text-blue-600'
                }`}
              >
                {selectedFactorData.num} {selectedFactorData.numUnit}
              </div>
              <div className="w-full h-0.5 bg-warm-800 my-1" />
              <div
                className={`font-bold text-sm sm:text-base transition-all duration-500 ${
                  isCancellingPhase && isCorrect && selectedFactorData.denUnit === 'mL'
                    ? 'text-red-400 line-through opacity-50'
                    : isCancellingPhase && !isCorrect && selectedFactorData.denUnit === 'L'
                      ? 'text-orange-500'
                      : 'text-green-600'
                }`}
              >
                {selectedFactorData.den} {selectedFactorData.denUnit}
              </div>
            </div>
          ) : (
            <span className="text-warm-400 text-sm">Veldu stuðul</span>
          )}
        </div>

        <div className="text-2xl sm:text-3xl text-warm-400">=</div>

        {/* Result */}
        <div className="text-center min-w-[80px]">
          <p className="text-sm text-warm-600 mb-2">Útkoma:</p>
          {showAnimation && animationPhase === 'done' && (
            <div
              className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-lg sm:text-xl ${
                isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isCorrect ? `${startValue / 1000} L` : 'Villa!'}
            </div>
          )}
          {showAnimation && animationPhase === 'cancelling' && (
            <div className="px-3 sm:px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 font-bold animate-pulse">
              ...
            </div>
          )}
        </div>
      </div>

      {/* Cancellation explanation */}
      {animationPhase === 'done' && isCorrect && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-red-400 line-through">mL</span>
            <span className="text-warm-600">og</span>
            <span className="text-red-400 line-through">mL</span>
            <span className="text-warm-600">strikast út →</span>
            <span className="text-green-600 font-bold text-lg">L</span>
            <span className="text-warm-600">verður eftir!</span>
          </div>
          <p className="text-green-700 text-center text-sm">
            {startValue} <span className="line-through text-red-400">mL</span> × (1{' '}
            <span className="text-green-600 font-bold">L</span> / 1000{' '}
            <span className="line-through text-red-400">mL</span>) = {startValue / 1000} L
          </p>
        </div>
      )}

      {/* Error explanation */}
      {animationPhase === 'done' && !isCorrect && selectedFactor !== null && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
          <p className="text-red-800 mb-2">
            <strong>mL</strong> er í teljara <em>beggja</em> - ekkert strikast út!
          </p>
          <p className="text-red-600 text-sm mb-3">
            Til að strika út einingu þarf hún að vera í teljara annarsvegar og nefnara hinsvegar.
          </p>
          <button
            onClick={() => {
              setSelectedFactor(null);
              setShowAnimation(false);
              setIsCorrect(false);
              setAnimationPhase('selecting');
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
          >
            Reyna aftur
          </button>
        </div>
      )}

      {/* Factor options */}
      {animationPhase === 'selecting' && (
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          {factors.map((factor, idx) => (
            <ConversionFactorBlock
              key={idx}
              numeratorValue={factor.num}
              numeratorUnit={factor.numUnit}
              denominatorValue={factor.den}
              denominatorUnit={factor.denUnit}
              onClick={() => handleFactorSelect(idx)}
              size="large"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- C5 & C6: Two-step chain conversions ----

const mgToKgSteps: ChainStep[] = [
  {
    label: 'Skref 1: Breyta mg í g',
    factors: [
      { num: 1, numUnit: 'g', den: 1000, denUnit: 'mg', correct: true },
      { num: 1000, numUnit: 'mg', den: 1, denUnit: 'g', correct: false },
    ],
    errorMessage: 'mg þarf að vera í nefnara til að strikast út!',
    resultLabel: '5 g',
  },
  {
    label: 'Skref 2: Breyta g í kg',
    factors: [
      { num: 1, numUnit: 'kg', den: 1000, denUnit: 'g', correct: true },
      { num: 1000, numUnit: 'g', den: 1, denUnit: 'kg', correct: false },
    ],
    errorMessage: 'g þarf að vera í nefnara til að strikast út!',
    resultLabel: '0.005 kg',
  },
];

const timeSteps: ChainStep[] = [
  {
    label: 'Skref 1: Breyta klukkustund í mínútur',
    factors: [
      { num: 60, numUnit: 'mín', den: 1, denUnit: 'klst', correct: true },
      { num: 1, numUnit: 'klst', den: 60, denUnit: 'mín', correct: false },
    ],
    errorMessage: 'klst þarf að vera í nefnara til að strikast út!',
    resultLabel: '60 mín',
  },
  {
    label: 'Skref 2: Breyta mínútum í sekúndur',
    factors: [
      { num: 60, numUnit: 's', den: 1, denUnit: 'mín', correct: true },
      { num: 1, numUnit: 'mín', den: 60, denUnit: 's', correct: false },
    ],
    errorMessage: 'mín þarf að vera í nefnara til að strikast út!',
    resultLabel: '3600 s',
  },
];

function ChainCancellation({
  onComplete,
  onAttempt,
  steps,
  startBlock,
  finalResult,
}: {
  onComplete: () => void;
  onAttempt: (isIncorrect?: boolean) => void;
  steps: ChainStep[];
  startBlock: { value: number; unit: string };
  finalResult: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsDone, setStepsDone] = useState<boolean[]>(steps.map(() => false));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    onAttempt();
    setSelectedIdx(idx);
    const factor = steps[currentStep].factors[idx];
    if (factor.correct) {
      setTimeout(() => {
        const newDone = [...stepsDone];
        newDone[currentStep] = true;
        setStepsDone(newDone);
        setSelectedIdx(null);

        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          onComplete();
        }
      }, 800);
    }
  };

  const allDone = stepsDone.every(Boolean);

  return (
    <div className="space-y-6">
      {/* Chain display */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-warm-50 rounded-xl flex-wrap">
        <UnitBlock value={startBlock.value} unit={startBlock.unit} color="blue" size="medium" />
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl text-warm-400">→</span>
            <div
              className={`px-3 sm:px-4 py-2 rounded-lg border-2 min-w-[60px] text-center transition-all duration-300 ${
                stepsDone[i] ? 'bg-green-100 border-green-400' : 'bg-white border-warm-300'
              }`}
            >
              <span className="font-bold text-sm sm:text-base">
                {stepsDone[i] ? step.resultLabel : '?'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Active step */}
      {!allDone && (
        <div className={`p-4 rounded-lg ${currentStep === 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
          <p
            className={`font-semibold mb-3 text-sm sm:text-base ${currentStep === 0 ? 'text-blue-800' : 'text-yellow-800'}`}
          >
            {steps[currentStep].label}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            {steps[currentStep].factors.map((factor, idx) => (
              <ConversionFactorBlock
                key={idx}
                numeratorValue={factor.num}
                numeratorUnit={factor.numUnit}
                denominatorValue={factor.den}
                denominatorUnit={factor.denUnit}
                onClick={() => handleSelect(idx)}
                isCorrect={selectedIdx === idx ? factor.correct : null}
              />
            ))}
          </div>
          {selectedIdx !== null && !steps[currentStep].factors[selectedIdx].correct && (
            <p className="text-red-600 text-sm mt-3 text-center">
              {steps[currentStep].errorMessage}
            </p>
          )}
        </div>
      )}

      {/* Step 1 success feedback for time chain */}
      {stepsDone[0] && !stepsDone[1] && (
        <div className="p-3 bg-green-100 rounded-lg text-center">
          <p className="text-green-800 text-sm">
            ✓ {steps[0].factors[0].denUnit} strikast út! Nú eru eftir {steps[0].resultLabel}.
          </p>
        </div>
      )}

      {/* Final success */}
      {allDone && (
        <div className="p-4 bg-green-100 rounded-lg text-center">
          <p className="text-green-800 font-semibold mb-2">Keðjan virkaði!</p>
          <p className="text-green-700 text-sm">{finalResult}</p>
        </div>
      )}
    </div>
  );
}
