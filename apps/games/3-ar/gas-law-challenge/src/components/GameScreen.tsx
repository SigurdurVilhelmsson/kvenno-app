import { useEffect, useRef, type Ref } from 'react';

import { Presence } from '@shared/components';
import { focusTarget, formatDecimal, revealSpan } from '@shared/utils';

import type { Level } from '../data';
import { GasLawQuestion, GameMode, GameStats, GasLaw, GAS_LAW_INFO } from '../types';
import { FormulaText } from './FormulaText';
import { GasLawSimulator } from './GasLawSimulator';
import { answerText, answerUnit, getVariableNameAccusative } from '../utils/gas-calculations';

interface GameScreenProps {
  currentQuestion: GasLawQuestion;
  selectedLevel: Level;
  gameMode: GameMode;
  gameStep: 'select-law' | 'solve';
  selectedLaw: GasLaw | null;
  setSelectedLaw: (law: GasLaw) => void;
  timeRemaining: number | null;
  userAnswer: string;
  setUserAnswer: (s: string) => void;
  showHint: number;
  showSolution: boolean;
  setShowSolution: (b: boolean) => void;
  validationError: string | null;
  lawFeedback: { correct: boolean; message: string } | null;
  stats: GameStats;
  isGameScreenActive: boolean;
  simulatorShowAnswer: boolean;
  onCheckAnswer: () => void;
  onGetHint: () => void;
  onCheckLaw: () => void;
  onSkipLaw: () => void;
  onBackToMenu: () => void;
  /** The screen's root, for App's screen-swap anchoring. */
  rootRef?: Ref<HTMLDivElement>;
}

