import { useState, useEffect, useMemo } from 'react';
import { UnitBlock, ConversionFactorBlock, EquivalenceDisplay } from './UnitBlock';
import type { TieredHints } from '@shared/types';

interface Level1Progress {
  questionsAnswered: number;
  questionsCorrect: number;
  explanationsProvided: number;
  explanationScores: number[];
  mastered: boolean;
}

interface Level1Props {
  onComplete: (progress: Level1Progress, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  initialProgress?: Level1Progress;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

// Challenge definitions - visual, conceptual challenges
interface Challenge {
  id: string;
  type: 'equivalence' | 'factor_building' | 'cancellation' | 'orientation';
  title: string;
  instruction: string;
  hints: TieredHints;
}

const challenges: Challenge[] = [
  {
    id: 'C1',
    type: 'equivalence',
    title: 'Jafngildi eininga',
    instruction: 'Finndu hversu margir LÍTRAR jafngilda 1000 mL. Notaðu takkana til að stilla.',
    hints: {
      topic: 'Þetta snýst um jafngildi milli mismunandi einingakerfa.',
      strategy: 'Hugsaðu um hvernig mismunandi tölur geta táknað sama rúmmál.',
      method: 'Mundu: 1 L = 1000 mL. Lítrar og millilítrar mæla sama rúmmál.',
      solution: '1000 mL = 1 L. Stilltu á 1 lítra.'
    }
  },
  {
    id: 'C2',
    type: 'factor_building',
    title: 'Byggja umbreytingarstuðul',
    instruction: 'Dragðu einingar í brotið til að búa til stuðul sem jafngildir 1.',
    hints: {
      topic: 'Þetta snýst um umbreytingarstuðla og hvernig þeir virka.',
      strategy: 'Stuðull jafngildir 1 þegar teljari og nefnari tákna sama magn.',
      method: 'Veldu tvær einingar sem tákna nákvæmlega sama rúmmál.',
      solution: '1000 mL / 1 L = 1 eða 1 L / 1000 mL = 1'
    }
  },
  {
    id: 'C3',
    type: 'cancellation',
    title: 'Strikun eininga',
    instruction: 'Veldu réttan stuðul til að breyta mL í L. Horfðu á hvernig einingarnar strikast út!',
    hints: {
      topic: 'Þetta snýst um strikun eininga í einingagreiningu.',
      strategy: 'Einingin sem þú vilt losna við þarf að vera í nefnara stuðulsins.',
      method: 'mL í byrjunargildi þarf að para við mL í nefnara stuðulsins.',
      solution: 'Veldu (1 L / 1000 mL) þar sem mL er í nefnara og strikast út.'
    }
  },
  {
    id: 'C4',
    type: 'orientation',
    title: 'Snúningur stuðuls',
    instruction: 'Prófaðu báða stuðla. Hver virkar til að breyta km í m?',
    hints: {
      topic: 'Þetta snýst um stefnu umbreytingarstuðla.',
      strategy: 'Einingin sem á að hverfa þarf að vera í nefnara.',
      method: 'km er í byrjunargildi, svo km þarf að vera í nefnara stuðulsins.',
      solution: 'Veldu (1000 m / 1 km) þar sem km í nefnara strikast út með km í teljara.'
    }
  },
  {
    id: 'C5',
    type: 'cancellation',
    title: 'Keðjubreyting',
    instruction: 'Notaðu tvo stuðla til að breyta mg í kg.',
    hints: {
      topic: 'Þetta snýst um keðjubreytingar með mörgum stuðlum.',
      strategy: 'Fyrst mg → g, síðan g → kg. Fylgstu með hvernig einingarnar hverfa.',
      method: 'Í hverju skrefi þarf einingin sem á að hverfa að vera í nefnara.',
      solution: 'Skref 1: (1 g / 1000 mg), Skref 2: (1 kg / 1000 g)'
    }
  },
  {
    id: 'C6',
    type: 'cancellation',
    title: 'Keðjubreyting - Tími',
    instruction: 'Byggðu keðjuna til að breyta 1 klukkustund í sekúndur. Veldu rétta stuðla!',
    hints: {
      topic: 'Þetta snýst um keðjubreytingar með tímaeiningum.',
      strategy: 'Byrjaðu með klst → mín, síðan mín → s. Einingin sem á að hverfa fer í nefnara.',
      method: 'klst strikast út með klst í nefnara, mín strikast út með mín í nefnara.',
      solution: 'Skref 1: (60 mín / 1 klst), Skref 2: (60 s / 1 mín)'
    }
  }
];

// Random starting values to prevent memorization
function getRandomStartValue(): number {
  const options = [250, 500, 750, 1500, 2000];
  return options[Math.floor(Math.random() * options.length)];
}

// Shuffle factor order to prevent memorization
function shuffleFactors<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Pre-generated confetti colors
const CONFETTI_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#eab308', '#ec4899'];

/**
 * Memoized confetti particles component to prevent style recalculation on re-render
 */
function ConfettiParticles() {
  const styles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: '-10px',
      backgroundColor: CONFETTI_COLORS[i % 5],
      animationDelay: `${Math.random() * 0.5}s`,
      animationDuration: `${1 + Math.random()}s`
    })),
    [] // Only compute once on mount
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {styles.map((style, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={style}
        />
      ))}
    </div>
  );
}

