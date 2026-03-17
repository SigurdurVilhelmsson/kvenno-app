import { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { Header, InteractiveGraph, LanguageSwitcher, ErrorBoundary } from '@shared/components';
import type {
  DataPoint,
  DataSeries,
  MarkerConfig,
  RegionConfig,
  VerticalLineConfig,
} from '@shared/components';
import { AchievementNotificationsContainer } from '@shared/components/AchievementNotificationPopup';
import { AchievementsButton, AchievementsPanel } from '@shared/components/AchievementsPanel';
import { AnimatedBackground } from '@shared/components/AnimatedBackground';
import {
  ParticleCelebration,
  useParticleCelebration,
} from '@shared/components/ParticleCelebration';
import { SoundToggle } from '@shared/components/SoundToggle';
import { useGameI18n } from '@shared/hooks';
import { useAchievements } from '@shared/hooks/useAchievements';
import { useGameSounds } from '@shared/hooks/useGameSounds';

import { EntropyVisualization } from './components/EntropyVisualization';
import { PROBLEMS } from './data';
import { gameTranslations } from './i18n';
import type { Difficulty, GameMode, Spontaneity, Problem } from './types';
import { calculateDeltaG, getSpontaneity } from './utils/thermo-calculations';

interface ThermoProgress {
  score: number;
  highScore: number;
  bestStreak: number;
  problemsCompleted: number;
}

const STORAGE_KEY = 'thermodynamics-predictor-progress';

function loadProgress(): ThermoProgress {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultProgress();
    }
  }
  return getDefaultProgress();
}

function getDefaultProgress(): ThermoProgress {
  return {
    score: 0,
    highScore: 0,
    bestStreak: 0,
    problemsCompleted: 0,
  };
}

