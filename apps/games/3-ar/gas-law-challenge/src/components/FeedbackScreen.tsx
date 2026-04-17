import { GasLawQuestion, GameMode, GameStats, QuestionFeedback, GAS_LAW_INFO } from '../types';
import { getUnit } from '../utils/gas-calculations';

interface FeedbackScreenProps {
  feedback: QuestionFeedback;
  currentQuestion: GasLawQuestion;
  stats: GameStats;
  sessionCompleted: boolean;
  sessionQuestionsAnswered: number;
  gameMode: GameMode;
  onNext: (mode: GameMode) => void;
  onBackToMenu: () => void;
}

export function FeedbackScreen({
  feedback,
  currentQuestion,
  stats,
  sessionCompleted,
  sessionQuestionsAnswered,
  gameMode,
  onNext,
  onBackToMenu,
}: FeedbackScreenProps) {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div
              className={`text-center mb-6 p-6 rounded-xl ${
                feedback.isCorrect
                  ? 'bg-green-50 border-2 border-green-300'
                  : 'bg-red-50 border-2 border-red-300'
              }`}
            >
              <div className="text-6xl mb-2">{feedback.isCorrect ? '✅' : '❌'}</div>
              <h2
                className={`text-3xl font-bold mb-2 ${
                  feedback.isCorrect ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {feedback.message}
              </h2>
              {feedback.isCorrect && (
                <div className="text-2xl font-bold text-yellow-600">+{feedback.points} stig</div>
              )}
            </div>

            {sessionCompleted && sessionQuestionsAnswered === 15 && (
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-xl p-4 mb-6 text-center">
                <div className="text-3xl mb-1">🎉⭐</div>
                <p className="font-bold text-yellow-800 text-lg">
                  Þú hefur lokið Gas Law Challenge!
                </p>
                <p className="text-yellow-700 text-sm">
                  15 spurningar svaraðar — þú getur haldið áfram til að bæta stigin þín.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Þitt svar:</h3>
                <p className="text-2xl font-bold text-blue-800">
                  {feedback.userAnswer.toFixed(2)} {getUnit(currentQuestion.find)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">Rétt svar:</h3>
                <p className="text-2xl font-bold text-green-800">
                  {feedback.correctAnswer.toFixed(2)} {getUnit(currentQuestion.find)}
                </p>
              </div>
            </div>

            {!feedback.isCorrect && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h3 className="font-bold text-yellow-900 mb-1">Mismunur:</h3>
                <p className="text-lg text-yellow-800">
                  {feedback.difference.toFixed(2)} {getUnit(currentQuestion.find)} frá réttum svari
                </p>
              </div>
            )}

            <div className="bg-warm-50 p-4 rounded-lg border border-warm-200 mb-6">
              <h3 className="font-bold text-warm-800 mb-3">Skref fyrir skref lausn:</h3>
              <div className="space-y-2 text-sm">
                {currentQuestion.solution.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-bold text-warm-600">{idx + 1}.</span>
                    <span className="text-warm-700">{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white p-3 rounded border border-warm-300">
                <p className="text-sm">
                  <span className="font-bold">Formúla:</span> {currentQuestion.solution.formula}
                </p>
                <p className="text-sm">
                  <span className="font-bold">Innsetning:</span>{' '}
                  {currentQuestion.solution.substitution}
                </p>
                <p className="text-sm">
                  <span className="font-bold">Útreikningur:</span>{' '}
                  {currentQuestion.solution.calculation}
                </p>
              </div>
            </div>

            {/* Why this law works — principle card (iter 1 P2 fix) */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
              <h3 className="font-bold text-purple-900 mb-2">
                Af hverju virkar {GAS_LAW_INFO[currentQuestion.gasLaw].nameIs}?
              </h3>
              <p className="text-sm text-purple-800">
                {GAS_LAW_INFO[currentQuestion.gasLaw].principleIs}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-bold text-blue-900 mb-2">Árangur:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.score}</div>
                  <div className="text-warm-600">Stig</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.correctAnswers}/{stats.questionsAnswered}
                  </div>
                  <div className="text-warm-600">Rétt</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.streak}</div>
                  <div className="text-warm-600">Núverandi röð</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.bestStreak}</div>
                  <div className="text-warm-600">Besta röð</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onNext(gameMode)}
                className="flex-1 py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: '#f36b22' }}
              >
                ➡️ Næsta spurning
              </button>
              <button
                onClick={onBackToMenu}
                className="px-6 py-3 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition font-bold"
              >
                📊 Valmynd
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