/**
 * Level 1 Conceptual - Visual learning with NO calculations
 * Students manipulate visual elements to understand dimensional analysis concepts
 */
export function Level1Conceptual({ onComplete, onBack, initialProgress, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(
    initialProgress?.questionsAnswered || 0
  );
  const [progress, setProgress] = useState<Level1Progress>(
    initialProgress || {
      questionsAnswered: 0,
      questionsCorrect: 0,
      explanationsProvided: 0,
      explanationScores: [],
      mastered: false
    }
  );

  const [showSuccess, setShowSuccess] = useState(false);
  const [showIntro, setShowIntro] = useState(!initialProgress?.questionsAnswered);
  const [showSummary, setShowSummary] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintTier, setHintTier] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallengeIndex];

  // Reset state when challenge changes
  useEffect(() => {
    setShowSuccess(false);
    setHintTier(0);
    setShowHint(false);
    setAttempts(0);
  }, [currentChallengeIndex]);

  const handleSuccess = () => {
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setShowSuccess(true);
    }, 1200);

    // Track correct answer for achievements
    onCorrectAnswer?.();

    const newProgress = {
      ...progress,
      questionsAnswered: progress.questionsAnswered + 1,
      questionsCorrect: progress.questionsCorrect + 1
    };
    setProgress(newProgress);
  };

  const handleContinue = () => {
    const newProgress = { ...progress };

    // Check mastery after 6 challenges
    if (newProgress.questionsAnswered >= 6) {
      newProgress.mastered = newProgress.questionsCorrect >= 5;
    }

    setProgress(newProgress);

    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
    } else {
      // Show summary before completing
      setShowSummary(true);
    }
  };

  const handleCompleteSummary = () => {
    // Max score is 100 per challenge x 6 challenges = 600
    onComplete(progress, 600, totalHintsUsed);
  };

  const handleAttempt = (isIncorrect: boolean = false) => {
    setAttempts(attempts + 1);
    if (attempts >= 2 && !showHint) {
      setShowHint(true);
      setTotalHintsUsed(prev => prev + 1);
    }
    // Track incorrect attempt for achievements
    if (isIncorrect) {
      onIncorrectAnswer?.();
    }
  };

  if (!challenge && !showSummary) return null;

  // Intro Tutorial Screen
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔬</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Velkomin í Einingagreiningu!</h1>
              <p className="text-lg text-gray-600">Stig 1: Hugtök</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                <span className="text-2xl">👆</span>
                <div>
                  <p className="font-semibold text-green-800">Engar útreikninga!</p>
                  <p className="text-green-700 text-sm">Þú lærir með því að prófa og sjá hvað gerist.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-semibold text-blue-800">6 áskoranir</p>
                  <p className="text-blue-700 text-sm">Hver áskorun kennir þér nýtt hugtak um umbreytingar.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-semibold text-yellow-800">Vísbendingar birtast</p>
                  <p className="text-yellow-700 text-sm">Ef þú reynir nokkrum sinnum birtist hjálp.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Byrja! →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Summary Screen
  if (showSummary) {
    const mastered = progress.questionsCorrect >= 5;
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{mastered ? '🎉' : '📚'}</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {mastered ? 'Frábært!' : 'Vel gert!'}
              </h1>
              <p className="text-lg text-gray-600">
                Þú svaraðir {progress.questionsCorrect} af {challenges.length} rétt
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Hvað þú lærðir:</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 text-xl">✓</span>
                  <p className="text-green-800">Mismunandi tölur með mismunandi einingum geta táknað <strong>sama magn</strong></p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 text-xl">✓</span>
                  <p className="text-green-800">Umbreytingarstuðlar <strong>jafngilda 1</strong> - þeir breyta ekki magninu</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 text-xl">✓</span>
                  <p className="text-green-800">Eins einingar <strong>strikast út</strong> (teljari og nefnari)</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 text-xl">✓</span>
                  <p className="text-green-800">Einingin sem á að hverfa þarf að vera í <strong>nefnara</strong></p>
                </div>
              </div>
            </div>

            {mastered ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-blue-800 font-semibold">Stig 2 er nú opið!</p>
                  <p className="text-blue-600 text-sm">Þar munt þú nota þessi hugtök til að spá fyrir um niðurstöður.</p>
                </div>
                <button
                  onClick={handleCompleteSummary}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
                >
                  Halda áfram →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-yellow-800 font-semibold">Þú þarft 5 af 6 til að opna Stig 2</p>
                  <p className="text-yellow-600 text-sm">Reyndu aftur til að styrkja skilninginn!</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentChallengeIndex(0);
                    setShowSummary(false);
                    setProgress({
                      questionsAnswered: 0,
                      questionsCorrect: 0,
                      explanationsProvided: 0,
                      explanationScores: [],
                      mastered: false
                    });
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-colors"
                >
                  Reyna aftur
                </button>
                <button
                  onClick={handleCompleteSummary}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Til baka í valmynd
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <div className="text-4xl font-bold text-green-600 animate-pulse">Rétt!</div>
          </div>
          {/* Confetti particles - styles memoized to prevent recalculation on re-render */}
          <ConfettiParticles />
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 text-lg"
          >
            ← Til baka
          </button>
          <div className="text-sm text-gray-600 flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
              Stig 1: Hugtök
            </span>
            <span>Áskorun {currentChallengeIndex + 1} / {challenges.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentChallengeIndex) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main challenge card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{challenge.title}</h2>
          <p className="text-lg text-gray-600 mb-6">{challenge.instruction}</p>

          {/* Challenge content - rendered based on type */}
          <div className="mb-6">
            {challenge.type === 'equivalence' && challenge.id === 'C1' && (
              <EquivalenceChallenge1 onSuccess={handleSuccess} onAttempt={handleAttempt} />
            )}
            {challenge.type === 'factor_building' && (
              <FactorBuildingChallenge onSuccess={handleSuccess} onAttempt={handleAttempt} />
            )}
            {challenge.type === 'cancellation' && challenge.id === 'C3' && (
              <CancellationChallenge1 onSuccess={handleSuccess} onAttempt={handleAttempt} />
            )}
            {challenge.type === 'orientation' && (
              <OrientationChallenge onSuccess={handleSuccess} onAttempt={handleAttempt} />
            )}
            {challenge.type === 'cancellation' && challenge.id === 'C5' && (
              <ChainConversionChallenge onSuccess={handleSuccess} onAttempt={handleAttempt} />
            )}
            {challenge.type === 'cancellation' && challenge.id === 'C6' && (
              <TimeEquivalenceChallenge onSuccess={handleSuccess} onAttempt={handleAttempt} />
            )}
          </div>

          {/* Hint */}
          {showHint && challenge.hints && !showSuccess && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm font-semibold text-blue-800 mb-1">Vísbending {hintTier + 1}:</p>
              <p className="text-blue-700">
                {hintTier === 0 && challenge.hints.topic}
                {hintTier === 1 && challenge.hints.strategy}
                {hintTier === 2 && challenge.hints.method}
                {hintTier >= 3 && challenge.hints.solution}
              </p>
              {hintTier < 3 && (
                <button
                  onClick={() => {
                    setHintTier(prev => prev + 1);
                    setTotalHintsUsed(prev => prev + 1);
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Fá meiri hjálp
                </button>
              )}
            </div>
          )}

          {/* Success message */}
          {showSuccess && (
            <div className="mb-6 p-6 bg-green-100 rounded-xl border-2 border-green-300">
              <h3 className="text-xl font-bold text-green-800 mb-2">Rétt!</h3>
              <p className="text-green-700 mb-4">
                {challenge.type === 'equivalence' && 'Þú skildir að mismunandi tölur með mismunandi einingum geta táknað sama magn!'}
                {challenge.type === 'factor_building' && 'Þú bjóst til stuðul sem jafngildir 1 - lykilhugtak í einingagreiningu!'}
                {challenge.type === 'cancellation' && 'Þú sást hvernig einingarnar strikast út þegar þær eru eins!'}
                {challenge.type === 'orientation' && 'Þú lærðir að einingin sem á að hverfa þarf að vera í nefnara!'}
              </p>
              <button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors"
              >
                {currentChallengeIndex < challenges.length - 1 ? 'Næsta áskorun →' : 'Ljúka stigi'}
              </button>
            </div>
          )}
        </div>

        {/* Conceptual reminder */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          Stig 1 snýst um að <strong>skilja hugtökin</strong> - engar útreikninga!
        </div>
      </div>
    </div>
  );
}

// ==================== Individual Challenge Components ====================

interface ChallengeComponentProps {
  onSuccess: () => void;
  onAttempt: (isIncorrect?: boolean) => void;
}

/**
 * Challenge 1: Unit Equivalence - Find how many L equals 1000 mL
 *
 * Simplified design: Students adjust ONLY the L value to match 1000 mL.
 * This teaches: "Different numbers with different units = same amount"
 */
function EquivalenceChallenge1({ onSuccess, onAttempt }: ChallengeComponentProps) {
  const [rightValue, setRightValue] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  // Left side: 1000 mL = 1000 mL (in base units)
  // Right side: rightValue L = rightValue * 1000 mL (in base units)
  const leftVolumeInML = 1000;
  const rightVolumeInML = rightValue * 1000;

  useEffect(() => {
    // Correct when rightValue = 1 (meaning 1 L = 1000 mL)
    const correct = rightValue === 1;
    setIsCorrect(correct);
    if (correct && hasAttempted) {
      onSuccess();
    }
  }, [rightValue, hasAttempted, onSuccess]);

  const adjustValue = (delta: number) => {
    onAttempt();
    setHasAttempted(true);
    const newValue = Math.max(0, rightValue + delta);
    setRightValue(Number(newValue.toFixed(1)));
  };

  // Determine which side is heavier for scale tilt
  const comparison = rightVolumeInML - leftVolumeInML; // positive = right heavier

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
        <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl">
          <p className="text-gray-700 font-semibold">Hversu margir lítrar jafngilda 1000 mL?</p>

          {/* Current value display */}
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-green-700">
              {rightValue}
            </span>
            <span className="text-2xl font-bold text-green-600">L</span>
          </div>

          {/* Hint about direction */}
          {hasAttempted && !isCorrect && (
            <p className="text-sm text-gray-500">
              {comparison < 0 ? '↑ Þú þarft meira' : comparison > 0 ? '↓ Þú þarft minna' : ''}
            </p>
          )}

          {/* Value adjuster - appropriate increments for Liters */}
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

/**
 * Challenge 2: Factor Building - Create a conversion factor that equals 1
 *
 * Students learn that a conversion factor equals 1 when numerator and denominator
 * represent the SAME quantity (just with different units).
 */
function FactorBuildingChallenge({ onSuccess, onAttempt }: ChallengeComponentProps) {
  const [numerator, setNumerator] = useState<{ value: number; unit: string } | null>(null);
  const [denominator, setDenominator] = useState<{ value: number; unit: string } | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'same_unit' | 'different_type' | 'wrong_ratio'>('none');

  // Simplified: only mL/L to focus on one concept
  const availableBlocks = [
    { value: 1000, unit: 'mL', type: 'volume' },
    { value: 1, unit: 'L', type: 'volume' },
    { value: 500, unit: 'mL', type: 'volume' },
    { value: 0.5, unit: 'L', type: 'volume' }
  ];

  useEffect(() => {
    if (numerator && denominator) {
      // Check if they represent the same amount (in mL)
      const numInML = numerator.unit === 'L' ? numerator.value * 1000 : numerator.value;
      const denInML = denominator.unit === 'L' ? denominator.value * 1000 : denominator.value;

      // Check for errors
      if (numerator.unit === denominator.unit) {
        setErrorType('same_unit');
        setIsCorrect(false);
      } else if (Math.abs(numInML - denInML) < 0.01) {
        // Correct! Same quantity
        setIsCorrect(true);
        setErrorType('none');
        onSuccess();
      } else {
        setErrorType('wrong_ratio');
        setIsCorrect(false);
      }
    } else {
      setErrorType('none');
    }
  }, [numerator, denominator, onSuccess]);

  const handleBlockClick = (block: { value: number; unit: string; type: string }) => {
    onAttempt();
    if (!numerator) {
      setNumerator(block);
    } else if (!denominator) {
      setDenominator(block);
    } else {
      // Reset
      setNumerator(block);
      setDenominator(null);
      setIsCorrect(false);
      setErrorType('none');
    }
  };

  return (
    <div className="space-y-6">
      {/* Fraction display */}
      <div className="flex flex-col items-center p-6 sm:p-8 bg-gray-50 rounded-xl">
        {/* Numerator slot */}
        <div className={`
          min-w-[120px] sm:min-w-[150px] min-h-[50px] sm:min-h-[60px] p-3 sm:p-4 rounded-lg border-2 border-dashed
          flex items-center justify-center text-base sm:text-lg font-bold
          ${numerator ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-400'}
        `}>
          {numerator ? `${numerator.value} ${numerator.unit}` : 'Teljari'}
        </div>

        {/* Fraction bar */}
        <div className="w-36 sm:w-48 h-1 bg-gray-800 my-2 sm:my-3" />

        {/* Denominator slot */}
        <div className={`
          min-w-[120px] sm:min-w-[150px] min-h-[50px] sm:min-h-[60px] p-3 sm:p-4 rounded-lg border-2 border-dashed
          flex items-center justify-center text-base sm:text-lg font-bold
          ${denominator ? 'bg-green-100 border-green-400 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-400'}
        `}>
          {denominator ? `${denominator.value} ${denominator.unit}` : 'Nefnari'}
        </div>

        {/* Result */}
        {numerator && denominator && (
          <div className={`mt-4 sm:mt-6 text-xl sm:text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            = {isCorrect ? '1 ✓' : '≠ 1'}
          </div>
        )}
      </div>

      {/* Error explanations */}
      {errorType === 'same_unit' && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
          <p className="text-red-800 font-semibold mb-1">Sömu einingarnar!</p>
          <p className="text-red-600 text-sm">
            {numerator?.value} {numerator?.unit} / {denominator?.value} {denominator?.unit} = {numerator && denominator ? (numerator.value / denominator.value).toFixed(1) : '?'}
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
        <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-3 text-center">Veldu tvær einingar sem tákna <strong>sama rúmmál</strong>:</p>
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
              onClick={() => { setNumerator(null); setDenominator(null); setIsCorrect(false); setErrorType('none'); }}
              className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
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
            <strong>{numerator?.value} {numerator?.unit}</strong> og <strong>{denominator?.value} {denominator?.unit}</strong> er sama rúmmálið!
          </p>
          <p className="text-green-600 text-sm mt-1">
            Þess vegna er brotið = 1
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Challenge 3: Unit Cancellation - Select factor to convert mL to L
 *
 * Visual feedback shows:
 * - The mL units (starting value + denominator) get strikethrough
 * - The L unit (numerator) stays highlighted as the result
 */
function CancellationChallenge1({ onSuccess, onAttempt }: ChallengeComponentProps) {
  const [selectedFactor, setSelectedFactor] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'selecting' | 'cancelling' | 'done'>('selecting');
  const [startValue] = useState(() => getRandomStartValue());
  const [factors] = useState(() => shuffleFactors([
    { num: 1000, numUnit: 'mL', den: 1, denUnit: 'L', correct: false },
    { num: 1, numUnit: 'L', den: 1000, denUnit: 'mL', correct: true }
  ]));

  const handleFactorSelect = (idx: number) => {
    onAttempt();
    const correct = factors[idx].correct; // Determine immediately
    setSelectedFactor(idx);
    setIsCorrect(correct); // Set immediately so animation shows correctly
    setShowAnimation(true);
    setAnimationPhase('cancelling');

    // After animation, show result and trigger success
    setTimeout(() => {
      setAnimationPhase('done');
      if (correct) {
        onSuccess();
      }
    }, 1500);
  };

  // For correct factor (1 L / 1000 mL):
  // - Starting mL cancels with denominator mL
  // - Numerator L becomes the result
  const selectedFactorData = selectedFactor !== null ? factors[selectedFactor] : null;
  const isCancellingPhase = animationPhase === 'cancelling' || animationPhase === 'done';

  return (
    <div className="space-y-6">
      {/* Starting value */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 rounded-xl flex-wrap">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Byrjunargildi:</p>
          <div className="flex items-center gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">{startValue}</span>
            {/* Starting mL - gets strikethrough when correct factor selected */}
            <span className={`text-2xl sm:text-3xl font-bold transition-all duration-500 ${
              isCancellingPhase && isCorrect
                ? 'text-red-400 line-through opacity-50'
                : 'text-blue-600'
            }`}>
              mL
            </span>
          </div>
        </div>

        <div className="text-2xl sm:text-3xl text-gray-400">×</div>

        {/* Factor slot */}
        <div className={`
          min-w-[120px] sm:min-w-[140px] min-h-[70px] sm:min-h-[80px] p-3 sm:p-4 rounded-xl border-2
          flex items-center justify-center transition-all duration-300
          ${selectedFactor !== null
            ? (isCorrect ? 'border-green-500 bg-green-50' : (showAnimation && !isCorrect ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'))
            : 'border-dashed border-gray-300 bg-gray-50'
          }
        `}>
          {selectedFactorData ? (
            <div className="text-center">
              {/* Numerator - L stays visible and highlighted when correct */}
              <div className={`font-bold text-sm sm:text-base transition-all duration-500 ${
                isCancellingPhase && isCorrect && selectedFactorData.numUnit === 'L'
                  ? 'text-green-600 scale-110' // L stays, gets highlighted
                  : isCancellingPhase && !isCorrect && selectedFactorData.numUnit === 'mL'
                  ? 'text-orange-500' // Wrong: mL in numerator doesn't cancel
                  : 'text-blue-600'
              }`}>
                {selectedFactorData.num} {selectedFactorData.numUnit}
              </div>
              <div className="w-full h-0.5 bg-gray-800 my-1" />
              {/* Denominator - mL gets strikethrough when correct */}
              <div className={`font-bold text-sm sm:text-base transition-all duration-500 ${
                isCancellingPhase && isCorrect && selectedFactorData.denUnit === 'mL'
                  ? 'text-red-400 line-through opacity-50' // mL cancels
                  : isCancellingPhase && !isCorrect && selectedFactorData.denUnit === 'L'
                  ? 'text-orange-500' // Wrong: L in denominator
                  : 'text-green-600'
              }`}>
                {selectedFactorData.den} {selectedFactorData.denUnit}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Veldu stuðul</span>
          )}
        </div>

        <div className="text-2xl sm:text-3xl text-gray-400">=</div>

        {/* Result */}
        <div className="text-center min-w-[80px]">
          <p className="text-sm text-gray-600 mb-2">Útkoma:</p>
          {showAnimation && animationPhase === 'done' && (
            <div className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-lg sm:text-xl ${
              isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
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

      {/* Cancellation explanation - only show when correct */}
      {animationPhase === 'done' && isCorrect && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-red-400 line-through">mL</span>
            <span className="text-gray-600">og</span>
            <span className="text-red-400 line-through">mL</span>
            <span className="text-gray-600">strikast út →</span>
            <span className="text-green-600 font-bold text-lg">L</span>
            <span className="text-gray-600">verður eftir!</span>
          </div>
          <p className="text-green-700 text-center text-sm">
            {startValue} <span className="line-through text-red-400">mL</span> × (1 <span className="text-green-600 font-bold">L</span> / 1000 <span className="line-through text-red-400">mL</span>) = {startValue / 1000} L
          </p>
        </div>
      )}

      {/* Error explanation - only show when wrong */}
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

      {/* Factor options - only show when selecting */}
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

/**
 * Challenge 4: Orientation - Try both factor orientations
 *
 * Shows visually what happens with each orientation:
 * - Wrong: km doesn't cancel (both in numerator)
 * - Correct: km cancels (numerator × denominator)
 */
function OrientationChallenge({ onSuccess, onAttempt }: ChallengeComponentProps) {
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
      setTimeout(() => onSuccess(), 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Starting value with visual */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Við viljum breyta:</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-bold text-blue-600">5 km</span>
          <span className="text-2xl text-gray-400">→</span>
          <span className="text-2xl font-bold text-green-600">? m</span>
        </div>
      </div>

      <p className="text-center text-gray-700">Prófaðu báða stuðla og sjáðu hvað gerist:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Wrong factor */}
        <div className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
          selectedFactor === 'wrong' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}>
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
              {/* Visual showing the problem */}
              <div className="flex items-center justify-center gap-1 text-sm mb-2 flex-wrap">
                <span className="font-bold">5</span>
                <span className="text-blue-600 font-bold">km</span>
                <span>×</span>
                <span className="text-blue-600 font-bold">km</span>
                <span>/</span>
                <span className="text-green-600">m</span>
              </div>
              <p className="text-red-600 text-xs text-center">
                <span className="text-blue-600 font-bold">km</span> er í teljara <em>beggja</em> - strikast ekki út!
              </p>
              <p className="text-red-500 text-xs text-center mt-1">
                Við fáum km×km/m sem er vitlaust.
              </p>
            </div>
          )}
        </div>

        {/* Correct factor */}
        <div className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
          selectedFactor === 'correct' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}>
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
              {/* Visual showing cancellation */}
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
              <p className="text-green-700 text-sm text-center mt-2 font-semibold">
                = 5000 m ✓
              </p>
            </div>
          )}
        </div>
      </div>

      {triedWrong && !triedCorrect && (
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">👆 Prófaðu hinn stuðulinn!</p>
        </div>
      )}
    </div>
  );
}

/**
 * Challenge 5: Chain Conversion - mg to kg
 */
function ChainConversionChallenge({ onSuccess, onAttempt }: ChallengeComponentProps) {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [selectedStep1, setSelectedStep1] = useState<number | null>(null);
  const [selectedStep2, setSelectedStep2] = useState<number | null>(null);

  const step1Factors = [
    { num: 1, numUnit: 'g', den: 1000, denUnit: 'mg', correct: true },
    { num: 1000, numUnit: 'mg', den: 1, denUnit: 'g', correct: false }
  ];

  const step2Factors = [
    { num: 1, numUnit: 'kg', den: 1000, denUnit: 'g', correct: true },
    { num: 1000, numUnit: 'g', den: 1, denUnit: 'kg', correct: false }
  ];

  const handleStep1 = (idx: number) => {
    onAttempt();
    setSelectedStep1(idx);
    if (step1Factors[idx].correct) {
      setTimeout(() => setStep1Done(true), 800);
    }
  };

  const handleStep2 = (idx: number) => {
    onAttempt();
    setSelectedStep2(idx);
    if (step2Factors[idx].correct) {
      setTimeout(() => {
        setStep2Done(true);
        onSuccess();
      }, 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chain display */}
      <div className="flex items-center justify-center gap-3 p-6 bg-gray-50 rounded-xl flex-wrap">
        <UnitBlock value={5000} unit="mg" color="blue" size="medium" />
        <span className="text-2xl text-gray-400">→</span>

        <div className={`px-4 py-2 rounded-lg border-2 ${step1Done ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300'}`}>
          {step1Done ? '5 g' : '?'}
        </div>

        <span className="text-2xl text-gray-400">→</span>

        <div className={`px-4 py-2 rounded-lg border-2 ${step2Done ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300'}`}>
          {step2Done ? '0.005 kg' : '?'}
        </div>
      </div>

      {/* Step 1 */}
      {!step1Done && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-800 mb-3">Skref 1: Breyta mg í g</p>
          <div className="flex justify-center gap-4">
            {step1Factors.map((factor, idx) => (
              <ConversionFactorBlock
                key={idx}
                numeratorValue={factor.num}
                numeratorUnit={factor.numUnit}
                denominatorValue={factor.den}
                denominatorUnit={factor.denUnit}
                onClick={() => handleStep1(idx)}
                isCorrect={selectedStep1 === idx ? factor.correct : null}
              />
            ))}
          </div>
          {selectedStep1 !== null && !step1Factors[selectedStep1].correct && (
            <p className="text-red-600 text-sm mt-2 text-center">mg þarf að vera í nefnara til að strikast út!</p>
          )}
        </div>
      )}

      {/* Step 2 */}
      {step1Done && !step2Done && (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="font-semibold text-green-800 mb-3">Skref 2: Breyta g í kg</p>
          <div className="flex justify-center gap-4">
            {step2Factors.map((factor, idx) => (
              <ConversionFactorBlock
                key={idx}
                numeratorValue={factor.num}
                numeratorUnit={factor.numUnit}
                denominatorValue={factor.den}
                denominatorUnit={factor.denUnit}
                onClick={() => handleStep2(idx)}
                isCorrect={selectedStep2 === idx ? factor.correct : null}
              />
            ))}
          </div>
          {selectedStep2 !== null && !step2Factors[selectedStep2].correct && (
            <p className="text-red-600 text-sm mt-2 text-center">g þarf að vera í nefnara til að strikast út!</p>
          )}
        </div>
      )}

      {step2Done && (
        <div className="p-4 bg-green-100 rounded-lg text-center">
          <p className="text-green-800 font-semibold">Keðjan virkaði!</p>
          <p className="text-green-700 text-sm">5000 mg → 5 g → 0.005 kg</p>
        </div>
      )}
    </div>
  );
}

/**
 * Challenge 6: Time Chain Conversion - Visual, No Calculation
 * Students build the conversion chain klst → mín → s by selecting correct factors
 * This replaces the old multiple-choice that required calculating 60 × 60
 */
function TimeEquivalenceChallenge({ onSuccess, onAttempt }: ChallengeComponentProps) {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [selectedStep1, setSelectedStep1] = useState<number | null>(null);
  const [selectedStep2, setSelectedStep2] = useState<number | null>(null);
  const [showStep1Animation, setShowStep1Animation] = useState(false);
  const [showStep2Animation, setShowStep2Animation] = useState(false);

  const step1Factors = [
    { num: 60, numUnit: 'mín', den: 1, denUnit: 'klst', correct: true },
    { num: 1, numUnit: 'klst', den: 60, denUnit: 'mín', correct: false }
  ];

  const step2Factors = [
    { num: 60, numUnit: 's', den: 1, denUnit: 'mín', correct: true },
    { num: 1, numUnit: 'mín', den: 60, denUnit: 's', correct: false }
  ];

  const handleStep1 = (idx: number) => {
    onAttempt();
    setSelectedStep1(idx);
    setShowStep1Animation(true);

    if (step1Factors[idx].correct) {
      setTimeout(() => {
        setStep1Done(true);
        setShowStep1Animation(false);
      }, 1000);
    } else {
      setTimeout(() => setShowStep1Animation(false), 1000);
    }
  };

  const handleStep2 = (idx: number) => {
    onAttempt();
    setSelectedStep2(idx);
    setShowStep2Animation(true);

    if (step2Factors[idx].correct) {
      setTimeout(() => {
        setStep2Done(true);
        setShowStep2Animation(false);
        onSuccess();
      }, 1000);
    } else {
      setTimeout(() => setShowStep2Animation(false), 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual chain display */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-gray-50 rounded-xl flex-wrap">
        <UnitBlock value={1} unit="klst" color="blue" size="medium" />
        <span className="text-xl sm:text-2xl text-gray-400">→</span>

        <div className={`px-3 sm:px-4 py-2 rounded-lg border-2 min-w-[60px] text-center transition-all duration-300 ${
          step1Done ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300'
        } ${showStep1Animation && selectedStep1 !== null && step1Factors[selectedStep1].correct ? 'animate-pulse ring-2 ring-green-400' : ''}`}>
          <span className="font-bold text-sm sm:text-base">{step1Done ? '60 mín' : '?'}</span>
        </div>

        <span className="text-xl sm:text-2xl text-gray-400">→</span>

        <div className={`px-3 sm:px-4 py-2 rounded-lg border-2 min-w-[70px] text-center transition-all duration-300 ${
          step2Done ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300'
        } ${showStep2Animation && selectedStep2 !== null && step2Factors[selectedStep2].correct ? 'animate-pulse ring-2 ring-green-400' : ''}`}>
          <span className="font-bold text-sm sm:text-base">{step2Done ? '3600 s' : '?'}</span>
        </div>
      </div>

      {/* Step 1: klst → mín */}
      {!step1Done && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">
            Skref 1: Breyta klukkustund í mínútur
          </p>
          <p className="text-blue-700 text-xs sm:text-sm mb-4">
            Veldu stuðulinn sem strikað út klst og gefur mín
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            {step1Factors.map((factor, idx) => (
              <ConversionFactorBlock
                key={idx}
                numeratorValue={factor.num}
                numeratorUnit={factor.numUnit}
                denominatorValue={factor.den}
                denominatorUnit={factor.denUnit}
                onClick={() => handleStep1(idx)}
                isCorrect={selectedStep1 === idx ? factor.correct : null}
              />
            ))}
          </div>
          {selectedStep1 !== null && !step1Factors[selectedStep1].correct && !showStep1Animation && (
            <p className="text-red-600 text-sm mt-3 text-center">
              klst þarf að vera í nefnara til að strikast út!
            </p>
          )}
        </div>
      )}

      {/* Step 1 success feedback */}
      {step1Done && !step2Done && (
        <div className="p-3 bg-green-100 rounded-lg text-center">
          <p className="text-green-800 text-sm">
            ✓ klst strikast út! Nú eru eftir 60 mínútur.
          </p>
        </div>
      )}

      {/* Step 2: mín → s */}
      {step1Done && !step2Done && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="font-semibold text-yellow-800 mb-3 text-sm sm:text-base">
            Skref 2: Breyta mínútum í sekúndur
          </p>
          <p className="text-yellow-700 text-xs sm:text-sm mb-4">
            Veldu stuðulinn sem strikað út mín og gefur s
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            {step2Factors.map((factor, idx) => (
              <ConversionFactorBlock
                key={idx}
                numeratorValue={factor.num}
                numeratorUnit={factor.numUnit}
                denominatorValue={factor.den}
                denominatorUnit={factor.denUnit}
                onClick={() => handleStep2(idx)}
                isCorrect={selectedStep2 === idx ? factor.correct : null}
              />
            ))}
          </div>
          {selectedStep2 !== null && !step2Factors[selectedStep2].correct && !showStep2Animation && (
            <p className="text-red-600 text-sm mt-3 text-center">
              mín þarf að vera í nefnara til að strikast út!
            </p>
          )}
        </div>
      )}

      {/* Final success */}
      {step2Done && (
        <div className="p-4 bg-green-100 rounded-lg text-center">
          <p className="text-green-800 font-semibold mb-2">Keðjan virkaði!</p>
          <p className="text-green-700 text-sm">
            1 klst × (60 mín / 1 klst) × (60 s / 1 mín) = 3600 s
          </p>
          <p className="text-green-600 text-xs mt-2">
            Þú þurftir ekki að reikna 60 × 60 - stuðlarnir gera verkið!
          </p>
        </div>
      )}
    </div>
  );
}

export default Level1Conceptual;
