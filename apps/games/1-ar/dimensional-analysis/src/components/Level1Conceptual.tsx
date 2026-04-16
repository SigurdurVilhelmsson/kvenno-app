import { useState, useEffect } from 'react';

import { useEscapeKey } from '@shared/hooks';

import { CancellationChallenge } from './challenges/CancellationChallenge';
import { challenges, cancellationVariants, successMessages } from './challenges/challengeData';
import { EquivalenceChallenge } from './challenges/EquivalenceChallenge';
import { FactorBuildingChallenge } from './challenges/FactorBuildingChallenge';
import { OrientationChallenge } from './challenges/OrientationChallenge';

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

const INITIAL_PROGRESS: Level1Progress = {
  questionsAnswered: 0,
  questionsCorrect: 0,
  explanationsProvided: 0,
  explanationScores: [],
  mastered: false,
};

/**
 * Level 1 Conceptual - Visual learning with NO calculations
 * Students manipulate visual elements to understand dimensional analysis concepts
 */
export function Level1Conceptual({
  onComplete,
  onBack,
  initialProgress,
  onCorrectAnswer,
  onIncorrectAnswer,
}: Level1Props) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(
    initialProgress?.questionsAnswered || 0
  );
  const [progress, setProgress] = useState<Level1Progress>(initialProgress || INITIAL_PROGRESS);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showIntro, setShowIntro] = useState(!initialProgress?.questionsAnswered);
  useEscapeKey(onBack, showIntro);
  const [showSummary, setShowSummary] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintTier, setHintTier] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallengeIndex];

  useEffect(() => {
    setShowSuccess(false);
    setHintTier(0);
    setShowHint(false);
    setAttempts(0);
  }, [currentChallengeIndex]);

  const handleSuccess = () => {
    setShowSuccess(true);
    onCorrectAnswer?.();
    setProgress((prev) => ({
      ...prev,
      questionsAnswered: prev.questionsAnswered + 1,
      questionsCorrect: prev.questionsCorrect + 1,
    }));
  };

  const handleContinue = () => {
    setProgress((prev) => {
      const updated = { ...prev };
      if (updated.questionsAnswered >= 6) {
        updated.mastered = updated.questionsCorrect >= 5;
      }
      return updated;
    });

    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleAttempt = (isIncorrect: boolean = false) => {
    setAttempts((prev) => prev + 1);
    if (attempts >= 2 && !showHint) {
      setShowHint(true);
      setTotalHintsUsed((prev) => prev + 1);
    }
    if (isIncorrect) onIncorrectAnswer?.();
  };

  if (!challenge && !showSummary) return null;

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔬</div>
              <h1 className="text-3xl font-bold text-warm-800 mb-2">
                Velkomin í Einingagreiningu!
              </h1>
              <p className="text-lg text-warm-600">Stig 1: Hugtök</p>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                <span className="text-2xl">👆</span>
                <div>
                  <p className="font-semibold text-green-800">Engar útreikninga!</p>
                  <p className="text-green-700 text-sm">
                    Þú lærir með því að prófa og sjá hvað gerist.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-semibold text-blue-800">6 áskoranir</p>
                  <p className="text-blue-700 text-sm">
                    Hver áskorun kennir þér nýtt hugtak um umbreytingar.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-semibold text-yellow-800">Vísbendingar birtast</p>
                  <p className="text-yellow-700 text-sm">
                    Ef þú reynir nokkrum sinnum birtist hjálp.
                  </p>
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

  if (showSummary) {
    const mastered = progress.questionsCorrect >= 5;
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{mastered ? '🎉' : '📚'}</div>
              <h1 className="text-3xl font-bold text-warm-800 mb-2">
                {mastered ? 'Frábært!' : 'Vel gert!'}
              </h1>
              <p className="text-lg text-warm-600">
                Þú svaraðir {progress.questionsCorrect} af {challenges.length} rétt
              </p>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-warm-800 mb-4">Hvað þú lærðir:</h2>
              <div className="space-y-3">
                {[
                  'Mismunandi tölur með mismunandi einingum geta táknað <strong>sama magn</strong>',
                  'Umbreytingarstuðlar <strong>jafngilda 1</strong> - þeir breyta ekki magninu',
                  'Eins einingar <strong>strikast út</strong> (teljari og nefnari)',
                  'Einingin sem á að hverfa þarf að vera í <strong>nefnara</strong>',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 text-xl">✓</span>
                    <p className="text-green-800" dangerouslySetInnerHTML={{ __html: text }} />
                  </div>
                ))}
              </div>
            </div>
            {mastered ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-blue-800 font-semibold">Stig 2 er nú opið!</p>
                  <p className="text-blue-600 text-sm">
                    Þar munt þú nota þessi hugtök til að spá fyrir um niðurstöður.
                  </p>
                </div>
                <button
                  onClick={() => onComplete(progress, 600, totalHintsUsed)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
                >
                  Halda áfram →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-yellow-800 font-semibold">
                    Þú þarft 5 af 6 til að opna Stig 2
                  </p>
                  <p className="text-yellow-600 text-sm">
                    Reyndu aftur til að styrkja skilninginn!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentChallengeIndex(0);
                    setShowSummary(false);
                    setProgress(INITIAL_PROGRESS);
                  }}
                  className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white py-4 rounded-xl font-bold text-lg transition-colors"
                >
                  Reyna aftur
                </button>
                <button
                  onClick={() => onComplete(progress, 600, totalHintsUsed)}
                  className="w-full bg-warm-200 hover:bg-warm-300 text-warm-700 py-3 rounded-xl font-semibold transition-colors"
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2 text-lg"
          >
            ← Til baka
          </button>
          <div className="text-sm text-warm-600 flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
              Stig 1: Hugtök
            </span>
            <span>
              Áskorun {currentChallengeIndex + 1} / {challenges.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentChallengeIndex / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main challenge card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-warm-800 mb-2">{challenge.title}</h2>
          <p className="text-lg text-warm-600 mb-6">{challenge.instruction}</p>

          {/* Challenge content */}
          <div className="mb-6">
            {challenge.id === 'C1' && (
              <EquivalenceChallenge onComplete={handleSuccess} onAttempt={handleAttempt} />
            )}
            {challenge.id === 'C2' && (
              <FactorBuildingChallenge onComplete={handleSuccess} onAttempt={handleAttempt} />
            )}
            {challenge.id === 'C4' && (
              <OrientationChallenge onComplete={handleSuccess} onAttempt={handleAttempt} />
            )}
            {challenge.type === 'cancellation' && cancellationVariants[challenge.id] && (
              <CancellationChallenge
                variant={cancellationVariants[challenge.id]}
                onComplete={handleSuccess}
                onAttempt={handleAttempt}
              />
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
                    setHintTier((prev) => prev + 1);
                    setTotalHintsUsed((prev) => prev + 1);
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Fá meiri hjálp
                </button>
              )}
            </div>
          )}

          {/* Success message with "Af hverju?" card */}
          {showSuccess && (
            <div className="mb-6 space-y-4">
              <div className="p-6 bg-green-100 rounded-xl border-2 border-green-300">
                <h3 className="text-xl font-bold text-green-800 mb-2">Rétt!</h3>
                <p className="text-green-700 mb-4">{successMessages[challenge.type]}</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm font-semibold text-amber-800 mb-1">Af hverju?</p>
                <p className="text-amber-700 text-sm">{challenge.whyExplanation}</p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors"
              >
                {currentChallengeIndex < challenges.length - 1 ? 'Næsta áskorun →' : 'Ljúka stigi'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-warm-500 text-sm">
          Stig 1 snýst um að <strong>skilja hugtökin</strong> - engar útreikninga!
        </div>
      </div>
    </div>
  );
}

export default Level1Conceptual;
