import { useState, useEffect } from 'react';

import {
  Header,
  LanguageSwitcher,
  ErrorBoundary,
  Presence,
  FadePresence,
} from '@shared/components';
import { useGameI18n } from '@shared/hooks';

import { GasLawSimulator } from './components/GasLawSimulator';
import { questions, getRandomQuestion } from './data';
import { gameTranslations } from './i18n';
import {
  GasLawQuestion,
  GameMode,
  GameStats,
  QuestionFeedback,
  GasLaw,
  GAS_LAW_INFO,
} from './types';
import { checkAnswer, calculateError, getUnit, getVariableName } from './utils/gas-calculations';

const STORAGE_KEY = 'gas-law-challenge-progress';

function loadStats(): GameStats {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultStats();
    }
  }
  return getDefaultStats();
}

function getDefaultStats(): GameStats {
  return {
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    hintsUsed: 0,
  };
}

function saveStats(stats: GameStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function App() {
  // Game state
  const [screen, setScreen] = useState<'menu' | 'game' | 'feedback'>('menu');
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [currentQuestion, setCurrentQuestion] = useState<GasLawQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState<QuestionFeedback | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [sessionHintsUsed, setSessionHintsUsed] = useState(0);
  const [sessionQuestionsAnswered, setSessionQuestionsAnswered] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Law selection step state (practice mode only)
  const [gameStep, setGameStep] = useState<'select-law' | 'solve'>('select-law');
  const [selectedLaw, setSelectedLaw] = useState<GasLaw | null>(null);
  const [lawFeedback, setLawFeedback] = useState<{ correct: boolean; message: string } | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Stats with localStorage persistence
  const [stats, setStats] = useState<GameStats>(loadStats);

  // Save stats whenever they change
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const resetStats = () => {
    const newStats = getDefaultStats();
    setStats(newStats);
    saveStats(newStats);
  };

  // Start new question
  const startNewQuestion = (mode: GameMode) => {
    const question = getRandomQuestion();
    setGameMode(mode);
    setCurrentQuestion(question);
    setUserAnswer('');
    setShowHint(0);
    setShowSolution(false);
    setFeedback(null);
    setTimeRemaining(mode === 'challenge' ? 90 : null);
    // Law selection step - only in practice mode
    setGameStep(mode === 'practice' ? 'select-law' : 'solve');
    setSelectedLaw(null);
    setLawFeedback(null);
    setScreen('game');
  };

  // Check selected gas law
  const checkSelectedLaw = () => {
    if (!currentQuestion || !selectedLaw) return;

    const isCorrect = selectedLaw === currentQuestion.gasLaw;
    const correctLawInfo = GAS_LAW_INFO[currentQuestion.gasLaw];

    if (isCorrect) {
      setLawFeedback({
        correct: true,
        message: `Rétt! Þetta er ${correctLawInfo.nameIs} (${correctLawInfo.formula})`,
      });
      // Move to solve step after short delay
      setTimeout(() => {
        setGameStep('solve');
      }, 1500);
    } else {
      setLawFeedback({
        correct: false,
        message: `Ekki rétt. Þetta verkefni notar ${correctLawInfo.nameIs}: ${correctLawInfo.formula}. ${correctLawInfo.description}.`,
      });
    }
  };

  // Skip law selection (practice mode only)
  const skipLawSelection = () => {
    setGameStep('solve');
  };

  // Timer for challenge mode
  useEffect(() => {
    if (
      screen === 'game' &&
      gameMode === 'challenge' &&
      timeRemaining !== null &&
      timeRemaining > 0
    ) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      checkUserAnswer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only trigger on screen/mode/timer state changes
  }, [screen, gameMode, timeRemaining]);

  // Check user answer
  const checkUserAnswer = () => {
    if (!currentQuestion) return;

    const userNum = parseFloat(userAnswer);
    if (isNaN(userNum)) {
      setValidationError('Vinsamlegast sláðu inn gilt númer');
      return;
    }
    if (userNum < 0) {
      setValidationError('Gildi má ekki vera neikvætt');
      return;
    }
    if (userNum === 0) {
      setValidationError('Gildi má ekki vera núll');
      return;
    }
    if (userNum > 1_000_000) {
      setValidationError('Gildi er of hátt — athugaðu einingarnar');
      return;
    }
    setValidationError(null);

    const isCorrect = checkAnswer(userNum, currentQuestion.answer, currentQuestion.tolerance);
    const error = calculateError(userNum, currentQuestion.answer);

    let points = 0;
    let message: string;

    if (isCorrect) {
      points = 100;
      if (error < 1) points = 150; // Very accurate
      if (gameMode === 'challenge' && timeRemaining && timeRemaining > 60) points += 50; // Time bonus
      // Hints are free — no penalty for learning

      message = error < 1 ? 'Fullkomið! Mjög nákvæmt svar! ⭐' : 'Rétt! Innan vikmarka ✓';
    } else {
      message = error < 5 ? 'Næstum rétt! Reyndu aftur.' : 'Ekki rétt. Athugaðu útreikninga þína.';
    }

    const newQuestionsAnswered = sessionQuestionsAnswered + 1;
    setSessionQuestionsAnswered(newQuestionsAnswered);

    if (newQuestionsAnswered === 15) {
      setSessionCompleted(true);
    }

    const newStats = {
      ...stats,
      questionsAnswered: stats.questionsAnswered + 1,
      correctAnswers: isCorrect ? stats.correctAnswers + 1 : stats.correctAnswers,
      streak: isCorrect ? stats.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
      score: stats.score + points,
      hintsUsed: stats.hintsUsed + showHint,
    };

    setStats(newStats);
    setFeedback({
      isCorrect,
      message,
      points,
      userAnswer: userNum,
      correctAnswer: currentQuestion.answer,
      difference: Math.abs(userNum - currentQuestion.answer),
      explanation: currentQuestion.solution.steps.join(' → '),
    });
    setScreen('feedback');
  };

  // Get next hint
  const getHint = () => {
    if (!currentQuestion || showHint >= currentQuestion.hints.length) return;
    setShowHint(showHint + 1);
    setSessionHintsUsed(sessionHintsUsed + 1);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (screen !== 'game') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        checkUserAnswer();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        getHint();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowSolution(!showSolution);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: keyboard handler uses current closure values
  }, [screen, userAnswer, showSolution]);

  // ==================== RENDER ====================

  const renderMenu = () => {
    return (
      <div>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          <Header
            variant="game"
            backHref="/efnafraedi/3-ar/"
            gameTitle="Gas Law Challenge"
            authSlot={
              <LanguageSwitcher
                language={language}
                onLanguageChange={setLanguage}
                variant="compact"
              />
            }
          />
          <div className="min-h-screen">
            <main className="max-w-5xl mx-auto px-4 py-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <p className="text-lg text-warm-600 mb-2">
                    Læðu að leysa verkefni um tilvalin lofttegundalögmál: PV = nRT
                  </p>
                  <p className="text-sm text-warm-500">
                    {questions.length} spurningar í boði • Auðvelt, Miðlungs, Erfitt
                  </p>

                  {/* Stats */}
                  {stats.questionsAnswered > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-center gap-4 text-sm flex-wrap">
                        <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                          <span className="font-bold text-yellow-800">🏆 Stig: {stats.score}</span>
                        </div>
                        <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <span className="font-bold text-green-800">
                            ✓ Rétt: {stats.correctAnswers}/{stats.questionsAnswered}
                          </span>
                        </div>
                        <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                          <span className="font-bold text-blue-800">
                            🔥 Besta röð: {stats.bestStreak}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={resetStats}
                        className="mt-3 text-sm text-warm-500 hover:text-red-500 transition-colors"
                      >
                        Endurstilla framvindu
                      </button>
                    </div>
                  )}
                </div>

                {/* Conceptual intro — WHY does PV=nRT? */}
                <div className="bg-purple-50 p-6 rounded-xl mb-8 border border-purple-200">
                  <h2 className="font-bold text-purple-800 mb-3">Af hverju PV = nRT?</h2>
                  <p className="text-sm text-purple-700 mb-3">
                    Gasagnir (sameindir) eru á stöðugri hreyfingu. Þegar þær rekast á veggi ílátsins
                    skapa þær <strong>þrýsting</strong>. Þetta tengir saman fjórar stærðir:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="bg-white p-2 rounded">
                      <strong className="text-blue-700">P (þrýstingur)</strong> — fleiri árekstur =
                      meiri þrýstingur
                    </div>
                    <div className="bg-white p-2 rounded">
                      <strong className="text-green-700">V (rúmmál)</strong> — minna ílát = fleiri
                      árekstur
                    </div>
                    <div className="bg-white p-2 rounded">
                      <strong className="text-red-700">T (hitastig)</strong> — hærra T = hraðari
                      agnir = harðari árekstur
                    </div>
                    <div className="bg-white p-2 rounded">
                      <strong className="text-amber-700">n (mólfjöldi)</strong> — fleiri agnir =
                      fleiri árekstur
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="font-mono text-purple-800 text-lg">PV = nRT</p>
                    <p className="text-xs text-purple-600 mt-1">
                      R = 0,08206 L·atm/(mol·K) — tengir einingarnar saman
                    </p>
                  </div>
                  <p className="text-xs text-purple-600 mt-3">
                    <strong>Mikilvægt:</strong> T verður alltaf að vera í Kelvin (K = °C + 273).
                    Þetta lögmál gildir best fyrir gas við lágan þrýsting og hátt hitastig (tilvalið
                    gas).
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Practice Mode */}
                  <div className="game-card bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                    <h2 className="text-2xl font-bold mb-3 text-blue-900">Æfingahamur</h2>
                    <ul className="text-warm-700 mb-4 space-y-2 text-sm">
                      <li>✓ Engin tímatakmörk</li>
                      <li>✓ Ótakmarkaðar vísbendingar</li>
                      <li>✓ Sjá lausnir skref fyrir skref</li>
                      <li>✓ Leggja áherslu á nám</li>
                    </ul>
                    <button
                      onClick={() => startNewQuestion('practice')}
                      className="w-full py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90"
                      style={{ backgroundColor: '#3b82f6' }}
                    >
                      Byrja að Æfa
                    </button>
                  </div>

                  {/* Challenge Mode */}
                  <div className="game-card bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                    <h2 className="text-2xl font-bold mb-3 text-orange-900">Keppnishamur</h2>
                    <ul className="text-warm-700 mb-4 space-y-2 text-sm">
                      <li>⏱️ 90 sekúndur á spurningu</li>
                      <li>🎯 Tíma bónus fyrir hraða</li>
                      <li>💡 Vísbendingar kosta stig (-10)</li>
                      <li>📊 Stigatafla og röð</li>
                    </ul>
                    <button
                      onClick={() => startNewQuestion('challenge')}
                      className="w-full py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90"
                      style={{ backgroundColor: '#f36b22' }}
                    >
                      Byrja Keppni
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-warm-50 p-4 rounded-lg border border-warm-200">
                  <h3 className="font-bold text-warm-800 mb-2">Leiðbeiningar:</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-warm-700">
                    <div>
                      <p className="font-semibold">Tilvalin lofttegundalögmál:</p>
                      <p className="font-mono bg-white px-2 py-1 rounded mt-1">PV = nRT</p>
                      <p className="text-xs mt-1">þar sem R = 0.08206 L·atm/(mol·K)</p>
                    </div>
                    <div>
                      <p className="font-semibold">Lyklaborð:</p>
                      <p className="text-xs">
                        • <kbd className="px-1 bg-warm-200 rounded">Enter</kbd> Athuga svar
                      </p>
                      <p className="text-xs">
                        • <kbd className="px-1 bg-warm-200 rounded">H</kbd> Vísbending
                      </p>
                      <p className="text-xs">
                        • <kbd className="px-1 bg-warm-200 rounded">S</kbd> Sýna lausn
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <footer className="text-center text-sm text-warm-500 py-4">
              <p>© 2024 Kvennaskólinn - Efnafræðileikir</p>
            </footer>
          </div>
        </div>
      </div>
    );
  };

  const renderGame = () => {
    if (!currentQuestion) return null;
    return (
      <div>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          <main className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#f36b22' }}>
                    Gas Law Challenge
                  </h1>
                  <p className="text-sm text-warm-600">
                    {gameMode === 'practice' ? 'Æfingahamur' : 'Keppnishamur'} • Spurning{' '}
                    {currentQuestion.id}
                  </p>
                </div>
                <div className="flex gap-2">
                  {gameMode === 'challenge' && timeRemaining !== null && (
                    <div
                      className={`px-4 py-2 rounded-lg font-bold ${timeRemaining < 30 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                    >
                      ⏱️ {timeRemaining}s
                    </div>
                  )}
                  <button
                    onClick={() => setScreen('menu')}
                    className="px-4 py-2 bg-warm-200 rounded-lg hover:bg-warm-300 transition"
                  >
                    ← Valmynd
                  </button>
                </div>
              </div>

              {/* Stats bar */}
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

                    {/* Question context */}
                    <div className="bg-white p-3 rounded-lg border border-warm-200 mb-4">
                      <h4 className="font-bold text-warm-800 mb-1">
                        {currentQuestion.emoji} {currentQuestion.scenario_is}
                      </h4>
                      <p className="text-xs text-warm-500">{currentQuestion.scenario_en}</p>
                    </div>

                    {/* Given values preview */}
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

                    {/* Law selection buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {(Object.keys(GAS_LAW_INFO) as GasLaw[]).map((law) => {
                        const info = GAS_LAW_INFO[law];
                        return (
                          <button
                            key={law}
                            onClick={() => setSelectedLaw(law)}
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

                    {/* Feedback */}
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

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={checkSelectedLaw}
                        disabled={!selectedLaw}
                        className="flex-1 py-2 px-4 rounded-lg font-bold text-white transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700"
                      >
                        Athuga lögmál
                      </button>
                      <button
                        onClick={skipLawSelection}
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

                  {/* Gas Law Simulator */}
                  <GasLawSimulator
                    question={currentQuestion}
                    isRunning={screen === 'game'}
                    showAnswer={feedback?.isCorrect === true}
                    correctAnswer={currentQuestion.answer}
                  />

                  {/* Given Values */}
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
                  {/* Law indicator (shows after selection in practice mode) */}
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

                  {/* Question */}
                  <div
                    className={`bg-orange-50 p-4 rounded-lg border-2 border-orange-200 mb-4 ${
                      gameMode === 'practice' && gameStep === 'select-law' ? 'opacity-50' : ''
                    }`}
                  >
                    <h3 className="font-bold text-orange-900 mb-2">
                      {gameMode === 'practice' && gameStep === 'select-law' && '(Skref 2) '}
                      Finndu {getVariableName(currentQuestion.find)} ({currentQuestion.find}):
                    </h3>
                    <div className="flex gap-2">
                      <input
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
                          e.key === 'Enter' && gameStep === 'solve' && checkUserAnswer()
                        }
                        disabled={gameMode === 'practice' && gameStep === 'select-law'}
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
                      onClick={checkUserAnswer}
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

                  {/* Hints */}
                  <div className="bg-warm-50 p-4 rounded-lg border border-warm-200 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-warm-800">Vísbendingar:</h3>
                      <button
                        onClick={getHint}
                        disabled={showHint >= currentQuestion.hints.length}
                        className={`px-3 py-1 rounded-lg text-sm font-bold transition ${
                          showHint >= currentQuestion.hints.length
                            ? 'bg-warm-300 text-warm-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Vísbending (H) {gameMode === 'challenge' && '(-10 stig)'}
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
                      <p className="text-sm text-warm-600">
                        Smelltu á "Vísbending" til að fá hjálp
                      </p>
                    )}
                  </div>

                  {/* Solution Toggle */}
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
                            Svar: {currentQuestion.answer.toFixed(2)}{' '}
                            {getUnit(currentQuestion.find)}
                          </div>
                        </div>
                      </Presence>
                    </div>
                  )}

                  {/* Formula Reference */}
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
  };

  const renderFeedback = () => {
    if (!feedback || !currentQuestion) return null;
    return (
      <div>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
          <main className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Result Header */}
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

              {/* Session completion banner */}
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

              {/* Answer Comparison */}
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

              {/* Difference */}
              {!feedback.isCorrect && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                  <h3 className="font-bold text-yellow-900 mb-1">Mismunur:</h3>
                  <p className="text-lg text-yellow-800">
                    {feedback.difference.toFixed(2)} {getUnit(currentQuestion.find)} frá réttum
                    svari
                  </p>
                </div>
              )}

              {/* Explanation */}
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

              {/* Stats Update */}
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

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={() => startNewQuestion(gameMode)}
                  className="flex-1 py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#f36b22' }}
                >
                  ➡️ Næsta spurning
                </button>
                <button
                  onClick={() => setScreen('menu')}
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
  };

  return (
    <>
      <FadePresence show={screen === 'menu'} exitDuration={200}>
        {renderMenu()}
      </FadePresence>
      <FadePresence show={screen === 'game'} exitDuration={200}>
        {renderGame()}
      </FadePresence>
      <FadePresence show={screen === 'feedback'} exitDuration={200}>
        {renderFeedback()}
      </FadePresence>
    </>
  );
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
