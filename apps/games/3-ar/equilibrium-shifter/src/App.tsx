import { useState, useEffect, useRef } from 'react';
import { useProgress, useAccessibility, useI18n, useGameI18n } from '@shared/hooks';
import { useAchievements } from '@shared/hooks/useAchievements';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';
import { HintSystem, LanguageSwitcher } from '@shared/components';
import { gameTranslations } from './i18n';
import type { TieredHints } from '@shared/types';
import { ParticleEquilibrium } from './components/ParticleEquilibrium';
import { QKComparison } from './components/QKComparison';
import {
  Equilibrium,
  Stress,
  ShiftDirection,
  GameMode,
  GameStats,
  ShiftResult,
  DifficultyLevel
} from './types';
import { getRandomEquilibrium } from './data';
import { calculateShift, getStressDescriptionIs } from './utils/le-chatelier';
import './styles.css';

function App() {
  const { progress, updateProgress } = useProgress({
    gameId: 'equilibrium-shifter',
    initialProgress: {
      currentLevel: 0,
      problemsCompleted: 0,
      lastPlayedDate: new Date().toISOString(),
      totalTimeSpent: 0,
      levelProgress: {}
    }
  });

  const { settings, toggleHighContrast, setTextSize } = useAccessibility();
  const { t, language, setLanguage } = useI18n();
  useGameI18n({ gameTranslations }); // Initialize game translations

  // Achievements
  const [showAchievements, setShowAchievements] = useState(false);
  const {
    achievements,
    allAchievements,
    notifications,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    trackLevelComplete,
    trackGameComplete,
    dismissNotification,
    resetAll: resetAchievements,
  } = useAchievements({ gameId: 'equilibrium-shifter' });

  // Game state
  const [screen, setScreen] = useState<'menu' | 'mode-select' | 'game' | 'feedback' | 'results'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('learning');
  const [currentEquilibrium, setCurrentEquilibrium] = useState<Equilibrium | null>(null);
  const [appliedStress, setAppliedStress] = useState<Stress | null>(null);
  const [userPrediction, setUserPrediction] = useState<ShiftDirection | null>(null);
  const [correctShift, setCorrectShift] = useState<ShiftResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintsUsedTier, setHintsUsedTier] = useState(0);
  const [hintResetKey, setHintResetKey] = useState(0);

  // Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    hintsUsed: 0,
    totalTime: 0,
    correctByDifficulty: {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    }
  });

  // Challenge mode state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Ref to track if timeout has been handled for current question
  const timeoutHandledRef = useRef(false);

  // Timer for challenge mode
  useEffect(() => {
    if (screen === 'game' && gameMode === 'challenge' && timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev !== null ? prev - 1 : null);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameMode === 'challenge' && !timeoutHandledRef.current) {
      // Time's up - mark as incorrect and move on
      timeoutHandledRef.current = true;
      setIsCorrect(false);
      setShowExplanation(true);
      trackIncorrectAnswer(); // Track timeout as incorrect answer
      setStats(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        streak: 0
      }));

      setTimeout(() => {
        handleNextQuestion();
      }, 3000);
    }
  }, [screen, gameMode, timeRemaining]);

  // Start game flow
  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setScreen('game');
    setStats({
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      bestStreak: 0,
      hintsUsed: 0,
      totalTime: 0,
      correctByDifficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      }
    });
    setQuestionNumber(1);
    loadNewQuestion(mode);
  };

  const loadNewQuestion = (mode: GameMode) => {
    const eq = getRandomEquilibrium();
    setCurrentEquilibrium(eq);

    // Reset timeout handler ref for new question
    timeoutHandledRef.current = false;

    // In challenge mode, randomly select a stress
    if (mode === 'challenge') {
      const randomStress = eq.possibleStresses[Math.floor(Math.random() * eq.possibleStresses.length)];
      setAppliedStress(randomStress);
      const shift = calculateShift(eq, randomStress);
      setCorrectShift(shift);
      setTimeRemaining(20); // 20 seconds per question
    } else {
      // In learning mode, let user select stress
      setAppliedStress(null);
      setCorrectShift(null);
      setTimeRemaining(null);
    }

    setUserPrediction(null);
    setShowExplanation(false);
    setHintMultiplier(1.0);
    setHintsUsedTier(0);
    setHintResetKey(prev => prev + 1);
    setIsCorrect(null);
  };

  // Generate tiered hints based on current equilibrium and stress
  const generateHints = (): TieredHints => {
    if (!currentEquilibrium || !appliedStress) {
      return {
        topic: 'Le Chatelier meginreglan fjallar um hvernig jafnvægi bregst við álagi.',
        strategy: 'Hugsaðu um hvernig kerfið reynir að minnka áhrif álagsins.',
        method: 'Athugaðu hvort álagið eykur eða minnkar magn á hvorri hlið.',
        solution: 'Veldu álag til að sjá vísbendingu.'
      };
    }

    const eq = currentEquilibrium;
    const stress = appliedStress;
    const isExothermic = eq.thermodynamics.type === 'exothermic';
    const moreGasOnRight = (eq.gasMoles?.products || 0) > (eq.gasMoles?.reactants || 0);
    const moreGasOnLeft = (eq.gasMoles?.reactants || 0) > (eq.gasMoles?.products || 0);

    // Topic hint - general concept area
    let topic = 'Þetta snýst um Le Chatelier meginregluna og hvernig jafnvægi bregst við álagi.';
    if (stress.type.includes('temp')) {
      topic = 'Þetta snýst um áhrif hitastigsbreytinga á jafnvægi og varmalosandi/varmabindandi hvörf.';
    } else if (stress.type.includes('pressure')) {
      topic = 'Þetta snýst um áhrif þrýstingsbreytinga á gasjafnvægi og fjölda móla.';
    } else if (stress.type.includes('catalyst')) {
      topic = 'Þetta snýst um hlutverk hvata í efnahvörfum.';
    } else {
      topic = 'Þetta snýst um áhrif styrkbreytinga á jafnvægi.';
    }

    // Strategy hint - approach to solve
    let strategy = 'Hugsaðu um hvernig kerfið reynir að minnka áhrif álagsins.';
    if (stress.type.includes('temp')) {
      strategy = isExothermic
        ? 'Hvarf sem losar varma (varmalosandi) mun hliðrast í áttina sem „eyðir" viðbættu varmanum.'
        : 'Hvarf sem bindur varma (varmabindandi) mun hliðrast í áttina sem „nýtir" viðbættu varmanum.';
    } else if (stress.type === 'increase-pressure') {
      strategy = 'Hærri þrýstingur mun hliðra jafnvæginu í áttina með FÆRRI móla af gasi.';
    } else if (stress.type === 'decrease-pressure') {
      strategy = 'Lægri þrýstingur mun hliðra jafnvæginu í áttina með FLEIRI móla af gasi.';
    } else if (stress.type === 'add-catalyst') {
      strategy = 'Hvatar flýta fyrir bæði fram- og bakhvarfi jafnt mikið.';
    } else if (stress.type.includes('add')) {
      strategy = 'Að bæta við efni veldur hliðrun BURTfrá þeirri hlið.';
    } else if (stress.type.includes('remove')) {
      strategy = 'Að fjarlægja efni veldur hliðrun Í ÁTTINA að þeirri hlið.';
    }

    // Method hint - specific technique/formula
    let method = '';
    if (stress.type === 'increase-temp') {
      method = isExothermic
        ? 'Varmalosandi hvarf: Varmi er „afurð". Meira varma → hliðrun til vinstri.'
        : 'Varmabindandi hvarf: Varmi er „hvarfefni". Meira varma → hliðrun til hægri.';
    } else if (stress.type === 'decrease-temp') {
      method = isExothermic
        ? 'Varmalosandi hvarf: Minna varma → hliðrun til hægri til að framleiða varma.'
        : 'Varmabindandi hvarf: Minna varma → hliðrun til vinstri.';
    } else if (stress.type === 'increase-pressure') {
      if (moreGasOnRight) {
        method = `Hvarfefni: ${eq.gasMoles?.reactants} mól gas. Afurðir: ${eq.gasMoles?.products} mól gas. Hliðrun til vinstri (færri mól).`;
      } else if (moreGasOnLeft) {
        method = `Hvarfefni: ${eq.gasMoles?.reactants} mól gas. Afurðir: ${eq.gasMoles?.products} mól gas. Hliðrun til hægri (færri mól).`;
      } else {
        method = `Hvarfefni: ${eq.gasMoles?.reactants || 0} mól gas. Afurðir: ${eq.gasMoles?.products || 0} mól gas. Jafnt → engin hliðrun.`;
      }
    } else if (stress.type === 'decrease-pressure') {
      if (moreGasOnRight) {
        method = `Afurðir hafa fleiri mól gas (${eq.gasMoles?.products}). Hliðrun til hægri.`;
      } else if (moreGasOnLeft) {
        method = `Hvarfefni hafa fleiri mól gas (${eq.gasMoles?.reactants}). Hliðrun til vinstri.`;
      } else {
        method = `Jafnt magn gass beggja megin → engin hliðrun.`;
      }
    } else if (stress.type === 'add-catalyst') {
      method = 'Hvati breytir EKKI jafnvæginu - aðeins hraða til að ná því.';
    } else if (stress.type === 'add-reactant') {
      method = `Bætt við hvarfefni (${stress.target}). Kerfið eyðir því → hliðrun til hægri.`;
    } else if (stress.type === 'add-product') {
      method = `Bætt við afurð (${stress.target}). Kerfið eyðir henni → hliðrun til vinstri.`;
    } else if (stress.type === 'remove-reactant') {
      method = `Hvarfefni fjarlægt (${stress.target}). Kerfið bætir upp → hliðrun til vinstri.`;
    } else if (stress.type === 'remove-product') {
      method = `Afurð fjarlægð (${stress.target}). Kerfið bætir upp → hliðrun til hægri.`;
    }

    // Solution hint - full worked answer
    let solution = '';
    if (correctShift) {
      const directionText = correctShift.direction === 'left' ? 'til vinstri ←'
        : correctShift.direction === 'right' ? 'til hægri →'
        : 'engin hliðrun ⇌';
      solution = `Rétt svar: ${directionText}. ${correctShift.explanationIs || ''}`;
    } else {
      solution = 'Veldu spá til að sjá lausn.';
    }

    return { topic, strategy, method, solution };
  };

  // Learning mode: Apply stress
  const handleApplyStress = (stress: Stress) => {
    if (!currentEquilibrium) return;

    setAppliedStress(stress);
    const shift = calculateShift(currentEquilibrium, stress);
    setCorrectShift(shift);
    setUserPrediction(null);
    setShowExplanation(false);
  };

  // Make prediction
  const handlePrediction = (prediction: ShiftDirection) => {
    if (!correctShift || !currentEquilibrium) return;

    setUserPrediction(prediction);
    const correct = prediction === correctShift.direction;
    setIsCorrect(correct);
    setShowExplanation(true);

    // Track achievements
    if (correct) {
      trackCorrectAnswer({ firstAttempt: hintsUsedTier === 0 });
    } else {
      trackIncorrectAnswer();
    }

    // Update stats - apply hint multiplier to points
    const basePoints = calculatePoints(correct, currentEquilibrium.difficulty);
    const points = Math.round(basePoints * hintMultiplier);

    setStats(prev => ({
      ...prev,
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      score: correct ? prev.score + points : prev.score,
      streak: correct ? prev.streak + 1 : 0,
      bestStreak: correct ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
      correctByDifficulty: {
        ...prev.correctByDifficulty,
        [currentEquilibrium.difficulty]: correct
          ? prev.correctByDifficulty[currentEquilibrium.difficulty] + 1
          : prev.correctByDifficulty[currentEquilibrium.difficulty]
      }
    }));

    // In challenge mode, auto-advance after 3 seconds
    if (gameMode === 'challenge') {
      setTimeout(() => {
        handleNextQuestion();
      }, 3000);
    }
  };

  const calculatePoints = (correct: boolean, difficulty: DifficultyLevel): number => {
    if (!correct) return 0;

    const basePoints = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 20 : 30;
    const streakBonus = Math.min(stats.streak * 5, 25);
    const timeBonus = (gameMode === 'challenge' && timeRemaining && timeRemaining > 15) ? 5 : 0;

    return basePoints + streakBonus + timeBonus;
  };

  const handleNextQuestion = () => {
    if (gameMode === 'challenge') {
      if (questionNumber >= totalQuestions) {
        // Game over - show results
        setScreen('results');
        updateProgress({
          problemsCompleted: progress.problemsCompleted + stats.correctAnswers,
          totalTimeSpent: progress.totalTimeSpent + stats.totalTime
        });

        // Track challenge completion as level 1, and game complete
        const maxScore = totalQuestions * 35; // Max possible score (30 base + 5 time bonus)
        trackLevelComplete(1, stats.score, maxScore, { hintsUsed: stats.hintsUsed });
        trackGameComplete();
      } else {
        // Next question
        setQuestionNumber(prev => prev + 1);
        loadNewQuestion(gameMode);
      }
    } else {
      // Learning mode - load new question
      loadNewQuestion(gameMode);
    }
  };

  // Handle hint usage from HintSystem
  const handleHintUsed = (tier: 1 | 2 | 3 | 4) => {
    setHintsUsedTier(tier);
    setStats(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));
  };

  // Render functions
  const renderMenu = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Jafnvægisstjóri
        </h2>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Lærðu Le Chatelier meginregluna í gegnum gagnvirkar æfingar
        </p>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <button
            onClick={() => startGame('learning')}
            className="mode-card bg-white border-2 border-blue-200 hover:border-blue-400 rounded-lg p-6 text-left transition-all"
          >
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Lærdómshamur
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Taktu þér tíma, notaðu vísbendingar og lærðu á þínum hraða
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Enginn tímatakmörkun</li>
              <li>✓ Ítarlegar útskýringar</li>
              <li>✓ Vísbendingakerfi</li>
              <li>✓ Veltudæmi</li>
            </ul>
          </button>

          <button
            onClick={() => startGame('challenge')}
            className="mode-card bg-white border-2 border-orange-200 hover:border-orange-400 rounded-lg p-6 text-left transition-all"
          >
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Keppnishamur
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Prófaðu kunnáttu þína með tímasettum spurningum
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ 20 sekúndur á spurningu</li>
              <li>✓ 10 spurningar</li>
              <li>✓ Stigagjöf og raðir</li>
              <li>✓ Hraðbónus</li>
            </ul>
          </button>
        </div>

        {/* Progress Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Framvinda þín</h3>
          <p className="text-sm text-gray-600">
            Verkefni kláruð: {progress.problemsCompleted}
          </p>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    if (!currentEquilibrium) return null;

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header with stats */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <button
              onClick={() => setScreen('menu')}
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition-colors"
            >
              ← Til baka
            </button>

            <div className="flex items-center gap-4">
              {gameMode === 'challenge' && (
                <>
                  <div className="text-sm text-gray-600">
                    Spurning {questionNumber} / {totalQuestions}
                  </div>
                  <div className={`timer-display ${timeRemaining && timeRemaining <= 5 ? 'warning' : ''}`}>
                    {timeRemaining}s
                  </div>
                </>
              )}
              <div className="score-display">
                Stig: {stats.score}
              </div>
              {stats.streak > 0 && (
                <div className="streak-indicator">
                  🔥 {stats.streak} röð
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main game area */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          {/* Chemical Equation */}
          <div className="text-center mb-6">
            <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              {currentEquilibrium.equation}
            </div>
            <div className="text-lg text-gray-600 mb-2">
              {language === 'is' ? currentEquilibrium.nameIs : currentEquilibrium.name}
            </div>
            <div className={`thermo-indicator ${currentEquilibrium.thermodynamics.type}`}>
              {currentEquilibrium.thermodynamics.type === 'exothermic' ? '🔥' : '❄️'}
              ΔH = {currentEquilibrium.thermodynamics.deltaH} kJ/mol
              ({currentEquilibrium.thermodynamics.type === 'exothermic' ? 'Varmalosandi' : 'Varmabindandi'})
            </div>
          </div>

          {/* Visual Equilibrium Display */}
          <div className="grid md:grid-cols-3 gap-4 items-center mb-6">
            {/* Reactants */}
            <div className={`molecule-container reactants-side ${isCorrect !== null && correctShift?.direction === 'left' ? 'glowing' : ''}`}>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2 font-semibold">Hvarfefni</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentEquilibrium.reactants.map((r, idx) => (
                    <div key={idx} className="molecule">
                      {Array.from({ length: r.coefficient }, (_, i) => (
                        <span key={i}>{r.display}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrows */}
            <div className="text-center">
              <div className={`equilibrium-arrows ${isCorrect !== null ? (correctShift?.direction === 'right' ? 'shift-right' : correctShift?.direction === 'left' ? 'shift-left' : 'no-shift') : ''}`}>
                ⇌
              </div>
            </div>

            {/* Products */}
            <div className={`molecule-container products-side ${isCorrect !== null && correctShift?.direction === 'right' ? 'glowing' : ''}`}>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2 font-semibold">Afurðir</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentEquilibrium.products.map((p, idx) => (
                    <div key={idx} className="molecule">
                      {Array.from({ length: p.coefficient }, (_, i) => (
                        <span key={i}>{p.display}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Particle Equilibrium Visualization */}
          <div className="flex justify-center mb-6">
            <ParticleEquilibrium
              reactantCount={20}
              productCount={20}
              shiftDirection={showExplanation ? correctShift?.direction : null}
              isExothermic={currentEquilibrium.thermodynamics.type === 'exothermic'}
              running={screen === 'game'}
            />
          </div>

          {/* Context/Description */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 text-center">
              {language === 'is' ? currentEquilibrium.descriptionIs : currentEquilibrium.description}
            </p>
          </div>

          {/* Learning Mode: Stress Selection */}
          {gameMode === 'learning' && !appliedStress && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Veldu álag sem þú vilt beita:</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {currentEquilibrium.possibleStresses.map((stress, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyStress(stress)}
                    className="stress-btn"
                  >
                    {getStressDescriptionIs(stress)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Challenge Mode or Stress Applied: Show applied stress */}
          {appliedStress && correctShift && (
            <div>
              <div className={`bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4 ${appliedStress ? 'selected' : ''}`}>
                <div className="font-semibold text-gray-800 mb-1">Álag sem beitt er:</div>
                <div className="text-lg text-gray-700">
                  {getStressDescriptionIs(appliedStress)}
                </div>
              </div>

              {/* Prediction Buttons */}
              {!showExplanation && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Hvert mun jafnvægið hliðrast?
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <button
                      onClick={() => handlePrediction('left')}
                      className="predict-btn left"
                      disabled={userPrediction !== null}
                    >
                      ← Til vinstri
                    </button>
                    <button
                      onClick={() => handlePrediction('none')}
                      className="predict-btn none"
                      disabled={userPrediction !== null}
                    >
                      ⇌ Engin hliðrun
                    </button>
                    <button
                      onClick={() => handlePrediction('right')}
                      className="predict-btn right"
                      disabled={userPrediction !== null}
                    >
                      Til hægri →
                    </button>
                  </div>

                  {/* Tiered Hint System (Learning Mode Only) */}
                  {gameMode === 'learning' && (
                    <div className="mt-4">
                      <HintSystem
                        hints={generateHints()}
                        basePoints={calculatePoints(true, currentEquilibrium.difficulty)}
                        onHintUsed={handleHintUsed}
                        onPointsChange={setHintMultiplier}
                        disabled={showExplanation}
                        resetKey={hintResetKey}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              {showExplanation && isCorrect !== null && (
                <div className={`explanation-box ${isCorrect ? 'correct' : 'incorrect'} slide-in-right`}>
                  <div className="text-2xl font-bold mb-3">
                    {isCorrect ? '✅ Rétt!' : '❌ Rangt'}
                  </div>

                  <div className="mb-4">
                    <div className="font-semibold mb-2">Rétt svar:</div>
                    <div className="text-lg">
                      Hliðrun: <strong>
                        {correctShift.direction === 'left' ? 'Til vinstri ←' :
                         correctShift.direction === 'right' ? 'Til hægri →' :
                         'Engin hliðrun ⇌'}
                      </strong>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="font-semibold mb-2">Útskýring:</div>
                    <p className="text-gray-700">
                      {language === 'is' ? correctShift.explanationIs : correctShift.explanation}
                    </p>
                  </div>

                  {/* Q vs K Comparison - shows in learning mode or for wrong answers */}
                  {(gameMode === 'learning' || !isCorrect) && appliedStress && (
                    <div className="mb-4">
                      <QKComparison
                        shiftDirection={correctShift.direction}
                        stress={appliedStress}
                        isExothermic={currentEquilibrium.thermodynamics.type === 'exothermic'}
                        animate={true}
                      />
                    </div>
                  )}

                  {gameMode === 'learning' && (
                    <div className="mb-4">
                      <div className="font-semibold mb-2">Rökstuðningur:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {correctShift.reasoning.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="font-semibold mb-2">Sameinda sjónarhorn:</div>
                    <p className="text-sm text-gray-700 italic">
                      {correctShift.molecularView}
                    </p>
                  </div>

                  {/* Points Earned */}
                  {isCorrect && (
                    <div className="bg-green-100 rounded-lg p-3 mt-4">
                      <div className="font-semibold text-green-800">
                        +{calculatePoints(true, currentEquilibrium.difficulty)} stig!
                      </div>
                    </div>
                  )}

                  {/* Next Button (Learning Mode) */}
                  {gameMode === 'learning' && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => {
                          setAppliedStress(null);
                          setShowExplanation(false);
                          setIsCorrect(null);
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 transition-colors"
                      >
                        Prófa annað álag
                      </button>
                      <button
                        onClick={handleNextQuestion}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-3 transition-colors"
                      >
                        Næsta jafnvægi →
                      </button>
                    </div>
                  )}

                  {/* Challenge Mode - Auto advance message */}
                  {gameMode === 'challenge' && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                      Næsta spurning birtist sjálfkrafa...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🏆 Niðurstöður
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-800 mb-2">
              {stats.score}
            </div>
            <div className="text-sm text-purple-600">Heildar stig</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-800 mb-2">
              {stats.correctAnswers} / {stats.questionsAnswered}
            </div>
            <div className="text-sm text-blue-600">Réttar svör</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <div className="text-3xl font-bold text-orange-800 mb-2">
              {stats.bestStreak}
            </div>
            <div className="text-sm text-orange-600">Besta röð</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-800 mb-2">
              {Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)}%
            </div>
            <div className="text-sm text-green-600">Nákvæmni</div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Niðurstöður eftir erfiðleikastigi:</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Byrjandi:</span>
              <span className="font-semibold text-gray-800">{stats.correctByDifficulty.beginner}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Miðlungs:</span>
              <span className="font-semibold text-gray-800">{stats.correctByDifficulty.intermediate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Erfitt:</span>
              <span className="font-semibold text-gray-800">{stats.correctByDifficulty.advanced}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => startGame(gameMode)}
            className="flex-1 bg-primary-orange hover:bg-dark-orange text-white rounded-lg px-6 py-3 transition-colors"
          >
            🔄 Spila aftur
          </button>
          <button
            onClick={() => setScreen('menu')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-6 py-3 transition-colors"
          >
            📋 Aðalvalmynd
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 ${settings.highContrast ? 'high-contrast' : ''} ${settings.reducedMotion ? 'reduced-motion' : ''}`}>
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        {t('accessibility.skipToContent', 'Fara beint í efní')}
      </a>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-end gap-2 mb-2">
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
            <AchievementsButton
              achievements={achievements}
              onClick={() => setShowAchievements(true)}
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#f36b22' }}>
              Jafnvægisstjóri
            </h1>
            <p className="text-lg text-gray-600">
              Le Chatelier Meginreglan
            </p>
          </div>
        </header>

        {/* Accessibility Menu */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 max-w-4xl mx-auto">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {t('accessibility.menuTitle', 'Aðgengisval')}
          </h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={toggleHighContrast}
                className="rounded"
              />
              <span className="text-sm">{t('accessibility.highContrast', 'Há birtuskil')}</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-sm">{t('accessibility.textSize', 'Leturstærð')}:</span>
              <select
                value={settings.textSize}
                onChange={(e) => setTextSize(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="small">{t('accessibility.textSizeSmall', 'Lítil')}</option>
                <option value="medium">{t('accessibility.textSizeMedium', 'Miðlungs')}</option>
                <option value="large">{t('accessibility.textSizeLarge', 'Stór')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Tungumál:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="is">Íslenska</option>
                <option value="en">English</option>
                <option value="pl">Polski</option>
              </select>
            </div>
          </div>
        </div>

        {/* Screen Routing */}
        {screen === 'menu' && renderMenu()}
        {screen === 'game' && renderGame()}
        {screen === 'results' && renderResults()}
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4">
        <p>© 2024 Kvennaskólinn - Efnafræðileikir</p>
      </footer>

      {/* Achievements Panel Modal */}
      {showAchievements && (
        <AchievementsPanel
          achievements={achievements}
          allAchievements={allAchievements}
          onClose={() => setShowAchievements(false)}
          onReset={resetAchievements}
        />
      )}

      {/* Achievement Notifications */}
      <AchievementNotificationsContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

export default App;
