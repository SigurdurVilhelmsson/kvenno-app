import { Presence } from '@shared/components';

import type { Level } from '../data';
import { GasLawQuestion, GameMode, GameStats, GasLaw, GAS_LAW_INFO } from '../types';
import { GasLawSimulator } from './GasLawSimulator';
import { getUnit, getVariableName } from '../utils/gas-calculations';

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
}: GameScreenProps) {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#f36b22' }}>
                  Gas Law Challenge
                </h1>
                <p className="text-sm text-warm-600">
                  Stig {selectedLevel} • {gameMode === 'practice' ? 'Æfingahamur' : 'Keppnishamur'}{' '}
                  • Spurning {currentQuestion.id}
                </p>
              </div>
              <div className="flex gap-2">
                {gameMode === 'challenge' && timeRemaining !== null && (
                  <div
                    role="timer"
                    aria-live={timeRemaining < 10 ? 'assertive' : 'off'}
                    aria-label={`${timeRemaining} sekúndur eftir${timeRemaining < 30 ? ' — stutt eftir' : ''}`}
                    className={`px-4 py-2 rounded-lg font-bold ${timeRemaining < 30 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                  >
                    ⏱️ {timeRemaining < 30 ? '⚠️ ' : ''}
                    {timeRemaining}s
                  </div>
                )}
                <button
                  onClick={onBackToMenu}
                  className="px-4 py-2 bg-warm-200 rounded-lg hover:bg-warm-300 transition"
                >
                  ← Valmynd
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-6 text-sm">
              <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <span className="font-bold text-yellow-800">🏆 {stats.score}</span>
              </div>
              <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <span className="font-bold text-green-800">
                  ✓ {stats.correctAnswers}/{stats.questionsAnswered}
                </span>
              </div>
              <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <span className="font-bold text-blue-800">🔥 {stats.streak}</span>
              </div>
              <div
                className={`px-3 py-2 rounded-lg border ${
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
            {gameStep === 'select-law' && gameMode === 'practice' && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
                  <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📚</span> Skref 1: Hvaða lögmál á við?
                  </h3>

                  <div className="bg-white p-3 rounded-lg border border-warm-200 mb-4">
                    <h4 className="font-bold text-warm-800 mb-1">
                      {currentQuestion.emoji} {currentQuestion.scenario_is}
                    </h4>
                    <p className="text-xs text-warm-500">{currentQuestion.scenario_en}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
                    {currentQuestion.given.P && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-center">
                        <span className="font-semibold">P:</span> {currentQuestion.given.P.value}{' '}
                        {currentQuestion.given.P.unit}
                      </div>
                    )}
                    {currentQuestion.given.V && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-center">
                        <span className="font-semibold">V:</span> {currentQuestion.given.V.value}{' '}
                        {currentQuestion.given.V.unit}
                      </div>
                    )}
                    {currentQuestion.given.T && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-center">
                        <span className="font-semibold">T:</span> {currentQuestion.given.T.value}{' '}
                        {currentQuestion.given.T.unit}
                      </div>
                    )}
                    {currentQuestion.given.n && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-center">
                        <span className="font-semibold">n:</span> {currentQuestion.given.n.value}{' '}
                        {currentQuestion.given.n.unit}
                      </div>
                    )}
                    <div className="bg-orange-50 px-2 py-1 rounded text-center">
                      <span className="font-semibold text-orange-700">
                        Finna: {currentQuestion.find}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {Object.entries(GAS_LAW_INFO).map(([law, info]) => {
                      return (
                        <button
                          key={law}
                          onClick={() => setSelectedLaw(law as GasLaw)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedLaw === law
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-warm-200 hover:border-indigo-300 bg-white'
                          }`}
                        >
                          <div className="font-semibold text-sm text-warm-800">{info.nameIs}</div>
                          <div className="font-mono text-xs text-indigo-600">{info.formula}</div>
                          <div className="text-xs text-warm-500 mt-1">{info.constants}</div>
                        </button>
                      );
                    })}
                  </div>

                  <Presence show={!!lawFeedback} exitDuration={250}>
                    <div
                      className={`p-3 rounded-lg mb-4 ${
                        lawFeedback?.correct
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{lawFeedback?.correct ? '✅' : '❌'}</span>
                        <span>{lawFeedback?.message}</span>
                      </div>
                    </div>
                  </Presence>

                  <div className="flex gap-2">
                    <button
                      onClick={onCheckLaw}
                      disabled={!selectedLaw}
                      className="flex-1 py-2 px-4 rounded-lg font-bold text-white transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700"
                    >
                      Athuga lögmál
                    </button>
                    <button
                      onClick={onSkipLaw}
                      className="px-4 py-2 bg-warm-200 text-warm-700 rounded-lg hover:bg-warm-300 transition text-sm"
                    >
                      Sleppa →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Visualization */}
              <div>
                <div className="bg-warm-50 p-4 rounded-lg border border-warm-200 mb-4">
                  <h3 className="font-bold text-warm-800 mb-2">
                    {currentQuestion.emoji} {currentQuestion.scenario_is}
                  </h3>
                  <p className="text-sm text-warm-600">{currentQuestion.scenario_en}</p>
                </div>

                <GasLawSimulator
                  question={currentQuestion}
                  isRunning={isGameScreenActive}
                  showAnswer={simulatorShowAnswer}
                  correctAnswer={currentQuestion.answer}
                />

                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-2">Gefnar upplýsingar:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {currentQuestion.given.P && (
                      <div className="bg-white px-3 py-2 rounded">
                        <span className="font-semibold">P:</span> {currentQuestion.given.P.value}{' '}
                        {currentQuestion.given.P.unit}
                      </div>
                    )}
                    {currentQuestion.given.V && (
                      <div className="bg-white px-3 py-2 rounded">
                        <span className="font-semibold">V:</span> {currentQuestion.given.V.value}{' '}
                        {currentQuestion.given.V.unit}
                      </div>
                    )}
                    {currentQuestion.given.T && (
                      <div className="bg-white px-3 py-2 rounded">
                        <span className="font-semibold">T:</span> {currentQuestion.given.T.value}{' '}
                        {currentQuestion.given.T.unit}
                      </div>
                    )}
                    {currentQuestion.given.n && (
                      <div className="bg-white px-3 py-2 rounded">
                        <span className="font-semibold">n:</span> {currentQuestion.given.n.value}{' '}
                        {currentQuestion.given.n.unit}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-blue-800 font-mono bg-white px-2 py-1 rounded">
                    PV = nRT þar sem R = 0.08206 L·atm/(mol·K)
                  </div>
                </div>
              </div>

              {/* Right: Input and Hints */}
              <div>
                {gameMode === 'practice' && gameStep === 'solve' && currentQuestion.gasLaw && (
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-indigo-600 font-semibold">📚 Lögmál:</span>
                      <span className="font-mono bg-white px-2 py-1 rounded text-indigo-800">
                        {GAS_LAW_INFO[currentQuestion.gasLaw].formula}
                      </span>
                      <span className="text-warm-600">
                        ({GAS_LAW_INFO[currentQuestion.gasLaw].nameIs})
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={`bg-orange-50 p-4 rounded-lg border-2 border-orange-200 mb-4 ${
                    gameMode === 'practice' && gameStep === 'select-law' ? 'opacity-50' : ''
                  }`}
                >
                  <h3 className="font-bold text-orange-900 mb-2">
                    <label htmlFor="gas-law-answer">
                      {gameMode === 'practice' && gameStep === 'select-law' && '(Skref 2) '}
                      Finndu {getVariableName(currentQuestion.find)} ({currentQuestion.find}):
                    </label>
                  </h3>
                  <div className="flex gap-2">
                    <input
                      id="gas-law-answer"
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={
                        gameMode === 'practice' && gameStep === 'select-law'
                          ? 'Veldu lögmál fyrst...'
                          : 'Sláðu inn svar...'
                      }
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-warm-300 focus:border-orange-500 focus:outline-none text-lg disabled:bg-warm-100 disabled:cursor-not-allowed"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && gameStep === 'solve' && onCheckAnswer()
                      }
                      disabled={gameMode === 'practice' && gameStep === 'select-law'}
                      aria-label={`Svar fyrir ${getVariableName(currentQuestion.find)} í einingunni ${getUnit(currentQuestion.find)}`}
                    />
                    <div className="bg-white px-4 py-3 rounded-lg border-2 border-warm-300 font-bold text-warm-700">
                      {getUnit(currentQuestion.find)}
                    </div>
                  </div>
                  {validationError && (
                    <div className="mt-2 text-sm text-red-600 font-medium" role="alert">
                      {validationError}
                    </div>
                  )}
                  <button
                    onClick={onCheckAnswer}
                    disabled={gameMode === 'practice' && gameStep === 'select-law'}
                    className="w-full mt-3 py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90 disabled:bg-warm-300 disabled:cursor-not-allowed"
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

                <div className="bg-warm-50 p-4 rounded-lg border border-warm-200 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-warm-800">Vísbendingar:</h3>
                    <button
                      onClick={onGetHint}
                      disabled={showHint >= currentQuestion.hints.length}
                      className={`px-3 py-1 rounded-lg text-sm font-bold transition ${
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
                          <span className="font-bold text-blue-800">💡 {idx + 1}:</span> {hint}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-warm-600">Smelltu á "Vísbending" til að fá hjálp</p>
                  )}
                </div>

                {gameMode === 'practice' && (
                  <div className="bg-warm-50 p-4 rounded-lg border border-warm-200">
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="w-full px-3 py-2 bg-warm-700 text-white rounded-lg hover:bg-warm-800 transition font-bold text-sm"
                    >
                      {showSolution ? '🔒 Fela lausn' : '🔓 Sýna lausn (S)'}
                    </button>
                    <Presence show={showSolution} exitDuration={250}>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="bg-white px-3 py-2 rounded border border-warm-300">
                          <span className="font-bold">Formúla:</span>{' '}
                          {currentQuestion.solution.formula}
                        </div>
                        <div className="bg-white px-3 py-2 rounded border border-warm-300">
                          <span className="font-bold">Innsetning:</span>{' '}
                          {currentQuestion.solution.substitution}
                        </div>
                        <div className="bg-white px-3 py-2 rounded border border-warm-300">
                          <span className="font-bold">Útreikningur:</span>{' '}
                          {currentQuestion.solution.calculation}
                        </div>
                        <div className="bg-green-50 px-3 py-2 rounded border border-green-300 font-bold text-green-800">
                          Svar: {currentQuestion.answer.toFixed(2)} {getUnit(currentQuestion.find)}
                        </div>
                      </div>
                    </Presence>
                  </div>
                )}

                <div className="mt-4 bg-warm-50 p-3 rounded-lg border border-warm-200 text-xs">
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