/** Runs `fn` on the first animation frame in which `ready()` holds, giving up after ~10 frames. */
function whenPainted(ready: () => boolean, fn: () => void): () => void {
  let id = 0;
  let tries = 0;
  const tick = () => {
    if (ready()) fn();
    else if (tries++ < 10) id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}

export function GameScreen({
  currentQuestion,
  selectedLevel,
  gameMode,
  gameStep,
  selectedLaw,
  setSelectedLaw,
  timeRemaining,
  userAnswer,
  setUserAnswer,
  showHint,
  showSolution,
  setShowSolution,
  validationError,
  lawFeedback,
  stats,
  isGameScreenActive,
  simulatorShowAnswer,
  onCheckAnswer,
  onGetHint,
  onCheckLaw,
  onSkipLaw,
  onBackToMenu,
  rootRef,
}: GameScreenProps) {
  const lawStep = gameStep === 'select-law' && gameMode === 'practice';

  // After "Athuga lögmál": the verdict opens between the law choices and the buttons, so on a
  // phone the verdict and the buttons are kept on screen together, and at every width focus
  // moves to the verdict (the button stays, so a second press only re-checks).
  const lawButtonsRef = useRef<HTMLDivElement>(null);
  const lawFeedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!lawFeedback) return;
    return whenPainted(
      () => !!lawFeedbackRef.current,
      () => {
        revealSpan(lawButtonsRef.current, [lawFeedbackRef.current]);
        focusTarget(lawFeedbackRef.current);
      }
    );
  }, [lawFeedback]);

  // Law step → solve step (after the automatic advance, or "Sleppa"): the law card leaves and
  // the solve section opens in its place. On a phone the question, its data and "Athuga Svar"
  // are brought on screen together where they fit, else the question at the top, with its
  // data under it; focus goes to the answer card's heading, never to the field, so a phone
  // does not open its keyboard unasked.
  const scenarioRef = useRef<HTMLDivElement>(null);
  const answerHeadingRef = useRef<HTMLHeadingElement>(null);
  const checkButtonRef = useRef<HTMLButtonElement>(null);
  const shownStep = useRef(gameStep);
  useEffect(() => {
    const from = shownStep.current;
    shownStep.current = gameStep;
    if (from !== 'select-law' || gameStep !== 'solve') return;
    return whenPainted(
      () => !!checkButtonRef.current,
      () => {
        revealSpan(checkButtonRef.current, [scenarioRef.current]);
        focusTarget(answerHeadingRef.current);
      }
    );
  }, [gameStep]);

  return (
    <div ref={rootRef}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <main className="max-w-5xl mx-auto px-3 py-4 sm:px-4 sm:py-8 phone:py-2">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 phone:p-3">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6 phone:gap-2 phone:mb-2">
              <div className="min-w-0 flex-1 basis-32 phone:min-[360px]:basis-0">
                <h1
                  className="text-xl sm:text-2xl font-bold phone:text-lg phone:leading-tight"
                  style={{ color: '#f36b22' }}
                >
                  Gaslögmál
                </h1>
                <p className="text-sm text-warm-600 phone:text-xs">
                  Stig {selectedLevel} • {gameMode === 'practice' ? 'Æfingahamur' : 'Keppnishamur'}{' '}
                  • Spurning {currentQuestion.id}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {gameMode === 'challenge' && timeRemaining !== null && (
                  <div
                    role="timer"
                    aria-live={timeRemaining < 10 ? 'assertive' : 'off'}
                    aria-label={`${timeRemaining} sekúndur eftir${timeRemaining < 30 ? ' — stutt eftir' : ''}`}
                    className={`px-4 py-2 phone:px-2.5 rounded-lg font-bold whitespace-nowrap ${timeRemaining < 30 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                  >
                    ⏱️ {timeRemaining < 30 ? '⚠️ ' : ''}
                    {timeRemaining}s
                  </div>
                )}
                <button
                  onClick={onBackToMenu}
                  className="px-3 sm:px-4 py-2 bg-warm-200 rounded-lg hover:bg-warm-300 transition whitespace-nowrap pointer-coarse:min-h-11 phone:px-2.5 phone:text-sm"
                >
                  ← Valmynd
                </button>
              </div>
            </div>

            {/* Score, streak and difficulty: compacted on a phone, never hidden (design §4). */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 text-sm phone:gap-1.5 phone:mb-2.5 phone:text-xs">
              <div className="bg-yellow-50 px-3 py-2 phone:px-2 phone:py-1 rounded-lg border border-yellow-200">
                <span className="font-bold text-yellow-800">🏆 {stats.score}</span>
              </div>
              <div className="bg-green-50 px-3 py-2 phone:px-2 phone:py-1 rounded-lg border border-green-200">
                <span className="font-bold text-green-800">
                  ✓ {stats.correctAnswers}/{stats.questionsAnswered}
                </span>
              </div>
              <div className="bg-blue-50 px-3 py-2 phone:px-2 phone:py-1 rounded-lg border border-blue-200">
                <span className="font-bold text-blue-800">🔥 {stats.streak}</span>
              </div>
              <div
                className={`px-3 py-2 phone:px-2 phone:py-1 rounded-lg border ${
                  currentQuestion.difficulty === 'Auðvelt'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : currentQuestion.difficulty === 'Miðlungs'
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <span className="font-bold">{currentQuestion.difficulty}</span>
              </div>
            </div>

            {/* Law Selection Step (Practice Mode Only) */}
            {lawStep && (
              <div className="mb-6 phone:mb-3">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 rounded-xl border-2 border-indigo-200 phone:p-2">
                  <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2 phone:text-base phone:mb-2">
                    <span className="text-2xl phone:text-lg">📚</span> Skref 1: Hvaða lögmál á við?
                  </h3>

                  <div className="bg-white p-3 rounded-lg border border-warm-200 mb-4 phone:p-2 phone:mb-2">
                    <h4 data-item-start className="font-bold text-warm-800 mb-1 phone:mb-0">
                      {currentQuestion.emoji} {currentQuestion.scenario_is}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs phone:gap-1.5 phone:mb-2 phone-land:grid-cols-5">
                    {currentQuestion.given.P && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-center">
                        <span className="font-semibold">P:</span>{' '}
                        {formatDecimal(currentQuestion.given.P.value)}{' '}
                        {currentQuestion.given.P.unit}
                      </div>
                    )}
                    {currentQuestion.given.V && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-center">
                        <span className="font-semibold">V:</span>{' '}
                        {formatDecimal(currentQuestion.given.V.value)}{' '}
                        {currentQuestion.given.V.unit}
                      </div>
                    )}
                    {currentQuestion.given.T && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-center">
                        <span className="font-semibold">T:</span>{' '}
                        {formatDecimal(currentQuestion.given.T.value)}{' '}
                        {currentQuestion.given.T.unit}
                      </div>
                    )}
                    {currentQuestion.given.n && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-center">
                        <span className="font-semibold">n:</span>{' '}
                        {formatDecimal(currentQuestion.given.n.value)}{' '}
                        {currentQuestion.given.n.unit}
                      </div>
                    )}
                    <div className="bg-orange-50 px-2 py-1 rounded text-center">
                      <span className="font-semibold text-orange-700">
                        Finna: {currentQuestion.find}
                      </span>
                    </div>
                  </div>

                  {/* Two law cards a row on a portrait phone from 360 px (one below, where a law's
                      name would break mid-word), three on its side. */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4 phone:min-[360px]:grid-cols-2 phone:gap-1.5 phone:mb-2 phone-land:grid-cols-3">
                    {Object.entries(GAS_LAW_INFO).map(([law, info]) => {
                      return (
                        <button
                          key={law}
                          onClick={() => setSelectedLaw(law as GasLaw)}
                          className={`p-3 phone:px-1.5 phone:py-2 rounded-lg border-2 transition-all text-left ${
                            selectedLaw === law
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-warm-200 hover:border-indigo-300 bg-white'
                          }`}
                        >
                          <div className="font-semibold text-sm text-warm-800 phone:text-[0.8125rem]">
                            {info.nameIs}
                          </div>
                          {/* A phone column is too narrow for the longest formula on one line;
                              it breaks at its spaces, never inside a term. */}
                          <div className="font-mono text-xs text-indigo-600 whitespace-nowrap phone:whitespace-normal">
                            {info.formula}
                          </div>
                          <div className="text-xs text-warm-500 mt-1 phone:mt-0.5">
                            {info.constants}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Presence show={!!lawFeedback} exitDuration={250}>
                    <div
                      ref={lawFeedbackRef}
                      tabIndex={-1}
                      role="group"
                      aria-labelledby="gas-law-law-verdict"
                      className={`p-3 rounded-lg mb-4 phone:p-2 phone:mb-2 focus:outline-none ${
                        lawFeedback?.correct
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{lawFeedback?.correct ? '✅' : '❌'}</span>
                        <span id="gas-law-law-verdict">{lawFeedback?.message}</span>
                      </div>
                    </div>
                  </Presence>

                  <div ref={lawButtonsRef} className="flex gap-2">
                    <button
                      onClick={onCheckLaw}
                      disabled={!selectedLaw}
                      className="flex-1 py-2 px-4 rounded-lg font-bold text-white transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 pointer-coarse:min-h-11"
                    >
                      Athuga lögmál
                    </button>
                    <button
                      onClick={onSkipLaw}
                      className="px-4 py-2 bg-warm-200 text-warm-700 rounded-lg hover:bg-warm-300 transition text-sm whitespace-nowrap pointer-coarse:min-h-11"
                    >
                      Sleppa →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* On a portrait phone the two columns flatten into one, in the order the question is
                played: the question, its data, the law, the answer, hints and solution, then the
                simulator and the reminder. Only the blocks with nothing to focus (question, data,
                simulator, reminder) are moved with `order`; the rest keep DOM order. On its side
                the phone gets the two columns back, the data above the simulator. While the law
                is still being chosen, this whole section is the next step and is hidden on a
                phone (design P10); from sm up it shows, dimmed, as it always did. */}
            <div
              className={`grid md:grid-cols-2 gap-6 phone:grid-cols-1 phone:gap-2.5 phone-land:grid-cols-2 ${lawStep ? 'phone:hidden' : ''}`}
            >
              {/* Left: Visualization */}
              <div className="min-w-0 phone:contents phone-land:flex phone-land:flex-col phone-land:gap-2.5">
                <div
                  ref={scenarioRef}
                  className="bg-warm-50 p-4 rounded-lg border border-warm-200 mb-4 phone:p-3 phone:mb-0 phone:-order-2"
                >
                  <h3
                    data-item-start={lawStep ? undefined : ''}
                    className="font-bold text-warm-800 mb-2 phone:mb-0"
                  >
                    {currentQuestion.emoji} {currentQuestion.scenario_is}
                  </h3>
                </div>

                <div className="phone:order-1">
                  <GasLawSimulator
                    question={currentQuestion}
                    isRunning={isGameScreenActive}
                    showAnswer={simulatorShowAnswer}
                    correctAnswer={currentQuestion.answer}
                  />
                </div>

                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200 phone:mt-0 phone:p-2.5 phone:-order-1">
                  <h3 className="font-bold text-blue-900 mb-2 phone:mb-1.5">Gefnar upplýsingar:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm phone:gap-1.5">
                    {currentQuestion.given.P && (
                      <div className="bg-white px-3 py-2 rounded phone:py-1">
                        <span className="font-semibold">P:</span>{' '}
                        {formatDecimal(currentQuestion.given.P.value)}{' '}
                        {currentQuestion.given.P.unit}
                      </div>
                    )}
                    {currentQuestion.given.V && (
                      <div className="bg-white px-3 py-2 rounded phone:py-1">
                        <span className="font-semibold">V:</span>{' '}
                        {formatDecimal(currentQuestion.given.V.value)}{' '}
                        {currentQuestion.given.V.unit}
                      </div>
                    )}
                    {currentQuestion.given.T && (
                      <div className="bg-white px-3 py-2 rounded phone:py-1">
                        <span className="font-semibold">T:</span>{' '}
                        {formatDecimal(currentQuestion.given.T.value)}{' '}
                        {currentQuestion.given.T.unit}
                      </div>
                    )}
                    {currentQuestion.given.n && (
                      <div className="bg-white px-3 py-2 rounded phone:py-1">
                        <span className="font-semibold">n:</span>{' '}
                        {formatDecimal(currentQuestion.given.n.value)}{' '}
                        {currentQuestion.given.n.unit}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-blue-800 font-mono bg-white px-2 py-1 rounded">
                    PV = nRT þar sem R = 0,08206 L·atm/(mól·K)
                  </div>
                </div>
              </div>

              {/* Right: Input and Hints */}
              <div className="min-w-0 phone:contents phone-land:flex phone-land:flex-col phone-land:gap-2.5">
                {gameMode === 'practice' && gameStep === 'solve' && currentQuestion.gasLaw && (
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 mb-4 phone:p-2 phone:mb-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm phone:gap-x-1.5 phone:gap-y-0.5">
                      <span className="text-indigo-600 font-semibold">📚 Lögmál:</span>
                      <span className="font-mono bg-white px-2 py-1 rounded text-indigo-800 whitespace-nowrap phone:px-1.5 phone:py-0.5">
                        {GAS_LAW_INFO[currentQuestion.gasLaw].formula}
                      </span>
                      <span className="text-warm-600 phone:text-xs">
                        ({GAS_LAW_INFO[currentQuestion.gasLaw].nameIs})
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={`bg-orange-50 p-4 rounded-lg border-2 border-orange-200 mb-4 phone:p-3 phone:mb-0 ${
                    gameMode === 'practice' && gameStep === 'select-law' ? 'opacity-50' : ''
                  }`}
                >
                  <h3
                    ref={answerHeadingRef}
                    className="font-bold text-orange-900 mb-2 flex flex-wrap items-baseline justify-between gap-x-3 md:block phone:mb-1.5"
                  >
                    <label htmlFor="gas-law-answer">
                      {gameMode === 'practice' && gameStep === 'select-law' && '(Skref 2) '}
                      Finndu {getVariableNameAccusative(currentQuestion.find)} (
                      {currentQuestion.find}):
                    </label>
                    {/* In the one-column layout the timer at the top of the page is scrolled out
                        of sight by the time the student reaches this field, so it is repeated
                        here. The role="timer" chip above stays the one screen readers announce. */}
                    {gameMode === 'challenge' && timeRemaining !== null && (
                      <span
                        aria-hidden="true"
                        className={`md:hidden whitespace-nowrap ${timeRemaining < 30 ? 'text-red-800' : 'text-blue-800'}`}
                      >
                        ⏱️ {timeRemaining < 30 ? '⚠️ ' : ''}
                        {timeRemaining}s
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <input
                      id="gas-law-answer"
                      type="text"
                      inputMode="decimal"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={
                        gameMode === 'practice' && gameStep === 'select-law'
                          ? 'Veldu lögmál fyrst...'
                          : 'Sláðu inn svar...'
                      }
                      className="flex-1 px-4 py-3 phone:py-2 rounded-lg border-2 border-warm-300 focus:border-orange-500 focus:outline-none text-lg disabled:bg-warm-100 disabled:cursor-not-allowed"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && gameStep === 'solve' && onCheckAnswer()
                      }
                      enterKeyHint="done"
                      disabled={gameMode === 'practice' && gameStep === 'select-law'}
                      aria-label={`Svar fyrir ${getVariableNameAccusative(currentQuestion.find)} í einingunni ${answerUnit(currentQuestion)}`}
                    />
                    <div className="bg-white px-4 py-3 phone:py-2 rounded-lg border-2 border-warm-300 font-bold text-warm-700 shrink-0">
                      {answerUnit(currentQuestion)}
                    </div>
                  </div>
                  {validationError && (
                    <div className="mt-2 text-sm text-red-600 font-medium" role="alert">
                      {validationError}
                    </div>
                  )}
                  <button
                    ref={checkButtonRef}
                    onClick={onCheckAnswer}
                    disabled={gameMode === 'practice' && gameStep === 'select-law'}
                    className="w-full mt-3 phone:mt-2 py-3 phone:py-2.5 px-6 rounded-lg font-bold text-white transition hover:opacity-90 disabled:bg-warm-300 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        gameMode !== 'practice' || gameStep !== 'select-law'
                          ? '#f36b22'
                          : undefined,
                    }}
                  >
                    Athuga Svar (Enter)
                  </button>
                </div>

                <div className="bg-warm-50 p-4 rounded-lg border border-warm-200 mb-4 phone:p-3 phone:mb-0">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                    <h3 className="font-bold text-warm-800">Vísbendingar:</h3>
                    <button
                      onClick={onGetHint}
                      disabled={showHint >= currentQuestion.hints.length}
                      className={`px-3 py-1 rounded-lg text-sm font-bold transition pointer-coarse:min-h-11 pointer-coarse:px-4 ${
                        showHint >= currentQuestion.hints.length
                          ? 'bg-warm-300 text-warm-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Vísbending (H) {gameMode === 'challenge' && ''}
                    </button>
                  </div>
                  {showHint > 0 ? (
                    <div className="space-y-2">
                      {currentQuestion.hints.slice(0, showHint).map((hint, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-50 px-3 py-2 rounded border border-blue-200 text-sm"
                        >
                          <span className="font-bold text-blue-800">💡 {idx + 1}:</span>{' '}
                          <FormulaText text={hint} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-warm-600">Smelltu á "Vísbending" til að fá hjálp</p>
                  )}
                </div>

                {gameMode === 'practice' && (
                  <div className="bg-warm-50 p-4 rounded-lg border border-warm-200 phone:p-3">
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="w-full px-3 py-2 bg-warm-700 text-white rounded-lg hover:bg-warm-800 transition font-bold text-sm pointer-coarse:min-h-11"
                    >
                      {showSolution ? '🔒 Fela lausn' : '🔓 Sýna lausn (S)'}
                    </button>
                    <Presence show={showSolution} exitDuration={250}>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="bg-white px-3 py-2 rounded border border-warm-300">
                          <span className="font-bold">Formúla:</span>{' '}
                          <FormulaText text={currentQuestion.solution.formula} />
                        </div>
                        <div className="bg-white px-3 py-2 rounded border border-warm-300">
                          <span className="font-bold">Innsetning:</span>{' '}
                          <FormulaText text={currentQuestion.solution.substitution} />
                        </div>
                        <div className="bg-white px-3 py-2 rounded border border-warm-300">
                          <span className="font-bold">Útreikningur:</span>{' '}
                          <FormulaText text={currentQuestion.solution.calculation} />
                        </div>
                        <div className="bg-green-50 px-3 py-2 rounded border border-green-300 font-bold text-green-800">
                          Svar: {answerText(currentQuestion)} {answerUnit(currentQuestion)}
                        </div>
                      </div>
                    </Presence>
                  </div>
                )}

                <div className="mt-4 bg-warm-50 p-3 rounded-lg border border-warm-200 text-xs phone:mt-0 phone:order-2">
                  <p className="font-bold text-warm-700 mb-1">Upprifjun:</p>
                  <p className="text-warm-600">P = nRT/V • V = nRT/P • T = PV/nR • n = PV/RT</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