function saveProgress(progress: ThermoProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function App() {
  const [mode, setMode] = useState<GameMode>('menu');
  const { language, setLanguage } = useGameI18n({ gameTranslations });
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [temperature, setTemperature] = useState(298);
  const [userDeltaG, setUserDeltaG] = useState('');
  const [userSpontaneity, setUserSpontaneity] = useState<Spontaneity | ''>('');
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [progress, setProgress] = useState<ThermoProgress>(loadProgress);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [showAchievements, setShowAchievements] = useState(false);

  // Achievement system
  const {
    achievements,
    allAchievements,
    notifications,
    trackLevelComplete,
    trackGameComplete,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    dismissNotification,
    resetAll: resetAchievements,
  } = useAchievements({ gameId: 'thermodynamics-predictor' });

  const { triggerCorrect, triggerLevelComplete, celebrationProps } = useParticleCelebration('3-ar');
  const {
    playCorrect,
    playWrong,
    playLevelComplete,
    isEnabled: soundEnabled,
    toggleSound,
  } = useGameSounds();

  // Map difficulty to level number for achievements
  const difficultyToLevel = (diff: Difficulty): 1 | 2 | 3 => {
    switch (diff) {
      case 'beginner':
        return 1;
      case 'intermediate':
        return 2;
      case 'advanced':
        return 3;
    }
  };

  // Save progress whenever it changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const resetProgress = () => {
    const newProgress = getDefaultProgress();
    setProgress(newProgress);
    saveProgress(newProgress);
    setStreak(0);
  };

  // Start new problem
  const startNewProblem = () => {
    const problems = PROBLEMS[difficulty];
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    setCurrentProblem(randomProblem);
    setTemperature(randomProblem.defaultTemp);
    setUserDeltaG('');
    setUserSpontaneity('');
    setShowSolution(false);
    setFeedback('');
    if (mode === 'challenge') {
      setTimeLeft(90);
    }
  };

  // Calculate ΔG for the current problem at a given temperature
  const calcDeltaGForProblem = (temp: number): number => {
    if (!currentProblem) return 0;
    return calculateDeltaG(currentProblem.deltaH, currentProblem.deltaS, temp);
  };

  // Get scenario description
  const getScenarioDescription = (scenario: number): string => {
    const descriptions: Record<number, string> = {
      1: 'Alltaf sjálfviljugt (ΔH<0, ΔS>0 eða ΔH<<0)',
      2: 'Aldrei sjálfviljugt (ΔH>0, ΔS<0)',
      3: 'Sjálfviljugt við lágt hitastig (ΔH<0, ΔS<0)',
      4: 'Sjálfviljugt við hátt hitastig (ΔH>0, ΔS>0)',
    };
    return descriptions[scenario] || '';
  };

  // Check answer
  const checkAnswer = () => {
    const calculatedDeltaG = calcDeltaGForProblem(temperature);
    const correctSpontaneity = getSpontaneity(calculatedDeltaG);

    const deltaGDiff = Math.abs(parseFloat(userDeltaG) - calculatedDeltaG);
    const deltaGCorrect = deltaGDiff <= 3;
    const spontaneityCorrect = userSpontaneity === correctSpontaneity;

    if (deltaGCorrect && spontaneityCorrect) {
      const points = 100 + streak * 10;
      const newStreak = streak + 1;
      setStreak(newStreak);
      setProgress((prev) => ({
        ...prev,
        score: prev.score + points,
        problemsCompleted: prev.problemsCompleted + 1,
        highScore: Math.max(prev.highScore, prev.score + points),
        bestStreak: Math.max(prev.bestStreak, newStreak),
      }));
      setFeedback(`Rétt! +${points} stig`);

      trackCorrectAnswer({ firstAttempt: true });
      playCorrect();
      if (streak + 1 >= 3) triggerCorrect();

      // Track level completion every 5 problems completed (milestone-based)
      const newProblemsCompleted = progress.problemsCompleted + 1;
      if (newProblemsCompleted % 5 === 0) {
        const level = difficultyToLevel(difficulty);
        const maxScore = 100 * 5;
        const scoreForLevel = Math.min(points * 5, maxScore);
        trackLevelComplete(level, scoreForLevel, maxScore, { hintsUsed: 0 });
        playLevelComplete();
        triggerLevelComplete();

        if (difficulty === 'advanced' && newProblemsCompleted >= 15) {
          trackGameComplete();
        }
      }
    } else {
      setStreak(0);
      trackIncorrectAnswer();
      playWrong();
      if (!deltaGCorrect && !spontaneityCorrect) {
        setFeedback('Rangt. Bæði ΔG útreikningur og sjálfviljugheit eru röng.');
      } else if (!deltaGCorrect) {
        setFeedback(
          `Sjálfviljugheit er rétt en ΔG er rangt. Rétt svar: ${calculatedDeltaG.toFixed(1)} kJ/mol`
        );
      } else {
        const spontaneityText =
          correctSpontaneity === 'spontaneous'
            ? 'Sjálfviljugt'
            : correctSpontaneity === 'equilibrium'
              ? 'Jafnvægi'
              : 'Ekki sjálfviljugt';
        setFeedback(`ΔG er rétt en sjálfviljugheit er röng. Rétt svar: ${spontaneityText}`);
      }
    }
    setShowSolution(true);
  };

  // Generate graph data for InteractiveGraph
  const graphData = useMemo(() => {
    if (!currentProblem) return null;

    const deltaH = currentProblem.deltaH;
    const deltaS = currentProblem.deltaS / 1000;
    const tempRange = { min: 200, max: 1200 };

    // Generate curve data points
    const dataPoints: DataPoint[] = [];
    for (let t = tempRange.min; t <= tempRange.max; t += 10) {
      const deltaG = deltaH - t * deltaS;
      dataPoints.push({ x: t, y: deltaG });
    }

    const series: DataSeries[] = [
      {
        id: 'deltaG',
        data: dataPoints,
        color: '#f36b22',
        lineWidth: 3,
        label: 'ΔG°',
      },
    ];

    // Spontaneity regions
    const regions: RegionConfig[] = [
      {
        yMin: -500,
        yMax: 0,
        color: 'rgba(34, 197, 94, 0.1)',
        label: 'Sjálfviljugt',
        labelPosition: 'left',
      },
      {
        yMin: 0,
        yMax: 500,
        color: 'rgba(239, 68, 68, 0.1)',
        label: 'Ekki sjálfviljugt',
        labelPosition: 'left',
      },
    ];

    // Current temperature marker
    const currentDeltaG = calcDeltaGForProblem(temperature);
    const markers: MarkerConfig[] = [
      {
        x: temperature,
        y: currentDeltaG,
        color: currentDeltaG < 0 ? '#22c55e' : '#ef4444',
        radius: 6,
        label: `${currentDeltaG.toFixed(0)} kJ/mol`,
      },
    ];

    // Crossover temperature line
    const verticalLines: VerticalLineConfig[] = [];
    if (deltaS !== 0) {
      const crossTemp = Math.abs(deltaH / deltaS);
      if (crossTemp >= tempRange.min && crossTemp <= tempRange.max) {
        verticalLines.push({
          x: crossTemp,
          color: '#8b5cf6',
          lineDash: [5, 5],
          label: `T_cross = ${crossTemp.toFixed(0)} K`,
          labelPosition: 'bottom',
        });
        // Add crossover point marker
        markers.push({
          x: crossTemp,
          y: 0,
          color: '#8b5cf6',
          radius: 8,
          label: 'ΔG = 0',
        });
      }
    }

    return { series, regions, markers, verticalLines };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: calcDeltaGForProblem is derived from currentProblem
  }, [currentProblem, temperature]);

  // Timer for challenge mode
  useEffect(() => {
    if (mode === 'challenge' && timeLeft > 0 && !showSolution) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !showSolution) {
      setFeedback('Tíminn rann út!');
      setShowSolution(true);
      setStreak(0);
    }
  }, [mode, timeLeft, showSolution]);

  const renderMenu = () => (
    <motion.div
      key="menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatedBackground yearTheme="3-ar" variant="menu">
        <Header
          variant="game"
          backHref="/efnafraedi/3-ar/"
          gameTitle="Varmafræði Spámaður"
          authSlot={
            <>
              <SoundToggle isEnabled={soundEnabled} onToggle={toggleSound} size="sm" />
              <LanguageSwitcher
                language={language}
                onLanguageChange={setLanguage}
                variant="compact"
              />
              <AchievementsButton
                achievements={achievements}
                onClick={() => setShowAchievements(true)}
              />
            </>
          }
        />
        <div className="min-h-screen py-8">
          <a
            href="#game-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-orange-600 focus:font-bold"
          >
            Fara í efni
          </a>
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8" id="game-content">
              <p className="text-warm-600 mb-4">
                Lærðu um Gibbs frjálsa orku og sjálfviljugheit efnahvarfa
              </p>

              {/* Progress Stats */}
              {(progress.highScore > 0 || progress.problemsCompleted > 0) && (
                <div className="mb-8 bg-warm-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-warm-700">Framvinda</h3>
                    <button
                      onClick={resetProgress}
                      className="text-sm text-warm-500 hover:text-red-500 transition-colors"
                    >
                      Endurstilla
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-600">{progress.highScore}</div>
                      <div className="text-xs text-warm-600">Hæsta stig</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">
                        {progress.problemsCompleted}
                      </div>
                      <div className="text-xs text-warm-600">Spurningar</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-orange-600">
                        {progress.bestStreak}
                      </div>
                      <div className="text-xs text-warm-600">Besta röð</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8 p-6 bg-blue-50 rounded-lg">
                <h2 className="text-xl font-bold mb-4">📚 Um leikinn</h2>
                <p className="mb-4">Þessi leikur kennir þér að:</p>
                <ul className="list-disc list-inside space-y-2 text-warm-700">
                  <li>
                    Reikna Gibbs frjálsa orku: <strong>ΔG = ΔH - TΔS</strong>
                  </li>
                  <li>Spá fyrir um sjálfviljugheit hvarfa</li>
                  <li>Skilja áhrif hitastigs á hvarfefni</li>
                  <li>Þekkja fjögur varmafræðileg atburðarás</li>
                  <li>Túlka ΔG vs T gröf</li>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Veldu erfiðleikastig:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setDifficulty('beginner')}
                    className={`p-4 rounded-lg border-2 transition ${
                      difficulty === 'beginner'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-warm-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-lg font-bold">🟢 Auðvelt</div>
                    <div className="text-sm text-warm-600">Einföld hvarfefni</div>
                  </button>
                  <button
                    onClick={() => setDifficulty('intermediate')}
                    className={`p-4 rounded-lg border-2 transition ${
                      difficulty === 'intermediate'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-warm-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-lg font-bold">🟡 Miðlungs</div>
                    <div className="text-sm text-warm-600">Iðnaðarhvarfefni</div>
                  </button>
                  <button
                    onClick={() => setDifficulty('advanced')}
                    className={`p-4 rounded-lg border-2 transition ${
                      difficulty === 'advanced'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-warm-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-lg font-bold">🔴 Erfitt</div>
                    <div className="text-sm text-warm-600">Háþróaðir útreikningar</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setMode('learning');
                    startNewProblem();
                  }}
                  className="game-card p-6 rounded-lg text-white font-bold text-lg transition"
                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                >
                  📖 Æfingarhamur
                  <div className="text-sm font-normal mt-1">Ótakmarkaður tími, vísbendingar</div>
                </button>
                <button
                  onClick={() => {
                    setMode('challenge');
                    setStreak(0);
                    startNewProblem();
                  }}
                  className="game-card p-6 rounded-lg text-white font-bold text-lg transition"
                  style={{ background: 'linear-gradient(135deg, #f36b22 0%, #d95a1a 100%)' }}
                >
                  ⚡ Keppnishamur
                  <div className="text-sm font-normal mt-1">90 sek tími, stigagjöf</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedBackground>
    </motion.div>
  );

  const renderGame = () => {
    if (!currentProblem) return null;

    const currentDeltaG = calcDeltaGForProblem(temperature);
    const currentSpontaneity = getSpontaneity(currentDeltaG);
    const crossoverTemp =
      currentProblem.deltaS !== 0
        ? Math.abs(currentProblem.deltaH / (currentProblem.deltaS / 1000))
        : null;

    return (
      <motion.div
        key="game"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-6"
      >
        <a
          href="#problem-display"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-orange-600 focus:font-bold"
        >
          Fara í verkefni
        </a>
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <button
                onClick={() => setMode('menu')}
                className="px-4 py-2 border-2 rounded-lg font-medium"
                style={{ borderColor: '#f36b22', color: '#f36b22' }}
              >
                ← Til baka
              </button>

              <div className="flex gap-4 items-center">
                {mode === 'challenge' && (
                  <>
                    <div className="text-center">
                      <div className="text-sm text-warm-600">Stig</div>
                      <div className="text-xl font-bold">{progress.score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-warm-600">Runa</div>
                      <div className="text-xl font-bold">{streak}🔥</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-warm-600">Tími</div>
                      <div className={`text-xl font-bold ${timeLeft < 20 ? 'text-red-500' : ''}`}>
                        {timeLeft}s
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 items-center">
                <div className="text-center">
                  <div className="text-sm text-warm-600">Spurning</div>
                  <div className="text-xl font-bold">{progress.problemsCompleted + 1}</div>
                </div>
                <AchievementsButton
                  achievements={achievements}
                  onClick={() => setShowAchievements(true)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Problem & Controls */}
            <div className="space-y-4">
              {/* Problem Display */}
              <div className="bg-white rounded-lg shadow-lg p-6" id="problem-display">
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-white text-sm scenario-${currentProblem.scenario}`}
                  >
                    Atburðarás {currentProblem.scenario}
                  </span>
                  <span className="ml-2 text-sm text-warm-600">{currentProblem.difficulty}</span>
                </div>

                <h2 className="text-xl font-bold mb-2">{currentProblem.name}</h2>
                <div className="text-lg mb-4 font-mono bg-warm-50 p-3 rounded">
                  {currentProblem.reaction}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm text-warm-600">Entalpía (ΔH°)</div>
                    <div
                      className="text-xl font-bold"
                      style={{
                        color:
                          currentProblem.deltaH < 0
                            ? 'var(--exothermic, #ff6b6b)'
                            : 'var(--endothermic, #4dabf7)',
                      }}
                    >
                      {currentProblem.deltaH > 0 ? '+' : ''}
                      {currentProblem.deltaH} kJ/mol
                    </div>
                    <div className="text-xs mt-1">
                      {currentProblem.deltaH < 0 ? '🔥 Varmalosandi' : '❄️ Varmabindandi'}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-warm-600">Óreiða (ΔS°)</div>
                    <div
                      className="text-xl font-bold"
                      style={{
                        color:
                          currentProblem.deltaS > 0
                            ? 'var(--entropy-increase, #22c55e)'
                            : 'var(--entropy-decrease, #a855f7)',
                      }}
                    >
                      {currentProblem.deltaS > 0 ? '+' : ''}
                      {currentProblem.deltaS} J/(mol·K)
                    </div>
                    <div className="text-xs mt-1">
                      {currentProblem.deltaS > 0 ? '↑ Óreiða eykst' : '↓ Óreiða minnkar'}
                    </div>
                  </div>
                </div>

                {currentProblem.advancedTask && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                    <div className="text-sm font-bold">Áskorun:</div>
                    <div className="text-sm">{currentProblem.advancedTask}</div>
                  </div>
                )}
              </div>

              {/* Temperature Slider */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold mb-3">🌡️ Hitastig</h3>
                <div className="mb-4">
                  <input
                    type="range"
                    min="200"
                    max="1200"
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-warm-600 mt-2">
                    <span>200 K</span>
                    <span className="text-xl font-bold" style={{ color: '#f36b22' }}>
                      {temperature} K ({(temperature - 273).toFixed(0)}°C)
                    </span>
                    <span>1200 K</span>
                  </div>
                </div>

                {/* Real-time ΔG calculation */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-warm-600 mb-2">Við núverandi hitastig:</div>
                  <div className="font-mono text-sm mb-2">
                    ΔG° = ΔH° - TΔS°
                    <br />
                    ΔG° = ({currentProblem.deltaH}) - ({temperature})(
                    {(currentProblem.deltaS / 1000).toFixed(3)})<br />
                    ΔG° ={' '}
                    <span className="font-bold text-lg">{currentDeltaG.toFixed(1)} kJ/mol</span>
                  </div>
                  <div
                    className={`text-lg font-bold ${currentSpontaneity === 'spontaneous' ? 'text-green-600' : currentSpontaneity === 'equilibrium' ? 'text-yellow-600' : 'text-red-600'}`}
                  >
                    {currentSpontaneity === 'spontaneous' && '✓ Sjálfviljugt'}
                    {currentSpontaneity === 'equilibrium' && '⚖️ Jafnvægi'}
                    {currentSpontaneity === 'non-spontaneous' && '✗ Ekki sjálfviljugt'}
                  </div>
                </div>

                {crossoverTemp && crossoverTemp >= 200 && crossoverTemp <= 1200 && (
                  <div
                    className={`mt-3 text-sm p-3 rounded border-l-4 ${
                      currentProblem.scenario === 3 || currentProblem.scenario === 4
                        ? 'bg-purple-50 border-purple-500'
                        : 'bg-warm-50 border-warm-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <div>
                        <strong className="text-purple-700">
                          Umbreytingarhitastig (T<sub>cross</sub>):
                        </strong>
                        <span className="ml-2 font-mono font-bold">
                          {crossoverTemp.toFixed(0)} K
                        </span>
                        <span className="text-warm-500 ml-1">
                          ({(crossoverTemp - 273).toFixed(0)}°C)
                        </span>
                      </div>
                    </div>
                    {(currentProblem.scenario === 3 || currentProblem.scenario === 4) && (
                      <div className="mt-2 text-xs">
                        {currentProblem.scenario === 3 ? (
                          <span className="text-purple-600">
                            ⚡ Þetta hvarf er sjálfviljugt <strong>undir</strong> þessu hitastigi
                          </span>
                        ) : (
                          <span className="text-purple-600">
                            ⚡ Þetta hvarf er sjálfviljugt <strong>yfir</strong> þessu hitastigi
                          </span>
                        )}
                      </div>
                    )}
                    {temperature > 0 && (
                      <div className="mt-2 text-xs">
                        {temperature < crossoverTemp ? (
                          <span
                            className={
                              currentProblem.scenario === 3 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            📍 Núverandi hitastig ({temperature} K) er <strong>undir</strong> T
                            <sub>cross</sub>
                          </span>
                        ) : temperature > crossoverTemp ? (
                          <span
                            className={
                              currentProblem.scenario === 4 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            📍 Núverandi hitastig ({temperature} K) er <strong>yfir</strong> T
                            <sub>cross</sub>
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            📍 Núverandi hitastig ({temperature} K) er <strong>við</strong> T
                            <sub>cross</sub> (jafnvægi)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Answer Input / Solution */}
              <AnimatePresence mode="wait">
                {!showSolution && (
                  <motion.div
                    key="answer-input"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-lg shadow-lg p-6"
                  >
                    <h3 className="font-bold mb-4">Svarið þitt:</h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        ΔG° við {temperature} K (kJ/mol):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={userDeltaG}
                        onChange={(e) => setUserDeltaG(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-warm-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        placeholder="t.d. -33.5"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Sjálfviljugheit:</label>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        <button
                          onClick={() => setUserSpontaneity('spontaneous')}
                          className={`px-4 py-2 rounded-lg border-2 transition ${
                            userSpontaneity === 'spontaneous'
                              ? 'border-green-500 bg-green-50 font-bold'
                              : 'border-warm-300 hover:border-green-300'
                          }`}
                        >
                          ✓ Sjálfviljugt
                        </button>
                        <button
                          onClick={() => setUserSpontaneity('equilibrium')}
                          className={`px-4 py-2 rounded-lg border-2 transition ${
                            userSpontaneity === 'equilibrium'
                              ? 'border-yellow-500 bg-yellow-50 font-bold'
                              : 'border-warm-300 hover:border-yellow-300'
                          }`}
                        >
                          ⚖️ Jafnvægi
                        </button>
                        <button
                          onClick={() => setUserSpontaneity('non-spontaneous')}
                          className={`px-4 py-2 rounded-lg border-2 transition ${
                            userSpontaneity === 'non-spontaneous'
                              ? 'border-red-500 bg-red-50 font-bold'
                              : 'border-warm-300 hover:border-red-300'
                          }`}
                        >
                          ✗ Ekki sjálfviljugt
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={checkAnswer}
                      disabled={!userDeltaG || !userSpontaneity}
                      className="w-full py-3 rounded-lg text-white font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #f36b22 0%, #d95a1a 100%)' }}
                    >
                      Athuga svar
                    </button>
                  </motion.div>
                )}

                {/* Solution */}
                {showSolution && (
                  <motion.div
                    key="solution"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-lg shadow-lg p-6"
                  >
                    <h3 className="font-bold text-lg mb-4">📝 Lausn:</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Skref 1:</strong> Umbreyta ΔS° í kJ/(mol·K)
                        <br />
                        ΔS° = {currentProblem.deltaS} J/(mol·K) × (1 kJ / 1000 J) ={' '}
                        {(currentProblem.deltaS / 1000).toFixed(3)} kJ/(mol·K)
                      </div>
                      <div>
                        <strong>Skref 2:</strong> Beita Gibbs jöfnunni
                        <br />
                        ΔG° = ΔH° - TΔS°
                        <br />
                        ΔG° = ({currentProblem.deltaH}) - ({temperature})(
                        {(currentProblem.deltaS / 1000).toFixed(3)})<br />
                        ΔG° = {currentProblem.deltaH} -{' '}
                        {((temperature * currentProblem.deltaS) / 1000).toFixed(1)}
                        <br />
                        <strong>ΔG° = {currentDeltaG.toFixed(1)} kJ/mol</strong>
                      </div>
                      <div>
                        <strong>Skref 3:</strong> Túlka niðurstöðu
                        <br />
                        {currentDeltaG < -1 && 'ΔG° < 0 → SJÁLFVILJUGT ✓'}
                        {Math.abs(currentDeltaG) <= 1 && 'ΔG° ≈ 0 → JAFNVÆGI ⚖️'}
                        {currentDeltaG > 1 && 'ΔG° > 0 → EKKI SJÁLFVILJUGT ✗'}
                      </div>
                      {/* Crossover temperature explanation for scenarios 3 & 4 */}
                      {(currentProblem.scenario === 3 || currentProblem.scenario === 4) &&
                        crossoverTemp && (
                          <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                            <strong>Skref 4:</strong> Reikna umbreytingarhitastig (T<sub>cross</sub>
                            )
                            <br />
                            <div className="font-mono mt-1">
                              Þegar ΔG° = 0: ΔH° = TΔS°
                              <br />T<sub>cross</sub> = ΔH° / ΔS°
                              <br />T<sub>cross</sub> = {currentProblem.deltaH} /{' '}
                              {(currentProblem.deltaS / 1000).toFixed(3)}
                              <br />
                              <strong>
                                T<sub>cross</sub> = {crossoverTemp.toFixed(0)} K (
                                {(crossoverTemp - 273).toFixed(0)}°C)
                              </strong>
                            </div>
                            <div className="mt-2 text-sm">
                              {currentProblem.scenario === 3 ? (
                                <>
                                  🔹 Við T &lt; {crossoverTemp.toFixed(0)} K: ΔG° &lt; 0
                                  (sjálfviljugt)
                                  <br />
                                  🔹 Við T &gt; {crossoverTemp.toFixed(0)} K: ΔG° &gt; 0 (ekki
                                  sjálfviljugt)
                                </>
                              ) : (
                                <>
                                  🔹 Við T &lt; {crossoverTemp.toFixed(0)} K: ΔG° &gt; 0 (ekki
                                  sjálfviljugt)
                                  <br />
                                  🔹 Við T &gt; {crossoverTemp.toFixed(0)} K: ΔG° &lt; 0
                                  (sjálfviljugt)
                                </>
                              )}
                            </div>
                          </div>
                        )}

                      <div className="bg-blue-50 p-3 rounded">
                        <strong>Atburðarás {currentProblem.scenario}:</strong>
                        <br />
                        {getScenarioDescription(currentProblem.scenario)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className={`rounded-lg shadow-lg p-6 ${
                      feedback.includes('Rétt')
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-red-50 border-2 border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-2">{feedback}</div>
                    {showSolution && (
                      <button
                        onClick={startNewProblem}
                        className="mt-4 w-full py-2 rounded-lg text-white font-bold"
                        style={{ background: '#f36b22' }}
                      >
                        Næsta spurning →
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Visualizations */}
            <div className="space-y-4">
              {/* Graph */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold mb-3">📊 ΔG° vs Hitastig</h3>
                {graphData && (
                  <InteractiveGraph
                    width={500}
                    height={300}
                    series={graphData.series}
                    xAxis={{ min: 200, max: 1200, label: 'T (K)', tickInterval: 200 }}
                    yAxis={{ min: -500, max: 500, label: 'ΔG (kJ/mol)', tickInterval: 100 }}
                    regions={graphData.regions}
                    markers={graphData.markers}
                    verticalLines={graphData.verticalLines}
                    horizontalLines={[
                      {
                        y: 0,
                        color: '#374151',
                        lineWidth: 2,
                        label: 'ΔG = 0',
                      },
                    ]}
                    ariaLabel="ΔG vs Hitastig graf"
                  />
                )}
                <div className="mt-3 text-xs text-warm-600 grid grid-cols-2 gap-2">
                  <div>🟠 Línuhalli: -ΔS°</div>
                  <div>🟢 Sjálfviljugt: ΔG° &lt; 0</div>
                  <div>🔵 Y-skurður: ΔH°</div>
                  <div>🔴 Ekki sjálfviljugt: ΔG° &gt; 0</div>
                  <div className="col-span-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1"></span>T
                    <sub>cross</sub>: Umbreytingarhitastig (ΔG° = 0)
                  </div>
                </div>
              </div>

              {/* Entropy Visualization */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold mb-3">🎲 Óreiða (Entropy)</h3>
                <EntropyVisualization deltaS={currentProblem.deltaS} />
                <div className="mt-4 text-sm">
                  <div
                    className={`font-bold ${currentProblem.deltaS > 0 ? 'text-green-600' : 'text-purple-600'}`}
                  >
                    {currentProblem.deltaS > 0 ? (
                      <>
                        ↑ Óreiða eykst (ΔS° &gt; 0)
                        <div className="text-xs font-normal mt-1">Eftirfarandi gerist:</div>
                        <ul className="text-xs font-normal list-disc list-inside mt-1">
                          <li>Lofttegundir myndast</li>
                          <li>Fasaskipti: solid → liquid → gas</li>
                          <li>Uppleysingarferli</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        ↓ Óreiða minnkar (ΔS° &lt; 0)
                        <div className="text-xs font-normal mt-1">Eftirfarandi gerist:</div>
                        <ul className="text-xs font-normal list-disc list-inside mt-1">
                          <li>Lofttegundir hvarf</li>
                          <li>Fasaskipti: gas → liquid → solid</li>
                          <li>Útfelling</li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Scenario Guide */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold mb-3">🎯 Fjögur Atburðarás</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded scenario-1 text-white">
                    <strong>1: ΔH&lt;0, ΔS&gt;0</strong> → Alltaf sjálfviljugt
                  </div>
                  <div className="p-2 rounded scenario-2 text-white">
                    <strong>2: ΔH&gt;0, ΔS&lt;0</strong> → Aldrei sjálfviljugt
                  </div>
                  <div className="p-2 rounded scenario-3 text-white">
                    <strong>3: ΔH&lt;0, ΔS&lt;0</strong> → Sjálfviljugt við lágt T
                  </div>
                  <div className="p-2 rounded scenario-4 text-white">
                    <strong>4: ΔH&gt;0, ΔS&gt;0</strong> → Sjálfviljugt við hátt T
                  </div>
                </div>
              </div>

              {/* Formula Reference */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-lg p-6">
                <h3 className="font-bold mb-3">📐 Formúlur</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="bg-white p-2 rounded">ΔG° = ΔH° - TΔS°</div>
                  <div className="bg-white p-2 rounded">ΔG° = -RT ln K</div>
                  <div className="bg-white p-2 rounded">
                    T<sub>cross</sub> = ΔH° / ΔS°
                  </div>
                </div>
                <div className="mt-3 text-xs text-warm-600">
                  R = 8.314 J/(mol·K)
                  <br />T í Kelvin (K = °C + 273)
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderScreen = () => {
    if (mode === 'menu') return renderMenu();
    return renderGame();
  };

  return (
    <>
      <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>

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

      <ParticleCelebration {...celebrationProps} />
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
