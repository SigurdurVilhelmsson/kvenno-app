/**
 * Game completion screen for Level 1 of the Molmassi game.
 * Shows score, accuracy, mastery progress, and learning summary.
 */

interface GameCompleteProps {
  /** Whether the player reached the mastery threshold */
  passedLevel: boolean;
  /** Number of correct answers */
  correctCount: number;
  /** Total questions answered */
  questionsAnswered: number;
  /** Total score accumulated */
  score: number;
  /** Mastery threshold (number of correct answers needed) */
  masteryThreshold: number;
  /** Total hints used (for score reporting) */
  hintsUsedTier: number;
  /** Total number of challenges in the level */
  totalChallenges: number;
  /** Called when player completes the level and moves on */
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  /** Called when player wants to replay */
  onReplay: () => void;
  /** Called when player wants to go back to menu */
  onBack: () => void;
}

/** Displays the results screen after Level 1 is finished. */
export function GameComplete({
  passedLevel,
  correctCount,
  questionsAnswered,
  score,
  masteryThreshold,
  hintsUsedTier,
  totalChallenges,
  onComplete,
  onReplay,
  onBack,
}: GameCompleteProps) {
  const accuracy = questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 0;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${passedLevel ? 'from-green-50' : 'from-yellow-50'} to-white flex items-center justify-center p-4`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
        <div className="text-6xl mb-4 animate-bounce-in">{passedLevel ? '\uD83C\uDF89' : '\uD83D\uDCAA'}</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {passedLevel ? 'Frábært!' : 'Góð tilraun!'}
        </h2>
        <p className="text-gray-600 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {passedLevel
            ? `Þú náðir ${masteryThreshold}+ réttum svörum og hefur lokið Stigi 1!`
            : `Þú þarft ${masteryThreshold} rétt svör til að opna Stig 2. Reyndu aftur!`}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="text-2xl font-bold text-green-600">{correctCount}/{questionsAnswered}</div>
            <div className="text-xs text-gray-600">Rétt svör</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
            <div className="text-xs text-gray-600">Nákvæmni</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="text-2xl font-bold text-purple-600">{score}</div>
            <div className="text-xs text-gray-600">Stig</div>
          </div>
        </div>

        {/* Mastery progress */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Framvinda í lærdómi</span>
            <span>{correctCount}/{masteryThreshold} rétt svör</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${passedLevel ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${Math.min((correctCount / masteryThreshold) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 text-left animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span className="text-lg">{'\uD83D\uDCDA'}</span> Hvað lærðir þú?
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">{'\u2713'}</span>
              <span>Sameindir eru byggðar úr frumeindum</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">{'\u2713'}</span>
              <span>Mismunandi frumeindir hafa mismunandi massa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">{'\u2713'}</span>
              <span>Formúlan sýnir hversu margar frumeindir eru</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">{'\u2713'}</span>
              <span>Fleiri/þyngri frumeindir = meiri massi</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          {passedLevel ? (
            <button
              onClick={() => onComplete(score, totalChallenges * 10, hintsUsedTier)}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors btn-press"
            >
              Halda áfram í Stig 2 {'\u2192'}
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-colors btn-press"
            >
              Reyna aftur
            </button>
          )}
          {passedLevel && (
            <button
              onClick={onReplay}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Spila Aftur
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full text-gray-500 hover:text-gray-700 font-semibold py-2"
          >
            Til baka í valmynd
          </button>
        </div>
      </div>
    </div>
  );
}
