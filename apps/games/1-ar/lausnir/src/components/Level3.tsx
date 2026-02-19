import { useState, useEffect, useRef, useCallback } from 'react';
import { Problem, Difficulty, GameMode } from '../types';
import { CHEMISTRY_FACTS } from '../data';
import { generateProblem } from '../utils/problem-generator';
import {
  validateInput,
  checkAnswer,
  getContextualFeedback
} from '../utils/validation';
import {
  getPointValue,
  getHintPenalty,
  getSpeedBonus,
  getStreakBonus,
  getMaxScore,
  getProblemCount,
  getAchievement
} from '../utils/scoring';
import { BeakerVisualization } from './BeakerVisualization';
import { StepBySolution } from './StepBySolution';
import { FormulaCard } from './FormulaCard';

interface Level3Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface Level3State {
  currentProblem: Problem | null;
  userAnswer: string;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  isPlaying: boolean;
  gameOver: boolean;
  difficulty: Difficulty;
  showFeedback: boolean;
  lastAnswerCorrect: boolean | null;
  showHint: boolean;
  hintLevel: number;
  problemsCompleted: number;
  totalProblems: number;
  streak: number;
  bestStreak: number;
  incorrectAttempts: number;
  showSolution: boolean;
  gameMode: GameMode;
  showFormulaCard: boolean;
  timerMode: boolean;
  timeRemaining: number;
  showBeakers: boolean;
  inputError: string | null;
  achievementShown: string | null;
}

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [gameState, setGameState] = useState<Level3State>({
    currentProblem: null,
    userAnswer: '',
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    isPlaying: false,
    gameOver: false,
    difficulty: 'easy',
    showFeedback: false,
    lastAnswerCorrect: null,
    showHint: false,
    hintLevel: 0,
    problemsCompleted: 0,
    totalProblems: 10,
    streak: 0,
    bestStreak: 0,
    incorrectAttempts: 0,
    showSolution: false,
    gameMode: 'competition',
    showFormulaCard: false,
    timerMode: false,
    timeRemaining: 90,
    showBeakers: true,
    inputError: null,
    achievementShown: null
  });

  const [animateBeakers, setAnimateBeakers] = useState(false);
  const [currentFact, setCurrentFact] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const themeColor = '#8b5cf6'; // Purple for Level 3
  const themeColorDark = '#7c3aed';

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, timeRemaining: 0, showFeedback: true, lastAnswerCorrect: false };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, []);

  const startGame = useCallback((difficulty: Difficulty) => {
    const problemsCount = getProblemCount(difficulty);
    const firstProblem = generateProblem(difficulty);

    setGameState((prev) => ({
      ...prev,
      difficulty,
      currentProblem: firstProblem,
      userAnswer: '',
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      isPlaying: true,
      gameOver: false,
      showFeedback: false,
      lastAnswerCorrect: null,
      showHint: false,
      hintLevel: 0,
      problemsCompleted: 0,
      totalProblems: problemsCount,
      streak: 0,
      incorrectAttempts: 0,
      showSolution: false,
      inputError: null,
      timeRemaining: 90
    }));

    setAnimateBeakers(true);
    setTimeout(() => setAnimateBeakers(false), 2000);

    if (gameState.timerMode) {
      startTimer();
    }
  }, [gameState.timerMode, startTimer]);

  const checkAnswerHandler = useCallback(() => {
    if (!gameState.currentProblem || !gameState.userAnswer.trim()) return;

    const validation = validateInput(gameState.userAnswer);
    if (!validation.valid) {
      setGameState((prev) => ({ ...prev, inputError: validation.error }));
      return;
    }

    const userValue = validation.value!;
    const correctAnswer = gameState.currentProblem.answer;
    const isCorrect = checkAnswer(userValue, correctAnswer);

    const pointValue = getPointValue(gameState.currentProblem.difficulty);
    const hintPenalty = getHintPenalty(gameState.hintLevel, gameState.gameMode);
    const speedBonus = isCorrect
      ? getSpeedBonus(gameState.timeRemaining, gameState.timerMode)
      : 0;

    const newStreak = isCorrect ? gameState.streak + 1 : 0;
    const streakBonus = getStreakBonus(newStreak);

    const achievement = isCorrect
      ? getAchievement(newStreak, gameState.currentProblem.type)
      : null;

    // Track achievement callbacks
    if (isCorrect) {
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }

    setGameState((prev) => {
      const newProblemsCompleted = prev.problemsCompleted + 1;
      const isGameOver = newProblemsCompleted >= prev.totalProblems;

      return {
        ...prev,
        score: isCorrect
          ? prev.score + pointValue - hintPenalty + speedBonus + streakBonus
          : prev.score,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        showFeedback: true,
        lastAnswerCorrect: isCorrect,
        problemsCompleted: newProblemsCompleted,
        gameOver: isGameOver,
        isPlaying: !isGameOver,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        incorrectAttempts: isCorrect ? 0 : prev.incorrectAttempts + 1,
        achievementShown: achievement
      };
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (Math.random() < 0.3) {
      setCurrentFact(
        CHEMISTRY_FACTS[Math.floor(Math.random() * CHEMISTRY_FACTS.length)]
      );
    }

    setTimeout(() => {
      if (gameState.problemsCompleted + 1 < gameState.totalProblems) {
        const nextProblem = generateProblem(gameState.difficulty);
        setGameState((prev) => ({
          ...prev,
          currentProblem: nextProblem,
          userAnswer: '',
          showFeedback: false,
          lastAnswerCorrect: null,
          showHint: false,
          hintLevel: 0,
          incorrectAttempts: 0,
          showSolution: false,
          inputError: null,
          timeRemaining: 90,
          achievementShown: null
        }));
        setAnimateBeakers(true);
        setTimeout(() => setAnimateBeakers(false), 2000);
        if (inputRef.current) inputRef.current.focus();
        if (gameState.timerMode) startTimer();
      } else {
        setCurrentFact(null);
      }
    }, 3000);
  }, [gameState, startTimer, onCorrectAnswer, onIncorrectAnswer]);

  const showNextHint = () => {
    setGameState((prev) => ({
      ...prev,
      hintLevel: Math.min(prev.hintLevel + 1, 3),
      showHint: true
    }));
    setTotalHintsUsed(prev => prev + 1);
  };

  const revealSolution = () => {
    setGameState((prev) => ({
      ...prev,
      showSolution: true,
      score: prev.gameMode === 'competition' ? prev.score + 5 : prev.score
    }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !gameState.showFeedback && gameState.userAnswer.trim()) {
        checkAnswerHandler();
      } else if ((e.key === 'h' || e.key === 'H') && !gameState.showFeedback && gameState.hintLevel < 3) {
        showNextHint();
      } else if ((e.key === 's' || e.key === 'S') && gameState.incorrectAttempts >= 2 && !gameState.showSolution) {
        revealSolution();
      } else if (e.key === 'f' || e.key === 'F') {
        setGameState((prev) => ({ ...prev, showFormulaCard: !prev.showFormulaCard }));
      } else if (e.key === 'r' || e.key === 'R') {
        setAnimateBeakers(true);
        setTimeout(() => setAnimateBeakers(false), 2000);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameState.showFeedback, gameState.userAnswer, gameState.hintLevel, gameState.incorrectAttempts, gameState.showSolution, checkAnswerHandler]);

  // Focus input
  useEffect(() => {
    if (gameState.isPlaying && !gameState.showFeedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState.isPlaying, gameState.showFeedback, gameState.currentProblem]);

  // Clear input error
  useEffect(() => {
    if (gameState.userAnswer && gameState.inputError) {
      const validation = validateInput(gameState.userAnswer);
      if (validation.valid) {
        setGameState((prev) => ({ ...prev, inputError: null }));
      }
    }
  }, [gameState.userAnswer, gameState.inputError]);

  // Menu Screen
  if (!gameState.isPlaying && !gameState.gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Til baka
            </button>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold text-center mb-2"
            style={{ color: themeColor }}
          >
            Lausnir - Stigur 3
          </h1>
          <p className="text-center text-gray-600 mb-6">Útreikningar - Notaðu formúlurnar!</p>

          <div className="bg-purple-50 p-4 rounded-xl mb-6">
            <h3 className="font-semibold text-purple-800 mb-2">Nú ertu tilbúin(n) að reikna!</h3>
            <p className="text-sm text-purple-700">
              Þú hefur lært hugtökin í Stigi 1 og spáð fyrir um breytingar í Stigi 2.
              Nú er komið að nota formúlurnar til að reikna nákvæm svör.
            </p>
          </div>

          <div className="space-y-6">
            {/* Game mode selection */}
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">Veldu leikstillingu:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setGameState((prev) => ({ ...prev, gameMode: 'competition' }))}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    gameState.gameMode === 'competition'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-xl font-bold">Keppnisstilling</div>
                  <div className="text-sm mt-2 text-gray-600">
                    Stigagjöf, tímamót, ábendingar kosta stig
                  </div>
                </button>
                <button
                  onClick={() => setGameState((prev) => ({ ...prev, gameMode: 'practice' }))}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    gameState.gameMode === 'practice'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-200'
                  }`}
                >
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-xl font-bold">Æfingastilling</div>
                  <div className="text-sm mt-2 text-gray-600">
                    Engin stig, ókeypis ábendingar
                  </div>
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">Veldu erfiðleikastig:</p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => startGame('easy')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-6 rounded-xl transition-colors"
              >
                <div className="text-2xl mb-2">😊</div>
                <div className="text-xl">Auðvelt</div>
                <div className="text-sm opacity-90 mt-2">
                  8 spurningar - Einföld útþynning og mólstyrkur
                </div>
              </button>

              <button
                onClick={() => startGame('medium')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 px-6 rounded-xl transition-colors"
              >
                <div className="text-2xl mb-2">🤔</div>
                <div className="text-xl">Miðlungs</div>
                <div className="text-sm opacity-90 mt-2">
                  10 spurningar - Með massa og mólmassa
                </div>
              </button>

              <button
                onClick={() => startGame('hard')}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-6 px-6 rounded-xl transition-colors"
              >
                <div className="text-2xl mb-2">😰</div>
                <div className="text-xl">Erfitt</div>
                <div className="text-sm opacity-90 mt-2">
                  12 spurningar - Blöndun og flókin verkefni
                </div>
              </button>
            </div>

            {/* Optional settings */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-3">Valfrjálsar stillingar:</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameState.timerMode}
                    onChange={(e) =>
                      setGameState((prev) => ({ ...prev, timerMode: e.target.checked }))
                    }
                    className="w-5 h-5"
                  />
                  <span>⏱️ Tímamót (90 sek á spurningu)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameState.showBeakers}
                    onChange={(e) =>
                      setGameState((prev) => ({ ...prev, showBeakers: e.target.checked }))
                    }
                    className="w-5 h-5"
                  />
                  <span>🔬 Sýna sjónræn bollalíkön</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (gameState.gameOver) {
    const accuracy =
      gameState.questionsAnswered > 0
        ? ((gameState.correctAnswers / gameState.questionsAnswered) * 100).toFixed(1)
        : '0';

    const maxScore = getMaxScore(gameState.difficulty);
    const percentage =
      gameState.gameMode === 'competition'
        ? ((gameState.score / maxScore) * 100).toFixed(0)
        : accuracy;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-center mb-6"
            style={{ color: themeColor }}
          >
            🎉 Til hamingju!
          </h1>

          <div className="space-y-6">
            {gameState.gameMode === 'competition' && (
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-bold mb-2" style={{ color: themeColor }}>
                    {gameState.score}
                  </div>
                  <div className="text-lg md:text-xl text-gray-700">
                    af {maxScore} stigum mögulegum
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">
                    {percentage}%
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600">
                  {gameState.totalProblems}
                </div>
                <div className="text-sm text-gray-700">Spurningar</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600">
                  {gameState.correctAnswers}
                </div>
                <div className="text-sm text-gray-700">Rétt</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-600">
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-700">Nákvæmni</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600">
                  {gameState.bestStreak}
                </div>
                <div className="text-sm text-gray-700">Lengsta röð</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
              >
                ← Til baka í aðalvalmynd
              </button>
              <button
                onClick={() => onComplete(gameState.score, getMaxScore(gameState.difficulty), totalHintsUsed)}
                className="flex-1 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                style={{ backgroundColor: themeColor }}
              >
                Ljuka Stigi 3
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Playing Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold" style={{ color: themeColor }}>
                Lausnir - Stigur 3
              </h1>
              <p className="text-sm text-gray-600">
                {gameState.gameMode === 'practice' ? 'Æfing' : 'Keppni'}
              </p>
            </div>

            <div className="flex gap-2 md:gap-4 items-center flex-wrap">
              <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-800">
                ← Til baka
              </button>

              {gameState.gameMode === 'competition' && (
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold" style={{ color: themeColor }}>
                    🏆 {gameState.score}
                  </div>
                  <div className="text-xs text-gray-600">Stig</div>
                </div>
              )}

              {gameState.streak > 0 && (
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-red-600">
                    🔥 {gameState.streak}
                  </div>
                  <div className="text-xs text-gray-600">Röð</div>
                </div>
              )}

              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {gameState.problemsCompleted}/{gameState.totalProblems}
                </div>
                <div className="text-xs text-gray-600">Framvinda</div>
              </div>

              {gameState.timerMode && gameState.timeRemaining > 0 && (
                <div className="text-center">
                  <div className={`text-xl md:text-2xl font-bold ${gameState.timeRemaining < 15 ? 'text-red-600' : 'text-purple-600'}`}>
                    ⏱️ {gameState.timeRemaining}s
                  </div>
                </div>
              )}

              <button
                onClick={() => setGameState((prev) => ({ ...prev, showFormulaCard: !prev.showFormulaCard }))}
                className="p-2 rounded-lg hover:bg-purple-50"
                style={{ color: themeColor }}
              >
                📐
              </button>
            </div>
          </div>

          <div className="mt-4 bg-gray-200 rounded-full h-2 md:h-3">
            <div
              className="h-2 md:h-3 rounded-full transition-all duration-500"
              style={{
                width: `${(gameState.problemsCompleted / gameState.totalProblems) * 100}%`,
                background: `linear-gradient(to right, ${themeColor}, ${themeColorDark})`
              }}
            />
          </div>
        </div>

        {/* Achievement notification */}
        {gameState.achievementShown && (
          <div className="mb-6 bg-gradient-to-r from-yellow-100 to-yellow-200 border-4 border-yellow-400 rounded-xl p-4 text-center animate-pulse">
            <div className="text-2xl md:text-3xl font-bold text-yellow-800">
              {gameState.achievementShown}
            </div>
          </div>
        )}

        {/* Formula reference card */}
        {gameState.showFormulaCard && <FormulaCard themeColor={themeColor} />}

        {/* Chemistry fact */}
        {currentFact && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
            <h3 className="font-bold text-blue-800 mb-2">💡 Visstu að...?</h3>
            <p className="text-blue-900">{currentFact}</p>
          </div>
        )}

        {/* Problem Area */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8">
          {gameState.currentProblem && (
            <>
              <div className="mb-6">
                <div
                  className="inline-block bg-purple-100 px-4 py-2 rounded-full text-sm font-semibold mb-4"
                  style={{ color: themeColorDark }}
                >
                  {gameState.currentProblem.description}
                </div>

                <div className="text-lg md:text-xl text-gray-800 leading-relaxed">
                  {gameState.currentProblem.question}
                </div>
              </div>

              {/* Beaker visualization */}
              {gameState.showBeakers && (
                <div className="mb-6">
                  <div className="flex justify-center mb-2">
                    <button
                      onClick={() => {
                        setAnimateBeakers(true);
                        setTimeout(() => setAnimateBeakers(false), 2000);
                      }}
                      className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                    >
                      🔄 Endurtaka hreyfingu
                    </button>
                  </div>
                  <BeakerVisualization
                    problem={gameState.currentProblem}
                    animate={animateBeakers}
                  />
                </div>
              )}

              {/* Hints */}
              {gameState.showHint && gameState.hintLevel > 0 && (
                <div className="mb-4 bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    💡 Ábending {gameState.hintLevel}:
                    {gameState.gameMode === 'competition' && (
                      <span className="text-sm">
                        (-{gameState.hintLevel === 1 ? 2 : gameState.hintLevel === 2 ? 2 : 3} stig)
                      </span>
                    )}
                  </h4>
                  <p className="text-yellow-900">
                    {gameState.currentProblem.hints[gameState.hintLevel - 1]}
                  </p>
                </div>
              )}

              {/* Show solution */}
              {gameState.showSolution && (
                <div className="mb-4 bg-blue-50 border-2 border-blue-300 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    📖 Fullkomin lausn
                  </h4>
                  <StepBySolution problem={gameState.currentProblem} />
                </div>
              )}

              {/* Answer Input */}
              <div className="max-w-md mx-auto">
                {!gameState.showFeedback ? (
                  <div className="space-y-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Svar:
                        </label>
                        <input
                          ref={inputRef}
                          type="number"
                          inputMode="decimal"
                          step="any"
                          value={gameState.userAnswer}
                          onChange={(e) =>
                            setGameState((prev) => ({
                              ...prev,
                              userAnswer: e.target.value
                            }))
                          }
                          placeholder="0.000"
                          className={`w-full p-3 text-xl border-2 rounded-lg focus:outline-none text-center font-bold ${
                            gameState.inputError ? 'border-red-500' : ''
                          }`}
                          style={{
                            borderColor: gameState.inputError ? '#ef4444' : themeColor
                          }}
                          autoFocus
                        />
                        {gameState.inputError && (
                          <div className="text-red-500 text-sm mt-1">
                            ⚠️ {gameState.inputError}
                          </div>
                        )}
                      </div>
                      <div className="text-xl font-bold text-gray-600 pb-3">
                        {gameState.currentProblem.unit}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                      {gameState.hintLevel < 3 && (
                        <button
                          onClick={showNextHint}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                          💡 Ábending {gameState.hintLevel + 1}
                          {gameState.gameMode === 'competition' &&
                            ` (-${gameState.hintLevel === 0 ? 2 : gameState.hintLevel === 1 ? 2 : 3})`}
                        </button>
                      )}
                      {gameState.incorrectAttempts >= 2 && !gameState.showSolution && (
                        <button
                          onClick={revealSolution}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                          📖 Sýna lausn
                        </button>
                      )}
                      <button
                        onClick={checkAnswerHandler}
                        disabled={!gameState.userAnswer.trim() || !!gameState.inputError}
                        className="flex-1 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor:
                            gameState.userAnswer.trim() && !gameState.inputError
                              ? themeColor
                              : undefined
                        }}
                      >
                        Athuga ✓
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      className={`p-6 rounded-xl mb-4 ${
                        gameState.lastAnswerCorrect
                          ? 'bg-green-50 border-4 border-green-300'
                          : 'bg-red-50 border-4 border-red-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {gameState.lastAnswerCorrect ? '✅' : '❌'}
                        </div>
                        <div className="text-2xl font-bold mb-2">
                          {gameState.lastAnswerCorrect ? 'Rétt!' : 'Rangt'}
                        </div>
                        <div className="text-lg text-gray-700">
                          Rétt svar:{' '}
                          <span className="font-bold">
                            {gameState.currentProblem.answer.toFixed(3)}{' '}
                            {gameState.currentProblem.unit}
                          </span>
                        </div>
                        {!gameState.lastAnswerCorrect && (
                          <>
                            <div className="text-sm text-gray-600 mt-2">
                              Þitt svar: {gameState.userAnswer} {gameState.currentProblem.unit}
                            </div>
                            <div className="text-sm text-red-700 mt-2 font-semibold">
                              {getContextualFeedback(
                                parseFloat(gameState.userAnswer),
                                gameState.currentProblem.answer
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <StepBySolution problem={gameState.currentProblem} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Keyboard shortcuts */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            ⌨️ Flýtilyklar: <strong>Enter</strong>=athuga, <strong>H</strong>=ábending,{' '}
            <strong>S</strong>=sýna lausn, <strong>F</strong>=formúlur, <strong>R</strong>=endurtaka
          </p>
        </div>
      </div>
    </div>
  );
}

export default Level3;
