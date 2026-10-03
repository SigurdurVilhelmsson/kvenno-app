import type { Ref } from 'react';

import { formatDecimal, useArmedAfter } from '@shared/utils';

import type { Level } from '../data';
import {
  GasLawQuestion,
  GameMode,
  GameStats,
  QuestionFeedback,
  GAS_LAW_INFO,
  RoundResult,
} from '../types';
import { FormulaText } from './FormulaText';
import { answerText, answerUnit, formatDifference } from '../utils/gas-calculations';

interface FeedbackScreenProps {
  feedback: QuestionFeedback;
  currentQuestion: GasLawQuestion;
  /** The Keppnishamur run; shown only in Keppnishamur. */
  stats: GameStats;
  selectedLevel: Level;
  /** The practice round, once its last question is answered; null until then. */
  roundResult?: RoundResult | null;
  /** The worked solution was open before this practice answer was checked. */
  solutionSeen?: boolean;
  gameMode: GameMode;
  onNext: () => void;
  /** Play the practice round again, from the end of one. */
  onRestart?: () => void;
  onBackToMenu: () => void;
  /** The screen's root, for App's screen-swap anchoring. */
  rootRef?: Ref<HTMLDivElement>;
}

export function FeedbackScreen({
  feedback,
  currentQuestion,
  stats,
  selectedLevel,
  roundResult = null,
  solutionSeen = false,
  gameMode,
  onNext,
  onRestart,
  onBackToMenu,
  rootRef,
}: FeedbackScreenProps) {
  // "Athuga Svar" opened this screen. A press on Næsta within 400 ms of it appearing is the
  // second half of a double tap, not a decision, and is dropped (design P3).
  const armed = useArmedAfter(400);
  // Points and streaks are Keppnishamur's alone (mobile-pass decision 1 (b)); a practice
  // round says how many it got right when it ends.
  const challenge = gameMode === 'challenge';

  return (
    <div ref={rootRef}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <main className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-8 phone:py-3">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 phone:p-3">
            {/* The feedback region focus moves to when this screen opens (design P3). On a
                phone the emoji sits inline with the verdict. */}
            <div
              data-feedback-verdict
              tabIndex={-1}
              role="group"
              aria-labelledby="gas-law-verdict"
              className={`text-center mb-6 p-4 sm:p-6 rounded-xl focus:outline-none phone:p-3 phone:mb-3 phone:flex phone:flex-wrap phone:items-center phone:gap-x-2.5 phone:text-left ${
                feedback.isCorrect
                  ? 'bg-green-50 border-2 border-green-300'
                  : 'bg-red-50 border-2 border-red-300'
              }`}
            >
              <div className="text-6xl mb-2 phone:text-3xl phone:mb-0 phone:shrink-0">
                {feedback.isCorrect ? '✅' : '❌'}
              </div>
              <h2
                id="gas-law-verdict"
                className={`text-2xl sm:text-3xl font-bold mb-2 phone:text-lg phone:leading-snug phone:mb-0 phone:flex-1 phone:min-w-0 ${
                  feedback.isCorrect ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {feedback.message}
              </h2>
              {challenge && feedback.isCorrect && (
                <div className="text-2xl font-bold text-yellow-600 phone:text-base phone:w-full phone:mt-0.5">
                  +{feedback.points} stig
                </div>
              )}
              {solutionSeen && feedback.isCorrect && (
                <p className="text-sm text-warm-700 mt-1 phone:w-full phone:mt-0.5">
                  Lausnin var opin þegar þú svaraðir, svo svarið telst ekki með.
                </p>
              )}
            </div>

            {roundResult && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-6 text-center phone:p-3 phone:mb-3">
                <p className="font-bold text-blue-900 text-lg">Stigi {selectedLevel} lokið</p>
                <p className="text-blue-800 text-2xl font-bold phone:text-xl">
                  {roundResult.correct} af {roundResult.total} rétt
                </p>
              </div>
            )}

            {challenge && stats.questionsAnswered === 15 && (
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-xl p-4 mb-6 text-center phone:p-3 phone:mb-3">
                <div className="text-3xl mb-1 phone:text-xl">🎉⭐</div>
                <p className="font-bold text-yellow-800 text-lg">Þú hefur lokið Gaslögmálum!</p>
                <p className="text-yellow-700 text-sm">
                  15 spurningum svarað — þú getur haldið áfram til að bæta stigin þín.
                </p>
              </div>
            )}

            {/* The two answers side by side on a phone, as one comparison row. */}
            <div className="grid md:grid-cols-2 gap-4 mb-6 phone:grid-cols-2 phone:gap-2 phone:mb-3">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 phone:p-2.5 phone:min-w-0">
                <h3 className="font-bold text-blue-900 mb-2 phone:mb-0.5 phone:text-sm">
                  Þitt svar:
                </h3>
                <p className="text-2xl font-bold text-blue-800 phone:text-lg">
                  {feedback.userAnswer === null
                    ? '—'
                    : `${formatDecimal(feedback.userAnswer)} ${answerUnit(currentQuestion)}`}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 phone:p-2.5 phone:min-w-0">
                <h3 className="font-bold text-green-900 mb-2 phone:mb-0.5 phone:text-sm">
                  Rétt svar:
                </h3>
                <p className="text-2xl font-bold text-green-800 phone:text-lg">
                  {answerText(currentQuestion)} {answerUnit(currentQuestion)}
                </p>
              </div>
            </div>

            {!feedback.isCorrect && feedback.userAnswer !== null && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6 phone:p-2.5 phone:mb-3">
                <h3 className="font-bold text-yellow-900 mb-1 phone:mb-0 phone:text-sm">
                  Mismunur:
                </h3>
                <p className="text-lg text-yellow-800 phone:text-base">
                  {formatDifference(feedback.userAnswer, currentQuestion.answer)}{' '}
                  {answerUnit(currentQuestion)} frá réttu svari
                </p>
              </div>
            )}

            <div className="bg-warm-50 p-4 rounded-lg border border-warm-200 mb-6 phone:p-3 phone:mb-3">
              <h3 className="font-bold text-warm-800 mb-3 phone:mb-2">Skref fyrir skref lausn:</h3>
              <div className="space-y-2 text-sm">
                {currentQuestion.solution.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-bold text-warm-600">{idx + 1}.</span>
                    <span className="text-warm-700 min-w-0">
                      <FormulaText text={step} />
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white p-3 rounded border border-warm-300 phone:mt-3 phone:p-2">
                <p className="text-sm">
                  <span className="font-bold">Formúla:</span>{' '}
                  <FormulaText text={currentQuestion.solution.formula} />
                </p>
                <p className="text-sm">
                  <span className="font-bold">Innsetning:</span>{' '}
                  <FormulaText text={currentQuestion.solution.substitution} />
                </p>
                <p className="text-sm">
                  <span className="font-bold">Útreikningur:</span>{' '}
                  <FormulaText text={currentQuestion.solution.calculation} />
                </p>
              </div>
            </div>

            {/* Why this law works — principle card (iter 1 P2 fix) */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6 phone:p-3 phone:mb-3">
              <h3 className="font-bold text-purple-900 mb-2">
                Af hverju virkar {GAS_LAW_INFO[currentQuestion.gasLaw].nameIs}?
              </h3>
              <p className="text-sm text-purple-800">
                {GAS_LAW_INFO[currentQuestion.gasLaw].principleIs}
              </p>
            </div>

            {/* Árangur is compacted on a phone (one row from 360 px), never hidden (design §4, §7.8).
                Keppnishamur only: it is this run's points and streak. */}
            {challenge && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6 phone:p-2.5 phone:mb-3">
                <h3 className="font-bold text-blue-900 mb-2 phone:mb-1 phone:text-sm">Árangur:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm phone:min-[360px]:grid-cols-4 phone:gap-1 phone:text-xs">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600 phone:text-lg">
                      {stats.score}
                    </div>
                    <div className="text-warm-600">Stig</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 phone:text-lg">
                      {stats.correctAnswers}/{stats.questionsAnswered}
                    </div>
                    <div className="text-warm-600">Rétt</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 phone:text-lg">
                      {stats.streak}
                    </div>
                    <div className="text-warm-600">Núverandi röð</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 phone:text-lg">
                      {stats.bestStreak}
                    </div>
                    <div className="text-warm-600">Besta röð</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {roundResult ? (
                <button
                  onClick={armed(() => onRestart?.())}
                  className="flex-1 py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#f36b22' }}
                >
                  🔁 Æfa stigið aftur
                </button>
              ) : (
                <button
                  onClick={armed(onNext)}
                  className="flex-1 py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#f36b22' }}
                >
                  ➡️ Næsta spurning
                </button>
              )}
              <button
                onClick={onBackToMenu}
                className="px-6 py-3 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition font-bold whitespace-nowrap"
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
